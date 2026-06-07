import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Configurar marked con renderer personalizado
const renderer = new marked.Renderer();

// La firma correcta para marked v4+
renderer.code = function({ text, lang, escaped }) {
  const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const highlighted = hljs.highlight(text, { language: validLang }).value;
  return `<pre><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
};

marked.use({ renderer, breaks: true, gfm: true });

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const rawHtml = marked.parse(value) as string;
    const sanitized = DOMPurify.sanitize(rawHtml);
    return sanitized;
  }
}