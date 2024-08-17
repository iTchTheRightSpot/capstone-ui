import { Routes } from '@angular/router';
import {
  ADMIN_DASHBOARD_CATEGORY_IMPL,
  ADMIN_DASHBOARD_CATEGORY_NEW,
  ADMIN_DASHBOARD_CATEGORY_UPDATE,
} from '@/app/employee-front/dashboard/category/category.util';

export const routes: Routes = [
  {
    path: ADMIN_DASHBOARD_CATEGORY_IMPL,
    loadComponent: () =>
      import('./category-impl/category-impl.component').then(
        (m) => m.CategoryImplComponent,
      ),
  },
  {
    path: ADMIN_DASHBOARD_CATEGORY_NEW,
    loadComponent: () =>
      import('./new/new-category.component').then(
        (m) => m.NewCategoryComponent,
      ),
  },
  {
    path: ADMIN_DASHBOARD_CATEGORY_UPDATE,
    loadComponent: () =>
      import('./update/update-category.component').then(
        (m) => m.UpdateCategoryComponent,
      ),
  },
];
