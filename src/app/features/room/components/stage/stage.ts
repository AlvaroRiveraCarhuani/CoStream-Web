import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomStateService } from '../../services/room-state.service';

@Component({
  selector: 'app-stage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage.html',
  styleUrls: ['./stage.css']
})
export class Stage {
  protected roomState = inject(RoomStateService);

  promoteToStage(userId: string) {
    // Aquí lógica para subir al escenario (socket)
  }

  subirAlEscenario(userId: string) {
    this.promoteToStage(userId);
  }
}