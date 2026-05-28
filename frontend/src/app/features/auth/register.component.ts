import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <main class="page auth">
      <section class="panel">
        <h2>Registro</h2>
        <mat-form-field appearance="outline"><mat-label>Nombre completo</mat-label><input matInput [(ngModel)]="fullName"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" [(ngModel)]="email"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Contraseña</mat-label><input matInput type="password" [(ngModel)]="password"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Teléfono</mat-label><input matInput [(ngModel)]="phone"></mat-form-field>
        <button mat-flat-button (click)="submit()">Crear cuenta</button>
      </section>
    </main>
  `,
  styles: [`.auth{max-width:520px}.panel{display:grid;gap:12px}`]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  fullName = ''; email = ''; password = ''; phone = '';
  submit() { this.auth.register({ fullName: this.fullName, email: this.email, password: this.password, phone: this.phone }).subscribe(() => this.router.navigateByUrl('/client')); }
}
