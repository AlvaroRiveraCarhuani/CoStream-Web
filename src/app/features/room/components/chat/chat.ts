import { Component, Input, inject, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomStateService } from '../../services/room-state.service';
import { MarkdownPipe } from '../../../../shared/pipes/markdown-pipe';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // o el tema que prefieras

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, MarkdownPipe],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat implements AfterViewChecked, OnDestroy {
  @Input({ required: true }) roomId!: string;
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  protected roomState = inject(RoomStateService);
  newMessage: string = '';
  private shouldScroll = false;
  private highlightTimeout: any;

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.roomState.sendMessage(this.roomId, this.newMessage);
    this.newMessage = '';
    this.shouldScroll = true;
  }

  handleEnter(event: any) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
    if (this.messageContainer) {
      // Limpiar timeout anterior para no ejecutar demasiadas veces
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
      this.highlightTimeout = setTimeout(() => {
        const codeBlocks = this.messageContainer.nativeElement.querySelectorAll('pre code');
        codeBlocks.forEach((block: HTMLElement) => {
          hljs.highlightElement(block);
        });
      }, 50);
    }
  }

  ngOnDestroy() {
    if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
  }
}