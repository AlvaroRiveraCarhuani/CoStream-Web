import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'login/success', // La ruta exacta a la que redirige tu backend de NestJS
    loadComponent: () => import('./features/auth/oauth-callback/oauth-callback').then(m => m.OauthCallback)
  },
  
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'room/:id', 
    loadComponent: () => import('./features/room/room').then(m => m.Room),
    canActivate: [authGuard] 
  },
  {
    path: '**', 
    redirectTo: ''
  }
];