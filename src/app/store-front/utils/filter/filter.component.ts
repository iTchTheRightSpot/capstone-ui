import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CategoryHierarchyComponent } from '@/app/shared-comp/hierarchy/category-hierarchy.component';
import { Category } from '@/app/global-utils';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CategoryHierarchyComponent],
  styles: [
    `
      .f-fnt {
        font-size: 20px;
      }
      @media (max-width: 768px) {
        .f-fnt {
          font-size: calc(12px + 1vw);
        }
      }
    `,
  ],
  template: `
    <div class="flex w-full h-full">
      <div class="w-2/4 max-[600px]:w-full h-full p-8 bg-white overflow-y-auto">
        <button
          type="button"
          (click)="closeModal()"
          class="w-full flex justify-between bg-transparent border-0"
        >
          <h1 class="f-fnt tracking-tight text-gray-900">{{ title }}</h1>
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
              d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
            />
          </svg>
        </button>

        <div
          class="w-full pt-3 pb-6 flex gap-2 flex-col border-t border-b border-gray-200"
        >
          <app-hierarchy
            [categories]="categories"
            (emitter)="categoryClicked($event)"
          />
        </div>

        <div class="w-full flex flex-col">
          <button
            type="button"
            (click)="closeModal()"
            class="f-fnt w-full p-3 mb-2 capitalize hover:uppercase border border-black"
          >
            clear all
          </button>
          <button
            type="button"
            (click)="closeModal()"
            class="f-fnt w-full p-3 capitalize hover:uppercase border bg-black text-white"
          >
            show results
          </button>
        </div>
      </div>

      <!-- Right column which is a black screen -->
      <div
        class="h-full max-[600px]:hidden flex-1 bg-black opacity-50"
        (click)="closeModal()"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent {
  @Input() title = '';
  @Input() categories: Category[] = [];

  @Output() toggleComponent = new EventEmitter<boolean>();
  @Output() categoryEmitter = new EventEmitter<{
    categoryId: number;
    name: string;
  }>();

  /**
   * closes filter component
   * */
  closeModal(): void {
    this.toggleComponent.emit(false);
  }

  /**
   * updates parent on category clicked
   * */
  categoryClicked(obj: { categoryId: number; name: string }): void {
    this.categoryEmitter.emit(obj);
  }
}
