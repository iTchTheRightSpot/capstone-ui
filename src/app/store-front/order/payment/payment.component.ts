import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Angular4PaystackModule } from 'angular4-paystack';
import { PaymentService } from './payment.service';
import { Router } from '@angular/router';
import { CheckoutNavComponent } from '@/app/store-front/order/checkout-nav/checkout-nav.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [Angular4PaystackModule, CheckoutNavComponent, AsyncPipe],
  styleUrls: ['../order.component.css'],
  template: `
    <div class="lg-scr mg-top">
      <!-- banner -->
      <div>
        <app-checkout-nav />
      </div>

      <!-- content -->
      <div class="p-1 sm:p-2">
        @if (address$ | async; as address) {
          @if (raceCondition$ | async; as dto) {
            <!-- shipping div -->
            <div class="mb-3 border-b">
              <h1 class="capitalize cs-font md:text-sm">
                confirm contact & shipping information
              </h1>
            </div>

            <div class="pb-3 grid grid-cols-1 gap-3">
              <!-- email and full name -->
              <div class="grid grid-cols-2 gap-2">
                <div class="w-full">
                  <h5 class="cs-font md:text-xs uppercase">
                    email <span class="text-red-500">*</span>
                  </h5>
                  <input
                    type="email"
                    name="email"
                    [value]="address.email"
                    class="w-full p-2 border"
                    placeholder="email"
                    readonly
                  />
                </div>
                <div class="w-full">
                  <h5 class="cs-font md:text-xs uppercase">
                    full name <span class="text-red-500">*</span>
                  </h5>
                  <input
                    type="text"
                    name="name"
                    [value]="address.name"
                    class="w-full p-2 border"
                    placeholder="fullname"
                    readonly
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
                  [value]="address.phone"
                  class="w-full p-2 border"
                  placeholder="phone"
                  readonly
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
                  [value]="address.address"
                  class="w-full p-2 border"
                  placeholder="address"
                  readonly
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
                    [value]="address.city"
                    class="w-full p-2 border"
                    placeholder="city"
                    readonly
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
                    [value]="address.state"
                    class="w-full p-2 border"
                    placeholder="state"
                    readonly
                  />
                </div>

                <!-- postcode -->
                <div class="w-full">
                  <h5 class="cs-font md:text-xs uppercase">postcode/zipcode</h5>
                  <input
                    type="text"
                    name="postcode"
                    class="w-full p-2 border"
                    [value]="address.postcode"
                    placeholder="postcode/zipcode"
                    readonly
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
                  name="postcode"
                  [value]="address.country"
                  class="w-full p-2 border"
                  placeholder="country"
                  readonly
                />
              </div>

              <!-- delivery information -->
              <div class="w-full">
                <h5 class="cs-font md:text-xs uppercase">
                  delivery information
                </h5>
                <textarea
                  [textContent]="address.deliveryInfo"
                  name="deliveryInfo"
                  class="w-full p-2 border"
                  readonly
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end">
              <div class="w-fit p-2 bg-black text-white">
                <angular4-paystack
                  [email]="address.email"
                  [key]="dto.pub_key"
                  [amount]="dto.total"
                  [ref]="dto.reference"
                  [metadata]="address"
                  [currency]="dto.currency"
                  [channels]="['card']"
                  [class]="'btn btn-primary'"
                  (onClose)="paymentCancel()"
                  (callback)="paymentDone($event)"
                  >PAY {{ dto.currency }}{{ dto.total }}</angular4-paystack
                >
              </div>
            </div>
          } @else {
            <div class="flex flex-col justify-center items-center">
              <div
                role="status"
                class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-[var(--app-theme)] align-[-0.125em] ext-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
              >
                <span
                  class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                >
                  Loading...
                </span>
              </div>
            </div>
          }
        } @else {
          <div class="flex flex-col justify-center items-center">
            <div
              role="status"
              class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-[var(--app-theme)] align-[-0.125em] ext-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);

  readonly address$ = this.paymentService.address$;
  readonly raceCondition$ = this.paymentService.validate();

  paymentDone(ref: any): void {
    this.router.navigate([`/order/${ref}`]);
  }

  paymentCancel(): void {
    this.router.navigate(['/order/cart']);
  }
}
