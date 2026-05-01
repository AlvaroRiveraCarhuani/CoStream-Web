import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. Importamos la herramienta de fechas
import { RoomStateService } from '../../services/room-state.service';
import { MarkdownPipe } from '../../../../shared/pipes/markdown-pipe'; // <-- 1. Importamos el Pipe de Markdown

@Component({
  selector: 'app-chat',
  imports: [DatePipe, MarkdownPipe, FormsModule], // Agregamos FormsModule aquí
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
  protected roomState = inject(RoomStateService);
  
  // Almacena el texto temporal del área de escritura
  newMessage: string = '';

  sendMessage() {
    if (!this.newMessage.trim()) return;

    // Invocamos la función del servicio pasándole tus datos simulados
    this.roomState.addMessage(this.newMessage, 'Rodrigo', 'HOST');
    
    // Limpiamos el editor de texto tras el envío
    this.newMessage = ''; 
  }

  // Captura el Enter ordinario para enviar, pero respeta Shift+Enter para saltos de línea
  handleEnter(event: any) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}