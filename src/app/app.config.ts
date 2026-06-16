import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { routes } from './app.routes';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth';

export const cookieAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Construir la request con withCredentials (para cookies) Y Bearer (para localStorage)
  const token = authService.getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const secureReq = req.clone({
    withCredentials: true,
    setHeaders: headers
  });
  
  return next(secureReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.currentUser.set(null);
        if (!req.url.includes('/auth/profile')) {
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    })
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(routes), 
    provideHttpClient(
      withFetch(),
      withInterceptors([cookieAuthInterceptor])
    )
  ],
};