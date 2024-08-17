import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicTableComponent } from '@/app/employee-front/dashboard/util/dynamictable/dynamic-table.component';
import { ProductService } from '../product.service';
import { CategoryService } from '@/app/employee-front/dashboard/category/category.service';
import { Router, RouterLink } from '@angular/router';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { Page } from '@/app/global-utils';
import { HttpErrorResponse } from '@angular/common/http';
import { mapper, ProductMapper } from '@/app/employee-front/dashboard/util/mapper';
import { PageChange, ProductResponse, TableContent } from '@/app/employee-front/admin-front.util';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '@/app/global-service/toast.service';

@Component({
  selector: 'app-product-impl',
  standalone: true,
  imports: [DynamicTableComponent, RouterLink, AsyncPipe],
  template: `
    <div class="flex flex-col h-full py-0">
      <div class="px-0 py-2.5 flex items-center">
        <h1
          class="cx-font-size w-fit capitalize border-b border-[var(--app-theme)]"
        >
          products
        </h1>
        <a routerLink="new" class="ml-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
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

      @if (data$ | async; as data) {
        <div class="flex-1">
          @switch (data.state) {
            @case ('LOADING') {
              <div class="lg-scr h-full p-20 flex justify-center items-center">
                <h1
                  class="cx-font-size capitalize text-[var(--app-theme-hover)]"
                >
                  loading...
                </h1>
              </div>
            }

            @case ('ERROR') {
              <div class="lg-scr mg-top p-10 capitalize text-3xl text-red-500">
                Error {{ data.error }}
              </div>
            }

            @case ('LOADED') {
              @if (data.data) {
                <app-dynamic-table
                  [pageData]="data.data"
                  [paginationTable]="true"
                  (pageEmitter)="pageChange($event)"
                  (eventEmitter)="infoFromTableComponent($event)"
                  [tHead]="thead"
                />
              } @else {
                no data to present
              }
            }
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductImplComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  // Table details
  protected readonly thead: Array<keyof ProductMapper> = [
    'index',
    'image',
    'name',
    'currency',
    'price',
    'weight',
    'type',
    'delete',
  ];

  protected data$: Observable<{
    state: string;
    error?: string;
    data?: Page<ProductMapper>;
  }> = this.productService.currency$.pipe(
    switchMap(() =>
      this.productService.products$.pipe(
        map((res: Page<ProductResponse>) => ({
          state: 'LOADED',
          data: mapper(res),
        })),
        startWith({ state: 'LOADING' }),
        catchError((err: HttpErrorResponse) =>
          of({
            state: 'ERROR',
            error: err.error ? err.error.message : err.message,
          }),
        ),
      ),
    ),
  );

  /**
   * Makes call to server on change of page or page size
   * */
  pageChange(page: PageChange): void {
    this.data$ = this.productService.currency$.pipe(
      switchMap((currency) =>
        this.productService.allProducts(page.page, page.size, currency).pipe(
          map((res: Page<ProductResponse>) => ({
            state: 'LOADED',
            data: mapper(res),
          })),
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
  }

  /**
   * Displays UpdateProduct component based on the product clicked
   * from DynamicTable.
   *
   * @param content of custom interface {@link TableContent}.
   * */
  infoFromTableComponent(content: TableContent<ProductMapper>): void {
    switch (content.key) {
      case 'edit': {
        this.router.navigate([
          `/admin/dashboard/product/${content.data.productId}`,
        ]);
        break;
      }

      case 'delete': {
        const obs = this.productService
          .deleteProduct(content.data.productId)
          .pipe(
            switchMap((status: number) =>
              this.productService.action(
                status,
                this.categoryService.allCategories(),
              ),
            ),
            catchError((err: HttpErrorResponse) =>
              of({ status: err.status, message: err.error.message }),
            ),
          );

        // todo open delete component
        // this.dialog.open(DeleteComponent, {
        //   width: '500px',
        //   maxWidth: '100%',
        //   height: 'fit-content',
        //   data: {
        //     name: content.data.name,
        //     asyncButton: obs,
        //   },
        // });

        break;
      }

      default:
        console.log('invalid key chosen');
    }
  }
}
