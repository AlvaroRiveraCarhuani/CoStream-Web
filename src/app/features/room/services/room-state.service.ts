import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { RoomParticipant, ChatMessage } from '../../../shared/interfaces/shared.interfaces';

@Injectable({ providedIn: 'root' })
export class RoomStateService {
  private socket!: Socket;
  private zone = inject(NgZone);

  public participants = signal<RoomParticipant[]>([]);
  public messages = signal<ChatMessage[]>([]);

  public onStageParticipants = computed(() => 
    this.participants().filter(p => p.isOnStage)
  );

  public backstageParticipants = computed(() => 
    this.participants().filter(p => !p.isOnStage && p.role !== 'VIEWER')
  );

  connect(roomId: string) {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
      upgrade: false
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al motor WebSocket de CoStream');
      this.socket.emit('room:join', { roomId });
    });

    this.socket.on('chat:broadcast', (message: ChatMessage) => {
      this.zone.run(() => this.messages.update(msgs => [...msgs, message]));
    });

    this.socket.on('room:participant_joined', (data) => {
      const newParticipant: RoomParticipant = {
        userId: data.user.id,
        name: data.user.displayName || data.user.email.split('@')[0],
        role: data.user.role || 'VIEWER',
        isOnStage: false
      };
      this.zone.run(() => this.participants.update(users => [...users, newParticipant]));
    });

    this.socket.on('room:kicked', () => {
      alert('El anfitrión ha finalizado la transmisión.');
      this.zone.run(() => {
        this.disconnect();
        window.location.href = '/dashboard';
      });
    });
  }

  sendMessage(roomId: string, text: string, type: 'text' | 'image' = 'text') {
    if (this.socket && text.trim()) {
      this.socket.emit('chat:send', { roomId, text, type });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}