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
  @Input() roomId: string = '';
  protected roomState = inject(RoomStateService);

  subirAlEscenario(userId: string) {
    this.roomState.sendModCommand('mod:promote', {
      roomId: this.roomId,
      targetUserId: userId,
    });
  }
}