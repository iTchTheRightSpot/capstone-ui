import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./all/list-customer.component').then(
        (m) => m.ListCustomerComponent,
      ),
  },
];
