import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { MobileNavigationComponent } from '../mobile-navigation/mobile-navigation.component';
import { Category, Link } from '@/app/global-utils';
import { CategoryHierarchyComponent } from '@/app/shared-comp/hierarchy/category-hierarchy.component';

@Component({
  selector: 'app-store-front-navigation-navigation',
  standalone: true,
  imports: [
    SearchComponent,
    MobileNavigationComponent,
    CategoryHierarchyComponent,
    NgStyle,
  ],
  template: `
    <nav class="w-full p-2.5 grid grid-cols-3 bg-transparent" [ngStyle]="navBg">
      <!-- Left -->
      <div class="flex items-center mr-auto">
        <!--  Mobile  -->
        <div class="block md:hidden">
          <!-- burger -->
          <button
            (click)="openNavMobile = !openNavMobile"
            class="bg-transparent outline-none border-none cursor-pointer relative"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
              style="color: var(--app-theme)"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          <div
            [style]="{ display: openNavMobile ? 'block' : 'none' }"
            class="fixed top-0 right-0 bottom-0 left-0"
          >
            <app-mobile-navigation
              [links]="links"
              [openNavMobile]="openNavMobile"
              [hierarchy]="categories"
              (toggleEmitter)="toggleNav($event)"
              (routeEmitter)="route($event)"
              (categoryEmitter)="categoryClicked($event)"
            />
          </div>
        </div>

        <!--  None Mobile  -->
        <div class="hidden md:flex gap-8">
          <button
            (click)="route('/')"
            type="button"
            class="h-full relative flex gap-1 items-center cursor-pointer uppercase text-[var(--app-theme)]"
          >
            home
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </button>

          <button
            (click)="route('/shop')"
            type="button"
            class="h-full relative flex gap-1 items-center cursor-pointer uppercase text-[var(--app-theme)]"
          >
            shop
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Center (logo) -->
      <div class="my-0 mx-auto cursor-pointer">
        <button type="button" (click)="route('')">
          <img
            [src]="logo"
            alt="logo"
            class="h-[2.5rem] w-[4.375rem] object-contain"
          />
        </button>
      </div>

      <!-- Right -->
      <div class="flex items-center ml-auto">
        <ul class="flex gap-2 lg:gap-8 justify-end list-none">
          <!--    Search    -->
          <li>
            <app-search (routeEmitter)="route($event)" />
          </li>

          <!--    Shopping cart    -->
          <li>
            <button
              type="button"
              (click)="route('/order/cart')"
              class="uppercase flex"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 cursor-pointer text-[var(--app-theme)]"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <span
                [style]="{ display: count > 0 ? 'block' : 'none' }"
                class="text-xs text-red-600"
              >
                {{ count }}
              </span>
            </button>
          </li>

          <!--    Person icon    -->
          <li class="hidden md:block">
            <button
              type="button"
              class="uppercase flex"
              (click)="route('/account')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
                style="color: var(--app-theme)"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreFrontNavigationComponent {
  @Input() count = 0;
  @Input() categories: Category[] = [];

  @Output() routeEmitter = new EventEmitter<string>();
  @Output() categoryEmitter = new EventEmitter<{
    categoryId: number;
    name: string;
  }>();

  protected readonly logo = './assets/images/logo.jpeg';

  links: Link[] = [
    { name: 'home', path: '/', bool: false },
    { name: 'shop', path: '', bool: true },
  ];
  openNavMobile = false;

  navBg: any;

  /**
   * applies bg white on nav container when scrolled down
   * */
  @HostListener('document:scroll') scroll(): void {
    let bool: boolean =
      document.body.scrollTop > 0 || document.documentElement.scrollTop > 0;
    const css = {
      'background-color': 'var(--white)',
      'box-shadow': '4px 6px 12px rgba(0, 0, 0, 0.2)',
      'border-bottom-right-radius': '3px',
      'border-bottom-left-radius': '3px',
    };

    this.navBg = bool ? css : {};
  }

  toggleNav(bool: boolean): void {
    this.openNavMobile = bool;
  }

  route = (path: string): void => this.routeEmitter.emit(path);

  categoryClicked(obj: { categoryId: number; name: string }): void {
    this.route('/shop');
    this.categoryEmitter.emit(obj);
  }
}
