import { Routes } from '@angular/router';
import {
  ADMIN_SETTING_SHIPPING,
  ADMIN_SETTING_TAX,
} from '@/app/employee-front/dashboard/setting/setting.util';

export const route: Routes = [
  {
    path: ADMIN_SETTING_SHIPPING,
    loadComponent: () =>
      import('./shipping/shipping.component').then((m) => m.ShippingComponent),
  },
  {
    path: ADMIN_SETTING_TAX,
    loadComponent: () =>
      import('./tax/tax.component').then((m) => m.TaxComponent),
  },
  {
    path: '',
    redirectTo: ADMIN_SETTING_SHIPPING,
    pathMatch: 'full',
  },
];
