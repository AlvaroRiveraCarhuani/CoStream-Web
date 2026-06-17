import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { RoomApiService } from '../../core/services/room-api';
import { RoomJoinResponse } from '../../shared/interfaces/shared.interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  private authService = inject(AuthService);
  public roomApi = inject(RoomApiService); 
  private router = inject(Router);
  private fb = inject(FormBuilder);

  user = this.authService.currentUser;

  isCreateModalOpen = false;
  isJoinModalOpen = false;
  selectedRoomIdToJoin = '';
  
  // Formularios
  createForm = this.fb.group({
    title: ['', Validators.required],
    isPublic: [true],
    requiresPin: [false],
    pin: ['']
  });

  joinForm = this.fb.group({
    displayName: ['', Validators.required],
    pin: ['']
  });

  ngOnInit() {
    if (!this.user()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Cargar datos divididos
    this.roomApi.loadMyActiveRoom(); // Busca la sala del propietario
    this.roomApi.loadPublicRooms();  // Busca el directorio de la comunidad
    this.roomApi.loadRoomHistory();
    
    // Autocompletar el nombre en el modal de join
    this.joinForm.patchValue({ displayName: this.user()?.displayName || '' });
  }

  // --- MÉTODOS DE CREACIÓN ---
  openCreateModal() { this.isCreateModalOpen = true; }
  closeCreateModal() { this.isCreateModalOpen = false; this.createForm.reset({ isPublic: true, requiresPin: false }); }

  // 🔁 Método onCreateSubmit CORREGIDO (con manejo de errores y cierre rápido del modal)
  onCreateSubmit() {
    if (this.createForm.invalid) return;
    const formValue = this.createForm.getRawValue();
    
    this.roomApi.createRoom({
      title: formValue.title!,
      isPublic: formValue.isPublic!,
      requiresPin: formValue.requiresPin!,
      pin: formValue.requiresPin ? formValue.pin! : undefined
    }).subscribe({
      next: (res: any) => { // Usamos 'any' porque Prisma devuelve la estructura de la BD
        
        // 1. Ocultamos la ventana oscura del modal inmediatamente
        this.closeCreateModal();

        // 2. Extraemos el ID real (Prisma devuelve 'id', no 'roomId')
        const newRoomId = res.id || res.roomId;

        // 3. Guardamos el token si el backend lo generó en este paso
        if (res.hostToken) {
          localStorage.setItem('livekit_token', res.hostToken);
        }

        // 4. Navegamos al estudio desactivando el botón "Atrás" del navegador
        this.router.navigate(['/room', newRoomId], { replaceUrl: true });
      },
      error: (err) => {
        // Si algo falla, ahora lo veremos claramente
        console.error('Error al crear la transmisión:', err);
        this.closeCreateModal();
      }
    });
  }

  // --- MÉTODOS DE ACCESO ---
  openJoinModal(roomId: string = '') { 
    this.selectedRoomIdToJoin = roomId;
    this.isJoinModalOpen = true; 
  }
  
  closeJoinModal() { 
    this.isJoinModalOpen = false; 
    this.joinForm.reset(); 
    this.selectedRoomIdToJoin = ''; 
  }

  onJoinSubmit() {
    if (this.joinForm.invalid || !this.selectedRoomIdToJoin) return;
    const formValue = this.joinForm.getRawValue();

    this.roomApi.joinRoom({
      roomId: this.selectedRoomIdToJoin,
      displayName: formValue.displayName!,
      pin: formValue.pin!
    }).subscribe({
      next: (res: RoomJoinResponse) => {
        localStorage.setItem('livekit_token', res.guestToken!);
        this.router.navigate(['/room', this.selectedRoomIdToJoin]);
      }
    });
  }

  copyRoomLink(roomId: string, event: MouseEvent) {
    const joinUrl = `${window.location.origin}/join/${roomId}`;
    const btn = event.currentTarget as HTMLButtonElement;
    const originalLabel = btn.querySelector('.label')?.textContent;

    navigator.clipboard.writeText(joinUrl).then(() => {
      const label = btn.querySelector('.label');
      if (label) {
        label.textContent = '¡Copiado!';
        btn.classList.add('copied');
        
        setTimeout(() => {
          if (label) label.textContent = originalLabel || 'Copiar Link';
          btn.classList.remove('copied');
        }, 2000);
      }
    });
  }
  
  logout() { this.authService.logout(); }


  // --- MÉTODOS EXCLUSIVOS DEL HOST PARA SU SALA ---

  goToMyRoom(roomId: string) {
    this.router.navigate(['/room', roomId]);
  }

  roomToConfirmEnd: string | null = null;

  endActiveRoom(roomId: string) {
    this.roomToConfirmEnd = roomId;
  }

  confirmEndActiveRoom() {
    if (this.roomToConfirmEnd) {
      this.roomApi.endRoom(this.roomToConfirmEnd).subscribe({
        next: () => {
          this.roomApi.myActiveRoom.set(null); 
          // Refrescamos el historial para que aparezca ahí
          this.roomApi.loadRoomHistory(); 
        },
        error: (err) => console.error('Error al cerrar sala', err)
      });
      this.roomToConfirmEnd = null;
    }
  }

  cancelEndActiveRoom() {
    this.roomToConfirmEnd = null;
  }
}