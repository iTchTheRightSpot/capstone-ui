import { Routes } from '@angular/router';

export const route: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./shop/shop.component').then((m) => m.ShopComponent),
    loadChildren: () => import('./shop/shop.routes').then((m) => m.SHOP_ROUTES),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
    loadChildren: () =>
      import('./profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'pages',
    loadComponent: () =>
      import('./pages/pages.component').then((m) => m.PagesComponent),
    loadChildren: () =>
      import('./pages/pages.routes').then((m) => m.PAGES_ROUTES),
  },
  {
    path: 'order',
    loadComponent: () =>
      import('./order/order.component').then((m) => m.OrderComponent),
    loadChildren: () => import('./order/order-routes').then((m) => m.route),
  },
];
