import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  tap,
} from 'rxjs';
import { Page, SarreCurrency } from '@/app/global-utils';
import {
  CategoryResponse,
  ProductResponse,
  UpdateProduct,
} from '@/app/employee-front/admin-front.util';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly HOST: string | undefined =
    environment.domain + 'api/v1/worker/product';

  private readonly http = inject(HttpClient);
  private readonly productSubject = new ReplaySubject<Page<ProductResponse>>();

  readonly products$ = this.productSubject.asObservable();
  products: ProductResponse[] = [];

  private readonly subject = new BehaviorSubject<SarreCurrency>(
    SarreCurrency.NGN,
  );
  readonly currency$ = this.subject.asObservable();

  setCurrencySubject(currency: SarreCurrency): void {
    this.subject.next(currency);
  }

  /**
   * Responsible for making a PUT call to server to update a product
   * @param obj of type {@link Product}
   * @return Observable of type HttpStatus
   * */
  updateProduct(obj: UpdateProduct): Observable<number> {
    return this.http
      .put<UpdateProduct>(`${this.HOST}`, obj, {
        headers: { 'content-type': 'application/json' },
        observe: 'response',
        withCredentials: true,
      })
      .pipe(map((res: HttpResponse<UpdateProduct>) => res.status));
  }

  /**
   * Responsible for making a DELETE restful call to our serve to delete a product.
   *
   * @param id is {@link Product} UUID
   * @return Observable of type HttpStatus
   * */
  deleteProduct(id: string): Observable<number> {
    return this.http
      .delete<HttpResponse<any>>(`${this.HOST}`, {
        observe: 'response',
        params: { id: id },
        withCredentials: true,
      })
      .pipe(map((res: HttpResponse<any>) => res.status));
  }

  /**
   * Returns a Page of ProductResponse
   * */
  allProducts(
    page: number = 0,
    size: number = 20,
    currency: SarreCurrency,
  ): Observable<Page<ProductResponse>> {
    return this.http
      .get<Page<ProductResponse>>(`${this.HOST}`, {
        headers: { 'content-type': 'application/json' },
        responseType: 'json',
        params: { page: page, size: size, currency: currency },
        withCredentials: true,
      })
      .pipe(
        tap((res: Page<ProductResponse>) => {
          this.productSubject.next(res);
          this.products = res.content;
        }),
      );
  }

  /**
   * Called on to refresh product or category after a successful delete
   *
   * @param status is the response from deleting a product or category.
   * @param categories$
   * @return Observable of type object
   * */
  action(
    status: number,
    categories$: Observable<CategoryResponse[]>,
  ): Observable<{ status: number; message: string }> {
    // refresh Category and Product Array
    const products$ = this.currency$.pipe(
      switchMap((currency) => this.allProducts(0, 20, currency)),
    );

    return of(status).pipe(
      switchMap((num: number) =>
        combineLatest([products$, categories$]).pipe(
          map(() => ({ status: num, message: 'deleted!' })),
        ),
      ),
    );
  }
}
