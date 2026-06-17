import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { RoomParticipant, ChatMessage } from '../../../shared/interfaces/shared.interfaces';
import { LivekitService } from './livekit.service';
import { environment } from '../../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class RoomStateService {
  private socket!: Socket;
  private zone = inject(NgZone);
  private http = inject(HttpClient);
  private livekitService = inject(LivekitService);
  private apiUrl = `${environment.apiUrl}/rooms`;

  public participants = signal<RoomParticipant[]>([]);
  public messages = signal<ChatMessage[]>([]);
  public onStageParticipants = computed(() => this.participants().filter(p => p.isOnStage));
  public backstageParticipants = computed(() => this.participants().filter(p => !p.isOnStage && p.role !== 'VIEWER'));

  async loadMessageHistory(roomId: string) {
    try {
      const history = await this.http.get<any[]>(`${this.apiUrl}/${roomId}/messages`).toPromise();
      if (history && history.length) {
        this.zone.run(() => this.messages.set(history));
      }
    } catch (error) {
      console.error('Error al cargar historial de mensajes', error);
    }
  }

  connect(roomId: string, onConnected?: () => void) {
    const token = localStorage.getItem('costream_token');

    this.socket = io(environment.socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
      upgrade: false,
      auth: { token }
    });

    this.socket.on('connect', async () => {
      onConnected?.();
      this.socket.emit('room:join', { roomId });
      await this.loadMessageHistory(roomId);
    });

    this.socket.on('room:current_participants', (participantsList: any[]) => {
      this.zone.run(() => {
        const mapped = participantsList.map(p => ({
          userId: p.user.id,
          name: p.user.displayName || p.user.email?.split('@')[0],
          role: p.user.role || 'VIEWER',
          isOnStage: p.user.role === 'HOST',
        }));
        this.participants.set(mapped);
      });
    });

    this.socket.on('room:participant_joined', (data) => {
      const isHost = data.user.role === 'HOST';
      const newParticipant: RoomParticipant = {
        userId: data.user.id,
        name: data.user.displayName || data.user.email?.split('@')[0],
        role: data.user.role || 'VIEWER',
        isOnStage: isHost,
      };
      this.zone.run(() => {
        this.participants.update(users => {
          if (users.some(u => u.userId === newParticipant.userId)) return users;
          return [...users, newParticipant];
        });
      });
    });

    this.socket.on('room:user_left', (data: { userId: string }) => {
      this.zone.run(() => {
        this.participants.update(users => users.filter(p => p.userId !== data.userId));
      });
    });

    this.socket.on('room:kicked', () => {
      this.zone.run(() => {
        const toast = document.createElement('div');
        toast.className = 'toast-container';
        toast.innerHTML = `<div class="toast"><span class="material-symbols-outlined" style="color: #ef4444;">error</span><span>El anfitrión ha finalizado la transmisión.</span></div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        this.disconnect();
        window.location.href = '/dashboard';
      });
    });

    this.socket.on('chat:broadcast', (message: ChatMessage) => {
      this.zone.run(() => this.messages.update(msgs => [...msgs, message]));
    });

    this.socket.on('room:promoted', (data: { userId: string }) => {
      this.zone.run(() => {
        this.participants.update(users => 
          users.map(u => u.userId === data.userId ? { ...u, isOnStage: true } : u)
        );
      });
    });

    // ========== LISTENERS DE MODERACIÓN ==========
    
    // Escucha cuando el anfitrión fuerza el estado del micrófono
    this.socket.on('force_microphone', (data: { enabled: boolean }) => {
      console.log('force_microphone recibido:', data);
      this.zone.run(async () => {
        // Al llamar a setMicrophoneEnabled, se dispara el callback onMuteStatusChange
        // que actualiza el botón en room.ts
        await this.livekitService.setMicrophoneEnabled(data.enabled);
      });
    });

    // Escucha cuando el anfitrión fuerza el estado de la cámara
    this.socket.on('force_camera', (data: { enabled: boolean }) => {
      console.log('force_camera recibido:', data);
      this.zone.run(async () => {
        await this.livekitService.setCameraEnabled(data.enabled);
      });
    });
  }

  sendMessage(roomId: string, text: string, type: 'text' | 'image' = 'text') {
    if (this.socket && text.trim()) {
      this.socket.emit('chat:send', { roomId, text, type });
    }
  }

  sendModCommand(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}