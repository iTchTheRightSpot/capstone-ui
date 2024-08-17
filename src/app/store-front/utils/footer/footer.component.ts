import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SarreCurrency } from '@/app/global-utils';
import { FooterService } from './footer.service';
import { RouterLink } from '@angular/router';
import { MobileFooterComponent } from '@/app/store-front/utils/mobilefooter/mobile-footer.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MobileFooterComponent, RouterLink],
  styles: [
    `
      .f-font {
        font-size: 15px;
      }

      @media (max-width: 768px) {
        .f-font {
          font-size: calc(7px + 1vw);
        }
      }
    `,
  ],
  template: `
    <div class="p-3 border-t border-solid bg-[var(--app-theme)]">
      <!-- mobile -->
      <div class="w-full md:hidden">
        <app-mobile-footer />
      </div>

      <!-- none mobile -->
      <div class="w-full hidden md:grid md:grid-cols-3">
        <!-- info -->
        <div class="p-2">
          <h2 class="uppercase f-font font-bold">legal</h2>
          <ul class="list-none">
            <li class="py-2 text-sm">
              <a routerLink="/pages/about-us" class="cursor-pointer"
                >About Us</a
              >
            </li>
            <li class="py-2 text-sm">
              <a routerLink="/pages/terms-of-service" class="cursor-pointer"
                >Terms of Service</a
              >
            </li>
            <li class="py-2 text-sm">
              <a routerLink="/pages/refund" class="cursor-pointer"
                >Refund Policy</a
              >
            </li>
          </ul>
        </div>

        <!-- help -->
        <div class="p-2">
          <h2 class="uppercase f-font font-bold">help</h2>
          <ul class="list-none">
            <li class="py-2 text-sm">
              <a routerLink="/pages/faq" class="cursor-pointer">FAQ</a>
            </li>
            <li class="py-2 text-sm">
              <a routerLink="/pages/contact-us" class="cursor-pointer"
                >Contact Us</a
              >
            </li>
          </ul>
        </div>

        <!-- socials -->
        <div class="p-2">
          <h2 class="uppercase f-font font-bold">follow us</h2>
          <ul class="list-none">
            <!-- instagram -->
            <li class="py-2 text-sm">
              <a
                class="cursor-pointer"
                href="https://www.instagram.com/sarrethebrand/"
                target="_blank"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-7 w-7"
                  fill="currentColor"
                  style="color: #c13584"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="pt-1.5 flex items-center justify-between border-t">
        <h1 class="f-font m-0">
          &copy; [{{ year }}] Sarre The Brand | Powered by
          <a
            class="m-0 border-b border-black text-[var(--black)]"
            href="https://emmanueluluabuike.com/"
            target="_blank"
            >E.U</a
          >
        </h1>

        <select
          class="f-font p-2 cursor-pointer"
          (change)="setCurrency($event)"
        >
          @for (currency of currencies; track currency) {
            <option [value]="currency" class="uppercase cursor-pointer">
              {{ currency }}
            </option>
          }
        </select>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private readonly footerService = inject(FooterService);

  readonly year = new Date().getFullYear();
  readonly currencies = [SarreCurrency.NGN, SarreCurrency.USD];

  setCurrency(event: Event): void {
    const currency = (event.target as HTMLSelectElement).value as SarreCurrency;
    this.footerService.activeCurrency(currency);
  }
}
