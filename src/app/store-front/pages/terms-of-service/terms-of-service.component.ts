import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-terms-of-global-service',
  standalone: true,
  template: `
    <div class="lg-scr mg-top p-2.5">Terms of Service Component</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsOfServiceComponent {}
