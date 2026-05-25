import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roomGuard } from './core/guards/room-guard'; 

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then(m => m.Landing)
  },
  {
    path: 'join/:id',
    loadComponent: () => import('./features/room-join/room-join').then(m => m.RoomJoin)
  },
  
  // --- AUTENTICACIÓN ---
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'login/success',
    loadComponent: () => import('./features/auth/oauth-callback/oauth-callback').then(m => m.OauthCallback)
  },
  
  // --- ZONAS PRIVADAS (Requieren cuenta) ---
  {
    path: 'dashboard', 
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    canActivate: [authGuard]
  },
  
  {
    path: 'room/:id', 
    loadComponent: () => import('./features/room/room').then(m => m.Room),
    canActivate: [roomGuard] 
  },
  
  {
    path: '**', 
    redirectTo: ''
  }
];