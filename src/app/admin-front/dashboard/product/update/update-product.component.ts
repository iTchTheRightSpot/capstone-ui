import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {catchError, combineLatest, map, Observable, of, ReplaySubject, startWith, switchMap, tap} from "rxjs";
import {
  CustomRowMapper,
  ProductDetailResponse,
  ProductResponse,
  TableContent,
  UpdateProduct,
} from "../../../shared-util";
import {HttpErrorResponse} from "@angular/common/http";
import {ProductService} from "../product.service";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {DirectiveModule} from "../../../../directive/directive.module";
import {CategoryService} from "../../category/category.service";
import {DynamicTableComponent} from "../../util/dynamictable/dynamic-table.component";
import {Variant} from "../../../../global-utils";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {UpdateVariantComponent} from "../product-variant/updatevariant/update-variant.component";
import {ToastService} from "../../../../shared-comp/toast/toast.service";
import {CreateVariantComponent} from "../product-variant/create-variant/create-variant.component";
import {UpdateProductService} from "./update-product.service";
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {DeleteComponent} from "../../util/delete/delete.component";
import {CustomUpdateVariant} from "../product-variant";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {CategoryHierarchyComponent} from "../../../../shared-comp/hierarchy/category-hierarchy.component";

@Component({
  selector: 'app-update-product',
  standalone: true,
  styles: [`
    :host ::ng-deep .ck-editor__editable_inline {
      min-height: 100px;
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule,
    DirectiveModule,
    DynamicTableComponent,
    MatDialogModule,
    CategoryHierarchyComponent
  ],
  templateUrl: './update-product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly productUUID = toSignal(
    this.activeRoute.params.pipe(map((p: Params) => p as { id: string })),
    { initialValue: { id: '' } }
  );

  // custom object
  private readonly product: ProductResponse | undefined = this.productService.products
    .find((value: ProductResponse) => value.product_id === this.productUUID().id)

  categoryName = this.categoryService.categories
    .find(c => c.name === this.product?.category)?.name;

  readonly data: { categoryId?: number, product?: ProductResponse } = {
    categoryId: this.categoryService.categories
      .find(c => c.name === this.product?.category)?.category_id,
    product: this.product
  }

  toggle = true;
  readonly hierarchy$ = this.categoryService.hierarchy$;

  // table
  readonly thead: Array<keyof CustomRowMapper> = ['index', 'url', 'colour', 'is_visible', 'sku', 'inventory', 'size', 'action'];
  productVariants$: Observable<{
    state: string,
    error?: string,
    data?: CustomRowMapper[]
  }> = this.updateProductService
    .fetchProductDetails(this.productUUID().id)
    .pipe(
      map((arr: ProductDetailResponse[]) =>
        ({ state: 'LOADED', data: this.toCustomRowMapperArray(arr) })
      ),
      startWith({ state: 'LOADING' }),
      catchError((err: HttpErrorResponse) =>
        of({ state: 'ERROR', error: err.error ? err.error.message : err.message })
      )
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
    sku: new FormControl({value: '', disabled: true}, [Validators.required]),
    price: new FormControl(0, Validators.required),
    desc: new FormControl('', [Validators.required, Validators.max(1000)]),
  });

  ngOnInit(): void {
    if (!this.data.product) {
      return;
    }

    this.form.controls['name'].setValue(this.data.product.name);
    this.form.controls['price'].setValue(this.data.product.price);
    this.form.controls['desc'].setValue(this.data.product.desc);
  }

  /**
   * Convert from ProductDetailResponse[] to CustomRowMapper[]
   * */
  private toCustomRowMapperArray = (arr: ProductDetailResponse[]): CustomRowMapper[] => arr
    .flatMap((res: ProductDetailResponse) => {
      const data: CustomRowMapper[] = [];

      // add all colours
      this.colours.push(...[res.colour]);

      // Based on the amount of Variants, append to CustomMapper
      res.variants.forEach((variant: Variant, index: number): void => {
        const obj: CustomRowMapper = {
          index: index,
          url: res.url[0],
          urls: res.url,
          colour: res.colour,
          is_visible: res.is_visible,
          sku: variant.sku,
          inventory: Number(variant.inventory),
          size: variant.size,
          action: ''
        }
        data.push(obj);

        if (index === 0) {
          this.productSubject$.next(obj);
          this.form.controls['sku'].setValue(variant.sku);
        }
      });
      return data;
    });

  private afterComponentClose = <T extends { arr: ProductDetailResponse[] }> (obj: Observable<T>) =>
    obj.pipe(
      tap((arr: { arr: ProductDetailResponse[] }) => {
        if (!arr || !(arr.arr && arr.arr.length > 0)) {
          return
        }
        this.productVariants$ = of({ state: 'LOADED', data: this.toCustomRowMapperArray(arr.arr) });
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
      data: { id: this.productUUID().id, colours: this.colours }
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

    const product = this.data.product;
    const cat = this.data.categoryId;

    // Validation
    if (!name || !price || !desc || !product || !cat) {
      return of();
    }

    return this.productService.currency$
      .pipe(
        switchMap((currency) => {
          // Create payload
          const payload: UpdateProduct = {
            category_id: this.currentCategory !== undefined && this.currentCategory.categoryId !== cat
              ? this.currentCategory.categoryId : cat,
            product_id: this.productUUID().id,
            name: name,
            currency: currency,
            price: price,
            desc: desc.trim(),
            category: product.category,
          };

          return this.updateProduct(
            payload,
            this.currentCategory !== undefined && this.currentCategory.categoryId !== cat
          );
        })
      );
  }

  /** Makes a call to our server to update a Product */
  private updateProduct(obj: UpdateProduct, bool: boolean): Observable<number> {
    return this.productService.updateProduct(obj)
      .pipe(
        switchMap((status: number) => {
          const res = of(status);
          const products$ = this.productService.currency$
            .pipe(switchMap((currency) =>
              this.productService.allProducts(0, 20, currency))
            );
          const categories$ = this.categoryService.allCategories();
          // If user changes category or collection, refresh the arrays else only refresh products
          return bool
            ? combineLatest([products$, categories$]).pipe(switchMap(() => res))
            : products$.pipe(switchMap(() => res));
        }),
        catchError((err: HttpErrorResponse) => {
          this.toastService.toastMessage(err.error ? err.error.message : err.message);
          return of(err.status);
        })
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
          productId: this.productUUID().id,
          productName: this.product.name,
          variant: {
            sku: content.data.sku,
            colour: content.data.colour,
            is_visible: content.data.is_visible,
            qty: content.data.inventory,
            size: content.data.size
          }
        }

        // Open Component
        const open = this.dialog.open(UpdateVariantComponent, {
          height: '400px',
          width: '600px',
          maxWidth: '100%',
          data: v,
        })

        // this.afterComponentClose(open.afterClosed());
        break;
      }

      case 'delete': {
        // Delete Observable/Request
        const obs = this.updateProductService
          .deleteVariant(content.data.sku)
          .pipe(
            switchMap((status: number) => {
              return this.updateProductService
                .fetchProductDetails(this.productUUID().id)
                .pipe(
                  tap((arr: ProductDetailResponse[]) => {
                    // On successful deletion, update productVariants$
                    const mapper = this.toCustomRowMapperArray(arr);
                    this.productVariants$ = of({ state: 'LOADED', data: mapper });
                  }),
                  switchMap(() => of(status))
                );
            })
          );

        this.dialog.open(DeleteComponent, {
          width: '500px',
          maxWidth: '100%',
          height: 'fit-content',
          data: {
            name: 'Product Variant ' + content.data.colour,
            asyncButton: obs
          }
        });

        break;
      }

      default:
        console.error('Invalid key');
    }
  }

}