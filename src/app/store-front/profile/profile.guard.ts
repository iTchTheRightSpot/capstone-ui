import { inject } from '@angular/core';
import { AuthenticationService } from '@/app/global-service/authentication.service';

export const CLIENT_DASHBOARD_GUARD = () => {
  const service = inject(AuthenticationService);
  return service.activeUser();
};
