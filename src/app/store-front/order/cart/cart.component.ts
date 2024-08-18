import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { CardComponent } from '@/app/store-front/utils/card/card.component';
import { CartService } from './cart.service';
import { FooterService } from '@/app/store-front/utils/footer/footer.service';
import { Router } from '@angular/router';
import { HomeService } from '@/app/store-front/home/home.service';
import {
  catchError,
  combineLatest,
  map,
  of,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { IS_NUMERIC, SarreCurrency } from '@/app/global-utils';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CardComponent, AsyncPipe, NgClass],
  styles: [
    `
      .on-input-change-error {
        border-color: red;
        border-width: 1px;
      }

      .on-input-change-error:focus {
        border-color: red;
      }

      /* Chrome, Safari, Edge, Opera */
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type='number'] {
        -moz-appearance: textfield;
      }
    `,
  ],
  template: `
    <div class="lg-scr mg-top h-full w-full">
      @if (!!(carts$ | async)?.length) {
        <!-- Contents -->
        <div class="flex-1 overflow-y-auto pb-9 px-4 sm:px-6">
          <div class="flex items-start justify-between">
            <h2
              class="text-lg font-medium text-gray-900 border-b border-[var(--app-theme)]"
            >
              Shopping cart
            </h2>
          </div>

          <div class="mt-8">
            <div class="flow-root">
              <ul role="list" class="relative -my-6 divide-y divide-gray-200">
                @for (detail of carts$ | async; track detail; let i = $index) {
                  <li class="flex py-6">
                    <div
                      class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200"
                    >
                      <img
                        [src]="detail.url"
                        alt="product image{{ i }}"
                        class="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div class="ml-4 flex flex-1 flex-col">
                      <div>
                        <div
                          class="flex justify-between text-base font-medium text-gray-900"
                        >
                          <button
                            type="button"
                            (click)="
                              route('/shop/product/' + detail.product_id)
                            "
                            class="font-app-card cursor-pointer hover:border-b hover:border-black"
                          >
                            {{ detail.product_name }}
                          </button>
                          <p class="font-app-card ml-4">
                            {{ currency(detail.currency) }}{{ detail.price }}
                          </p>
                        </div>
                        <p class="mt-1 text-sm text-gray-500">
                          {{ detail.colour }}
                        </p>
                      </div>
                      <div
                        class="flex flex-1 items-end justify-between text-sm"
                      >
                        <div>
                          <p class="text-gray-500">{{ detail.size }}</p>
                          @if (i === errorIndex()) {
                            <p class="text-xs text-red-600">
                              quantity is out of stock
                            </p>
                          }
                          <input
                            type="number"
                            [value]="detail.qty"
                            (keyup)="qtyChange($event, detail.sku, i)"
                            [ngClass]="{
                              'on-input-change-error': i === errorIndex()
                            }"
                            class="qty-box p-1 flex-1 w-full rounded-sm border border-solid border-[var(--border-outline)]"
                          />
                        </div>

                        <div class="flex">
                          <button
                            (click)="remove(detail.sku)"
                            type="submit"
                            class="font-medium text-[var(--app-theme-hover)]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                }

                <!-- spinner -->
                @if (loadingState$ | async; as spin) {
                  <div
                    class="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center bg-black opacity-50"
                  >
                    <div
                      role="status"
                      class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-[var(--app-theme)] align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    >
                      <span
                        class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                      >
                        Loading...
                      </span>
                    </div>
                  </div>
                }
              </ul>
            </div>
          </div>
        </div>

        <!-- Total amount -->
        <div class="border-t border-gray-200 px-4 py-6 sm:px-6">
          <div class="flex justify-between text-base font-medium text-gray-900">
            <p>Subtotal</p>
            @if (amount$ | async; as amount) {
              <p>{{ amount.currency }}{{ amount.total }}</p>
            }
          </div>
          <p class="mt-0.5 text-sm text-gray-500">
            Shipping and taxes calculated at checkout.
          </p>
          <div class="mt-6">
            <button
              (click)="route('/order/checkout')"
              type="submit"
              class=" w-full px-6 py-3 text-base font-medium text-white shadow-sm flex items-center justify-center rounded-md border border-transparent bg-[var(--app-theme)] hover:bg-[var(--app-theme-hover)]"
            >
              Checkout
            </button>
          </div>
          <div
            class="mt-6 flex justify-center text-center text-sm text-gray-500"
          >
            <p>
              or
              <button
                (click)="route('/shop')"
                type="button"
                class="font-medium text-[var(--app-theme-hover)]"
              >
                Continue Shopping
                <span aria-hidden="true"> &rarr;</span>
              </button>
            </p>
          </div>
        </div>

        <div class="py-2">
          <div class="p-3.5 flex justify-center">
            <h1
              class="feature-font w-fit capitalize font-bold text-[var(--app-theme)] border-b border-b-[var(--app-theme)]"
            >
              you may also like
            </h1>
          </div>

          <div
            class="p-2 xl:p-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            @for (
              product of products$ | async;
              track product.product_id;
              let i = $index
            ) {
              <button
                type="button"
                (click)="route('/shop/product/' + product.product_id)"
              >
                <app-card
                  [url]="product.image"
                  [name]="product.name"
                  [price]="product.price"
                  [currency]="currency(product.currency)"
                ></app-card>
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="h-full pl-2 text-center">
          <div class="w-fit mb-4 text-left border-[var(--app-theme)] border-b">
            <h1 class="capitalize text-2xl text-[var(--app-theme)]">
              Your cart
            </h1>
          </div>
          <h5 class="text-xs">Your cart is currently empty</h5>
          <button
            (click)="route('/shop')"
            type="button"
            class="p-2 uppercase bg-[var(--app-theme)]"
          >
            continue shopping
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly footService = inject(FooterService);
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeService);

  private readonly total$ = this.cartService.total$;
  private readonly currency$ = this.footService.currency$.pipe(
    switchMap((c: SarreCurrency) => this.currency(c)),
  );

  readonly products$ = this.homeService.products$;
  readonly carts$ = this.cartService.cart$;
  readonly amount$ = combineLatest([this.total$, this.currency$]).pipe(
    map((obj: [number, string]) => ({ currency: obj[1], total: obj[0] })),
  );

  currency = (str: string): string => this.footService.currency(str);

  route = (route: string): void => {
    this.router.navigate([`${route}`]);
  };

  /**
   * makes call to server to delete an item from a users cart.
   * */
  remove = (sku: string) => this.cartService.removeFromCart(sku);

  loadingState$ = of(false);
  readonly errorIndex = signal(-1);

  /**
   * Updates the quantity of a product based on its SKU.
   *
   * This function is triggered when a user enters input to adjust the quantity of a product.
   * It validates the input, ensuring it is a numeric value and not negative.
   *
   * Upon successful input validation, it triggers a loading screen after a short delay.
   *
   * @param e The keyboard event that triggered the quantity change.
   * @param sku The SKU (Stock Keeping Unit) of the product whose quantity is being updated.
   * @param index The input that was clicked. Needed to indicate the quantity that is out of stock.
   */
  qtyChange(e: KeyboardEvent, sku: string, index: number): void {
    const qty = (e.target as HTMLInputElement).value;

    if (!IS_NUMERIC(qty)) return;
    else if (IS_NUMERIC(qty) && Number(qty) < 0) return;

    this.loadingState$ = timer(907).pipe(
      switchMap(() => of({ sku: sku, qty: Number(qty) })),
      switchMap((obj: { sku: string; qty: number }) =>
        obj.qty === 0
          ? this.remove(obj.sku).pipe(
              map(() => false),
              startWith(true),
              catchError(() => of(false)),
            )
          : this.cartService.createCart({ sku: obj.sku, qty: obj.qty }).pipe(
              map(() => {
                this.errorIndex.set(-1);
                return false;
              }),
              startWith(true),
              catchError(() => {
                this.errorIndex.set(index);
                return of(false);
              }),
            ),
      ),
    );
  }
}
