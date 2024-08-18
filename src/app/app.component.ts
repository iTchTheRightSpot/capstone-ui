import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { catchError, combineLatest, map, of, startWith, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ImageModule } from 'primeng/image';
import { Toast, ToastService } from '@/app/global-service/toast.service';
import { AuthenticationService } from '@/app/global-service/authentication.service';
import { ApiStatus } from '@/app/app.util';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AsyncPipe,
    ToastModule,
    ProgressSpinnerModule,
    ImageModule,
  ],
  providers: [MessageService],
  template: `
    @if (csrfAndActiveUser$ | async; as status) {
      @switch (status) {
        @case (apiStatus.LOADING) {
          <div class="lg-scr h-full p-20 flex justify-center items-center">
            <h1 class="capitalize text-[var(--app-theme-hover)]">loading...</h1>
          </div>
          <div
            class="lg-scr h-full p-20 relative flex flex-col justify-center items-center"
          >
            <div class="relative inline-block">
              <p-progressSpinner
                aria-label="Loading"
                styleClass="w-96 h-96 m-0"
              />
              <div
                class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-2/4 text-xl md:text-2xl flex flex-col justify-center items-center text-center font-extralight text-[var(--app-theme-hover)]"
              >
                <p-image [src]="logo" alt="logo" width="120" />
                <span class="mt-2">Capstone Project</span>
              </div>
            </div>
          </div>
        }
        @case (apiStatus.ERROR) {
          <div class="lg-scr p-10 text-3xl text-red-500">
            Please try again later as server is undergoing maintenance
          </div>
        }
        @default {
          <p-toast />
          @if (toast$ | async) {}
          <router-outlet />
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly authService = inject(AuthenticationService);
  private readonly toastService = inject(ToastService);
  private readonly messageService = inject(MessageService);

  protected readonly logo = './assets/images/logo.jpeg';
  protected readonly apiStatus = ApiStatus;

  protected readonly toast$ = this.toastService.toast$.pipe(
    tap((obj) => {
      if (obj) {
        if (obj.key === Toast.ERROR) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: obj.message,
          });
        } else if (obj.key === Toast.SUCCESS) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: obj.message,
          });
        }
      }
    }),
  );

  /**
   * onload of application, retrieve CSRF token
   * */
  protected readonly csrf$ = this.authService.csrf$().pipe(
    map(() => ApiStatus.LOADED),
    startWith(ApiStatus.LOADING),
    catchError(() => of(ApiStatus.ERROR)),
  );

  protected readonly csrfAndActiveUser$ = combineLatest([
    this.authService.csrf$(),
    this.authService.activeUser$(),
  ]).pipe(
    map(() => ApiStatus.LOADED),
    startWith(ApiStatus.LOADING),
    catchError(() => of(ApiStatus.ERROR)),
  );
}
