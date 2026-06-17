import { Component, OnInit, OnDestroy, inject, signal, HostListener, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomStateService } from './services/room-state.service';
import { RoomApiService } from '../../core/services/room-api';
import { AuthService } from '../../core/services/auth';
import { Stage } from './components/stage/stage';
import { Chat } from './components/chat/chat';
import { LivekitService } from './services/livekit.service';

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
  private livekitService = inject(LivekitService);

  roomId = '';
  isHost = false;
  chatInput = signal('');

  isMuted = false;
  isCameraOff = false;
  isScreenSharing = false;
  dropdownOpen = false;
  showParticipants = true;
  socketConnected = false;

  get currentUserId(): string {
    const user = this.authService.currentUser();
    return user?.sub || user?.id || '';
  }

  get participantsList(): any[] {
    return this.roomState.participants?.() ?? [];
  }

  get participantsCount(): number {
    return this.participantsList.length;
  }

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.roomId) {
      this.roomApi.getRoomStatus(this.roomId).subscribe({
        next: (roomData) => {
          if (!roomData.exists) {
            alert('Esta sala ya no existe o ha finalizado.');
            this.router.navigate(['/dashboard']);
            return;
          }

          this.isHost = (roomData.creatorId === this.currentUserId);

          // NUEVO: Lógica unificada para Anfitriones e Invitados
          const currentUser = this.authService.currentUser();
          const guestName = localStorage.getItem('guest_name');
          
          // Generamos una ID aleatoria si es un invitado sin cuenta
          const userId = currentUser ? (currentUser.sub || currentUser.id) : ('guest_' + Math.random().toString(36).substr(2, 9));
          const finalName = currentUser ? (currentUser.displayName || currentUser.email?.split('@')[0]) : (guestName || 'Invitado');

          // Agregamos al usuario local a la lista (sea Host o Guest)
          this.roomState.participants.set([{
            userId: userId,
            name: finalName,
            role: this.isHost ? 'HOST' : 'PRESENTER',
            isOnStage: this.isHost,
          }]);

          this.roomState.connect(this.roomId, () => {
            this.socketConnected = true;
            this.cdr.detectChanges();
          });
          this.cdr.detectChanges();

          const token = localStorage.getItem('livekit_token');
          if (token) {
            this.livekitService.connect(this.roomId, token, 'local-video', 'remote-videos')
              .catch(err => console.error('Error conectando a LiveKit:', err));
          }
        },
        error: () => this.router.navigate(['/dashboard'])
      });
    }
  }

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

  async toggleMute() {
    const newState = await this.livekitService.toggleMicrophone();
    this.isMuted = !newState;
    this.cdr.detectChanges();
  }

  async toggleCamera() {
    const newState = await this.livekitService.toggleCamera();
    this.isCameraOff = !newState;
    this.cdr.detectChanges();
  }

  toggleScreenShare() {
    this.isScreenSharing = !this.isScreenSharing;
  }

  leaveRoom() {
    if (this.isHost) {
      if (confirm('¿Finalizar la transmisión? Se expulsará a todos los participantes.')) {
        if (this.roomState['socket']) {
          this.roomState['socket'].emit('room:end_broadcast', { roomId: this.roomId });
        }
        this.roomApi.endRoom(this.roomId).subscribe({
          next: () => {
            this.cleanupAndNavigate();
          },
          error: () => {}
        });
      }
    } else {
      this.cleanupAndNavigate();
    }
  }

  private cleanupAndNavigate() {
    this.roomState.disconnect();
    this.livekitService.disconnect();
    localStorage.removeItem('livekit_token');
    localStorage.removeItem('guest_name');
    this.router.navigate(['/dashboard']);
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
  }

  // ========== MÉTODOS DE MODERACIÓN ==========
  muteRemoteParticipant(targetUserId: string, mute: boolean) {
    if (!this.isHost) return;
    this.roomState.sendModCommand('mod:set_microphone', {
      roomId: this.roomId,
      targetUserId,
      enabled: !mute
    });
  }

  setRemoteCamera(targetUserId: string, enabled: boolean) {
    if (!this.isHost) return;
    this.roomState.sendModCommand('mod:set_camera', {
      roomId: this.roomId,
      targetUserId,
      enabled
    });
  }

  kickParticipant(targetUserId: string) {
    if (!this.isHost) return;
    if (confirm('¿Expulsar a este participante?')) {
      this.roomState.sendModCommand('mod:kick', {
        roomId: this.roomId,
        targetUserId
      });
    }
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
    this.livekitService.disconnect();
  }
}