import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { RoomParticipant, ChatMessage } from '../../../shared/interfaces/shared.interfaces';

@Injectable({ providedIn: 'root' })
export class RoomStateService {
  private socket!: Socket;
  private zone = inject(NgZone);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/rooms';

  public participants = signal<RoomParticipant[]>([]);
  public messages = signal<ChatMessage[]>([]);
  public onStageParticipants = computed(() => this.participants().filter(p => p.isOnStage));
  public backstageParticipants = computed(() => this.participants().filter(p => !p.isOnStage && p.role !== 'VIEWER'));

  async loadMessageHistory(roomId: string) {
    try {
      const history = await this.http.get<any[]>(`${this.apiUrl}/${roomId}/messages`).toPromise();
      if (history && history.length) {
        this.zone.run(() => {
          this.messages.set(history);
        });
      }
    } catch (error) {
      console.error('Error al cargar historial de mensajes', error);
    }
  }

  connect(roomId: string) {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
      upgrade: false
    });

    this.socket.on('connect', async () => {
      this.socket.emit('room:join', { roomId });
      await this.loadMessageHistory(roomId);
    });

    // Historial de participantes actuales (al unirse)
    this.socket.on('room:current_participants', (participantsList: any[]) => {
      this.zone.run(() => {
        const mapped = participantsList.map(p => ({
          userId: p.user.id,
          name: p.user.displayName || p.user.email?.split('@')[0],
          role: p.user.role || 'VIEWER',
          isOnStage: p.user.role === 'HOST' ? true : false, // Host al escenario
        }));
        this.participants.set(mapped);
      });
    });

    // Evitar duplicados al unirse un nuevo participante, y si es HOST, poner isOnStage = true
    this.socket.on('room:participant_joined', (data) => {
      const isHost = data.user.role === 'HOST';
      const newParticipant: RoomParticipant = {
        userId: data.user.id,
        name: data.user.displayName || data.user.email?.split('@')[0],
        role: data.user.role || 'VIEWER',
        isOnStage: isHost, // ✅ Host al escenario automáticamente
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
      alert('El anfitrión ha finalizado la transmisión.');
      this.zone.run(() => {
        this.disconnect();
        window.location.href = '/dashboard';
      });
    });

    // Mensajes de chat
    this.socket.on('chat:broadcast', (message: ChatMessage) => {
      this.zone.run(() => this.messages.update(msgs => [...msgs, message]));
    });
  }

  sendMessage(roomId: string, text: string, type: 'text' | 'image' = 'text') {
    if (this.socket && text.trim()) {
      this.socket.emit('chat:send', { roomId, text, type });
    }
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}