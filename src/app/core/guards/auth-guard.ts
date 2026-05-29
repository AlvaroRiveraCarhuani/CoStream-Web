import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Si ya hay sesión en memoria (navegación normal), pasa al instante
  if (authService.currentUser()) {
    return true; 
  }

  // 2. Si no hay memoria (F5), CONGELAMOS la ruta y le preguntamos a NestJS
  return authService.checkSession().pipe(
    map(user => {
      // Si NestJS responde con un usuario, lo dejamos pasar
      if (user) return true;
      // Si NestJS responde vacío, lo botamos al login
      return router.parseUrl('/auth/login');
    }),
    catchError(() => {
      return of(router.parseUrl('/auth/login'));
    })
  );
};