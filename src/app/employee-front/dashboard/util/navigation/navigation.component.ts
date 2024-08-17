import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [],
  template: `
    <div class="p-3 flex gap-1.5 justify-between rounded-md shadow-lg bg-white">
      <!--  Logo container  -->
      <div
        class="cursor-pointer justify-center items-center min-w-[3.5rem] min-h-[3.5rem] max-h-[6.25rem] max-w-[6.25rem] aspect-h-1 aspect-w-1 overflow-hidden"
      >
        <img
          class="h-full w-full object-cover object-center lg:h-full lg:w-full"
          [src]="logo"
          alt="logo"
        />
      </div>

      <!--  Search container  -->
      <div class="flex-1">
        <input
          type="text"
          name="search"
          class="h-full w-full bg-gray-200 appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="search"
        />
      </div>

      <!--  Auth-menu  -->
      <div class="flex items-center max-[768px]:hidden">auth menu</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  @Input() principal = '';
  protected readonly logo = './assets/images/logo.jpeg';
}
