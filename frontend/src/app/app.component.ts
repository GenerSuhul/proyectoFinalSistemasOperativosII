import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar>
      <a routerLink="/" class="brand"><mat-icon>flight_takeoff</mat-icon> Airport Platform</a>
      <span class="toolbar-spacer"></span>
      <a mat-button routerLink="/">Vuelos</a>
      @if (isAdmin()) { <a mat-button routerLink="/admin">Admin</a> }
      @if (isLogged()) {
        <a mat-button routerLink="/client">Mi panel</a>
        <button mat-icon-button aria-label="Cerrar sesión" (click)="auth.logout()"><mat-icon>logout</mat-icon></button>
      } @else {
        <a mat-button routerLink="/login">Login</a>
        <a mat-flat-button routerLink="/register">Registro</a>
      }
    </mat-toolbar>
    <router-outlet />
  `,
  styles: [`.brand{display:flex;gap:8px;align-items:center;font-weight:700}`]
})
export class AppComponent {
  auth = inject(AuthService);
  isLogged = computed(() => !!this.auth.user());
  isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');
}
