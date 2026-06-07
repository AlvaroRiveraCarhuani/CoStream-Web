import { Component, inject } from '@angular/core';
import { RoomStateService } from '../../services/room-state.service';

@Component({
  selector: 'app-stage',
  standalone: true,
  imports: [],
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