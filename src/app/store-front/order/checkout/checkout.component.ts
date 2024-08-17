import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CartService } from '../cart/cart.service';
import { FooterService } from '@/app/store-front/utils/footer/footer.service';
import {
  BehaviorSubject,
  catchError,
  delay,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { PaymentService } from '../payment/payment.service';
import { Checkout, WebhookMetadata } from '../index';
import { RouterLink } from '@angular/router';
import { CheckoutService } from '@/app/store-front/order/checkout/checkout.service';
import { SarreCurrency } from '@/app/global-utils';
import { HttpErrorResponse } from '@angular/common/http';
import { CheckoutNavComponent } from '@/app/store-front/order/checkout-nav/checkout-nav.component';

interface CustomCheckout extends Checkout {
  currency: SarreCurrency;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CheckoutNavComponent,
  ],
  styleUrls: ['../order.component.css'],
  template: `
    <div class="lg-scr mg-top">
      <!-- banner -->
      <div>
        <app-checkout-nav />
      </div>

      <!-- contents -->
      <div class="p-1 md:p-3 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <!-- shipping div -->
        <div class="md:p-2">
          <div class="border-b mb-3">
            <h1 class="uppercase cs-font md:text-sm">
              contact & shipping information
            </h1>
          </div>
          <form [formGroup]="form" class="grid grid-cols-1 gap-3">
            <!-- email and full name -->
            <div class="grid grid-cols-2 gap-2">
              <div class="w-full">
                <h5 class="cs-font md:text-xs uppercase">
                  email <span class="text-red-500">*</span>
                </h5>
                <input
                  type="email"
                  name="email"
                  formControlName="email"
                  class="w-full p-2 border"
                  placeholder="Email"
                />
              </div>
              <div class="w-full">
                <h5 class="cs-font md:text-xs uppercase">
                  full name <span class="text-red-500">*</span>
                </h5>
                <input
                  type="text"
                  name="name"
                  formControlName="name"
                  class="w-full p-2 border"
                  placeholder="Full Name"
                />
              </div>
            </div>

            <!-- phone -->
            <div class="w-full">
              <h5 class="cs-font md:text-xs uppercase">
                phone number <span class="text-red-500">*</span>
              </h5>
              <input
                type="text"
                name="phone"
                formControlName="phone"
                class="w-full p-2 border"
                placeholder="phone"
              />
            </div>

            <!-- address -->
            <div class="w-full">
              <h5 class="cs-font md:text-xs uppercase">
                address <span class="text-red-500">*</span>
              </h5>
              <input
                type="text"
                name="address"
                formControlName="address"
                class="w-full p-2 border"
                placeholder="address"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <!-- city -->
              <div class="w-full">
                <h5 class="cs-font md:text-xs uppercase">
                  city <span class="text-red-500">*</span>
                </h5>
                <input
                  type="text"
                  name="city"
                  formControlName="city"
                  class="w-full p-2 border"
                  placeholder="city"
                />
              </div>

              <!-- state -->
              <div class="w-full">
                <h5 class="cs-font md:text-xs uppercase">
                  state <span class="text-red-500">*</span>
                </h5>
                <input
                  type="text"
                  name="state"
                  formControlName="state"
                  class="w-full p-2 border"
                  placeholder="state"
                />
              </div>

              <!-- postcode -->
              <div class="w-full">
                <h5 class="cs-font md:text-xs uppercase">postcode/zipcode</h5>
                <input
                  type="text"
                  name="postcode"
                  formControlName="postcode"
                  class="w-full p-2 border"
                  placeholder="postcode/zipcode"
                />
              </div>
            </div>

            <!-- country -->
            <div class="w-full">
              <h5 class="cs-font md:text-xs uppercase">
                country <span class="text-red-500">*</span>
              </h5>
              <input
                type="text"
                name="country"
                formControlName="country"
                class="w-full p-2 border"
                (keyup)="onInputCountry($event)"
                placeholder="country"
              />
            </div>

            <!-- delivery information -->
            <div class="w-full">
              <h5 class="cs-font md:text-xs uppercase">delivery information</h5>
              <textarea
                formControlName="deliveryInfo"
                name="deliveryInfo"
                class="w-full p-2 border"
              ></textarea>
            </div>

            <div class="w-full flex justify-end text-sm md:text-base">
              <a
                routerLink="/order"
                (click)="onAddressEntered()"
                [style]="{
                  display:
                    form.valid && loading() === 'loaded' ? 'block' : 'none'
                }"
                class="p-2 text-white hover:text-black bg-black hover:bg-[var(--app-theme-hover)]"
              >
                Continue to payment
              </a>
            </div>
          </form>
        </div>

        <!-- products div -->
        <div
          class="relative p-2 max-h-[500px] overflow-y-auto border-l bg-neutral-100"
        >
          <div class="pb-4">
            <ul role="list" class="relative -my-6 divide-y divide-gray-200">
              @for (
                detail of carts$ | async;
                track detail.product_name;
                let i = $index
              ) {
                <li class="flex pt-6 pb-3">
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
                    <div
                      class="md:mb-2 flex flex-col md:flex-row md:justify-between text-base font-medium text-gray-900"
                    >
                      <h3 class="cs-font">
                        {{ detail.product_name }}
                      </h3>
                      <p class="cs-font ml-4">
                        {{ currencySymbol(detail.currency) }}{{ detail.price }}
                      </p>
                    </div>
                    <!-- mobile -->
                    <div class="cs-font md:hidden">
                      <div class="grid grid-cols-2">
                        <div class="">
                          <h5 class="w-fit border-b font-bold">size</h5>
                          <p class="text-gray-500">{{ detail.size }}</p>
                        </div>
                        <div class="">
                          <h5 class="w-fit border-b font-bold">quantity</h5>
                          <p class="text-gray-500">{{ detail.qty }}</p>
                        </div>
                      </div>

                      <div class="w-full pt-1">
                        <h5 class="w-fit border-b font-bold">colour</h5>
                        <p class="mt-1 text-gray-500">{{ detail.colour }}</p>
                      </div>
                    </div>
                    <!-- none mobile -->
                    <div class="hidden md:grid grid-cols-3 text-xs">
                      <div class="border-r-2">
                        <h5 class="border-b font-bold">colour</h5>
                        <p class="mt-1 text-sm text-gray-500">
                          {{ detail.colour }}
                        </p>
                      </div>

                      <div class="border-r-2 text-center">
                        <h5 class="border-b font-bold">size</h5>
                        <p class="text-gray-500">{{ detail.size }}</p>
                      </div>

                      <div class="border-r-2">
                        <h5 class="border-b text-right font-bold">quantity</h5>
                        <p class="text-gray-500 text-right">{{ detail.qty }}</p>
                      </div>
                    </div>
                  </div>
                </li>
              }
            </ul>
          </div>

          @if (checkout$ | async; as checkout) {
            <div>
              <!-- subtotal -->
              <div class="cs-font py-1 flex justify-between md:text-sm">
                <h3 class="capitalize">subtotal</h3>
                <h3 class="capitalize">
                  {{ checkout.currency }}{{ checkout.sub_total }}
                </h3>
              </div>

              <!-- shipping -->
              <div class="cs-font py-1 flex justify-between md:text-xs">
                <h3 class="capitalize">shipping</h3>
                <h3 class="capitalize">
                  {{ checkout.currency }}{{ checkout.ship_cost }}
                </h3>
              </div>

              <!-- taxes -->
              <div class="cs-font py-1 flex justify-between md:text-sm">
                <p class="capitalize text-sm">
                  {{ checkout.tax_name }} ({{ checkout.tax_rate }})
                </p>
                <h3 class="capitalize">
                  {{ checkout.currency }}{{ checkout.tax_total }}
                </h3>
              </div>

              <!-- total -->
              <div
                class="cs-font py-1 flex justify-between font-semibold md:text-sm"
              >
                <h3 class="capitalize">total</h3>
                <h3 class="uppercase">
                  {{ checkout.currency }}{{ checkout.total }}
                </h3>
              </div>

              <!-- weight -->
              <div
                class="cs-font py-1 flex justify-between font-semibold md:text-sm"
              >
                <h3 class="capitalize">total weight</h3>
                <h3 class="lowercase">{{ checkout.weight_detail }}</h3>
              </div>
            </div>
          }

          @if (loading() === 'loading') {
            <div
              class="absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center bg-black opacity-50 z-10"
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
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {
  private readonly paymentService = inject(PaymentService);
  private readonly cartService = inject(CartService);
  private readonly footService = inject(FooterService);
  private readonly fb = inject(FormBuilder);
  private readonly checkoutService = inject(CheckoutService);

  readonly loading = signal('');
  readonly principal = signal('');

  readonly carts$ = this.cartService.cart$;

  readonly form = this.fb.group({
    email: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    address: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
    city: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    state: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    postcode: new FormControl('', [Validators.maxLength(10)]),
    country: new FormControl('nigeria', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    deliveryInfo: new FormControl('', [Validators.maxLength(1000)]),
  });

  readonly currencySymbol = (str: SarreCurrency) =>
    str === SarreCurrency.NGN
      ? SarreCurrency.NGN_SYMBOL
      : SarreCurrency.USD_SYMBOL;

  private readonly subject = new BehaviorSubject<string>('nigeria');

  /**
   * Initiates a server request to adjust prices based on the
   * user's country.
   *
   * On new emission from {@link subject}, {@link checkout$}
   * sets a delay of 807 milliseconds and triggers a loading
   * state whilst making a GET request to the server.
   *
   * @return An observable of {@link CustomCheckout} which is the
   * adjusted prices and currency based on value emitted from
   * {@link subject}.
   */
  readonly checkout$ = this.subject.pipe(
    switchMap((str) =>
      of(str).pipe(
        delay(907),
        tap(() => this.loading.set('loading')),
      ),
    ),
    switchMap((country) =>
      this.footService.currency$.pipe(
        switchMap((currency) =>
          this.checkoutService.checkout(country, currency).pipe(
            tap((obj) => {
              this.principal.set(obj.principal);
              this.loading.set('loaded');
            }),
            map(
              (obj: Checkout) =>
                ({
                  currency: this.currencySymbol(currency),
                  principal: obj.principal,
                  sub_total: obj.sub_total,
                  ship_cost: obj.ship_cost,
                  tax_name: obj.tax_name,
                  tax_rate: obj.tax_rate,
                  tax_total: obj.tax_total,
                  total: obj.total,
                  weight_detail: obj.weight_detail,
                }) as CustomCheckout,
            ),
            catchError((e: HttpErrorResponse) => {
              this.loading.set('error');
              const err = e.error ? e.error.message : e.message;
              this.paymentService.toast(err);
              return throwError(() => new Error(err));
            }),
          ),
        ),
      ),
    ),
  );

  /**
   * Updates {@link subject} when a user enters their country.
   *
   * @param e The keyboard event triggered by the user input.
   */
  onInputCountry = (e: KeyboardEvent): void => {
    this.subject.next((e.target as HTMLInputElement).value);
  };

  /**
   * Sets the address details for a user to confirm before proceeding
   * to the {@link src/app/store-front/order/payment/payment.component.ts}.
   * <p>
   * This method retrieves address details entered by the user from
   * the form fields.
   * If any required field is missing, it displays a toast message
   * prompting the user to enter shipping information.
   * The address details are then formatted into a {@link WebhookMetadata}
   * object and passed to the payment global-service.
   */
  onAddressEntered(): void {
    const email = this.form.controls['email'].value;
    const name = this.form.controls['name'].value;
    const phone = this.form.controls['phone'].value;
    const address = this.form.controls['address'].value;
    const city = this.form.controls['city'].value;
    const state = this.form.controls['state'].value;
    const country = this.form.controls['country'].value;

    if (!email || !name || !phone || !address || !city || !state || !country) {
      this.paymentService.toast('please enter your shipping information');
      return;
    }

    const postcode = this.form.controls['postcode'].value;
    const deliveryInfo = this.form.controls['deliveryInfo'].value;

    const dto: WebhookMetadata = {
      principal: this.principal(),
      email: email,
      name: name,
      phone: phone,
      address: address,
      city: city,
      state: state,
      postcode: !postcode ? '' : postcode,
      country: country,
      deliveryInfo: !deliveryInfo ? '' : deliveryInfo,
    };

    this.paymentService.setAddress(dto);
  }
}
