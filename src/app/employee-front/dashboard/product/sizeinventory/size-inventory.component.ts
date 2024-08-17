import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Output } from '@angular/core';
import { AsyncPipe, DOCUMENT, NgStyle } from '@angular/common';
import { SizeInventory } from '@/app/employee-front/admin-front.util';
import { CustomQueue } from './custom-queue';
import { SizeInventoryService } from './size-inventory.service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IS_NUMERIC } from '@/app/global-utils';

@Component({
  selector: 'app-size-inventory',
  standalone: true,
  imports: [
    AsyncPipe,
    NgStyle,
  ],
  template: `
    <div class="flex gap-1.5 mb-2 justify-between">
      <h4 class="cx-font-size capitalize">
        <span class="text-red-500">*</span> size & stock
      </h4>
      <button
        type="button"
        [disabled]="invalidInputImpl()"
        (click)="addInputRow()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6 text-[var(--app-theme)]"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>

    @if (queue.queue$ | async; as bool) {
      <div [style]="{ display: bool ? 'block' : 'none' }">
        @for (row of queue.toArray(); let i = $index; track i; ) {
          <div class="mb-1.5" >
            <div class="dom block">
              <!-- Error message -->
              <p
                class="m-0 hidden"
                [ngStyle]="{
                display:
                  invalidInputImpl() && i === indexOfError ? 'block' : 'none',
                color: 'red',
                'font-size': '10px'
              }"
              >
                Please enter correctly
              </p>

              <div class="w-full flex gap-1.5">
                <!-- Size -->
                <input
                  type="text"
                  class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
                  placeholder="size"
                  [value]="row.size"
                  (keyup)="onKeySize($event, i)"
                />

                <!-- Size -->
                <input
                  type="number"
                  class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
                  placeholder="quantity"
                  [value]="row.qty"
                  (keyup)="onKeyQty($event, i)"
                />

                <!-- Delete row -->
                <button type="button" (click)="deleteRow(i)">
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
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Preview and final state -->
        <div class="pt-2.5 flex justify-end">
          <button
            type="button"
            (click)="informParent()"
            [disabled]="invalidInputImpl()"
            [style]="{
              'background-color': invalidInputImpl()
                ? 'var(--app-theme)'
                : 'var(--app-theme-hover)'
            }"
            class="capitalize text-white font-bold py-2 px-4 rounded"
          >
            save
          </button>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SizeInventoryComponent {
  readonly queue = new CustomQueue<SizeInventory>();
  indexOfError = -1;

  @Output() eventEmitter = new EventEmitter<SizeInventory[]>();

  constructor(
    private readonly service: SizeInventoryService,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    // An observable that listen to clean queue when parent class passes true
    this.service.clearQueue$
      .pipe(
        tap((bool: boolean): void => {
          if (bool) {
            // Remove elements from dom
            const elements = this._document.querySelectorAll('.dom');
            elements.forEach((element) => element.remove());

            // clear queue
            this.queue.clear();
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  // https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
  private isNumeric = (num: any): boolean => IS_NUMERIC(num);

  /**
   * Validates if size and quantity pair are in the right format
   *
   * @return boolean
   * */
  invalidInputImpl = (): boolean => {
    if (this.queue.isEmpty()) {
      return false;
    }

    for (let i = 0; i < this.queue.toArray().length; i++) {
      const obj: SizeInventory = this.queue.toArray()[i];
      if (!this.isNumeric(obj.qty) || obj.size === '' || obj.qty < 0) {
        this.indexOfError = i;
        return true;
      }
    }

    const end = this.queue.endOfQueue();
    return !this.isNumeric(end.qty) || end.qty < 0 || end.size === '';
  };

  addInputRow(): void {
    this.queue.addToQueue({ size: '', qty: -1 });
  }

  /**
   * Adds quantity based on the index into inputRow. More on getting user input
   * https://angular.io/guide/user-input
   *
   * @param event
   * @param index is the row on the html
   * */
  onKeyQty(event: KeyboardEvent, index: number): void {
    const qty: string = (event.target as HTMLInputElement).value;
    this.queue.toArray()[index].qty = Number(qty);
  }

  /**
   * Adds size based on the index into inputRow. More on getting user input
   * https://angular.io/guide/user-input
   *
   * @param event
   * @param index is the row on the html
   * */
  onKeySize(event: KeyboardEvent, index: number): void {
    this.queue.toArray()[index].size = (event.target as HTMLInputElement).value;
  }

  /**
   * Delete row from inputRow
   *
   * @param index is the row to delete on the UI
   * @return void
   * */
  deleteRow(index: number): void {
    this.queue.removeFromQueue(index);
  }

  /**
   * Updates parent content with array of SizeInventory
   * */
  informParent(): void {
    this.eventEmitter.emit(this.queue.toArray());
  }
}
