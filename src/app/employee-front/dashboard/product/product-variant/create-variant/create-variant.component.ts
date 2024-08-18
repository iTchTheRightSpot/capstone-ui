import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SizeInventoryComponent } from '@/app/employee-front/dashboard/product/sizeinventory/size-inventory.component';
import {
  ProductDetailResponse,
  SizeInventory,
} from '@/app/employee-front/admin-front.util';
import { Observable, of, switchMap } from 'rxjs';
import { UpdateProductService } from '@/app/employee-front/dashboard/product/update/update-product.service';
import { SizeInventoryService } from '@/app/employee-front/dashboard/product/sizeinventory/size-inventory.service';
import { VariantService } from '../variant.service';
import { ToastService } from '@/app/global-service/toast.service';

@Component({
  selector: 'app-create-variant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SizeInventoryComponent],
  templateUrl: './create-variant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateVariantComponent {
  private readonly variantService = inject(VariantService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly updateProductService = inject(UpdateProductService);
  private readonly sizeInventoryService = inject(SizeInventoryService);

  files: File[] = []; // Images
  rows: SizeInventory[] = [];
  colourExists = true;

  // Converts file to image strings
  toString = (file: File): string => URL.createObjectURL(file);

  protected readonly reactiveForm = this.fb.group({
    visible: new FormControl(true, Validators.required),
    colour: new FormControl('', Validators.required),
  });

  // constructor(
  //   private dialogRef: MatDialogRef<CreateVariantComponent>,
  //   @Inject(MAT_DIALOG_DATA) public data: ProductVariant,
  // ) {}

  /**
   * Allows for removing dummy inputs if colour exists
   * */
  oninputChange(event: KeyboardEvent): void {
    const input: string = (event.target as HTMLInputElement).value;
    // const find = this.data.colours.find((c) => c === input);
    // if (find) {
    //   this.colourExists = false;
    //   this.files = [];
    // }
  }

  /**
   * Updates reactive form if cx wants to create a new product variant with exist colour
   * */
  onselectColour(event: Event): void {
    const colour: string = (event.target as HTMLInputElement).value;
    this.reactiveForm.controls['colour'].setValue(colour);
    this.colourExists = false;
    this.files = [];
  }

  /**
   * Removes image clicked
   * @param file
   * @return void
   * */
  remove(file: File): void {
    const index: number = this.files.findIndex(
      (value: File) => value.name === file.name,
    );
    this.files.splice(index, 1);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.files.push(file);
    }
  }

  cancel(): void {}

  /** Clears reactiveForm */
  clear(): void {
    this.files = [];
    this.reactiveForm.reset();
  }

  /** Sets Size and Inventory to FormGroup */
  sizeInv(arr: SizeInventory[]): void {
    this.rows = arr;
  }

  create(): Observable<number> {
    const formData = new FormData();

    // const payload = {
    //   product_id: this.data.id,
    //   visible: this.reactiveForm.controls['visible'].value,
    //   colour: this.reactiveForm.controls['colour'].value,
    //   sizeInventory: this.rows,
    // };

    const payload = {
      product_id: -1,
      visible: this.reactiveForm.controls['visible'].value,
      colour: this.reactiveForm.controls['colour'].value,
      sizeInventory: this.rows,
    };

    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });
    formData.append('dto', blob);

    // append files
    this.files.forEach((file: File) => formData.append('files', file));

    return this.variantService.create(formData).pipe(
      switchMap((status: number) => {
        return (
          this.updateProductService
            // .productDetailsByProductUuid(this.data.id)
            .productDetailsByProductUuid('-1')
            .pipe(
              switchMap((arr: ProductDetailResponse[]) => {
                this.sizeInventoryService.setSubject(true);
                return of(status);
              }),
              // tap(() => this.toastService.toastMessage('Created!')),
            )
        );
      }),
      // catchError((err: HttpErrorResponse) => {
      //   this.toastService.toastMessage(err.error.message);
      //   return of(err.status);
      // }),
    );
  }
}
