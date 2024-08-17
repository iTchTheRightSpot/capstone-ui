import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { MatRadioModule } from '@angular/material/radio';
import { DirectiveModule } from '@/app/directive/directive.module';
import { CategoryService } from '../category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@/app/shared-comp/toast/toast.service';
import { Router } from '@angular/router';
import { CategoryHierarchyComponent } from '@/app/shared-comp/hierarchy/category-hierarchy.component';

@Component({
  selector: 'app-new-category',
  standalone: true,
  imports: [
    CommonModule,
    MatRadioModule,
    ReactiveFormsModule,
    DirectiveModule,
    CategoryHierarchyComponent,
  ],
  template: `
    <form class="h-full flex flex-col py-0 px-2.5" [formGroup]="form">
      <!-- Title -->
      <div class="py-2.5 px-0 mb-4 flex">
        <button
          (click)="routeToCategoryComponent()"
          type="button"
          class="mr-1.5 md:px-2.5 border-[var(--border-outline)] border"
        >
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
              d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
            />
          </svg>
        </button>
        <h1
          class="cx-font-size w-fit capitalize border-b border-[var(--app-theme)]"
        >
          create a new category
        </h1>
      </div>

      <!-- Contents -->
      <div class="flex gap-2.5 max-[945px]:flex-col">
        <!-- Left-column -->
        <div class="flex-1">
          <div
            class="p-2.5 rounded-md border border-solid border-[var(--active)] bg-[var(--white)]"
          >
            <div class="py-1.5 px-0">
              <h2 class="cx-font-size capitalize">general</h2>
            </div>

            <div class="grid gap-4">
              <div class="text-left">
                <div class="flex flex-col gap-2.5">
                  <h4 class="cx-font-size capitalize">
                    name <span class="border-red-600">*</span>
                  </h4>
                  <input
                    formControlName="name"
                    placeholder="category name"
                    type="text"
                    class="p-2.5 w-full flex-1 inline rounded-sm border border-solid border-[var(--border-outline)]"
                  />
                </div>
              </div>

              <div class="text-left">
                <div class="flex flex-col gap-2.5">
                  <div>
                    <h4 class="flex text-xs capitalize">
                      parent category
                      <button
                        (click)="parent.set(undefined)"
                        type="button"
                        [style]="{ display: !parent() ? 'none' : 'block' }"
                        class="ml-1 lowercase text-red-400"
                      >
                        clear
                      </button>
                    </h4>

                    <button
                      (click)="displayHierarchy = !displayHierarchy"
                      type="button"
                      class="text-xs capitalize text-[#2c6ecb]"
                    >
                      @if (parent()) {
                        selected {{ parent()?.name }}
                      } @else {
                        select category
                      }
                    </button>
                  </div>

                  @if (displayHierarchy) {
                    @if (hierarchy$ | async; as hierarchy) {
                      <div class="w-full p-2 flex gap-2 flex-col bg-[#eff2f5]">
                        <app-hierarchy
                          [categories]="hierarchy"
                          (emitter)="parentClicked($event)"
                        ></app-hierarchy>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right-column -->
        <div class="flex-1">
          <div
            class="h-full p-2.5 rounded-md border border-[var(--active)] border-solid bg-[var(--white)]"
          >
            <div class="py-1.5 px-0">
              <h2 class="cx-font-size capitalize">status</h2>
            </div>
            <div class="text-left">
              <div>
                <h4 class="cx-font-size">
                  <span [style]="'color: red'">*</span>
                  Visibility (include in store front)
                </h4>
                <mat-radio-group
                  aria-label="Select an option"
                  formControlName="visible"
                >
                  <mat-radio-button [checked]="true" value="false"
                    >false</mat-radio-button
                  >
                  <mat-radio-button value="true">true</mat-radio-button>
                </mat-radio-group>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Button container -->
      <div class="p-2.5 px-1.5 flex justify-between">
        <button
          type="button"
          (click)="clear()"
          class="capitalize py-2 px-4 rounded text-red-400 border border-red-400"
        >
          Cancel
        </button>
        <button
          [disabled]="!form.valid"
          [asyncButton]="submit()"
          type="submit"
          [style]="{
            'background-color': form.valid
              ? 'var(--app-theme-hover)'
              : 'var(--app-theme)'
          }"
          class="capitalize text-white font-bold py-2 px-4 rounded bg-[var(--app-theme)]"
        >
          create
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewCategoryComponent {
  private readonly service = inject(CategoryService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly hierarchy$ = this.service.hierarchy$;
  readonly parent = signal<{ categoryId: number; name: string } | undefined>(
    undefined,
  );

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.max(50)]),
    visible: new FormControl(false, Validators.required),
  });

  routeToCategoryComponent = (): void => {
    this.router.navigate(['/admin/dashboard/category']);
  };

  /**
   * clears form
   * */
  clear = (): void => {
    this.form.controls['name'].setValue('');
    this.parent.set(undefined);
    this.displayHierarchy = !this.displayHierarchy;
  };

  displayHierarchy = false;

  /**
   * Gets info emitter from {@code category-hierarchy.component.ts}
   * */
  parentClicked(obj: { categoryId: number; name: string }): void {
    this.parent.set(obj);
  }

  /**
   * Submit reactive form to our server.
   * The gotcha is on successful creation, we switch map to update categories array
   *
   * @return Observable of type number
   * */
  submit(): Observable<number> {
    const name = this.form.controls['name'].value;
    const visible = this.form.controls['visible'].value;

    return !name || visible === null
      ? of(0)
      : this.service
          .create({
            name: name,
            parent_id: this.parent()?.categoryId,
            visible: visible,
          })
          .pipe(
            switchMap((status: number): Observable<number> => {
              this.clear();
              // make call to server to update CategoryResponse[]
              return this.service
                .allCategories()
                .pipe(switchMap(() => of(status)));
            }),
            catchError((err: HttpErrorResponse) => {
              this.toastService.toastMessage(
                err.error ? err.error.message : err.message,
              );
              return of(err.status);
            }),
          );
  }
}
