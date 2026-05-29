import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <main class="auth-shell">
      <section class="auth-visual">
        <span>AeroNova Pass</span>
        <h1>Gestiona tus vuelos en segundos</h1>
        <p>Reserva, paga y recibe tu boarding pass digital con QR.</p>
      </section>

      <section class="auth-panel">
        <span class="eyebrow">Acceso seguro</span>
        <h2>Iniciar sesion</h2>
        <label>
          <span>Email</span>
          <input type="email" [(ngModel)]="email">
        </label>
        <label>
          <span>Contrasena</span>
          <input type="password" [(ngModel)]="password">
        </label>
        @if (error()) { <p class="error"><mat-icon>error</mat-icon>{{error()}}</p> }
        <button mat-flat-button color="primary" (click)="submit()">Entrar</button>
        <a routerLink="/register">Crear cuenta</a>
      </section>
    </main>
  `,
  styles: [`
    .auth-shell {
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      min-height: calc(100vh - 200px);
    }
    .auth-visual {
      background:
        linear-gradient(120deg, rgba(0, 18, 32, .86), rgba(0, 137, 164, .55)),
        url('https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1300&q=80') center/cover;
      color: white;
      padding: clamp(40px, 8vw, 96px);
    }
    .auth-visual span,
    .eyebrow {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .auth-visual h1 {
      font-size: clamp(42px, 7vw, 78px);
      line-height: .92;
      margin: 80px 0 18px;
      max-width: 650px;
    }
    .auth-visual p { font-size: 21px; max-width: 520px; }
    .auth-panel {
      align-self: center;
      display: grid;
      gap: 16px;
      margin: 40px auto;
      max-width: 440px;
      padding: 0 24px;
      width: 100%;
    }
    .eyebrow { color: #0089a4; }
    h2 {
      font-size: 42px;
      margin: 0 0 8px;
    }
    label {
      display: grid;
      gap: 7px;
    }
    label span {
      color: #5e6c78;
      font-weight: 800;
    }
    input {
      border: 1px solid #cfdbe5;
      border-radius: 8px;
      font-size: 18px;
      min-height: 56px;
      outline: 0;
      padding: 0 14px;
    }
    input:focus {
      border-color: #0089a4;
      box-shadow: 0 0 0 4px rgba(0, 137, 164, .13);
    }
    .error {
      align-items: center;
      background: #fff0f0;
      border-radius: 8px;
      color: #b00020;
      display: flex;
      gap: 8px;
      margin: 0;
      padding: 12px;
    }
    @media (max-width: 820px) {
      .auth-shell { grid-template-columns: 1fr; }
      .auth-visual { min-height: 300px; }
      .auth-visual h1 { margin-top: 48px; }
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = 'admin@airport.local';
  password = 'Admin12345!';
  error = signal('');

  submit() {
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: err => this.error.set(err?.error?.message ?? 'Credenciales invalidas.')
    });
  }
}
