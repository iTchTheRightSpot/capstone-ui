import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { VariantService } from '../variant.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UpdateProductService } from '@/app/employee-front/dashboard/product/update/update-product.service';
import { ProductDetailResponse } from '@/app/employee-front/admin-front.util';
import { CustomUpdateVariant, UpdateVariant } from '../index';
import { ToastService } from '@/app/global-service/toast.service';

@Component({
  selector: 'app-update-variant',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="w-full p-2 flex justify-center">
      <h1
        class="cx-font-size w-fit capitalize border-b border-b-[var(--app-theme)]"
      >
        editing {{ data.productName }} variant
      </h1>
    </div>

    <form
      class="w-full p-2 grid grid-cols-1 gap-2 bg-[var(--white)]"
      [formGroup]="form"
    >
      <!-- SKU -->
      <div
        class="p-6 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
      >
        <h4 class="cx-font-size">SKU <span style="color: red">*</span></h4>
        <input
          type="text"
          class="w-full bg-transparent"
          formControlName="sku"
        />
      </div>

      <!-- Colour -->
      <div
        class="p-6 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
      >
        <h4 class="cx-font-size capitalize">
          colour <span style="color: red">*</span>
        </h4>
        <input
          type="text"
          class="w-full p-2.5 bg-transparent rounded-sm border border-solid border-[var(--border-outline)]"
          formControlName="colour"
        />
      </div>

      <!-- Radio -->
      <div
        class="p-6 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
      >
        <h4 class="cx-font-size">
          Visibility (include in store front)
          <span [style]="'color: red'">*</span>
        </h4>
        radio
        <!--        <mat-radio-group-->
        <!--          aria-label="Select an option"-->
        <!--          formControlName="visible"-->
        <!--        >-->
        <!--          <mat-radio-button [value]="false" [checked]="!data.variant.is_visible"-->
        <!--            >false</mat-radio-button-->
        <!--          >-->
        <!--          <mat-radio-button [value]="true" [checked]="data.variant.is_visible"-->
        <!--            >true</mat-radio-button-->
        <!--          >-->
        <!--        </mat-radio-group>-->
      </div>

      <!-- QTY -->
      <div
        class="p-6 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
      >
        <h4 class="cx-font-size capitalize">
          quantity <span style="color: red">*</span>
        </h4>
        <input
          type="number"
          class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
          [value]="data.variant.qty"
          formControlName="qty"
        />
      </div>

      <!-- SIZE -->
      <div
        class="p-6 text-left rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
      >
        <h4 class="cx-font-size capitalize">
          size <span style="color: red">*</span>
        </h4>
        <input
          type="text"
          formControlName="size"
          [value]="data.variant.size"
          class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
        />
      </div>

      <!-- Btn ctn -->
      <div class="flex justify-between py-2.5 px-1.5">
        <button
          class="text-white font-bold py-2 px-4 rounded border bg-red-500"
          type="button"
          (click)="onNoClick()"
        >
          cancel
        </button>

        <button
          type="submit"
          (click)="update()"
          class="text-white font-bold py-2 px-4 rounded bg-[var(--app-theme)]"
          [disabled]="!form.valid"
          [style]="{
            'background-color': form.valid
              ? 'var(--app-theme-hover)'
              : 'var(--app-theme)'
          }"
        >
          update
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateVariantComponent {
  private readonly updateVariantService = inject(VariantService);
  private readonly updateProductService = inject(UpdateProductService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup;

  constructor() { // @Inject(MAT_DIALOG_DATA) public data: CustomUpdateVariant, // private dialogRef: MatDialogRef<UpdateVariantComponent>,
    this.form = this.fb.group({
      sku: new FormControl({ value: 'sku', disabled: true }, [
        Validators.required,
      ]),
      colour: new FormControl('colour', [Validators.required]),
      visible: new FormControl(true, [Validators.required]),
      qty: new FormControl(1, Validators.required),
      size: new FormControl('medium', [Validators.required]),
    });
    // this.form = this.fb.group({
    //   sku: new FormControl({ value: this.data.variant.sku, disabled: true }, [
    //     Validators.required,
    //   ]),
    //   colour: new FormControl(this.data.variant.colour, [Validators.required]),
    //   visible: new FormControl(this.data.variant.is_visible, [
    //     Validators.required,
    //   ]),
    //   qty: new FormControl(this.data.variant.qty, Validators.required),
    //   size: new FormControl(this.data.variant.size, [Validators.required]),
    // });
  }

  /**
   * Closes modal
   * */
  onNoClick(): void {}

  /**
   * Update ProductVariant
   * */
  update(): Observable<number> {
    const sku = this.form.controls['sku'].value;
    const visible = this.form.controls['visible'].value;
    const colour = this.form.controls['colour'].value;
    const qty = this.form.controls['qty'].value;
    const size = this.form.controls['size'].value;

    const payload: UpdateVariant = {
      sku: sku,
      colour: colour,
      is_visible: visible,
      qty: qty,
      size: size,
    };

    return this.updateVariantService.updateVariant(payload).pipe(
      switchMap((status: number) => {
        // refresh variants table and close the modal
        return (
          this.updateProductService
            // .productDetailsByProductUuid(this.data.productId)
            .productDetailsByProductUuid('product-id')
            .pipe(
              // tap((arr: ProductDetailResponse[]) =>
              //   this.dialogRef.close({ arr: arr }),
              // ),
              switchMap(() => of(status)),
              catchError((e: HttpErrorResponse) => {
                // this.toastService.toastMessage(
                //   e.error ? e.error.message : e.message,
                // );
                return of(e.status);
              }),
            )
        );
      }),
      catchError((e: HttpErrorResponse) => {
        // this.toastService.toastMessage(e.error ? e.error.message : e.message);
        return of(e.status);
      }),
    );
  }
}
