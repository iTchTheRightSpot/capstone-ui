import { Routes } from '@angular/router';
import { AdminGuard } from './admin-guard';
import {
  ADMIN_FRONT_AUTHENTICATION,
  ADMIN_FRONT_DASHBOARD,
} from '@/app/employee-front/admin-front.util';

export const route: Routes = [
  {
    path: ADMIN_FRONT_AUTHENTICATION,
    loadComponent: () =>
      import('./auth/admin-authentication.component').then(
        (m) => m.AdminAuthenticationComponent,
      ),
  },
  {
    path: ADMIN_FRONT_DASHBOARD,
    loadComponent: () =>
      import('./dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
    loadChildren: () =>
      import('./dashboard/admin-dashboard.routes').then((m) => m.routes),
    canActivateChild: [AdminGuard],
  },
];
