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
    <main class="register-shell">
      <section class="register-panel">
        <span class="eyebrow">Cuenta de viajero</span>
        <h1>Crea tu perfil AeroNova</h1>
        <div class="form-grid">
          <label>
            <span>Nombre completo</span>
            <input autocomplete="name" [(ngModel)]="fullName">
          </label>
          <label>
            <span>Email</span>
            <input type="email" autocomplete="email" [(ngModel)]="email">
          </label>
          <label>
            <span>Contrasena</span>
            <input type="password" autocomplete="new-password" [(ngModel)]="password">
          </label>
          <label>
            <span>Telefono</span>
            <input autocomplete="tel" [(ngModel)]="phone">
          </label>
          <label>
            <span>Documento</span>
            <input [(ngModel)]="documentNumber">
          </label>
        </div>
        @if (error()) { <p class="error"><mat-icon>error</mat-icon>{{error()}}</p> }
        <button mat-flat-button color="primary" (click)="submit()"><mat-icon>person_add</mat-icon> Crear cuenta</button>
        <a routerLink="/login">Ya tengo cuenta</a>
      </section>
    </main>
  `,
  styles: [`
    .register-shell {
      background:
        linear-gradient(120deg, rgba(247, 249, 251, .96), rgba(229, 248, 252, .9)),
        url('https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=1600&q=80') center/cover;
      min-height: calc(100vh - 200px);
      padding: 56px 18px;
    }
    .register-panel {
      background: rgba(255, 255, 255, .94);
      border: 1px solid #dce7ef;
      border-radius: 18px;
      box-shadow: 0 24px 70px rgba(17, 31, 43, .15);
      display: grid;
      gap: 18px;
      margin: auto;
      max-width: 760px;
      padding: clamp(24px, 5vw, 46px);
    }
    .eyebrow {
      color: #0089a4;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(34px, 6vw, 58px);
      line-height: .98;
      margin: 0;
    }
    .form-grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(2, 1fr);
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
    @media (max-width: 720px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  fullName = '';
  email = '';
  password = '';
  phone = '';
  documentNumber = '';
  error = signal('');

  submit() {
    this.error.set('');
    if (!this.fullName || !this.email || this.password.length < 8) {
      this.error.set('Completa nombre, correo y una contrasena de al menos 8 caracteres.');
      return;
    }
    this.auth.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      phone: this.phone,
      documentNumber: this.documentNumber
    }).subscribe({
      next: () => this.router.navigateByUrl('/client'),
      error: err => this.error.set(err?.error?.message ?? 'No fue posible crear la cuenta.')
    });
  }
}
