import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatButtonModule, MatIconModule],
  template: `
    @if (promoVisible()) {
      <div class="top-offer">
        <mat-icon>flight_takeoff</mat-icon>
        <a routerLink="/">Reserva tu proximo vuelo.</a>
        <span>Hoy tienes tarifas especiales saliendo de Guatemala.</span>
        <button type="button" aria-label="Cerrar promocion" (click)="promoVisible.set(false)">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    }

    <header class="site-header">
      <div class="utility-bar">
        <span><mat-icon>support_agent</mat-icon> AeroNova Chat</span>
        <span><mat-icon>language</mat-icon> Espanol</span>
        <span><mat-icon>paid</mat-icon> Guatemala (USD)</span>
      </div>

      <nav class="main-nav">
        <a routerLink="/" class="brand" aria-label="AeroNova inicio">
          <span class="brand-mark"><mat-icon>flight</mat-icon></span>
          <span>AeroNova</span>
        </a>

        <div class="nav-links">
          <a routerLink="/">Reservar</a>
          <a routerLink="/">Ofertas y destinos</a>
          @if (isLogged()) { <a routerLink="/client">Tu reserva</a> }
          @if (isAdmin()) { <a routerLink="/admin">Operacion</a> }
          <a [routerLink]="isLogged() ? '/client' : '/login'" class="nav-chip">Check-in</a>
        </div>

        <div class="account-actions">
          @if (isLogged()) {
            <a routerLink="/client" class="account-pill"><mat-icon>person</mat-icon> Mi cuenta</a>
            <button type="button" class="icon-button" aria-label="Cerrar sesion" (click)="auth.logout()"><mat-icon>logout</mat-icon></button>
          } @else {
            <a routerLink="/login">Login</a>
            <a routerLink="/register" class="account-pill"><mat-icon>person_add</mat-icon> Crear cuenta</a>
          }
        </div>
      </nav>
    </header>

    <router-outlet />
  `,
  styles: [`
    .top-offer {
      align-items: center;
      background: #e4f7f3;
      color: #00839a;
      display: flex;
      gap: 10px;
      font-weight: 800;
      justify-content: center;
      min-height: 58px;
      padding: 0 64px;
      position: relative;
    }
    .top-offer a { text-decoration: underline; }
    .top-offer button {
      align-items: center;
      background: transparent;
      border: 0;
      color: #00839a;
      cursor: pointer;
      display: flex;
      position: absolute;
      right: 26px;
    }
    .site-header {
      background: white;
      box-shadow: 0 8px 30px rgba(18, 31, 44, .08);
      position: sticky;
      top: 0;
      z-index: 30;
    }
    .utility-bar {
      align-items: center;
      background: #171717;
      color: white;
      display: flex;
      gap: 24px;
      justify-content: flex-end;
      min-height: 54px;
      padding: 0 clamp(18px, 9vw, 170px);
    }
    .utility-bar span,
    .main-nav,
    .brand,
    .nav-links,
    .account-actions,
    .account-pill,
    .icon-button {
      align-items: center;
      display: flex;
    }
    .utility-bar span { gap: 8px; }
    .utility-bar mat-icon { font-size: 19px; height: 19px; width: 19px; }
    .main-nav {
      gap: clamp(20px, 4vw, 58px);
      justify-content: space-between;
      min-height: 88px;
      padding: 0 clamp(18px, 9vw, 170px);
    }
    .brand {
      color: #e00000;
      font-size: clamp(30px, 4vw, 46px);
      font-weight: 900;
      gap: 6px;
      letter-spacing: 0;
    }
    .brand-mark {
      align-items: center;
      display: inline-flex;
      transform: rotate(28deg);
    }
    .brand-mark mat-icon { font-size: 42px; height: 42px; width: 42px; }
    .nav-links {
      color: #171717;
      flex: 1;
      gap: clamp(18px, 3vw, 42px);
      justify-content: center;
      font-size: 18px;
    }
    .nav-chip {
      background: #2c9cec;
      border-radius: 10px;
      color: white;
      font-weight: 800;
      padding: 5px 12px;
    }
    .account-actions {
      gap: 14px;
      font-weight: 800;
      white-space: nowrap;
    }
    .account-pill {
      border: 2px solid #171717;
      border-radius: 999px;
      gap: 8px;
      padding: 10px 18px;
    }
    .icon-button {
      background: #171717;
      border: 0;
      border-radius: 999px;
      color: white;
      cursor: pointer;
      height: 42px;
      justify-content: center;
      width: 42px;
    }
    @media (max-width: 980px) {
      .utility-bar { display: none; }
      .main-nav { flex-wrap: wrap; min-height: auto; padding: 16px; }
      .nav-links { order: 3; overflow-x: auto; justify-content: flex-start; width: 100%; }
      .account-actions { margin-left: auto; }
    }
    @media (max-width: 620px) {
      .top-offer { justify-content: flex-start; padding: 12px 52px 12px 16px; }
      .top-offer span { display: none; }
      .brand { font-size: 30px; }
      .account-actions > a:not(.account-pill) { display: none; }
      .account-pill { padding: 8px 12px; }
    }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  promoVisible = signal(true);
  isLogged = computed(() => !!this.auth.user());
  isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');
}
