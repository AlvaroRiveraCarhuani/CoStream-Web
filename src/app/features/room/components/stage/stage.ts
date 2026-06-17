import { Component, inject, Input } from '@angular/core';
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
  @Input() isHost: boolean = false;
  protected roomState = inject(RoomStateService);

  promoteToStage(userId: string) {
    this.roomState.sendModCommand('room:promote', { userId });
  }

  subirAlEscenario(userId: string) {
    this.promoteToStage(userId);
  }
}