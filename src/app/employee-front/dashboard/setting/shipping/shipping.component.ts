import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map, Observable } from 'rxjs';
import { DynamicTableComponent } from '../../util/dynamictable/dynamic-table.component';
import { TableContent } from '@/app/employee-front/admin-front.util';
import { DeleteComponent } from '@/app/employee-front/dashboard/util/delete/delete.component';
import { SettingService } from '../setting.service';
import { UpdateShippingComponent } from './update-shipping.component';
import { ShipSettingMapper } from '../setting.util';

interface CxShipping {
  index: number;
  id: number;
  name: string;
  usd: number;
  ngn: number;
  delete: string;
}

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [DynamicTableComponent, AsyncPipe],
  template: `
    <div class="flex flex-col h-full py-0">
      <div class="flex py-2.5 px-0 align-center">
        <h1
          class="cx-font-size w-fit capitalize border-b border-[var(--app-theme)]"
        >
          shipping setting
        </h1>
        <button
          type="button"
          class="ml-1"
          (click)="openCreateShippingComponent()"
        >
          <svg
            fill="none"
            stroke-width="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-[var(--app-theme)]"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      @if (ship$ | async; as ship) {
        <app-dynamic-table
          (eventEmitter)="infoFromTableComponent($event)"
          [tHead]="thead"
          [data]="ship"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingComponent {
  private readonly service = inject(SettingService);

  readonly thead: Array<keyof CxShipping> = [
    'index',
    'name',
    'usd',
    'ngn',
    'delete',
  ];

  /**
   * Observable for ShippingSetting data with automatic refreshing.
   *
   * This observable listens to changes in the 'refreshShippingSetting$' observable
   * from the global-service. When new shipping settings data is emitted, it checks if the
   * array is empty. If it is empty, it triggers a refresh of shipping settings data
   * by calling 'refreshShippingSettingObservable' with a boolean value of true.
   *
   * @returns An observable that emits shipping settings data with automatic refreshing.
   */
  readonly ship$: Observable<CxShipping[]> =
    this.service.refreshShippingSetting$.pipe(
      map((arr: ShipSettingMapper[]) => {
        return arr.map((value, index) => ({
          index: index + 1,
          id: value.shipping_id,
          name: value.country,
          ngn: value.ngn_price,
          usd: value.usd_price,
          delete: '',
        }));
      }),
    );

  infoFromTableComponent(ship: TableContent<CxShipping>): void {
    if (ship.key === 'edit') {
      this.openEditComponent(ship.data);
    } else if (ship.key === 'delete') {
      this.openDeleteComponent(ship.data);
    }
  }

  openEditComponent(ship: CxShipping): void {
    // this.dialog.open(UpdateShippingComponent, {
    //   height: '400px',
    //   width: '600px',
    //   maxWidth: '100%',
    //   data: {
    //     country: ship.name,
    //     shipping_id: ship.id,
    //     ngn_price: ship.ngn,
    //     usd_price: ship.usd,
    //   },
    // });
  }

  openDeleteComponent(ship: CxShipping): void {
    // this.dialog.open(DeleteComponent, {
    //   width: '500px',
    //   maxWidth: '100%',
    //   height: 'fit-content',
    //   data: {
    //     name: ship.name,
    //     asyncButton: this.service.delete(ship.id),
    //   },
    // });
  }

  openCreateShippingComponent(): void {
    // this.dialog.open(CreateShippingComponent, {
    //   width: '500px',
    //   maxWidth: '100%',
    //   height: 'fit-content',
    // });
  }
}
