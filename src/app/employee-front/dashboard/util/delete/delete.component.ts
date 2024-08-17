import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@/app/global-service/toast.service';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [],
  template: `
    <div class="w-full mb-2 px-2.5 text-center">
      <h1 class="cx-font-size">
<!--        Are you sure you want to delete {{ data.name }}?-->
        Are you sure you want to delete xyz?
      </h1>
    </div>

    <div class="p-2.5 px-1.5 flex justify-between">
      <button
        type="button"
        (click)="cancel()"
        class="capitalize text-white font-bold py-2 px-4 rounded bg-red-400 text-white"
      >
        Cancel
      </button>
      <button
        class="capitalize text-white font-bold py-2 px-4 rounded bg-[var(--app-theme-hover)]"
        (click)="delete()"
        type="button"
      >
        delete
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteComponent {
  private readonly toastService = inject(ToastService);

  // constructor(
  //   private dialogRef: MatDialogRef<DeleteComponent>,
  //   @Inject(MAT_DIALOG_DATA)
  //   public data: DeleteData<{ status: number; message: string }>,
  // ) {}

  /**
   * Closes component.
   * */
  cancel(): void {}

  /**
   *  Passes the observable from the callers component
   *  to asyncButton in delete component.
   * */
  delete = () => {
    // this.data.asyncButton.pipe(
    //   map((obj: { status: number; message: string }) => {
    //     this.toastService.toastMessage(obj.message);
    //     this.cancel();
    //     return obj.status;
    //   }),
    //   catchError((err: HttpErrorResponse) => {
    //     this.toastService.toastMessage(
    //       err.error ? err.error.message : err.message,
    //     );
    //     this.cancel();
    //     return of(err.status);
    //   }),
    // );
  }
}
