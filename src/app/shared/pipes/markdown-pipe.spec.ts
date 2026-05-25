import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownPipe } from './markdown-pipe';
import { describe, beforeEach, it, expect } from 'vitest';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MarkdownPipe,
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (val: string) => val
          }
        }
      ]
    });
    
    pipe = TestBed.inject(MarkdownPipe);
  });

  it('debería crearse la instancia respetando el contexto de inyección', () => {
    expect(pipe).toBeTruthy();
  });
});