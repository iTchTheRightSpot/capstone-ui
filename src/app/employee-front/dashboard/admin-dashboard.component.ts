import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { CategoryService } from './category/category.service';
import { CategoryResponse } from '../admin-front.util';
import { SarreCurrency } from '@/app/global-utils';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from './product/product.service';
import { DASHBOARDLINKS } from './admin-dashboard.util';
import { AsyncPipe } from '@angular/common';
import { NavigationComponent } from './util/navigation/navigation.component';
import { FooterComponent } from './util/footer/footer.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthenticationService } from '@/app/global-service/authentication.service';
import { SettingService } from './setting/setting.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    NavigationComponent,
    FooterComponent,
    RouterLinkActive,
    RouterLink,
    RouterOutlet,
    AsyncPipe,
  ],
  template: `
    <div class="">admin dashboard works</div>
    <app-footer />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private readonly authService = inject(AuthenticationService);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly setting = inject(SettingService);

  protected readonly SarreCurrency = SarreCurrency;
  readonly principal$ = this.authService.principal$;
  readonly dashBoardLinks = DASHBOARDLINKS;

  activeCurrency = SarreCurrency.NGN;
  leftColumn = false;

  /**
   * To improve UX, on load of Admin route, based on default currency,
   * make call to server to return a {@code Page} of {@code ProductResponse}.
   *
   * @return An Observable of a {@code Page} of {@code ProductResponse}.
   * */
  private readonly products$ = this.productService.currency$.pipe(
    switchMap((currency) => this.productService.allProducts(0, 20, currency)),
  );

  /**
   * To improve UX, on load of Admin route, make call to server to
   * return all {@code CategoryResponse} where we sort based on
   * property name.
   *
   * @return An Observable of an array of {@code CategoryResponse}.
   * */
  private readonly category$ = this.categoryService
    .allCategories()
    .pipe(
      tap((arr: CategoryResponse[]) =>
        arr.sort((a, b) => a.name.localeCompare(b.name)),
      ),
    );

  /**
   * To improve UX, on load of Admin route, make call to server to
   * return all Tax information.
   *
   * @return An Observable of an array of {@code ShipSetting}.
   * */
  private readonly ship$ = this.setting.allShipping();

  /**
   * To improve UX, on load of Admin route, make call to server to
   * return all Tax information.
   *
   * @return An Observable of an array of {@code TaxSetting}.
   * */
  private readonly tax$ = this.setting.allTaxSetting();

  readonly combine$: Observable<{ state: string; error?: string }> =
    combineLatest([this.products$, this.category$, this.ship$, this.tax$]).pipe(
      map(() => ({ state: 'LOADED' })),
      startWith({ state: 'LOADING' }),
      catchError((e: HttpErrorResponse) =>
        of({ state: 'ERROR', error: e.error ? e.error.message : e.message }),
      ),
    );

  /**
   * Set currency for the whole admin front
   * */
  setCurrency = (currency: SarreCurrency): void => {
    this.activeCurrency = currency;
    this.productService.setCurrencySubject(currency);
  };
}
