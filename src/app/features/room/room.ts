import { Component, inject } from '@angular/core';
import { RoomStateService } from './services/room-state.service';
// Importamos los subcomponentes. 
import { Stage } from './components/stage/stage';
import { Chat } from './components/chat/chat';

@Component({
  selector: 'app-room',
  imports: [Stage, Chat], // Le decimos a Angular que usaremos estos componentes en el HTML
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class Room {
  // Inyectamos el cerebro de la sala para tener acceso a los datos falsos
  protected roomState = inject(RoomStateService);
}