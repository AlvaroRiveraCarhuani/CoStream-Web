import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomApiService } from '../../core/services/room-api';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-room-join',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './room-join.html',
  styleUrls: ['./room-join.css']
})
export class RoomJoin implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private roomApi = inject(RoomApiService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef); // Inyección directa para control del DOM

  roomId = '';
  status: 'loading' | 'ready' | 'not-found' = 'loading';
  requiresPin = false;
  user = this.authService.currentUser();
  errorMessage = '';

  joinForm = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    pin: ['']
  });

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.roomId) return;

    if (this.user) {
      this.joinForm.patchValue({ displayName: this.user.displayName });
      this.joinForm.get('displayName')?.disable();
    }

    this.roomApi.checkRoomStatus(this.roomId).subscribe({
      next: (res) => {
        if (!res.exists) {
          this.status = 'not-found';
        } else {
          this.requiresPin = res.requiresPin;
          if (this.requiresPin) {
            this.joinForm.get('pin')?.setValidators(Validators.required);
            this.joinForm.get('pin')?.updateValueAndValidity();
          }
          this.status = 'ready';
        }
        // Forzamos el repintado inmediato de la interfaz
        this.cdr.detectChanges(); 
      },
      error: () => {
        this.status = 'not-found';
        // Forzamos el repintado incluso si hay un error de red
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    if (this.joinForm.invalid) return;
    this.errorMessage = '';
    
    const formValue = this.joinForm.getRawValue();
    
    this.roomApi.joinRoom({
      roomId: this.roomId,
      displayName: formValue.displayName,
      pin: formValue.pin
    }).subscribe({
      next: (res) => {
        localStorage.setItem('livekit_token', res.guestToken!);
        this.router.navigate(['/room', this.roomId]);
      },
      error: (err) => {
         this.errorMessage = err.error?.message || 'Error al ingresar. Verifique el PIN.';
         this.cdr.detectChanges(); 
      }
    });
  }
}