import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptorProvider } from '@interceptors/auth.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from '@services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),
    AuthInterceptorProvider,
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.refreshToken();
    }),
  ]
};
