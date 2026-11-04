import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService), router = inject(Router);
  await auth.ready;
  if (!auth.session()) return router.createUrlTree(['/login']);
  if (!auth.profile()) await auth.loadProfile();
  if (auth.isAdmin) return router.createUrlTree(['/admin/dashboard']);
  return true;
};

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService), router = inject(Router);
  await auth.ready;
  if (!auth.session()) return router.createUrlTree(['/admin/login']);
  if (!auth.profile()) await auth.loadProfile();
  return auth.isAdmin ? true : router.createUrlTree(['/admin/login']);
};
