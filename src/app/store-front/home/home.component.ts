import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { concatMap, delay, from, of, repeat, startWith, switchMap } from 'rxjs';
import { HomeService } from './home.service';
import { CardComponent } from '../utils/card/card.component';
import { Product } from '../store-front-utils';
import { Router } from '@angular/router';
import { FooterService } from '../utils/footer/footer.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardComponent, AsyncPipe],
  styles: [
    `
      .trans {
        transition: all 2s ease;
        transition-delay: 1s, 250ms;
      }

      .bg-font {
        font-size: 40px;
      }

      .feature-font {
        font-size: 20px;
      }

      @media only screen and (max-width: 768px) {
        .bg-font,
        .feature-font {
          font-size: calc(13px + 1vw);
        }
      }
    `,
  ],
  template: `
    @if (image$ | async; as image) {
      <div
        [style.background-image]="'url(' + image + ')'"
        class="trans w-full min-h-[100vh] flex bg-center bg-no-repeat bg-cover"
      >
        <div
          class="lg-scr self-end pb-10 px-2 lg:px-0 flex flex-col gap-y-3 lg:gap-y-10"
        >
          <h1 class="bg-font uppercase font-bold text-white">
            clothing apparel for the confident women
          </h1>

          <button
            (click)="route('/shop')"
            type="button"
            class="w-fit text-sm md:text-3xl capitalize text-white cursor-pointer border-b border-b-white"
          >
            shop now
          </button>
        </div>
      </div>
    }
    <div class="lg-scr py-4">
      <div class="p-3.5 flex justify-center">
        <h1
          class="feature-font w-fit capitalize font-bold text-[var(--app-theme)] border-b border-b-[var(--app-theme)]"
        >
          featured collection
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
          <button (click)="clicked(product)" type="button">
            <app-card
              [url]="product.image"
              [name]="product.name"
              [currency]="currency(product.currency)"
              [price]="product.price"
            />
          </button>
        } @empty {
          no product(s) available.
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly footerService = inject(FooterService);
  private readonly homeService = inject(HomeService);
  private readonly router = inject(Router);

  readonly products$ = this.homeService.products$;

  currency = (str: string): string => this.footerService.currency(str);

  /**
   * Function achieves an infinite typing effect only difference is
   * this is done with images.
   * */
  private readonly images = this.homeService.bgImages;
  image$ = of(this.images).pipe(
    switchMap((photos: string[]) =>
      from(photos).pipe(
        concatMap((photo: string) => of(photo).pipe(delay(5000))),
        repeat(),
      ),
    ),
    startWith(this.images[0]),
  );

  route(path: string): void {
    this.router.navigate([`${path}`]);
  }

  /**
   * Route to product page
   * */
  clicked = (p: Product): void => this.route(`/shop/product/${p.product_id}`);
}
