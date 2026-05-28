import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Flight } from '../../core/models';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTableModule],
  template: `
    <section class="hero">
      <div class="hero-inner">
        <h1>Airport Platform</h1>
        <p>Compra boletos, elige asiento y descarga tu ticket PDF para vuelos regionales con una experiencia premium.</p>
        <a mat-flat-button routerLink="/register"><mat-icon>confirmation_number</mat-icon> Comprar ahora</a>
      </div>
    </section>
    <main class="page">
      <section class="panel">
        <div class="search">
          <mat-form-field appearance="outline"><mat-label>Origen IATA</mat-label><input matInput [(ngModel)]="origin" maxlength="3"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Destino IATA</mat-label><input matInput [(ngModel)]="destination" maxlength="3"></mat-form-field>
          <button mat-flat-button (click)="load()"><mat-icon>search</mat-icon> Buscar</button>
        </div>
        <table mat-table [dataSource]="flights()">
          <ng-container matColumnDef="flight"><th mat-header-cell *matHeaderCellDef>Vuelo</th><td mat-cell *matCellDef="let f">{{f.flightNumber}}</td></ng-container>
          <ng-container matColumnDef="route"><th mat-header-cell *matHeaderCellDef>Ruta</th><td mat-cell *matCellDef="let f">{{f.origin.iataCode}} - {{f.destination.iataCode}}</td></ng-container>
          <ng-container matColumnDef="time"><th mat-header-cell *matHeaderCellDef>Salida</th><td mat-cell *matCellDef="let f">{{f.departureTime | date:'medium'}}</td></ng-container>
          <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>Precio</th><td mat-cell *matCellDef="let f">{{f.price | currency}}</td></ng-container>
          <ng-container matColumnDef="action"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let f"><a mat-button [routerLink]="['/checkout', f.id]">Elegir asiento</a></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </section>
    </main>
  `,
  styles: [`.search{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.search mat-form-field{width:180px}`]
})
export class HomeComponent {
  private api = inject(ApiService);
  flights = signal<Flight[]>([]);
  origin = '';
  destination = '';
  columns = ['flight', 'route', 'time', 'price', 'action'];

  ngOnInit() { this.load(); }
  load() { this.api.flights(this.origin || undefined, this.destination || undefined).subscribe(f => this.flights.set(f)); }
}
