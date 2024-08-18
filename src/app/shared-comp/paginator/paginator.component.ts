import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { RouterLinkActive } from '@angular/router';
import { UtilService } from '@/app/global-service/util.service';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [RouterLinkActive],
  styles: [
    `
      /* width */
      ::-webkit-scrollbar {
        height: 5px;
        width: 5px;
        margin-top: 10px;
      }
      /* Track */
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: #bec4c4;
      }

      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `,
  ],
  template: `
    <nav class="text-black" aria-label="pagination">
      @if (totalPages < 6) {
        <ul class="list-style-none flex justify-center">
          <li class="flex gap-2 cursor-pointer">
            <!-- rgb(148 163 184) -->
            @for (num of range(); track num; let i = $index) {
              <a
                (click)="onGoTo(num)"
                [attr.data-page-number]="num"
                aria-label="button number"
                [style]="{
                  'background-color':
                    num === currentPage ? 'var(--app-theme)' : ''
                }"
                class="relative block rounded-full bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-gray-200"
                >{{ num + 1 }}</a
              >
            }
          </li>
        </ul>
      } @else {
        <div class="flex gap-2.5 justify-center list-style-none">
          <!-- Previous -->
          <div>
            <button
              (click)="onPrevious()"
              type="button"
              aria-label="Previous button"
              class="relative block rounded-full bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-gray-200"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </div>

          <!-- number -->
          <ul class="slider w-60 flex overflow-x-auto scroll-smooth">
            @for (num of range(); track num; let i = $index) {
              <li>
                <a
                  (click)="onGoTo(num)"
                  aria-label="button number"
                  [attr.data-page-number]="num"
                  [style]="{
                    'background-color':
                      num === currentPage ? 'var(--app-theme)' : ''
                  }"
                  class="relative cursor-pointer block rounded-full bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-gray-200"
                >
                  {{ num + 1 }}
                </a>
              </li>
            }
          </ul>

          <!-- Next -->
          <div>
            <button
              (click)="onNext()"
              type="button"
              aria-label="Next button"
              class="relative block rounded bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-gray-200 hover:rounded-full"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </div>
        </div>
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  private readonly render = inject(Renderer2);
  private readonly utilService = inject(UtilService);

  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;

  @Output() goTo = new EventEmitter<number>();

  /**
   * Displays from 0 to the total number of items (totalPages)
   * passed by the parent component
   * */
  range = (): number[] => this.utilService.range(this.totalPages);

  /**
   * Informs parent component on what page number was clicked
   * */
  onGoTo(page: number): void {
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    this.goTo.emit(page);
  }

  /**
   * Displays previous numbers
   * */
  onPrevious(): void {
    const container = this.render.selectRootElement('.slider', true);
    let dimension = container.getBoundingClientRect();
    let width = dimension.width;
    container.scrollLeft -= width;
  }

  /**
   * Displays next numbers
   * */
  onNext(): void {
    const container = this.render.selectRootElement('.slider', true);
    let dimension = container.getBoundingClientRect();
    container.scrollLeft += dimension.width;
  }
}
