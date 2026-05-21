import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- 1. Importamos el módulo común
import { RoomStateService } from '../../services/room-state.service';

@Component({
  selector: 'app-stage',
  standalone: true,
  imports: [CommonModule], // <-- 2. Lo agregamos a los imports
  templateUrl: './stage.html',
  styleUrl: './stage.css'
})
export class Stage {
  protected roomState = inject(RoomStateService);

  // Recibimos la orden de "Modo Foco" desde la barra inferior de la sala
  @Input() isScreenSharing: boolean = false;

  subirAlEscenario(userId: string) {
    this.roomState.promoteToStage(userId);
  }
}