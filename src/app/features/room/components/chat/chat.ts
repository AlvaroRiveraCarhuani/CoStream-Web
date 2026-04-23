import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common'; // 1. Importamos la herramienta de fechas
import { RoomStateService } from '../../services/room-state.service';
import { MarkdownPipe } from '../../../../shared/pipes/markdown-pipe'; // <-- 1. Importamos el Pipe de Markdown

@Component({
  selector: 'app-chat',
  imports: [DatePipe, MarkdownPipe], // <-- 2. Le damos permiso al HTML para usarlo
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
  protected roomState = inject(RoomStateService);
}