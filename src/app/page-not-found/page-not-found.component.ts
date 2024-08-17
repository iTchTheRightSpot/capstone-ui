import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StoreFrontNavigationComponent } from '../store-front/utils/navigation/store-front-navigation.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [StoreFrontNavigationComponent],
  template: `
    <div
      class="lg-scr z-10 border-b border-transparent fixed left-0 top-0 right-0"
    >
      <app-store-front-navigation-navigation
        [count]="0"
        [categories]="[]"
        (routeEmitter)="onChildRoute($event)"
      />
    </div>
    <div class="lg-scr mg-top p-2.5">
      <h1>Page not found :(</h1>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent {
  private readonly router = inject(Router);

  /**
   * Update {@code RouterOutlet} based on routes clicked in navigation bar.
   * */
  onChildRoute(route: string): void {
    this.router.navigate([`${route}`]);
  }
}
