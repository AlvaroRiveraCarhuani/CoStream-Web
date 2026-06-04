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

  // Método temporal (evita el error)
  promoteToStage(userId: string) {
    console.log('Promote to stage:', userId);
    // Aquí luego se implementará la lógica real
  }

  // Si había un método subirAlEscenario que usaba promoteToStage, lo corregimos
  subirAlEscenario(userId: string) {
    this.promoteToStage(userId);
  }
}