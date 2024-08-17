import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthenticationService } from '@/app/global-service/authentication.service';
import { CardComponent } from '@/app/store-front/utils/card/card.component';
import { AccountService } from '@/app/store-front/profile/dashboard/account.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CardComponent, AsyncPipe],
  styles: [
    `
      @media (max-width: 768px) {
        .cs-font {
          font-size: calc(6px + 1vw);
        }
      }
    `,
  ],
  template: `
    <div class="md:flex">
      <!-- Order history -->
      <section class="flex-1 p-2">
        <div class="w-full flex justify-center">
          <h1
            class="w-fit capitalize border-b border-[var(--app-theme)] text-sm md:text-base"
          >
            order history
          </h1>
        </div>

        <div class="w-full mt-2">
          @for (obj of object$ | async; track obj.orderNumber) {
            <!-- header -->
            <div class="p-2 grid grid-cols-3 gap-3 bg-neutral-100">
              <div class="cs-font md:text-base">
                <h1 class="uppercase font-semibold">order placed</h1>
                <p class="">{{ obj.date }}</p>
              </div>

              <div class="cs-font md:text-base text-center">
                <h1 class="uppercase font-semibold">total</h1>
                <p>{{ obj.total }}</p>
              </div>

              <div class="cs-font md:text-base">
                <h1 class="uppercase font-semibold">order #</h1>
                <p>{{ obj.orderNumber }}</p>
              </div>
            </div>

            <!-- body -->
            <div
              class="p-2 gap-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              @for (o of obj.detail; track o.url) {
                <app-card [url]="o.url" [name]="o.name" [bool]="false" />
              }
            </div>
          }
        </div>
      </section>

      <!-- Account details -->
      <section class="p-2">
        <div
          class="w-full flex gap-6 justify-between border-b border-[var(--app-theme)]"
        >
          <h1 class="w-fit capitalize text-sm md:text-base">account details</h1>
          <button
            (click)="(logout$)"
            type="button"
            class="w-fit capitalize text-blue-300 text-sm md:text-base"
          >
            logout
          </button>
        </div>

        <div class="w-full pt-2 flex flex-col gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <h1 class="w-fit capitalize text-sm md:text-base">
            {{ principal$ | async }}
          </h1>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  private readonly authService = inject(AuthenticationService);
  private readonly accountService = inject(AccountService);

  readonly principal$ = this.authService.principal$;
  readonly object$ = this.accountService.orderHistory();

  readonly logout$ = this.authService.logout('/profile/authentication');
}
