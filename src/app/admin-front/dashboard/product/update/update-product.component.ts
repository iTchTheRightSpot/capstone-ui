import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  ReplaySubject,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  ProductDetailResponse,
  ProductResponse,
  TableContent,
  UpdateProduct,
} from '@/app/admin-front/shared-util';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../product.service';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DirectiveModule } from '@/app/directive/directive.module';
import { CategoryService } from '@/app/admin-front/dashboard/category/category.service';
import { DynamicTableComponent } from '@/app/admin-front/dashboard/util/dynamictable/dynamic-table.component';
import { Variant } from '@/app/global-utils';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UpdateVariantComponent } from '../product-variant/updatevariant/update-variant.component';
import { ToastService } from '@/app/shared-comp/toast/toast.service';
import { CreateVariantComponent } from '../product-variant/create-variant/create-variant.component';
import { UpdateProductService } from './update-product.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DeleteComponent } from '@/app/admin-front/dashboard/util/delete/delete.component';
import { CategoryHierarchyComponent } from '@/app/shared-comp/hierarchy/category-hierarchy.component';
import { CustomUpdateVariant } from '@/app/admin-front/dashboard/product/product-variant';

interface CustomRowMapper {
  index: number;
  colour: string;
  visible: boolean;
  image: string;
  urls?: string[];
  sku: string;
  inventory: number;
  size: string;
  delete: string;
}

