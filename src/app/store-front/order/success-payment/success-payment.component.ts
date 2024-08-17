import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SuccessPaymentService } from '@/app/store-front/order/success-payment/success-payment.service';
import { ActivatedRoute, Params } from '@angular/router';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-success-payment',
  standalone: true,
  template: `
    <div class="lg-scr mg-top">
      <div class="w-fit mb-3 ml-2 border-b">
        <h1 class="capitalize text-xs md:text-sm">payment successful</h1>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessPaymentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(SuccessPaymentService);

  readonly details$ = this.route.params.pipe(
    map((p: Params) => p as { reference: string }),
    switchMap((obj) => this.service.orderByReference(obj.reference)),
  );
}
