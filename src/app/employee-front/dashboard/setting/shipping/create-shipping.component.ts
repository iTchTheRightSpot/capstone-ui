import {
  ChangeDetectionStrategy,
  Component,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SettingService } from '@/app/employee-front/dashboard/setting/setting.service';
import { DirectiveModule } from '@/app/directive/directive.module';
import { catchError, Observable, of, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-create-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DirectiveModule],
  template: `
    <div class="p-3">
      <div class="w-full flex justify-center">
        <h1 class="w-fit text-xs border-b border-[var(--app-theme)]">
          New Shipping Setting
        </h1>
      </div>

      <form
        class="w-full p-2 grid grid-cols-1 gap-2 bg-[var(--white)]"
        [formGroup]="form"
      >
        <!-- Country -->
        <div
          class="p-4 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
        >
          <h4 class="text-xs">Country <span style="color: red">*</span></h4>
          <input
            type="text"
            formControlName="country"
            class="p-1.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
          />
        </div>

        <!-- ngn -->
        <div
          class="p-4 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
        >
          <h4 class="text-xs capitalize">
            cost in NGN <span style="color: red">*</span>
          </h4>
          <input
            type="number"
            formControlName="ngn"
            class="p-1.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
          />
        </div>

        <!-- usd -->
        <div
          class="p-4 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
        >
          <h4 class="text-xs capitalize">
            cost in USD <span style="color: red">*</span>
          </h4>
          <input
            type="number"
            formControlName="usd"
            class="p-1.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
          />
        </div>

        <!-- usd -->
        <div class="w-full p-2">
          <p class="text-xs text-red-400">{{ error() }}</p>
        </div>

        <div class="flex justify-between py-2.5 px-1.5">
          <button
            class="text-white font-bold py-2 px-4 rounded border bg-red-500"
            type="button"
            (click)="cancel()"
          >
            cancel
          </button>

          <button
            type="submit"
            class="text-white font-bold py-2 px-4 rounded bg-[var(--app-theme)]"
            [disabled]="!form.valid"
            [style]="{
              'background-color': form.valid
                ? 'var(--app-theme-hover)'
                : 'var(--app-theme)'
            }"
            [asyncButton]="create()"
          >
            create
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateShippingComponent {
  readonly error: WritableSignal<string>;

  constructor(
    private readonly dialogRef: MatDialogRef<CreateShippingComponent>,
    private readonly fb: FormBuilder,
    private readonly service: SettingService,
  ) {
    this.error = signal('');
  }

  readonly form = this.fb.group({
    country: new FormControl('', [Validators.required, Validators.max(57)]),
    usd: new FormControl(0, Validators.required),
    ngn: new FormControl(0, Validators.required),
  });

  /**
   * Closes {@link CreateShippingComponent}
   * */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Initiates a request to the server to create a new
   * {@link ShipSettingMapper}.
   *
   * This function extracts the necessary data from
   * the form fields(country, USD and NGN price) and
   * sends it to the server via the {@link SettingService}
   * global-service. Upon success, the 'cancel' function is triggered.
   *
   * If any required field is missing, the function returns 0.
   * In case of an error during the request, the error message is displayed.
   *
   * @returns An observable emitting the HTTP status code upon completion.
   */
  create(): Observable<number> {
    const country = this.form.controls['country'].value;
    const usd = this.form.controls['usd'].value;
    const ngn = this.form.controls['ngn'].value;

    return !country || !usd || !ngn
      ? of(0)
      : this.service
          .create({ country: country, usd_price: usd, ngn_price: ngn })
          .pipe(
            tap(() => this.cancel()),
            catchError((e: HttpErrorResponse) => {
              this.error.set(e.error ? e.error.message : e.message);
              return of(e.status);
            }),
          );
  }
}
