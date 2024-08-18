import { HttpInterceptorFn } from '@angular/common/http';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const service = inject(LoadingService);
  return next(req).pipe(
    map(() => ApiStatus.LOADED),
    startWith(ApiStatus.LOADING),
    tap((state) => service.LOADING_STATE.set(state)),
    catchError(() => ApiStatus.ERROR),
  );
};
