import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api.service';
import { Flight, Seat } from '../../core/models';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, MatButtonModule, MatIconModule],
  template: `
    <main class="page checkout-page">
      @if (flight(); as f) {
        <section class="trip-summary">
          <div>
            <span class="eyebrow">Vuelo seleccionado</span>
            <h1>{{f.origin.city}} a {{f.destination.city}}</h1>
            <p>{{f.flightNumber}} - {{f.airplane.model}} - {{f.departureTime | date:'EEEE d MMM, HH:mm'}}</p>
          </div>
          <div class="price">
            <span>Total</span>
            <strong>{{f.price | currency:'USD'}}</strong>
          </div>
        </section>
      }

      <section class="checkout-grid">
        <article class="panel cabin-card">
          <div class="section-title">
            <span>1</span>
            <div>
              <h2>Selecciona asiento</h2>
              <p>Cabina economica con distribucion 3-3.</p>
            </div>
          </div>

          <div class="cabin">
            @for (seat of seats(); track seat.id) {
              <button
                type="button"
                [disabled]="!seat.available"
                [class.selected]="seat.seatNumber === selected"
                [class.taken]="!seat.available"
                (click)="selected = seat.seatNumber">
                {{seat.seatNumber}}
              </button>
            }
          </div>
        </article>

        <article class="panel pay-card">
          <div class="section-title">
            <span>2</span>
            <div>
              <h2>Pago seguro</h2>
              <p>Al confirmar, se genera el PDF y se envia al correo de la cuenta.</p>
            </div>
          </div>

          <label>
            <span>Numero de tarjeta</span>
            <input [(ngModel)]="cardNumber" inputmode="numeric" maxlength="19" autocomplete="cc-number" placeholder="4111 1111 1111 1111">
          </label>
          <label>
            <span>Titular</span>
            <input [(ngModel)]="cardHolder" autocomplete="cc-name" placeholder="Nombre como aparece en la tarjeta">
          </label>
          <div class="payment-row">
            <label>
              <span>Vence</span>
              <input [(ngModel)]="expiry" maxlength="5" autocomplete="cc-exp" placeholder="MM/AA">
            </label>
            <label>
              <span>CVV</span>
              <input [(ngModel)]="cvv" maxlength="4" autocomplete="cc-csc" placeholder="123">
            </label>
          </div>

          @if (error()) {
            <p class="error"><mat-icon>error</mat-icon>{{error()}}</p>
          }

          <button mat-flat-button color="primary" [disabled]="!selected || submitting()" (click)="checkout()">
            <mat-icon>lock</mat-icon>
            {{submitting() ? 'Procesando...' : 'Pagar y emitir ticket'}}
          </button>
        </article>
      </section>
    </main>
  `,
  styles: [`
    .checkout-page { display: grid; gap: 24px; }
    .trip-summary {
      align-items: center;
      background:
        linear-gradient(120deg, rgba(0, 137, 164, .95), rgba(5, 39, 59, .92)),
        url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1300&q=80') center/cover;
      border-radius: 18px;
      color: white;
      display: flex;
      justify-content: space-between;
      min-height: 220px;
      padding: clamp(26px, 5vw, 48px);
    }
    .eyebrow {
      color: #c9f7ff;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    h1 { font-size: clamp(36px, 6vw, 62px); line-height: .98; margin: 8px 0; }
    .trip-summary p { font-size: 18px; margin: 0; }
    .price {
      background: white;
      border-radius: 16px;
      color: #171717;
      min-width: 180px;
      padding: 20px;
      text-align: right;
    }
    .price span { color: #5f6c78; display: block; }
    .price strong { font-size: 30px; }
    .checkout-grid {
      display: grid;
      gap: 22px;
      grid-template-columns: 1.2fr .8fr;
    }
    .section-title {
      align-items: center;
      display: flex;
      gap: 14px;
      margin-bottom: 22px;
    }
    .section-title > span {
      align-items: center;
      background: #171717;
      border-radius: 999px;
      color: white;
      display: flex;
      font-weight: 900;
      height: 38px;
      justify-content: center;
      width: 38px;
    }
    .section-title h2 { margin: 0; }
    .section-title p { color: #667684; margin: 2px 0 0; }
    .cabin {
      background: #eef7fa;
      border-radius: 999px 999px 22px 22px;
      display: grid;
      gap: 10px 14px;
      grid-template-columns: repeat(6, minmax(48px, 1fr));
      padding: 44px 28px 28px;
      position: relative;
    }
    .cabin::before {
      background: #cdeaf1;
      border-radius: 999px 999px 0 0;
      content: '';
      height: 22px;
      left: 22%;
      position: absolute;
      right: 22%;
      top: 12px;
    }
    .cabin button {
      background: white;
      border: 1px solid #c9d8e1;
      border-radius: 8px;
      color: #17202a;
      cursor: pointer;
      font-weight: 900;
      min-height: 46px;
      transition: transform .16s ease, box-shadow .16s ease, background .16s ease;
    }
    .cabin button:nth-child(6n + 4) { margin-left: 22px; }
    .cabin button:not(:disabled):hover {
      box-shadow: 0 8px 20px rgba(0, 137, 164, .2);
      transform: translateY(-2px);
    }
    .cabin button.selected {
      background: #19c36b;
      border-color: #19c36b;
      color: white;
    }
    .cabin button.taken {
      background: #e7edf2;
      color: #95a4b1;
      cursor: not-allowed;
      text-decoration: line-through;
    }
    .pay-card {
      display: grid;
      gap: 14px;
    }
    label {
      display: grid;
      gap: 7px;
    }
    label span {
      color: #566675;
      font-size: 13px;
      font-weight: 700;
    }
    input {
      border: 1px solid #cfdae3;
      border-radius: 8px;
      font-size: 18px;
      min-height: 54px;
      outline: 0;
      padding: 0 14px;
    }
    input:focus {
      border-color: #0089a4;
      box-shadow: 0 0 0 4px rgba(0, 137, 164, .12);
    }
    .payment-row {
      display: grid;
      gap: 12px;
      grid-template-columns: 1fr 1fr;
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
    @media (max-width: 880px) {
      .trip-summary,
      .checkout-grid {
        grid-template-columns: 1fr;
      }
      .trip-summary {
        align-items: flex-start;
        display: grid;
      }
      .price { text-align: left; }
      .cabin { grid-template-columns: repeat(4, 1fr); }
      .cabin button:nth-child(6n + 4) { margin-left: 0; }
    }
  `]
})
export class CheckoutComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  flightId = Number(this.route.snapshot.paramMap.get('flightId'));
  flight = signal<Flight | null>(null);
  seats = signal<Seat[]>([]);
  selected = '';
  submitting = signal(false);
  error = signal('');
  cardNumber = '';
  cardHolder = '';
  expiry = '';
  cvv = '';

  ngOnInit() {
    this.api.flights().subscribe(flights => this.flight.set(flights.find(f => f.id === this.flightId) ?? null));
    this.api.seats(this.flightId).subscribe(seats => this.seats.set(seats));
  }

  checkout() {
    if (!this.selected || this.submitting()) {
      return;
    }
    if (!this.cardNumber || !this.cardHolder || !this.expiry || !this.cvv) {
      this.error.set('Completa los datos de pago para emitir el ticket.');
      return;
    }
    this.error.set('');
    this.submitting.set(true);
    this.api.reserve(this.flightId, this.selected).pipe(
      switchMap(reservation => this.api.pay(reservation.code, {
        cardNumber: this.cardNumber,
        cardHolder: this.cardHolder,
        expiry: this.expiry,
        cvv: this.cvv
      })),
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: payment => {
        if (payment.status !== 'APPROVED') {
          this.error.set('El banco rechazo el pago. El asiento fue liberado para intentar de nuevo.');
          this.selected = '';
          this.api.seats(this.flightId).subscribe(seats => this.seats.set(seats));
          return;
        }
        this.router.navigateByUrl('/client', {
          state: {
            ticketEmailSent: payment.ticketEmailSent,
            ticketEmailMessage: payment.ticketEmailMessage,
            authorizationCode: payment.authorizationCode
          }
        });
      },
      error: err => this.error.set(err?.error?.message ?? 'No fue posible completar el pago.')
    });
  }
}
