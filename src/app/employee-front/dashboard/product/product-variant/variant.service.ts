import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { map, Observable } from 'rxjs';
import { ProductVariant, UpdateVariant } from './index';

@Injectable({
  providedIn: 'root',
})
export class VariantService {
  private readonly HOST: string | undefined =
    environment.domain + 'api/v1/worker/product/detail';
  private readonly http = inject(HttpClient);

  create = (data: FormData): Observable<number> =>
    this.http
      .post<ProductVariant>(`${this.HOST}`, data, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(map((res: HttpResponse<ProductVariant>) => res.status));

  updateVariant(payload: UpdateVariant): Observable<number> {
    return this.http
      .put<UpdateVariant>(`${this.HOST}`, payload, {
        headers: { 'content-type': 'application/json' },
        observe: 'response',
        withCredentials: true,
      })
      .pipe(map((res: HttpResponse<UpdateVariant>) => res.status));
  }
}
