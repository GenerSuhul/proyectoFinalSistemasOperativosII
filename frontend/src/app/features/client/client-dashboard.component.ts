import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api.service';
import { Reservation } from '../../core/models';

@Component({
  standalone: true,
  imports: [DatePipe, CurrencyPipe, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <main class="page trips-page">
      <section class="trips-hero">
        <div>
          <span class="eyebrow">Tu reserva</span>
          <h1>Centro de viajes</h1>
          <p>Consulta tus vuelos, descarga el boarding pass y conserva una copia en PDF.</p>
        </div>
        <a routerLink="/" class="new-trip"><mat-icon>add</mat-icon> Nueva reserva</a>
      </section>

      @if (notice(); as message) {
        <div class="notice"><mat-icon>mark_email_read</mat-icon>{{message}}</div>
      }

      <section class="tickets">
        @if (reservations().length) {
          @for (reservation of reservations(); track reservation.id) {
            <article class="ticket-card" [class.pending]="reservation.status !== 'CONFIRMED'">
              <div class="ticket-route">
                <span>{{reservation.flightNumber}}</span>
                <h2>{{reservation.route}}</h2>
                <p>Reserva {{reservation.code}} · Emitida {{reservation.createdAt | date:'mediumDate'}}</p>
              </div>
              <div class="ticket-meta">
                <div>
                  <span>Asiento</span>
                  <strong>{{reservation.seatNumber}}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{{reservation.amount | currency:'USD'}}</strong>
                </div>
                <div>
                  <span>Estado</span>
                  <strong>{{label(reservation.status)}}</strong>
                </div>
              </div>
              <div class="ticket-actions">
                @if (reservation.status === 'CONFIRMED') {
                  <button mat-flat-button color="primary" (click)="openTicket(reservation.code)">
                    <mat-icon>picture_as_pdf</mat-icon> Ver PDF
                  </button>
                  <button mat-stroked-button (click)="download(reservation.code)">
                    <mat-icon>download</mat-icon> Descargar
                  </button>
                } @else {
                  <a mat-stroked-button routerLink="/">Reservar otro vuelo</a>
                }
              </div>
            </article>
          }
        } @else {
          <article class="empty">
            <mat-icon>flight_takeoff</mat-icon>
            <h2>Aun no tienes viajes</h2>
            <p>Elige un destino y tu ticket aparecera aqui cuando completes el pago.</p>
            <a mat-flat-button color="primary" routerLink="/">Buscar vuelos</a>
          </article>
        }
      </section>
    </main>
  `,
  styles: [`
    .trips-page { display: grid; gap: 22px; }
    .trips-hero {
      align-items: center;
      background: linear-gradient(120deg, #111827, #00576e);
      border-radius: 18px;
      color: white;
      display: flex;
      justify-content: space-between;
      min-height: 220px;
      padding: clamp(28px, 5vw, 54px);
    }
    .eyebrow {
      color: #a7ecf5;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .trips-hero h1 {
      font-size: clamp(36px, 6vw, 64px);
      line-height: .98;
      margin: 8px 0;
    }
    .trips-hero p { font-size: 18px; margin: 0; max-width: 560px; }
    .new-trip {
      align-items: center;
      background: white;
      border-radius: 999px;
      color: #171717;
      display: flex;
      font-weight: 900;
      gap: 8px;
      padding: 14px 20px;
      white-space: nowrap;
    }
    .notice {
      align-items: center;
      background: #eafaf3;
      border: 1px solid #bdebd6;
      border-radius: 8px;
      color: #087044;
      display: flex;
      gap: 10px;
      padding: 14px 18px;
    }
    .tickets {
      display: grid;
      gap: 16px;
    }
    .ticket-card {
      background: white;
      border: 1px solid #dce7ef;
      border-radius: 12px;
      box-shadow: 0 16px 44px rgba(17, 31, 43, .08);
      display: grid;
      gap: 18px;
      grid-template-columns: 1fr 1.2fr auto;
      overflow: hidden;
      padding: 22px;
      position: relative;
    }
    .ticket-card::before {
      background: #0089a4;
      content: '';
      inset: 0 auto 0 0;
      position: absolute;
      width: 7px;
    }
    .ticket-card.pending::before { background: #d79d00; }
    .ticket-route span {
      color: #0089a4;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .ticket-route h2 { margin: 6px 0; }
    .ticket-route p { color: #657484; margin: 0; }
    .ticket-meta {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(3, 1fr);
    }
    .ticket-meta div {
      background: #f3f8fb;
      border-radius: 8px;
      padding: 14px;
    }
    .ticket-meta span {
      color: #657484;
      display: block;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .ticket-meta strong {
      display: block;
      font-size: 18px;
      margin-top: 4px;
    }
    .ticket-actions {
      align-content: center;
      display: grid;
      gap: 10px;
      min-width: 150px;
    }
    .empty {
      background: white;
      border: 1px dashed #b9c9d5;
      border-radius: 12px;
      padding: 48px 22px;
      text-align: center;
    }
    .empty mat-icon {
      color: #0089a4;
      font-size: 54px;
      height: 54px;
      width: 54px;
    }
    @media (max-width: 900px) {
      .trips-hero,
      .ticket-card,
      .ticket-meta {
        grid-template-columns: 1fr;
      }
      .trips-hero { align-items: flex-start; display: grid; }
    }
  `]
})
export class ClientDashboardComponent {
  private api = inject(ApiService);
  reservations = signal<Reservation[]>([]);
  notice = signal(history.state?.ticketEmailSent ? 'Ticket enviado al correo registrado con el PDF adjunto.' : '');

  ngOnInit() {
    this.api.myReservations().subscribe(reservations => this.reservations.set(reservations));
  }

  openTicket(code: string) {
    this.api.ticket(code).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    });
  }

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

  label(status: string) {
    return status === 'CONFIRMED' ? 'Confirmado' : status === 'REJECTED' ? 'Rechazado' : 'Pago pendiente';
  }
}
