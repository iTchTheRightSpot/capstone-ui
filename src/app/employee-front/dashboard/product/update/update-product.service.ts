import { inject, Injectable } from '@angular/core';
import { ProductDetailResponse } from '@/app/employee-front/admin-front.util';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UpdateProductService {
  private readonly HOST: string | undefined = environment.domain;
  private readonly http = inject(HttpClient);

  /**
   * Fetch ProductDetail based on id
   * */
  productDetailsByProductUuid = (
    id: string,
  ): Observable<ProductDetailResponse[]> =>
    this.http.get<ProductDetailResponse[]>(
      `${this.HOST}api/v1/worker/product/detail?id=${id}`,
      { responseType: 'json', withCredentials: true },
    );

  /**
   * Delete Product Variant
   * */
  deleteVariantBySku = (sku: string): Observable<number> =>
    this.http
      .delete<number>(
        `${this.HOST}api/v1/worker/product/detail/sku?sku=${sku}`,
        { observe: 'response', withCredentials: true },
      )
      .pipe(map((res: HttpResponse<number>) => res.status));
}
