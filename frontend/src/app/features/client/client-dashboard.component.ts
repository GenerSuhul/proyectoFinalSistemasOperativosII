import { Component, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../core/api.service';
import { Reservation } from '../../core/models';

@Component({
  standalone: true,
  imports: [DatePipe, CurrencyPipe, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <main class="page">
      <h1>Mis boletos</h1>
      <section class="panel">
        <table mat-table [dataSource]="reservations()">
          <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Código</th><td mat-cell *matCellDef="let r">{{r.code}}</td></ng-container>
          <ng-container matColumnDef="flight"><th mat-header-cell *matHeaderCellDef>Vuelo</th><td mat-cell *matCellDef="let r">{{r.flightNumber}} {{r.route}}</td></ng-container>
          <ng-container matColumnDef="seat"><th mat-header-cell *matHeaderCellDef>Asiento</th><td mat-cell *matCellDef="let r">{{r.seatNumber}}</td></ng-container>
          <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Total</th><td mat-cell *matCellDef="let r">{{r.amount | currency}}</td></ng-container>
          <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Estado</th><td mat-cell *matCellDef="let r">{{r.status}}</td></ng-container>
          <ng-container matColumnDef="ticket"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let r">@if (r.status === 'CONFIRMED') {<button mat-button (click)="download(r.code)"><mat-icon>download</mat-icon> PDF</button>}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </section>
    </main>
  `
})
export class ClientDashboardComponent {
  api = inject(ApiService);
  reservations = signal<Reservation[]>([]);
  columns = ['code', 'flight', 'seat', 'amount', 'status', 'ticket'];
  ngOnInit() { this.api.myReservations().subscribe(r => this.reservations.set(r)); }
  download(code: string) {
    this.api.ticket(code).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `ticket-${code}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }
}
