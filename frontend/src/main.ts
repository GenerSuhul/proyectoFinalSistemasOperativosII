import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/auth.interceptor';
import { adminGuard, authGuard } from './app/guards/auth.guard';

const routes: Routes = [
  { path: '', loadComponent: () => import('./app/features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./app/features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./app/features/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'checkout/:flightId', canActivate: [authGuard], loadComponent: () => import('./app/features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'client', canActivate: [authGuard], loadComponent: () => import('./app/features/client/client-dashboard.component').then(m => m.ClientDashboardComponent) },
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./app/features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch(err => console.error(err));
