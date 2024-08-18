import { Injectable, signal } from '@angular/core';
import { ApiStatus } from '@/app/app.util';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  /**
   * Validate if loading progress bar should be shown globally.
   *
   * @return A {@link WritableSignal} that emits {@link ApiStatus} where if `ApiStatus.LOADING`,
   * progress bar will be shown.
   * */
  readonly LOADING_STATE = signal<ApiStatus>(ApiStatus.LOADED);
}
