import { inject, Injectable } from '@angular/core';
import { environment } from '@/environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  concat,
  concatMap,
  map,
  Observable,
  of,
  startWith,
  tap,
  timer,
} from 'rxjs';
import { AuthResponse } from '@/app/global-utils';
import { Router } from '@angular/router';
import { ApiStatus } from '@/app/app.util';
import { ToastService } from '@/app/global-service/toast.service';

interface CSRF {
  token: string;
  parameterName: string;
  headerName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly domain = environment.domain;
  private readonly production = environment.production;

  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly activeUserSubject = new BehaviorSubject<{} | undefined>(
    undefined,
  );

  readonly principal$ = this.activeUserSubject.asObservable();

  /**
   * Retrieve CSRF token on load of application
   * */
  readonly csrf$ = () =>
    this.production
      ? this.http.get<CSRF>(`${this.domain}csrf`, { withCredentials: true })
      : of<CSRF>({
          token: 'token',
          parameterName: 'param',
          headerName: 'header',
        });

  /**
   * Returns current user principal
   * */
  readonly activeUser$ = () =>
    this.production
      ? this.http
          .get<AuthResponse>(`${this.domain}active`, {
            observe: 'response',
            responseType: 'json',
            withCredentials: true,
          })
          .pipe(
            map((res: HttpResponse<AuthResponse>): string => {
              if (res.body === null) {
                return '';
              }
              this.activeUserSubject.next(res.body.principal);
              return res.body.principal;
            }),
            catchError((err: HttpErrorResponse) =>
              this.toastService.messageErrorNothing(err),
            ),
          )
      : of('');

  readonly logout = (path: string) =>
    this.http
      .post(
        `${this.domain}logout`,
        {},
        { observe: 'response', withCredentials: true },
      )
      .pipe(
        map((res: any) => (res === null ? 0 : res.status)),
        tap(() => this.router.navigate([`${path}`])),
      );

  readonly login = (obj: { principal: string; password: string }) =>
    this.production
      ? this.http
          .post<AuthResponse>(`${this.domain}demo`, obj, {
            withCredentials: true,
          })
          .pipe(
            map(() => {
              this.router.navigate(['/employee/dashboard']);
              return ApiStatus.LOADED;
            }),
            startWith(ApiStatus.LOADING),
            catchError((e: HttpErrorResponse) =>
              this.toastService.messageErrorApiStatus(e),
            ),
          )
      : concat(
          ApiStatus.LOADING,
          timer(600).pipe(concatMap(() => of(ApiStatus.LOADED))),
        );
}
