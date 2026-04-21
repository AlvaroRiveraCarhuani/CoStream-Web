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
    
  // Lista de usuarios que deben renderizarse en el Grid central principal
    onStageParticipants = computed(() => 
    this.participants().filter(p => p.isOnStage)
    );

  // Lista de usuarios en la barra inferior (excluye a los VIEWERS que no tienen cámara)
    backstageParticipants = computed(() => 
    this.participants().filter(p => !p.isOnStage && p.role !== 'VIEWER')
    );

    constructor() {}
}