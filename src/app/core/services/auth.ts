import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface AuthResponse {
  accessToken?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Ajusta la URL base según tus entornos
  private API_URL = `${environment.apiUrl}`;
  private TOKEN_KEY = 'costream_token';

  // Signal que maneja el estado global del usuario en Angular 21
  currentUser = signal<any | null>(null);

  constructor() {
    this.checkInitialAuth();
  }

  // 1. LOGIN TRADICIONAL — guarda el token en localStorage para auth con Bearer
  login(email: string, passwordPlain: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, {
      email,
      password: passwordPlain
    }).pipe(
      tap(response => {
        if (response.accessToken) {
          this.saveToken(response.accessToken);
        }
        if (response.user) {
          this.currentUser.set(response.user);
        }
      })
    );
  }

  // 2. LOGOUT SEGURO (Mata la cookie en NestJS y limpia el estado local)
  logout(): void {
    this.http.post(`${this.API_URL}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearLocalSession(),
      error: () => this.clearLocalSession() // Si falla la red, igual limpiamos el cliente
    });
  }


  
  checkSession(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/auth/profile`, { withCredentials: true }).pipe(
      tap(user => {
        this.currentUser.set(user);
      })
    );
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Guarda el JWT en localStorage (usado por Google OAuth y login tradicional)
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private checkInitialAuth(): void {
    // Intenta recuperar perfil si existe una sesión activa por Cookie
    this.checkSession().subscribe({
      error: () => this.currentUser.set(null)
    });
  }

  private clearLocalSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }
}