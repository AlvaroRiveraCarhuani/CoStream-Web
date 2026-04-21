import { Component, inject } from '@angular/core';
import { RoomStateService } from '../../services/room-state.service';

@Component({
  selector: 'app-stage',
  imports: [],
  templateUrl: './stage.html',
  styleUrl: './stage.css'
})
export class Stage {
  // Inyectamos el servicio para leer quién está en el escenario y quién en backstage
  protected roomState = inject(RoomStateService);
}