@Component({
  selector: 'app-update-product',
  standalone: true,
  styles: [
    `
      :host ::ng-deep .ck-editor__editable_inline {
        min-height: 100px;
      }
    `,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DirectiveModule,
    DynamicTableComponent,
    CategoryHierarchyComponent,
  ],
  templateUrl: './update-product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateProductComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly updateProductService = inject(UpdateProductService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly dialog = inject(MatDialog);
  private readonly toastService = inject(ToastService);
  private readonly productUuid = toSignal(
    this.activeRoute.params.pipe(map((p: Params) => p as { id: string })),
    { initialValue: { id: '' } },
  );

  // custom object
  private readonly product: ProductResponse | undefined =
    this.productService.products.find(
      (value: ProductResponse) => value.product_id === this.productUuid().id,
    );

  categoryName = this.categoryService.categories.find(
    (c) => c.name === this.product?.category,
  )?.name;

  readonly data: { categoryId?: number; product?: ProductResponse } = {
    categoryId: this.categoryService.categories.find(
      (c) => c.name === this.product?.category,
    )?.category_id,
    product: this.product,
  };

  toggle = true;
  readonly hierarchy$ = this.categoryService.hierarchy$;

  // table
  readonly thead: Array<keyof CustomRowMapper> = [
    'index',
    'image',
    'colour',
    'visible',
    'sku',
    'inventory',
    'size',
    'delete',
  ];
  productVariants$: Observable<{
    state: string;
    error?: string;
    data?: CustomRowMapper[];
  }> = this.updateProductService
    .productDetailsByProductUuid(this.productUuid().id)
    .pipe(
      map((arr: ProductDetailResponse[]) => ({
        state: 'LOADED',
        data: this.toCustomRowMapperArray(arr),
      })),
      startWith({ state: 'LOADING' }),
      catchError((err: HttpErrorResponse) =>
        of({
          state: 'ERROR',
          error: err.error ? err.error.message : err.message,
        }),
      ),
    );

  // Initially the product variant displayed and when user clicks on variant table
  private readonly productSubject$ = new ReplaySubject<CustomRowMapper>();
  currentProduct$ = this.productSubject$.asObservable();

  // CKEditor
  readonly config = ClassicEditor;

  // Needed if a cx wants to create a product variant of the same colour
  private colours: string[] = [];

  readonly form = this.fb.group({
    name: new FormControl('', [Validators.required, Validators.max(50)]),
    sku: new FormControl({ value: '', disabled: true }, [Validators.required]),
    price: new FormControl(0, Validators.required),
    weight: new FormControl(0, [Validators.required]),
    desc: new FormControl('', [Validators.required, Validators.max(1000)]),
  });

  ngOnInit(): void {
    if (this.data.product) {
      this.form.controls['name'].setValue(this.data.product.name);
      this.form.controls['price'].setValue(this.data.product.price);
      this.form.controls['desc'].setValue(this.data.product.desc);
      this.form.controls['weight'].setValue(this.data.product.weight);
    }
  }

  /**
   * Convert from ProductDetailResponse[] to CustomRowMapper[]
   * */
  private toCustomRowMapperArray = (
    arr: ProductDetailResponse[],
  ): CustomRowMapper[] =>
    arr.flatMap((res: ProductDetailResponse) => {
      const data: CustomRowMapper[] = [];

      // add all colours
      this.colours.push(...[res.colour]);

      // Based on the amount of Variants, append to CustomMapper
      res.variants.forEach((variant: Variant, index: number): void => {
        const obj: CustomRowMapper = {
          index: index,
          image: res.urls[0],
          urls: res.urls,
          colour: res.colour,
          visible: res.is_visible,
          sku: variant.sku,
          inventory: Number(variant.inventory),
          size: variant.size,
          delete: '',
        };
        data.push(obj);

        if (index === 0) {
          this.productSubject$.next(obj);
          this.form.controls['sku'].setValue(variant.sku);
        }
      });
      return data;
    });

  private afterComponentClose = <T extends { arr: ProductDetailResponse[] }>(
    obj: Observable<T>,
  ) =>
    obj.pipe(
      tap((arr: { arr: ProductDetailResponse[] }) => {
        if (!arr || !(arr.arr && arr.arr.length > 0)) {
          return;
        }
        this.productVariants$ = of({
          state: 'LOADED',
          data: this.toCustomRowMapperArray(arr.arr),
        });
      }),
    );

  /**
   * Opens CreateVariantComponent
   * */
  openCreateVariantComponent(): Observable<number> {
    const open = this.dialog.open(CreateVariantComponent, {
      height: '450px',
      width: '900px',
      maxWidth: '100%',
      maxHeight: '100%',
      data: { id: this.productUuid().id, colours: this.colours },
    });
    return this.afterComponentClose(open.afterClosed()).pipe(map(() => 0));
  }

  /** Return back to product component */
  returnToProductComponent(): void {
    this.router.navigate(['/admin/dashboard/product']);
  }

  currentCategory: { categoryId: number; name: string } | undefined = undefined;
  categoryClicked(obj: { categoryId: number; name: string }): void {
    this.categoryName = obj.name;
    this.currentCategory = obj;
  }

  /** Makes call to server to update product not product detail */
  onSubmit(): Observable<number> {
    const name = this.form.controls['name'].value;
    const price = this.form.controls['price'].value;
    const desc = this.form.controls['desc'].value;
    const weight = this.form.controls['weight'].value;

    const product = this.data.product;
    const cat = this.data.categoryId;

    // Validation
    if (!name || !price || !desc || !product || !cat || !weight) {
      return of();
    }

    return this.productService.currency$.pipe(
      switchMap((currency) => {
        const payload: UpdateProduct = {
          category_id:
            this.currentCategory !== undefined &&
            this.currentCategory.categoryId !== cat
              ? this.currentCategory.categoryId
              : cat,
          product_id: this.productUuid().id,
          name: name,
          currency: currency,
          price: price,
          desc: desc.trim(),
          category: product.category,
          weight: weight,
        };

        return this.updateProduct(
          payload,
          this.currentCategory !== undefined &&
            this.currentCategory.categoryId !== cat,
        );
      }),
    );
  }

  /**
   * Make a call to our server to update a Product.
   * */
  private updateProduct(obj: UpdateProduct, bool: boolean): Observable<number> {
    return this.productService.updateProduct(obj).pipe(
      switchMap((status: number) => {
        const res = of(status);
        const products$ = this.productService.currency$.pipe(
          switchMap((currency) =>
            this.productService.allProducts(0, 20, currency),
          ),
        );
        const categories$ = this.categoryService.allCategories();
        // If user changes category or collection, refresh the arrays else only refresh products
        return bool
          ? combineLatest([products$, categories$]).pipe(switchMap(() => res))
          : products$.pipe(switchMap(() => res));
      }),
      catchError((err: HttpErrorResponse) => {
        this.toastService.toastMessage(
          err.error ? err.error.message : err.message,
        );
        return of(err.status);
      }),
    );
  }

  /**
   * Based on info key received from Dynamic table Component,
   * we either do nothing, update or delete action
   * @param content is info received from Dynamic Table Component
   * */
  onDeleteOrUpdateVariant(content: TableContent<CustomRowMapper>): void {
    this.form.controls['sku'].setValue(content.data.sku);
    this.productSubject$.next(content.data);

    switch (content.key) {
      // view is a global click
      case 'view':
        break;

      case 'edit': {
        if (!this.product) {
          return;
        }

        const v: CustomUpdateVariant = {
          productId: this.productUuid().id,
          productName: this.product.name,
          variant: {
            sku: content.data.sku,
            colour: content.data.colour,
            is_visible: content.data.visible,
            qty: content.data.inventory,
            size: content.data.size,
          },
        };

        // Open Component
        const open = this.dialog.open(UpdateVariantComponent, {
          height: '400px',
          width: '600px',
          maxWidth: '100%',
          data: v,
        });

        this.afterComponentClose(open.afterClosed());
        break;
      }

      case 'delete': {
        // Delete Observable/Request
        const obs = this.updateProductService
          .deleteVariantBySku(content.data.sku)
          .pipe(
            switchMap((status: number) => {
              return this.updateProductService
                .productDetailsByProductUuid(this.productUuid().id)
                .pipe(
                  tap((arr: ProductDetailResponse[]) => {
                    // On successful deletion, update productVariants$
                    const mapper = this.toCustomRowMapperArray(arr);
                    this.productVariants$ = of({
                      state: 'LOADED',
                      data: mapper,
                    });
                  }),
                  switchMap(() => of(status)),
                );
            }),
          );

        this.dialog.open(DeleteComponent, {
          width: '500px',
          maxWidth: '100%',
          height: 'fit-content',
          data: {
            name: 'Product Variant ' + content.data.colour,
            asyncButton: obs,
          },
        });

        break;
      }

      default:
        this.toastService.toastMessage('invalid key chosen');
    }
  }
}
