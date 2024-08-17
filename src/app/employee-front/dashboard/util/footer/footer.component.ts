import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  styles: [
    `
      .fnt {
        font-size: 12px;
      }
    `,
  ],
  template: `
    <div class="w-full text-center">
      <h1 class="fnt">
        Sarre The Brand &copy; All Rights Reserved
        <span class="year">{{ year }}</span>
        | Designed by
        <a
          class="m-0 text-blue-300 border-b border-blue-300"
          href="https://emmanueluluabuike.com/"
          target="_blank"
          >E.U</a
        >
      </h1>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
