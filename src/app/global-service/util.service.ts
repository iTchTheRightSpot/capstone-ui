import { Injectable } from '@angular/core';
import { Product } from '@/app/store-front/store-front-utils';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  /**
   * Method allows displays a set of squares. These squares display the amount of products to be displayed on the page.
   * Can either be grid-cols-3 or grid-cols-4
   *
   * @param length is the size of the array
   * @return Array of number
   * */
  range = (length: number): number[] => [...Array(length).keys()];

  /**
   * Sorts array based on the price.
   * If bool is true, arr is filtered in ascending order.
   * If bool is false, arr is filtered in descending order.
   *
   * @param bool
   * @param arr is the Product array
   * @return Array of type Product
   * */
  sortArray = (bool: boolean, arr: Product[]): Product[] =>
    bool
      ? arr.sort((a: Product, b: Product) => a.price - b.price)
      : arr.sort((a: Product, b: Product) => b.price - a.price);
}
