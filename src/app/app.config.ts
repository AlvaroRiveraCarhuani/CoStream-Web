import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // <-- IMPORTA ESTO
import { routes } from './app.routes';
import { authGuard } from './core/guards/auth-guard';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), 
    provideRouter(routes), 
    provideHttpClient(withInterceptors([authInterceptor]))],
};
