import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpXsrfTokenExtractor,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { STORE_FRONT_HOME, UNAUTHORIZED } from '@/app/app.util';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenExtractor = inject(HttpXsrfTokenExtractor);

  const headerName = 'X-XSRF-TOKEN';
  const token: string | null = tokenExtractor.getToken();

  if (token !== null && !req.headers.has(headerName)) {
    req = req.clone({ headers: req.headers.set(headerName, token) });
  }
  return next(req);
};

export function authenticationRedirectInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  return next(req).pipe(
    catchError((err) => {
      const message = err.error ? err.error.message : err.message;
      const redirect = err.error ? err.error.redirect_url : '';
      const obj = {
        message: message,
        redirect_url: redirect,
        status: err.status,
      };

      if (obj.status === 401) {
        window.location.href = obj.redirect_url;
        router.navigate([`${STORE_FRONT_HOME}`]);
      } else if (obj.status === 403) {
        router.navigate([`${UNAUTHORIZED}`]);
      }

      return throwError(() => obj);
    }),
  );
}
