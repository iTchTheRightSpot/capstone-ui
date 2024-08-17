import { Routes } from '@angular/router';
import {
  ADMIN_DASHBOARD_CATEGORY,
  ADMIN_DASHBOARD_CUSTOMER,
  ADMIN_DASHBOARD_PRODUCT,
  ADMIN_DASHBOARD_SETTING,
  ADMIN_DASHBOARD_STATISTICS,
} from '@/app/employee-front/dashboard/admin-dashboard.util';

export const routes: Routes = [
  {
    path: ADMIN_DASHBOARD_STATISTICS,
    loadComponent: () =>
      import('./statistics/statistics.component').then(
        (m) => m.StatisticsComponent,
      ),
  },
  {
    path: ADMIN_DASHBOARD_PRODUCT,
    loadComponent: () =>
      import('./product/product.component').then((m) => m.ProductComponent),
    loadChildren: () =>
      import('./product/product.routes').then((m) => m.routes),
  },
  {
    path: ADMIN_DASHBOARD_CATEGORY,
    loadComponent: () =>
      import('./category/category.component').then((m) => m.CategoryComponent),
    loadChildren: () =>
      import('./category/category.routes').then((m) => m.routes),
  },
  {
    path: ADMIN_DASHBOARD_CUSTOMER,
    loadComponent: () =>
      import('./customer/customer.component').then((m) => m.CustomerComponent),
    loadChildren: () =>
      import('./customer/customer.routes').then((m) => m.routes),
  },
  {
    path: ADMIN_DASHBOARD_SETTING,
    loadComponent: () =>
      import('./setting/setting.component').then((m) => m.SettingComponent),
    loadChildren: () => import('./setting/setting.routes').then((m) => m.route),
  },
  {
    path: '',
    redirectTo: ADMIN_DASHBOARD_STATISTICS,
    pathMatch: 'full',
  },
];
