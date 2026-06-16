import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [],
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
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // El API redirige con ?token=<jwt> para evitar el bloqueo de cookies cross-site
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      // Guardar en localStorage → el interceptor lo mandará como Bearer en cada petición
      this.authService.saveToken(token);
      // Cargar el perfil del usuario en memoria y navegar
      this.authService.checkSession().subscribe({
        next: () => this.router.navigate(['/dashboard'], { replaceUrl: true }),
        error: () => this.router.navigate(['/auth/login'], { replaceUrl: true })
      });
    } else {
      // Fallback: si no hay token en URL, verificar si ya hay sesión activa
      this.authService.checkSession().subscribe({
        next: () => this.router.navigate(['/dashboard'], { replaceUrl: true }),
        error: () => this.router.navigate(['/auth/login'], { replaceUrl: true })
      });
    }
  }
}