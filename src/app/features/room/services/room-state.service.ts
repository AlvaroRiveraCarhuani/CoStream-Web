import { Injectable, signal, computed } from '@angular/core';
import { RoomParticipant, ChatMessage } from '../../../shared/interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class RoomStateService {
  // 1. Signals principales con datos simulados (Mocks)
  participants = signal<RoomParticipant[]>([
    { userId: 'u1', name: 'Rodrigo', role: 'HOST', isOnStage: true },
    { userId: 'u2', name: 'Alvaro', role: 'PRESENTER', isOnStage: true },
    { userId: 'u3', name: 'Invitado', role: 'PRESENTER', isOnStage: false },
    { userId: 'u4', name: 'Espectador', role: 'VIEWER', isOnStage: false }
  ]);

  messages = signal<ChatMessage[]>([
    { 
      id: 'm1', 
      senderName: 'Rodrigo', 
      role: 'HOST', 
      content: 'Bienvenidos a la prueba de CoStream.', 
      timestamp: new Date().toISOString() 
    },
    { 
      id: 'm2', 
      senderName: 'Alvaro', 
      role: 'PRESENTER', 
      content: '```typescript\nconsole.log("Señal WebRTC lista");\n```', 
      timestamp: new Date().toISOString() 
    }
  ]);

  // 2. Computed Signals (Filtros automáticos para la vista)
  onStageParticipants = computed(() => 
    this.participants().filter(p => p.isOnStage)
  );

  backstageParticipants = computed(() => 
    this.participants().filter(p => !p.isOnStage && p.role !== 'VIEWER')
  );

  constructor() {}

  // --- FUNCIONES INTERACTIVAS NUEVAS ---

  // 1. Inyecta nuevos mensajes al chat
  addMessage(content: string, senderName: string, role: 'HOST' | 'PRESENTER' | 'VIEWER') {
    const newMessage = {
      id: 'm' + Date.now(),
      senderName: senderName,
      role: role,
      content: content,
      timestamp: new Date().toISOString()
    };

    this.messages.update(mensajesActuales => [...mensajesActuales, newMessage]);
  }

  // 2. Mueve a un participante del backstage al escenario principal
  promoteToStage(userId: string) {
    this.participants.update(participantesActuales => 
      participantesActuales.map(p => 
        p.userId === userId ? { ...p, isOnStage: true } : p
      )
    );
  }
}