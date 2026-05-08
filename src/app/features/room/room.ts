import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomStateService } from './services/room-state.service';
import { RoomApiService } from '../../core/services/room-api';
import { AuthService } from '../../core/services/auth';
import { Stage } from './components/stage/stage';
import { Chat } from './components/chat/chat';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [Stage, Chat],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class Room implements OnInit, OnDestroy {
  protected roomState = inject(RoomStateService);
  private route = inject(ActivatedRoute);
  private roomApi = inject(RoomApiService);
  private authService = inject(AuthService);

  roomId = '';
  isHost = false;

  // --- ESTADOS DE LOS CONTROLES MULTIMEDIA ---
  isMuted: boolean = false;
  isCameraOff: boolean = false;
  isScreenSharing: boolean = false;

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    
    const user = this.authService.currentUser();
    this.isHost = !!user;
  }

  // --- FUNCIONES DE CONTROLES MULTIMEDIA ---
  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  toggleCamera() {
    this.isCameraOff = !this.isCameraOff;
  }

  toggleScreenShare() {
    this.isScreenSharing = !this.isScreenSharing;
  }

  leaveRoom() {
    console.log('Saliendo de la sala...');
    // Aquí más adelante agregaremos la lógica para salir y volver al Dashboard
  }

  // --- CONTROL DE CIERRE DE SALA ---
  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    if (this.isHost && this.roomId) {
      const url = `http://localhost:3000/api/rooms/${this.roomId}/end`;
      navigator.sendBeacon(url); 
    }
  }

  ngOnDestroy() {
    if (this.isHost && this.roomId) {
      this.roomApi.endRoom(this.roomId).subscribe();
    }
  }
}