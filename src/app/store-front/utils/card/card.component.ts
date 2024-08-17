import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  styles: [
    `
      .name {
        font-size: 15px;
      }

      @media (max-width: 768px) {
        .name {
          font-size: calc(7px + 1vw);
        }
      }
    `,
  ],
  template: `
    <div class="h-full w-full flex flex-col">
      <div
        class="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 h-36 sm:h-56 md:h-80"
      >
        <img
          [src]="url"
          class="h-full w-full object-cover object-center lg:h-full lg:w-full"
          alt="product image"
        />
      </div>
      <!-- End of Image Container -->
      <div
        class="mt-4 flex flex-col items-center md:flex-row md:justify-between"
      >
        <div class="inline-block overflow-hidden whitespace-nowrap">
          <h3 class="name capitalize text-gray-700">
            {{ name }}
          </h3>
        </div>
        @if (bool) {
          <p class="name font-medium text-gray-900">
            {{ currency }}{{ price }}
          </p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() url = '';
  @Input() name = '';
  @Input() currency = '';
  @Input() price = 0;
  @Input() bool = true;
}
