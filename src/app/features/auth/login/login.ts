import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage = '';
  isLoading = false;

  ngOnInit() {
    // Si la cookie ya es válida, checkSession() disparará la carga del usuario
    this.authService.checkSession().subscribe({
      next: () => this.router.navigate(['/dashboard'], { replaceUrl: true }),
      error: () => { /* Nos quedamos en el login */ }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { email, password } = this.loginForm.getRawValue();
    
    this.authService.login(email, password).subscribe({
      next: () => {
        // Al loguearse manualmente, la cookie ya se guardó. Ahora refrescamos el estado.
        this.authService.checkSession().subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => {
            this.isLoading = false;
            this.errorMessage = 'Error al cargar perfil';
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Credenciales incorrectas';
      }
    });
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/api/auth/google';
  }
}