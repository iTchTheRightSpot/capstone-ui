import { inject, Injectable } from '@angular/core';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { Page, SarreUser } from '@/app/global-utils';
import { ToastService } from '@/app/global-service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly HOST = environment.domain;
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  /** Returns a page of users from server */
  readonly allUsers = (page: number = 0, size: number = 20) =>
    this.http
      .get<Page<SarreUser>>(
        `${this.HOST}employee/user?page=${page}&size=${size}`,
        {
          observe: 'body',
          responseType: 'json',
          withCredentials: true,
        },
      )
      .pipe(catchError((err) => this.toastService.messageErrorNothing(err)));
}
