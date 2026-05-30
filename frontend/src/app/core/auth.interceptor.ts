import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('airport_access');
  const router = inject(Router);
  const authenticatedRequest = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(authenticatedRequest).pipe(
    catchError(error => {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('airport_access');
        localStorage.removeItem('airport_refresh');
        localStorage.removeItem('airport_user');
        window.dispatchEvent(new Event('airport-auth-cleared'));
        if (!req.url.includes('/api/auth/')) {
          router.navigateByUrl('/login');
        }
      }
      return throwError(() => error);
    })
  );
};
