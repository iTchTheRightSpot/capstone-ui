import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  authenticationRedirectInterceptor,
  csrfInterceptor,
} from '@/app/global-service/global.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_ROUTES } from '@/app/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([csrfInterceptor, authenticationRedirectInterceptor]),
    ),
  ],
};
