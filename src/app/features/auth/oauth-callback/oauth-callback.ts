import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background-color: #0f172a; color: white; font-family: sans-serif;">
      <h2 style="margin-bottom: 1rem;">Verificando credenciales...</h2>
      <div class="spinner" style="border: 4px solid rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #38bdf8; animation: spin 1s linear infinite;"></div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </div>
  `
})
export class OauthCallback implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.checkSession().subscribe({
      next: () => {
        // Redirección directa al dashboard del Host
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        // Si el token falló o la cookie expiró, vuelve al login
        this.router.navigate(['/auth/login']);
      }
    });
  }
}