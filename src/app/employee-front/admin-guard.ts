import { inject } from '@angular/core';
import { AuthenticationService } from '@/app/global-service/authentication.service';

export const AdminGuard = () => inject(AuthenticationService).activeUser$();
