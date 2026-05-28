import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../core/api.service';
import { Dashboard } from '../../core/models';

@Component({
  standalone: true,
  imports: [FormsModule, CurrencyPipe, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <main class="page">
      <h1>Dashboard administrativo</h1>
      @if (dashboard(); as d) {
        <section class="grid">
          <div class="metric">Ventas<strong>{{d.sales | currency}}</strong></div>
          <div class="metric">Vuelos activos<strong>{{d.activeFlights}}</strong></div>
          <div class="metric">Usuarios<strong>{{d.registeredUsers}}</strong></div>
          <div class="metric">Reservas confirmadas<strong>{{d.confirmedReservations}}</strong></div>
        </section>
      }
      <section class="grid forms">
        <form class="panel" (ngSubmit)="createAirport()">
          <h2>Aeropuerto</h2>
          <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput name="an" [(ngModel)]="airport.name"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Ciudad</mat-label><input matInput name="ac" [(ngModel)]="airport.city"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>País</mat-label><input matInput name="ap" [(ngModel)]="airport.country"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>IATA</mat-label><input matInput name="ai" [(ngModel)]="airport.iataCode"></mat-form-field>
          <button mat-flat-button>Guardar</button>
        </form>
        <form class="panel" (ngSubmit)="createAirplane()">
          <h2>Avión</h2>
          <mat-form-field appearance="outline"><mat-label>Modelo</mat-label><input matInput name="pm" [(ngModel)]="airplane.model"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Capacidad</mat-label><input matInput type="number" name="pc" [(ngModel)]="airplane.capacity"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Aerolínea</mat-label><input matInput name="pa" [(ngModel)]="airplane.airline"></mat-form-field>
          <button mat-flat-button>Guardar</button>
        </form>
      </section>
    </main>
  `,
  styles: [`.forms{margin-top:18px}.panel{display:grid;gap:10px}`]
})
export class AdminDashboardComponent {
  private api = inject(ApiService);
  dashboard = signal<Dashboard | null>(null);
  airport = { name: '', city: '', country: '', iataCode: '' };
  airplane = { model: '', capacity: 0, airline: '' };
  ngOnInit() { this.reload(); }
  reload() { this.api.dashboard().subscribe(d => this.dashboard.set(d)); }
  createAirport() { this.api.createAirport(this.airport).subscribe(() => this.airport = { name: '', city: '', country: '', iataCode: '' }); }
  createAirplane() { this.api.createAirplane(this.airplane).subscribe(() => this.airplane = { model: '', capacity: 0, airline: '' }); }
}
