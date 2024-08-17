import { Injectable } from '@angular/core';
import { concat, concatMap, Observable, of, Subject, timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiStatus } from '@/app/app.util';

export enum Toast {
  NONE = 'NONE',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface IToast {
  key: Toast;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  /**
   * Manages the display of error messages in the UI.
   * */
  private readonly subject = new Subject<IToast>();

  /**
   * Emits messages.
   *
   * @returns An Observable that resolves to the error message to be displayed.
   */
  readonly toast$: Observable<IToast> = this.subject.pipe(
    concatMap((obj) =>
      concat(
        of(obj),
        timer(5000).pipe(
          concatMap(() => of<IToast>({ key: Toast.NONE, message: '' })),
        ),
      ),
    ),
  );

  readonly message = (obj: IToast) => this.subject.next(obj);

  readonly messageErrorNothing = (e: HttpErrorResponse) => {
    this.subject.next({ key: Toast.ERROR, message: e.message });
    return of();
  };

  readonly messageErrorBool = (e: HttpErrorResponse) => {
    this.subject.next({ key: Toast.ERROR, message: e.message });
    return of(false);
  };

  readonly messageErrorApiStatus = (e: HttpErrorResponse) => {
    this.subject.next({ key: Toast.ERROR, message: e.message });
    return of(ApiStatus.ERROR);
  };

  readonly messageHandleIterateError = <T>(
    e: HttpErrorResponse,
  ): Observable<T[]> => {
    this.subject.next({ key: Toast.ERROR, message: e.message });
    return of([] as T[]);
  };
}
