import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { SearchService } from './search.service';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { FooterService } from '@/app/store-front/utils/footer/footer.service';
import { CardComponent } from '@/app/store-front/utils/card/card.component';
import { SarreCurrency } from '@/app/global-utils';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CardComponent, ReactiveFormsModule, AsyncPipe],
  template: `
    <button (click)="openSearchBar()" type="button">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 cursor-pointer"
        style="color: var(--app-theme)"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </button>

    @if (openSearchComponent$ | async; as open) {
      <div
        [style]="{ display: open ? 'flex' : 'none' }"
        class="flex flex-col z-15 fixed top-0 right-0 bottom-0 left-0"
      >
        <!-- Search -->
        <div class="w-full h-fit p-4 flex justify-center bg-white">
          <!-- close component button -->
          <div class="mr-3 flex items-center">
            <button (click)="closeSearchBar()" type="button">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- search input -->
          <label
            for="search-bar"
            class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >Search</label
          >
          <div class="relative w-full">
            <div
              class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
            >
              <svg
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>

            <input
              type="search"
              id="search-bar"
              [formControl]="formControl"
              class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="I'm searching for..."
            />
          </div>
        </div>

        <!-- Display component -->
        <div class="h-full flex flex-col overflow-y-auto">
          <!-- search results -->
          <div class="p-4 bg-white">
            @if (pageOfProducts$ | async; as page) {
              @switch (spinnerState()) {
                <!-- spinner -->
                @case (true) {
                  <div class="w-full flex justify-center">
                    <div
                      role="status"
                      class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-[var(--app-theme)] align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite] "
                    >
                      <span
                        class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                      >
                        Loading...
                      </span>
                    </div>
                  </div>
                }

                <!-- server results -->
                @case (false) {
                  <div
                    class="w-full bg-white p-2 xl:p-0 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  >
                    @for (p of page.content; track p.product_id) {
                      <a
                        (click)="
                          closeSearchBar('/shop/product/' + p.product_id)
                        "
                        class="cursor-pointer"
                      >
                        <app-card
                          [url]="p.image"
                          [name]="p.name"
                          [currency]="currency(p.currency)"
                          [price]="p.price"
                        />
                      </a>
                    }
                  </div>
                }
              }
            }
          </div>
          <div class="w-full flex-1 bg-black opacity-50"></div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  @Output() routeEmitter = new EventEmitter<string>();

  private readonly searchService = inject(SearchService);
  private readonly footerService = inject(FooterService);

  readonly openSearchComponent$ = this.searchService.openSearchComponent$;

  readonly spinnerState = signal<boolean>(false);

  currency = (currency: string) => this.footerService.currency(currency);

  closeSearchBar(path?: string): void {
    this.spinnerState.set(false);
    this.searchService.openComponent(false);

    if (path) {
      this.routeEmitter.emit(`${path}`);
    }
  }

  openSearchBar(): void {
    this.searchService.openComponent(true);
  }

  /**
   * Makes call to server to search for item based on user input and currency
   * https://stackoverflow.com/questions/44183519/cant-make-debouncetime-or-throttletime-to-work-on-an-angular-http-request
   * */
  readonly formControl = new FormControl();
  readonly pageOfProducts$ = this.formControl.valueChanges.pipe(
    tap((str: string): void => this.spinnerState.set(str.trim().length > 0)),
    switchMap((value: string) =>
      this.footerService.currency$.pipe(
        map((c: SarreCurrency) => ({ value: value, currency: c })),
      ),
    ),
    distinctUntilChanged(),
    debounceTime(700),
    switchMap((obj: { value: string; currency: SarreCurrency }) =>
      obj.value.trim().length > 0
        ? this.searchService._search(10, obj.value, obj.currency).pipe(
            tap((): void => this.spinnerState.set(false)),
            catchError(() => {
              this.spinnerState.set(false);
              return of();
            }),
          )
        : of(),
    ),
  );
}
