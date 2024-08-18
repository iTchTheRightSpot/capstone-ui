import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    @if (globalProgressBarLoadingState() === apiStatus.LOADING) {
      <div class="w-full">
        <div class="h-0.5 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <div
            class="progress left-right w-full h-full bg-[var(--app-theme)]"
          ></div>
        </div>
      </div>
    }
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {}
