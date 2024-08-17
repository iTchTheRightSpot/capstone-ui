import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SettingService } from '../setting.service';
import { ShipSettingMapper } from '../setting.util';
import { catchError, Observable, of } from 'rxjs';
import { DirectiveModule } from '@/app/directive/directive.module';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@/app/shared-comp/toast/toast.service';

@Component({
  selector: 'app-update-shipping',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    DirectiveModule,
  ],
  template: `
    <div class="w-full p-2 flex justify-center">
      <h1
        class="cx-font-size w-fit capitalize border-b border-b-[var(--app-theme)]"
      >
        editing {{ data.country }}
      </h1>
    </div>

    <form
      class="w-full p-2 grid grid-cols-1 gap-2 bg-[var(--white)]"
      [formGroup]="form"
    >
      <!-- Country -->
      <div
        class="p-6 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
      >
        <h4 class="text-xs">Country <span style="color: red">*</span></h4>
        <input
          type="text"
          formControlName="country"
          class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
        />
      </div>

      <!-- ngn -->
      <div
        class="p-6 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
      >
        <h4 class="text-xs capitalize">
          cost in NGN <span style="color: red">*</span>
        </h4>
        <input
          type="number"
          formControlName="ngn"
          class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
        />
      </div>

      <!-- usd -->
      <div
        class="p-6 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
      >
        <h4 class="text-xs capitalize">
          cost in USD <span style="color: red">*</span>
        </h4>
        <input
          type="number"
          formControlName="usd"
          class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
        />
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
          [asyncButton]="update()"
        >
          update
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateShippingComponent {
  readonly form: FormGroup;

  constructor(
    private readonly service: SettingService,
    private readonly toast: ToastService,
    private readonly fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateShippingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShipSettingMapper,
  ) {
    this.form = this.fb.group({
      country: new FormControl(data.country, [
        Validators.required,
        Validators.max(57),
      ]),
      usd: new FormControl(data.usd_price, Validators.required),
      ngn: new FormControl(data.ngn_price, Validators.required),
    });
  }

  /**
   * Closes modal
   * */
  cancel(): void {
    this.dialogRef.close();
  }

  update(): Observable<number> {
    const country = this.form.controls['country'].value;
    const usd = this.form.controls['usd'].value;
    const ngn = this.form.controls['ngn'].value;
    return !country || !usd || !ngn
      ? of()
      : this.service
          .update({
            shipping_id: this.data.shipping_id,
            country: country,
            ngn_price: ngn,
            usd_price: usd,
          })
          .pipe(
            catchError((e: HttpErrorResponse) => {
              this.toast.toastMessage(e.error ? e.error.message : e.message);
              return of(e.status);
            }),
          );
  }
}
