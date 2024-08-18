import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { NgSwitch } from '@angular/common';
import {
  PageChange,
  TableContent,
} from '@/app/employee-front/admin-front.util';
import { Page } from '@/app/global-utils';
import { PaginatorComponent } from '@/app/shared-comp/paginator/paginator.component';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [PaginatorComponent, NgSwitch],
  styles: [
    `
      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        text-transform: uppercase;
        text-align: left;
      }

      th,
      td {
        text-align: left;
        padding: 1rem;
        border-bottom: var(--cards-border);
      }

      @media screen and (max-width: 768px) {
        th,
        td,
        mat-icon {
          font-size: calc(10px + 1vw);
        }
      }
    `,
  ],
  template: `
    <div class="w-full rounded-md overflow-x-auto bg-[var(--white)]">
      <table class="table-auto">
        <thead>
          <tr>
            @for (col of tHead; track col) {
              <th [ngSwitch]="col">{{ col }}</th>
            }
          </tr>
        </thead>

        <tbody>
          @for (data of paginationTable ? pageData.content : data; track data) {
            <tr>
              @for (head of tHead; track head) {
                <td class="cursor-pointer">
                  @switch (head) {
                    @case ('image') {
                      <div
                        class="rounded overflow-hidden min-w-[2.75rem] min-h-[2.75rem] max-w-[7rem] max-h-[4rem]"
                      >
                        <img
                          [src]="data[head]"
                          alt="image"
                          class="w-full h-full object-cover object-center"
                        />
                      </div>
                    }

                    @case ('name') {
                      <button
                        type="button"
                        (click)="onClick(data, 'edit')"
                        class="outline-none bg-transparent text-blue-400 hover:border-b hover:border-blue-500"
                      >
                        {{ data[head] }}
                      </button>
                    }

                    @case ('delete') {
                      <button
                        type="button"
                        (click)="onClick(data, 'delete')"
                        class="outline-none border-none bg-transparent text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="w-4 h-4"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    }

                    @case ('sku') {
                      @if (!paginationTable) {
                        <button
                          (click)="onClick(data, 'edit')"
                          type="button"
                          class="outline-none bg-transparent text-blue-400 hover:border-b hover:border-blue-500"
                        >
                          {{ data[head] }}
                        </button>
                      } @else {
                        {{ data[head] }}
                      }
                    }

                    @case ('visible') {
                      <div
                        [style]="{
                          color: data[head] === true ? 'green' : 'red'
                        }"
                      >
                        {{ data[head] }}
                      </div>
                    }

                    @default {
                      {{ data[head] }}
                    }
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>

      @if (paginationTable) {
        <div class="w-full mt-6 p-1.5">
          <app-paginator
            [currentPage]="pageData.number"
            [totalPages]="pageData.totalPages"
            [totalElements]="pageData.totalElements"
            (goTo)="onPageNumber($event)"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicTableComponent<T> {
  @Input() paginationTable = false; // validates if pagination table should be rendered
  @Input() tHead: (keyof T)[] = [];
  @Input() data: T[] = [];
  @Input() pageData!: Page<T>;
  @Output() eventEmitter = new EventEmitter<TableContent<T>>();
  @Output() pageEmitter = new EventEmitter<PageChange>();

  /**
   * Informs Parent component on what input was clicked.
   *
   * @param data represents the row details
   * @param key can either be detail, edit or delete
   * @return void
   * */
  onClick = (data: T, key: string): void =>
    this.eventEmitter.emit({ data: data, key: key });

  /**
   * Emits page number clicked
   * */
  onPageNumber(pageNumber: number): void {
    this.pageEmitter.emit({ page: pageNumber, size: 20 });
  }
}
