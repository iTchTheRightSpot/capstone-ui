import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Category, Link } from '@/app/global-utils';
import { CategoryHierarchyComponent } from '@/app/shared-comp/hierarchy/category-hierarchy.component';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [CategoryHierarchyComponent],
  template: `
    <div class="h-full w-full flex flex-col gap-3 bg-white">
      <div class="flex justify-between w-full p-2">
        <button
          type="button"
          (click)="toggleNavDisplay((openNavMobile = !openNavMobile))"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Center (logo) -->
        <div class="my-0 mx-auto cursor-pointer">
          <button
            type="button"
            (click)="toggleNavDisplay((openNavMobile = !openNavMobile), '/')"
          >
            <img
              [src]="logo"
              alt="logo"
              class="h-[2.5rem] w-[4.375rem] object-contain"
            />
          </button>
        </div>

        <!--    Person icon    -->
        <button
          (click)="
            toggleNavDisplay((openNavMobile = !openNavMobile), '/account')
          "
          class="flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 cursor-pointer"
            style="color: var(--app-theme)"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </button>
      </div>

      <!-- Other links -->
      <ul class="flex-col list-none flex gap-3">
        @for (link of links; track link.path) {
          <li class="p-2.5 border-b">
            @if (link.bool) {
              <a class="uppercase text-[var(--app-theme)]">
                <div class="flex justify-between">
                  shop
                  <button type="button" (click)="dropDown = !dropDown">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-4 h-4"
                    >
                      @if (dropDown) {
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M5 12h14"
                        />
                      } @else {
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      }
                    </svg>
                  </button>
                </div>

                @if (dropDown) {
                  <div class="w-full p-1 flex gap-2 flex-col">
                    <app-hierarchy
                      [categories]="hierarchy"
                      (emitter)="categoryClicked($event)"
                    />
                  </div>
                }
              </a>
            } @else {
              <button
                type="button"
                (click)="
                  toggleNavDisplay((openNavMobile = !openNavMobile), link.path)
                "
                class="w-full flex uppercase text-[var(--app-theme)]"
              >
                {{ link.name }}
              </button>
            }
          </li>
        }
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNavigationComponent {
  @Input() links: Link[] = [];
  @Input() openNavMobile = false;
  @Input() hierarchy: Category[] = [];

  @Output() toggleEmitter = new EventEmitter<boolean>();
  @Output() routeEmitter = new EventEmitter<string>();
  @Output() categoryEmitter = new EventEmitter<{
    categoryId: number;
    name: string;
  }>();

  dropDown = false;
  protected readonly logo = './assets/images/logo.jpeg';

  toggleNavDisplay(bool: boolean, path?: string): void {
    this.toggleEmitter.emit(bool);
    if (path) {
      this.route(`${path}`);
    }
  }

  route = (path: string): void => this.routeEmitter.emit(path);

  categoryClicked(obj: { categoryId: number; name: string }): void {
    this.route('/shop');
    this.categoryEmitter.emit(obj);
    this.toggleEmitter.emit((this.openNavMobile = !this.openNavMobile));
  }
}
