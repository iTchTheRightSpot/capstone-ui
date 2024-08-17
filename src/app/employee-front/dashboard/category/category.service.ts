import { inject, Injectable } from '@angular/core';
import {
  CategoryRequest,
  CategoryResponse,
  ProductResponse,
  UpdateCategory,
  WorkerCategoryResponse,
} from '@/app/employee-front/admin-front.util';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { Category, Page, SarreCurrency } from '@/app/global-utils';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly HOST: string | undefined = environment.domain;
  private readonly http = inject(HttpClient);

  private readonly subject$ = new BehaviorSubject<CategoryResponse[]>([]);
  readonly categories$ = this.subject$.asObservable();
  categories: CategoryResponse[] = [];

  private readonly hierarchySubject = new BehaviorSubject<Category[]>([]);
  readonly hierarchy$ = this.hierarchySubject.asObservable();

  /**
   * Create a new category
   * */
  create = (obj: CategoryRequest): Observable<number> =>
    this.http
      .post<
        HttpResponse<any>
      >(`${this.HOST}api/v1/worker/category`, obj, { observe: 'response', withCredentials: true })
      .pipe(map((res: HttpResponse<any>) => res.status));

  /**
   * Delete category based on id
   * */
  deleteCategory(id: number): Observable<number> {
    const url = `${this.HOST}api/v1/worker/category/${id}`;
    return this.http
      .delete<HttpResponse<any>>(url, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(map((res: HttpResponse<any>) => res.status));
  }

  /**
   * Fetch all Categories
   * */
  allCategories(): Observable<CategoryResponse[]> {
    const url = `${this.HOST}api/v1/worker/category`;
    return this.http
      .get<WorkerCategoryResponse>(url, {
        observe: 'response',
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        map((res: HttpResponse<WorkerCategoryResponse>) => {
          const body = res.body;

          if (body == null) {
            const arr: CategoryResponse[] = [];
            return arr;
          }

          this.categories = body.table;
          this.subject$.next(body.table);
          this.hierarchySubject.next(body.hierarchy);

          return body.table;
        }),
      );
  }

  /**
   * Returns a Page of Product Response based
   * on CategoryResponse id and pagination params
   * */
  allProductsByCategory(
    categoryId: number,
    page: number = 0,
    size: number = 20,
    currency: SarreCurrency,
  ): Observable<Page<ProductResponse>> {
    const url = `${this.HOST}api/v1/worker/category/products`;
    return this.http.get<Page<ProductResponse>>(url, {
      headers: { 'content-type': 'application/json' },
      params: {
        category_id: categoryId,
        page: page,
        size: size,
        currency: currency,
      },
      responseType: 'json',
      withCredentials: true,
    });
  }

  updateCategory(body: UpdateCategory): Observable<number> {
    const url = `${this.HOST}api/v1/worker/category`;
    return this.http
      .put<UpdateCategory>(url, body, {
        headers: { 'content-type': 'application/json' },
        observe: 'response',
        withCredentials: true,
      })
      .pipe(map((res: HttpResponse<UpdateCategory>) => res.status));
  }
}
