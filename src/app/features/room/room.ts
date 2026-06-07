import { Component, OnInit, OnDestroy, inject, signal, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomStateService } from './services/room-state.service';
import { RoomApiService } from '../../core/services/room-api';
import { AuthService } from '../../core/services/auth';
import { ChangeDetectorRef } from '@angular/core';
import { Stage } from './components/stage/stage';
import { Chat } from './components/chat/chat';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule, Stage, Chat],
  templateUrl: './room.html',
  styleUrls: ['./room.css']
})
export class Room implements OnInit, OnDestroy {
  private roomState = inject(RoomStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomApi = inject(RoomApiService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  roomId = '';
  isHost = false;
  chatInput = signal('');

  isMuted = false;
  isCameraOff = false;
  isScreenSharing = false;
  dropdownOpen = false;

  // Control del panel de participantes
  showParticipants = true;

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    const user = this.authService.currentUser();

    if (this.roomId && user) {
      this.roomApi.getRoomStatus(this.roomId).subscribe({
        next: (roomData) => {
          if (!roomData.exists) {
            alert('Esta sala ya no existe o ha finalizado.');
            this.router.navigate(['/dashboard']);
            return;
          }

          this.roomState.connect(this.roomId);
          const myId = user.sub || user.id;
          this.isHost = (roomData.creatorId === myId);
          this.cdr.detectChanges();
        },
        error: () => this.router.navigate(['/dashboard'])
      });
    }
  }

  // Getter para la lista de participantes (para facilitar el template)
  get participantsList(): any[] {
    return this.roomState.participants?.() ?? [];
  }

  get participantsCount(): number {
    return this.participantsList.length;
  }

  // Método para traducir roles
  getRoleLabel(role: string): string {
    switch (role) {
      case 'HOST': return 'Anfitrión';
      case 'PRESENTER': return 'Presentador';
      default: return 'Espectador';
    }
  }

  trackByUserId(index: number, participant: any): string {
    return participant.userId || participant.id;
  }

  toggleParticipantsPanel() {
    this.showParticipants = !this.showParticipants;
  }

  toggleMute() { this.isMuted = !this.isMuted; }
  toggleCamera() { this.isCameraOff = !this.isCameraOff; }
  toggleScreenShare() { this.isScreenSharing = !this.isScreenSharing; }

  leaveRoom() {
    if (this.isHost) {
      if (confirm('¿Finalizar la transmisión? Se expulsará a todos los participantes.')) {
        if (this.roomState['socket']) {
          this.roomState['socket'].emit('room:end_broadcast', { roomId: this.roomId });
        }
        this.roomApi.endRoom(this.roomId).subscribe({
          next: () => {
            this.roomState.disconnect();
            this.router.navigate(['/dashboard']);
          },
          error: () => {}
        });
      }
    } else {
      this.roomState.disconnect();
      this.router.navigate(['/dashboard']);
    }
  }

  copyRoomLink() {
    const url = `${window.location.origin}/join/${this.roomId}`;
    navigator.clipboard.writeText(url).then(() => alert('Enlace copiado'));
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  openSettings() {
    this.dropdownOpen = false;
    // Aquí puedes abrir un modal de configuración (por implementar)
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.dropdownOpen = false;
    }
  }

  @HostListener('window:beforeunload')
  unloadHandler() {
    if (this.isHost && this.roomId && this.roomState['socket']) {
      this.roomState['socket'].emit('room:end_broadcast', { roomId: this.roomId });
    }
  }

  ngOnDestroy() {
    if (this.isHost && this.roomId) {
      this.roomApi.endRoom(this.roomId).subscribe();
      if (this.roomState['socket']) {
        this.roomState['socket'].emit('room:end_broadcast', { roomId: this.roomId });
      }
    }
    this.roomState.disconnect();
  }
}