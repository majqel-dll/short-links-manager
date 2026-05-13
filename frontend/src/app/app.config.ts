import { ApplicationConfig, inject, PLATFORM_ID, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptorProvider } from '@interceptors/auth.interceptor';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from '@services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withRouterConfig({
      onSameUrlNavigation: 'reload'
    })),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    AuthInterceptorProvider,
    provideAppInitializer((): Promise<boolean> => {
      const authService = inject(AuthService);
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) return Promise.resolve(false);
      return authService.refreshToken();
    }),
  ]
};
