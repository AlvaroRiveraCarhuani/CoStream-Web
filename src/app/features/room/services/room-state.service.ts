import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { RoomParticipant, ChatMessage } from '../../../shared/interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class RoomStateService {
  private socket!: Socket;
  private zone = inject(NgZone);

  // 1. Signals estrictamente tipadas
  public participants = signal<RoomParticipant[]>([]);
  public messages = signal<ChatMessage[]>([]);

  // 2. Computed Signals para el Stage
  public onStageParticipants = computed(() => 
    this.participants().filter(p => p.isOnStage)
  );

  public backstageParticipants = computed(() => 
    this.participants().filter(p => !p.isOnStage && p.role !== 'VIEWER')
  );

  // 3. Motor de WebSockets
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

    // Escuchar mensajes entrantes
    this.socket.on('chat:broadcast', (message: ChatMessage) => {
      console.log('📥 LLEGÓ UN MENSAJE:', message);
      this.zone.run(() => {
        this.messages.update(msgs => [...msgs, message]);
      });
    });

    // Escuchar cuando alguien entra (mapear al formato esperado)
    this.socket.on('room:participant_joined', (data) => {
      // Importante: el backend envía user.id, no user.sub
      const newParticipant: RoomParticipant = {
        userId: data.user.id,
        name: data.user.displayName || data.user.email.split('@')[0],
        role: data.user.role || 'VIEWER',
        isOnStage: false
      };
      this.zone.run(() => {
        this.participants.update(users => [...users, newParticipant]);
      });
    });

    // 🔥 NUEVO: Escuchar si el anfitrión cierra la sala (Grito de muerte)
    this.socket.on('room:kicked', () => {
      alert('El anfitrión ha finalizado la transmisión.');
      this.zone.run(() => {
        this.disconnect();
        // Redirigir al dashboard. Puedes usar Router si lo prefieres, o window.location
        window.location.href = '/dashboard';
      });
    });
  }

  sendMessage(roomId: string, text: string, type: 'text' | 'image' = 'text') {
    if (this.socket && text.trim()) {
      console.log('📤 ENVIANDO:', text);
      this.socket.emit('chat:send', { roomId, text, type });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}