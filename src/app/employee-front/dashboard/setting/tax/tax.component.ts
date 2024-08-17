import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingService } from '../setting.service';
import { catchError, map, of, startWith, Subject, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@/app/shared-comp/toast/toast.service';
import { IS_NUMERIC } from '@/app/global-utils';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tax',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full py-0">
      <div class="flex py-2.5 px-0 align-center">
        <h1
          class="cx-font-size w-fit capitalize border-b border-[var(--app-theme)]"
        >
          tax setting
        </h1>
      </div>

      <div class="w-full p-2 grid grid-cols-4 gap-2 bg-[var(--white)]">
        <div class="">No.</div>

        <div class="">Name</div>

        <div class="">Rate</div>

        <div class="">Action</div>

        @for (tax of taxes$ | async; track tax.tax_id; let i = $index) {
          <div class="">{{ i + 1 }}</div>

          <div class="">
            <input
              type="text"
              [value]="tax.name"
              #name
              [style]="{
                'border-color':
                  i === index() && !name.value ? 'red' : 'var(--border-outline)'
              }"
              class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
            />
          </div>

          <div class="">
            <input
              type="number"
              [value]="tax.rate"
              #rate
              [style]="{
                'border-color':
                  i === index() && !rate.value ? 'red' : 'var(--border-outline)'
              }"
              class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
            />
          </div>

          <div class="">
            <button
              type="button"
              (click)="update(i, tax.tax_id, name.value, rate.value)"
              class="text-white font-bold py-2 px-4 rounded bg-[var(--app-theme-hover)]"
            >
              @if (index() === i && api()) {
                <div role="status">
                  <svg
                    aria-hidden="true"
                    class="inline w-5 h-5 text-gray-200 animate-spin dark:text-white fill-green-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span class="sr-only">Loading...</span>
                </div>
              } @else {
                Edit
              }
            </button>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaxComponent {
  private readonly service = inject(SettingService);
  private readonly toastService = inject(ToastService);
  private readonly subject = new Subject<{
    id: number;
    name: string;
    rate: string;
  }>();

  /**
   * An observable that emits loading state boolean values based on the updates made to tax settings.
   * When a new value is emitted from the `subject`, it triggers an update to the tax settings
   * through the global-service. If the update is successful, it emits `false` indicating the loading state
   * has completed. If an error occurs during the update process, it emits `false` after displaying
   * an error message via the `toastService`. If the provided tax setting data is incomplete or invalid,
   * it emits `false` immediately without attempting to update.
   *
   * @returns An observable emitting loading state boolean values.
   */
  readonly loadingState$ = this.subject.pipe(
    switchMap((obj) =>
      !obj.name || !obj.rate || !IS_NUMERIC(obj.rate)
        ? of(false)
        : this.service
            .updateTaxSetting({
              tax_id: obj.id,
              name: obj.name,
              rate: Number(obj.rate),
            })
            .pipe(
              map(() => false),
              startWith(true),
              catchError((e: HttpErrorResponse) => {
                this.toastService.toastMessage(
                  e.error ? e.error.message : e.message,
                );
                return of(false);
              }),
            ),
    ),
  );

  /**
   * index and api are used to match the appropriate row button to display loading
   * state.
   * */
  readonly index = signal(-1);
  readonly api = toSignal(this.loadingState$, { initialValue: false });
  readonly taxes$ = this.service.refreshTaxSetting$;

  update(index: number, taxId: number, name: string, rate: string): void {
    this.index.set(index);
    this.subject.next({ id: taxId, name: name, rate: rate });
  }
}
