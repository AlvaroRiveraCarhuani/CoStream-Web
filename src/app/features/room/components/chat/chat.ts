import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomStateService } from '../../services/room-state.service';
import { MarkdownPipe } from '../../../../shared/pipes/markdown-pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat {
  @Input({ required: true }) roomId!: string;
  
  protected roomState = inject(RoomStateService);
  
  chatInput = signal('');

  onSendMessage() {
    const text = this.chatInput();
    if (text.trim() && this.roomId) {
      this.roomState.sendMessage(this.roomId, text);
      this.chatInput.set('');
    }
  }
}