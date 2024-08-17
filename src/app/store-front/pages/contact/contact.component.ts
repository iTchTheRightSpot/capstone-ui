import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: ` <div class="lg-scr mg-top p-2.5">contact works</div> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {}
