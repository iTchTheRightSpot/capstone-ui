import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
  {
    path: 'about-us',
    loadComponent: () =>
      import('./about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'terms-of-global-service',
    loadComponent: () =>
      import('./terms-of-service/terms-of-service.component').then(
        (m) => m.TermsOfServiceComponent,
      ),
  },
  {
    path: 'refund',
    loadComponent: () =>
      import('./refund/refund.component').then((m) => m.RefundComponent),
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./faq/faq.component').then((m) => m.FAQComponent),
  },
  {
    path: 'contact-us',
    loadComponent: () =>
      import('./contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: '',
    redirectTo: 'about-us',
    pathMatch: 'full',
  },
];
