import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <main class="page auth">
      <section class="panel">
        <h2>Iniciar sesión</h2>
        <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" [(ngModel)]="email"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Contraseña</mat-label><input matInput type="password" [(ngModel)]="password"></mat-form-field>
        <button mat-flat-button (click)="submit()">Entrar</button>
        <a routerLink="/register">Crear cuenta</a>
      </section>
    </main>
  `,
  styles: [`.auth{max-width:440px}.panel{display:grid;gap:12px}`]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = 'admin@airport.local';
  password = 'Admin12345!';
  submit() { this.auth.login(this.email, this.password).subscribe(() => this.router.navigateByUrl('/')); }
}
