import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roomGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const roomId = route.paramMap.get('id');

  const isHost = !!authService.currentUser();
  
  const isGuest = !!localStorage.getItem('livekit_token');

  if (isHost || isGuest) {
    return true; 
  }

  return router.createUrlTree(['/join', roomId]);
};