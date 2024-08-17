import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SizeInventory } from '@/app/employee-front/admin-front.util';
import { catchError, Observable, of, switchMap } from 'rxjs';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryService } from '@/app/employee-front/dashboard/category/category.service';
import { NewProductService } from './new-product.service';
import { SizeInventoryComponent } from '../sizeinventory/size-inventory.component';
import { ProductService } from '../product.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SizeInventoryService } from '../sizeinventory/size-inventory.service';
import { Router } from '@angular/router';
import { SarreCurrency } from '@/app/global-utils';
import { CategoryHierarchyComponent } from '@/app/shared-comp/hierarchy/category-hierarchy.component';
import { EditorModule } from 'primeng/editor';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastService } from '@/app/global-service/toast.service';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SizeInventoryComponent,
    ReactiveFormsModule,
    EditorModule,
    CategoryHierarchyComponent,
    RadioButtonModule,
  ],
  templateUrl: './new-product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProductComponent {
  private readonly newProductService = inject(NewProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly sizeInventoryService = inject(SizeInventoryService);
  private readonly router = inject(Router);

  // converts from file to string
  toString = (file: File): string => URL.createObjectURL(file);

  content: string = '';
  files: File[] = []; // Images
  rows: SizeInventory[] = [];

  toggle = true;
  readonly hierarchy$ = this.categoryService.hierarchy$;

  readonly form = this.fb.group({
    collection: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.max(50)]),
    weight: new FormControl(0, Validators.required),
    ngn: new FormControl(0, Validators.required),
    usd: new FormControl(0, Validators.required),
    desc: new FormControl('', [Validators.required, Validators.max(1000)]),
    visible: new FormControl(false, Validators.required),
    colour: new FormControl('', Validators.required),
  });

  protected readonly routeToProductComponent = async () =>
    await this.router.navigate(['/admin/dashboard/product']);

  /**
   * Responsible for verifying file uploaded is in image and then updating file FormGroup.
   * For better understanding https://blog.angular-university.io/angular-file-upload/
   *
   * @param event of any
   * @return void
   * */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    const files: File[] = Array.from(input.files);
    this.files.push(...files);
  }

  /**
   * Clears reactiveForm
   * */
  clear(): void {
    Object.keys(this.form.controls).forEach((key) => {
      if (key !== 'visible') {
        this.form.get(key)?.reset('');
      }
    });

    while (this.files.length > 0) {
      this.files.pop();
    }
    this.sizeInventoryService.setSubject(true);
    this.currentCategory = undefined;
  }

  /**
   * Removes image clicked
   *
   * @param file
   * @return void
   * */
  remove(file: File): void {
    const index: number = this.files.findIndex(
      (value: File) => value.name === file.name,
    );
    this.files.splice(index, 1);
  }

  /**
   * Updates SizeInventory[]
   * */
  sizeInv(arr: SizeInventory[]): void {
    this.rows = arr;
  }

  currentCategory: { categoryId: number; name: string } | undefined = undefined;

  categoryClicked(obj: { categoryId: number; name: string }): void {
    this.currentCategory = obj;
  }

  /**
   * Method responsible for creating a new product
   * */
  submit(): Observable<number> {
    const name = this.form.controls['name'].value;
    const ngn = this.form.controls['ngn'].value;
    const usd = this.form.controls['usd'].value;
    const weight = this.form.controls['weight'].value;
    const desc = this.form.controls['desc'].value;
    const visible = this.form.controls['visible'].value;
    const colour = this.form.controls['colour'].value;

    if (
      !this.currentCategory ||
      !name ||
      !ngn ||
      !usd ||
      !weight ||
      visible === null ||
      !colour
    ) {
      return of(0);
    }

    const formData = new FormData();

    const dto = {
      category_id: this.currentCategory.categoryId,
      name: name.trim(),
      priceCurrency: [
        { currency: SarreCurrency.NGN, price: ngn },
        { currency: SarreCurrency.USD, price: usd },
      ],
      weight: weight,
      desc: !desc ? '' : desc.trim(),
      visible: visible,
      colour: colour.trim(),
      sizeInventory: this.rows,
    };

    formData.append(
      'dto',
      new Blob([JSON.stringify(dto)], { type: 'application/json' }),
    );

    // append files
    this.files.forEach((file: File) => formData.append('files', file));

    return this.create(formData);
  }

  /**
   * Creates a new {@link Product} and fetches new products to updates product table
   * */
  private create = (data: FormData): Observable<number> =>
    this.newProductService.create(data).pipe(
      switchMap((status: number) => {
        this.sizeInventoryService.setSubject(true);
        this.clear();
        return this.productService.currency$.pipe(
          switchMap((currency) =>
            this.productService.allProducts(0, 20, currency).pipe(
              switchMap(() => of(status)),
              catchError((err: HttpErrorResponse) => {
                this.toastService.toastMessage(
                  err.error ? err.error.message : err.message,
                );
                return of(err.status);
              }),
            ),
          ),
        );
      }),
      catchError((err: HttpErrorResponse) => {
        this.toastService.toastMessage(
          err.error ? err.error.message : err.message,
        );
        return of(err.status);
      }),
    );
}
