import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-refund',
  standalone: true,
  template: ` <div class="lg-scr mg-top p-2.5">RefundComponent</div> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefundComponent {}
