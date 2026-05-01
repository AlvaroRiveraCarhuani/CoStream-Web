import { Component, inject } from '@angular/core';
import { RoomStateService } from '../../services/room-state.service';

@Component({
  selector: 'app-stage',
  imports: [],
  templateUrl: './stage.html',
  styleUrl: './stage.css'
})
export class Stage {
  protected roomState = inject(RoomStateService);

  // Esta función conecta la vista con el servicio
  subirAlEscenario(userId: string) {
    this.roomState.promoteToStage(userId);
  }
}