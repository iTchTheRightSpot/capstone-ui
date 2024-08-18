import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FooterService } from '@/app/store-front/utils/footer/footer.service';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { PaymentDetail, WebhookMetadata } from '../index';
import { Router } from '@angular/router';
import { ToastService } from '@/app/global-service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly HOST: string | undefined = environment.domain;
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly footerService = inject(FooterService);
  private readonly router = inject(Router);

  private readonly country = signal<string>('');
  private readonly addressSubject = new BehaviorSubject<
    WebhookMetadata | undefined
  >(undefined);
  readonly address$ = this.addressSubject.asObservable().pipe(
    tap((dto) => {
      if (!dto) this.router.navigate(['/order/checkout']);
      else this.country.set(dto.country);
    }),
  );

  setAddress = (dto: WebhookMetadata): void => this.addressSubject.next(dto);

  toast = (message: string): void => {};

  /**
   * Api call to server to prevent overselling before displaying page
   * */
  validate = (): Observable<PaymentDetail> =>
    this.footerService.currency$.pipe(
      switchMap((currency) =>
        this.http
          .post<PaymentDetail>(
            `${this.HOST}api/v1/payment?currency=${currency}&country=${this.country()}`,
            {},
            {
              headers: { 'content-type': 'application/json' },
              observe: 'response',
              responseType: 'json',
              withCredentials: true,
            },
          )
          .pipe(
            map((res) => {
              const body: PaymentDetail | null = res.body;
              if (body === null)
                throw new Error('an error occurred loading payment page.');
              return body;
            }),
            catchError((err: HttpErrorResponse) => {
              this.toast(err.error ? err.error.message : err.message);
              this.router.navigate(['/order/checkout']);
              return of();
            }),
          ),
      ),
    );
}
