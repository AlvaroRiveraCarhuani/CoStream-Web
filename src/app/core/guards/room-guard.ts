import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { RoomApiService } from '../services/room-api';
import { map, catchError, of, forkJoin } from 'rxjs';

export const roomGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const roomApi = inject(RoomApiService);
  const router = inject(Router);
  const roomId = route.paramMap.get('id');

  if (!roomId) {
    return router.createUrlTree(['/dashboard']);
  }

  // 1. Pase temporal (Invitados)
  if (localStorage.getItem('livekit_token')) {
    return true;
  }

  // 2. Doble validación síncrona/asíncrona
  return forkJoin({
    user: authService.checkSession().pipe(catchError(() => of(null))),
    room: roomApi.getRoomStatus(roomId).pipe(catchError(() => of({ exists: false })))
  }).pipe(
    map(responses => {
      const { user, room } = responses;

      // Si la sala NO existe o está inactiva, al Dashboard
      if (!room.exists) {
        alert('Esta sala no existe o ya ha finalizado.');
        return router.createUrlTree(['/dashboard']);
      }

      // Si existe Y eres el creador, pasas directo
      if (user && user.sub === room.creatorId) {
        return true; 
      }

      // Si existe pero NO eres el creador, te mandamos al lobby (Unirse)
      return router.createUrlTree(['/join', roomId]);
    })
  );
};