import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: ` <div class="lg-scr mg-top p-2.5">AboutComponent works</div> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}
