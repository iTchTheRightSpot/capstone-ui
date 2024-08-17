import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [],
  template: ` statics component works `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent {}
