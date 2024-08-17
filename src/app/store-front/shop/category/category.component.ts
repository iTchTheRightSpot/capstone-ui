import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { catchError, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { Product } from '@/app/store-front/store-front-utils';
import { CardComponent } from '@/app/store-front/utils/card/card.component';
import { FilterComponent } from '@/app/store-front/utils/filter/filter.component';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FooterService } from '@/app/store-front/utils/footer/footer.service';
import { Page, SarreCurrency } from '@/app/global-utils';
import { PaginatorComponent } from '@/app/shared-comp/paginator/paginator.component';
import { UtilService } from '@/app/global-service/util.service';
import { ShopService } from '../shop.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CardComponent,
    FilterComponent,
    RouterLink,
    PaginatorComponent,
    AsyncPipe,
  ],
  templateUrl: './category.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
  private readonly footService = inject(FooterService);
  private readonly shopService = inject(ShopService);
  private readonly utilService = inject(UtilService);

  totalElements = 0;
  filterByPrice = true; // A variable need to keep the state of price filter for future filtering
  displayFilter = false; // Displays filter button

  currency = (str: string): string => this.footService.currency(str);

  readonly categories$ = this.shopService.categories$;

  /**
   * filters products array in ascending or descending order based on price
   * */
  ascendingOrDescending = (arr: Product[]): Product[] =>
    this.utilService.sortArray(this.filterByPrice, arr);

  toggleFilter(bool: boolean): void {
    this.displayFilter = bool;
  }

  /**
   * load products from server on load of category component
   * */
  categoryImpl = (page: number) =>
    this.footService.currency$.pipe(
      switchMap((currency) =>
        this.shopService.category$.pipe(
          map((categoryId) => ({ id: categoryId, currency: currency })),
        ),
      ),
      switchMap((obj: { id: number; currency: SarreCurrency }) =>
        this.shopService
          .productsBasedOnCategoryId(obj.id, obj.currency, page)
          .pipe(
            tap((p: Page<Product>): void => {
              this.totalElements = p.content.length;
            }),
            map((p: Page<Product>) => ({ state: 'LOADED', data: p })),
          ),
      ),
      startWith({ state: 'LOADING' }),
      catchError((err: HttpErrorResponse) =>
        of({
          state: 'ERROR',
          error: err.error ? err.error.message : err.message,
        }),
      ),
    );

  products$: Observable<{
    state: string;
    error?: string;
    data?: Page<Product>;
  }> = this.categoryImpl(0);

  /**
   * Re-renders products pages based on page number clicked
   * */
  pageNumberClick(num: number): void {
    this.products$ = this.categoryImpl(num);
  }

  /**
   * Refresh products based on category clicked
   * */
  categoryClicked(obj: { categoryId: number; name: string }): void {
    this.shopService.currentCategorySubject.next(obj.categoryId);
  }
}
