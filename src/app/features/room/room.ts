import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomStateService } from './services/room-state.service';
import { RoomApiService } from '../../core/services/room-api';
import { AuthService } from '../../core/services/auth';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room.test.html', // 🧪 APUNTAMOS AL ARCHIVO DE PRUEBAS
  // styleUrls: ['./room.css'], // Comentamos el CSS para no interferir
})
export class Room implements OnInit, OnDestroy {
  protected roomState = inject(RoomStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomApi = inject(RoomApiService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  roomId = '';
  isHost = false;
  chatInput = signal('');

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
          
          // 🔥 FIX: Le gritamos a Angular: "¡Actualiza el HTML AHORA MISMO!"
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }
  onSendMessage() {
    const text = this.chatInput();
    if (text.trim() && this.roomId) {
      this.roomState.sendMessage(this.roomId, text);
      this.chatInput.set('');
    }
  }

  leaveRoom() {
    this.router.navigate(['/dashboard']); 
  }

  // 🔥 ARREGLO F5: Eliminamos el @HostListener('window:beforeunload') 
  // Ahora recargar la página no matará la sala.

ngOnDestroy() {
    if (this.isHost && this.roomId) {
      // 1. Avisamos al socket que expulse a todos
      this.roomState.sendMessage(this.roomId, 'Cerrando sala...');
      // Si el socket sigue vivo, emitimos el evento de cierre
      if (this.roomState['socket']) { 
        this.roomState['socket'].emit('room:end_broadcast', { roomId: this.roomId });
      }
      
      // 2. Apagamos la sala en la base de datos
      this.roomApi.endRoom(this.roomId).subscribe();
    }
    this.roomState.disconnect();
  }
}