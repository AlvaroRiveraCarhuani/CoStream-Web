import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomStateService } from './services/room-state.service';
import { RoomApiService } from '../../core/services/room-api';
import { AuthService } from '../../core/services/auth';
import { Stage } from './components/stage/stage';
import { Chat } from './components/chat/chat';
import { CommonModule } from '@angular/common'; // Necesario para ngIf y ngFor

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [Stage, Chat, CommonModule],
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

  // --- ESTADOS DEL PANEL LATERAL (Estilo Google Meet) ---
  isSidebarOpen: boolean = false; // Inicia cerrado para maximizar el video
  activeTab: 'chat' | 'participants' = 'chat';

  // --- DATOS SIMULADOS DE PARTICIPANTES ---
  participants = [
    { name: 'Rodrigo', role: 'HOST', isMuted: false, isCameraOff: false },
    { name: 'Alvaro', role: 'PRESENTER', isMuted: false, isCameraOff: false },
    { name: 'Invitado', role: 'GUEST', isMuted: true, isCameraOff: true }
  ];

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    const user = this.authService.currentUser();
    this.isHost = !!user;
  }

  // --- FUNCIONES DE CONTROLES MULTIMEDIA ---
  toggleMute() { this.isMuted = !this.isMuted; }
  toggleCamera() { this.isCameraOff = !this.isCameraOff; }
  toggleScreenShare() { this.isScreenSharing = !this.isScreenSharing; }
  
  leaveRoom() {
    console.log('Saliendo de la sala...');
  }

  // --- FUNCIÓN DEL PANEL LATERAL ---
  toggleSidebar(tab: 'chat' | 'participants') {
    if (this.isSidebarOpen && this.activeTab === tab) {
      // Si haces clic en el botón de la pestaña actual, se cierra el panel
      this.isSidebarOpen = false;
    } else {
      // Si está cerrado o clicas en el otro botón, se abre en la pestaña deseada
      this.isSidebarOpen = true;
      this.activeTab = tab;
    }
  }

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