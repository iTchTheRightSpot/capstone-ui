import { inject, Injectable } from '@angular/core';
import { map, of } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NewProductService {
  private readonly domain = environment.domain;
  private readonly production = environment.production;
  private readonly http = inject(HttpClient);

  /**
   * POST call to create a new product
   *
   * @param data of type FormData
   * @return Observable of type number
   * */
  readonly create = (data: FormData) =>
    this.production
      ? this.http
          .post<HttpResponse<any>>(`${this.domain}employee/product`, data, {
            observe: 'response',
            withCredentials: true,
          })
          .pipe(map((res: HttpResponse<any>) => res.status))
      : of(201);
}
