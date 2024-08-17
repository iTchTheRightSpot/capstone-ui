import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgSwitch } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DynamicTableComponent } from '@/app/employee-front/dashboard/util/dynamictable/dynamic-table.component';
import { CustomerService } from '../customer.service';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { Page, SarreUser } from '@/app/global-utils';
import { TableContent } from '@/app/employee-front/admin-front.util';

@Component({
  selector: 'app-list-customer',
  standalone: true,
  imports: [RouterLink, DynamicTableComponent, AsyncPipe, NgSwitch],
  template: `
    <div class="flex flex-col h-full py-0">
      <div class="flex py-2.5 px-0">
        <!-- Header -->
        <h1
          class="cx-font-size w-fit capitalize border-b border-[var(--app-theme)]"
        >
          customers
        </h1>
        <a class="ml-1" routerLink="register">
          <svg
            fill="none"
            stroke-width="1.5"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-[var(--app-theme)]"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </a>
      </div>

      @if (users$ | async; as users) {
        <div class="flex-1" [ngSwitch]="users.state">
          @switch (users.state) {
            @case ('LOADING') {
              <div class="lg-scr h-full p-20 flex justify-center items-center">
                <h1
                  class="cx-font-size capitalize text-[var(--app-theme-hover)]"
                >
                  loading..
                </h1>
              </div>
            }

            @case ('LOADED') {
              @if (users.data) {
                <app-dynamic-table
                  [tHead]="thead"
                  [pageData]="users.data"
                  (eventEmitter)="infoFromTableComponent($event)"
                  [paginationTable]="true"
                />
              } @else {
                error retrieving user data
              }
            }

            @case ('ERROR') {
              <div class="lg-scr mg-top p-10 capitalize text-3xl text-red-500">
                Error {{ users.error }}
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListCustomerComponent {
  private readonly customerService = inject(CustomerService);

  readonly thead: Array<keyof SarreUser> = [
    'firstname',
    'lastname',
    'email',
    'phone',
  ];

  users$: Observable<{
    state: string;
    error?: string;
    data?: Page<SarreUser>;
  }> = this.customerService.allUsers().pipe(
    map((page) => ({ state: 'LOADED', data: page })),
    startWith({ state: 'LOADING' }),
    catchError((err) => of({ state: 'ERROR', error: err.error.message })),
  );

  infoFromTableComponent(user: TableContent<SarreUser>): void {}
}
