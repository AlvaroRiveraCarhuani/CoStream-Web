import { Component, Input, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomStateService } from '../../services/room-state.service';
import { MarkdownPipe } from '../../../../shared/pipes/markdown-pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, MarkdownPipe],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat {
  @Input({ required: true }) roomId!: string;

  protected roomState = inject(RoomStateService);
  newMessage: string = '';

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.roomState.sendMessage(this.roomId, this.newMessage);
    this.newMessage = '';
  }

  handleEnter(event: any) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}