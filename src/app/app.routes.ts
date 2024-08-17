import { Routes } from '@angular/router';
import { EMPLOYEE_FRONT_HOME, STORE_FRONT_HOME } from '@/app/app.util';

export const APP_ROUTES: Routes = [
  {
    path: STORE_FRONT_HOME,
    loadComponent: () =>
      import('./store-front/store.component').then((m) => m.StoreComponent),
    loadChildren: () =>
      import('./store-front/store.routes').then((m) => m.route),
  },
  {
    path: EMPLOYEE_FRONT_HOME,
    loadComponent: () =>
      import('@/app/employee-front/admin.component').then(
        (m) => m.AdminComponent,
      ),
    loadChildren: () =>
      import('@/app/employee-front/admin.routes').then((m) => m.route),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent,
      ),
  },
  { path: '**', redirectTo: '/404' },
];
