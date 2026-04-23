import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  // Usamos el DomSanitizer para decirle a Angular: "Confía en este HTML, es seguro"
  private sanitizer = inject(DomSanitizer);
  
  // Configuramos el motor Marked para que use Highlight.js al detectar backticks (```)
  private markedInstance = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    // Parseamos el texto plano a HTML estructurado
    const html = this.markedInstance.parse(value) as string;
    
    // Devolvemos el HTML eludiendo la limpieza extrema de Angular para que no borre los colores
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}