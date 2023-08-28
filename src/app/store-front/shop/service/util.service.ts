import {Injectable} from '@angular/core';
import {catchError, combineLatest, map, Observable, of, startWith} from "rxjs";
import {Filter} from "../shop.helper";
import {HttpErrorResponse} from "@angular/common/http";
import {Product} from "../../../../global-utils/global-utils";

@Injectable({
  providedIn: 'root'
})
export class UtilService<T> {

  /**
   * Method allows displays a set of squares. These squares display the amount of products to be displayed on the page.
   * Can either be grid-cols-3 or grid-cols-4
   * @param length is the size of the array
   * @return Array of number
   * */
  getRange(length: number): number[] {
    return new Array(length);
  }

  /**
   * Sorts array based on the price. If variable bool is true, product is filtered in ascending order.
   * If it is false filters in descending order.
   * @param bool
   * @param arr is the Product array
   * @return Array of type Product
   * */
  sortArray(bool: boolean, arr: Product[]): Product[] {
    return bool ? arr.sort((a: Product, b: Product) => a.price - b.price)
      : arr.sort((a: Product, b: Product) => b.price - a.price);
  }

  /**
   * Onload of the page use combineLatest to combine api calls. Also fork join can be used
   * https://www.learnrxjs.io/learn-rxjs/operators/combination/forkjoin
   * @param products$ is an Observable of Product array
   * @param generic$ is an Observable of string array can either be Collection or Category
   * @param str is what filtering we are applying
   * @return Observable object of { state: string, error?: string, products?: Product[], filter?: Filter<string>[] }
   * */
  getCombine$(products$: Observable<Product[]>, generic$: Observable<T[]>, str: string): Observable<{
    state: string,
    error?: string,
    products?: Product[],
    filter?: Filter<T>[]
  }> {
    return combineLatest([products$, generic$]).pipe(
      map(([products, filter]: [Product[], T[]]) => {
        const arr: Filter<T>[] = [{ isOpen: false, parent: str, children: filter }];
        return { state: 'LOADED', products: products, filter: arr };
      }),
      startWith({ state: 'LOADING' }),
      catchError((err: HttpErrorResponse) => of({ state: 'ERROR', error: err.error.message }))
    );
  }


}