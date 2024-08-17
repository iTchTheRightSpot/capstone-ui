import { Routes } from '@angular/router';
import {
  ADMIN_PRODUCT_ALL,
  ADMIN_PRODUCT_NEW,
  ADMIN_PRODUCT_UPDATE,
} from '@/app/employee-front/dashboard/product/product.util';

export const routes: Routes = [
  {
    path: ADMIN_PRODUCT_ALL,
    loadComponent: () =>
      import('./product-impl/product-impl.component').then(
        (m) => m.ProductImplComponent,
      ),
  },
  {
    path: ADMIN_PRODUCT_NEW,
    loadComponent: () =>
      import('./new/new-product.component').then((m) => m.NewProductComponent),
  },
  {
    path: ADMIN_PRODUCT_UPDATE,
    loadComponent: () =>
      import('./update/update-product.component').then(
        (m) => m.UpdateProductComponent,
      ),
  },
];
