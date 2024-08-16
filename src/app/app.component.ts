import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { catchError, map, of, startWith } from 'rxjs';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  template: `
    @if (csrf$ | async; as csrf) {
      @switch (csrf.state) {
        @case ('LOADING') {
          <div class="lg-scr h-full p-20 flex justify-center items-center">
            <h1 class="capitalize text-[var(--app-theme-hover)]">loading...</h1>
          </div>
        }

        @case ('ERROR') {
          <div class="lg-scr p-10 text-3xl text-red-500">
            Please try again later as server is undergoing maintenance
          </div>
        }

        @case ('LOADED') {
          <router-outlet />
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly authService = inject(AuthService);

  /**
   * onload of application, retrieve CSRF token
   * */
  protected readonly csrf$ = this.authService.csrf().pipe(
    map(() => ({ state: 'LOADED' })),
    startWith({ state: 'LOADING' }),
    catchError(() => of({ state: 'ERROR' })),
  );
}
