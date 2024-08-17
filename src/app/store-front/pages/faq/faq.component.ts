import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  template: ` <div class="lg-scr mg-top p-2.5">FAQComponent works</div> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FAQComponent {}
