import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api.service';
import { Flight } from '../../core/models';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, MatButtonModule, MatIconModule],
  animations: [
    trigger('heroIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        animate('520ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('flightList', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(16px)' }),
          stagger(70, animate('360ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <section class="booking-hero">
      <div class="sky sky-a"></div>
      <div class="sky sky-b"></div>
      <div class="hero-content" @heroIn>
        <div class="booking-panel">
          <div class="booking-tabs">
            <button class="tab active"><span></span> Ida y vuelta</button>
            <button class="tab"><span></span> Solo ida</button>
            <button class="tab wide"><mat-icon>credit_card</mat-icon> Reservar con creditos</button>
            <button class="tab wide"><mat-icon>hotel</mat-icon> Hoteles</button>
            <button class="tab wide"><mat-icon>directions_car</mat-icon> Autos</button>
          </div>

          <div class="search-card">
            <label class="field">
              <mat-icon>flight_takeoff</mat-icon>
              <span>Origen</span>
              <input [(ngModel)]="origin" maxlength="3" placeholder="GUA" (input)="origin = origin.toUpperCase()">
            </label>
            <label class="field">
              <mat-icon>flight_land</mat-icon>
              <span>Destino</span>
              <input [(ngModel)]="destination" maxlength="3" placeholder="MIA" (input)="destination = destination.toUpperCase()">
            </label>
            <label class="field date">
              <mat-icon>calendar_month</mat-icon>
              <span>Ida</span>
              <strong>31/05/2026</strong>
            </label>
            <label class="field date">
              <mat-icon>event_repeat</mat-icon>
              <span>Vuelta</span>
              <strong>03/06/2026</strong>
            </label>
            <label class="field passengers">
              <mat-icon>group_add</mat-icon>
              <span>Pasajeros</span>
              <select [(ngModel)]="passengers">
                <option [ngValue]="1">1</option>
                <option [ngValue]="2">2</option>
                <option [ngValue]="3">3</option>
                <option [ngValue]="4">4</option>
              </select>
            </label>
            <button class="search-button" type="button" (click)="load()">Buscar</button>
          </div>
        </div>
      </div>
    </section>

    <main class="page home-page">
      <section class="promo-card">
        <div class="promo-photo">
          <span>No lo dejes para manana</span>
          <h2>Vuela a conocer el mundo</h2>
        </div>
        <div class="promo-copy">
          <mat-icon>flight_takeoff</mat-icon>
          <h3>El mundo esta lleno de nuevos destinos</h3>
          <p>Elige tu ruta, reserva tu asiento y recibe tu boarding pass digital al instante.</p>
          <a routerLink="/register">Reserva ya</a>
        </div>
      </section>

      <section class="offers-head">
        <h2>Ofertas desde <button type="button" (click)="origin = 'GUA'; load()">Ciudad de Guatemala</button></h2>
        <div class="destination-pills">
          @for (item of quickDestinations; track item.code) {
            <button type="button" (click)="pickDestination(item.code)">
              {{item.city}} <strong>{{item.code}}</strong>
            </button>
          }
        </div>
      </section>

      <section class="flight-results" @flightList>
        @if (flights().length) {
          @for (flight of flights(); track flight.id) {
            <article class="flight-card">
              <div>
                <span class="eyebrow">{{flight.flightNumber}} · {{flight.airplane.airline}}</span>
                <h3>{{flight.origin.city}} a {{flight.destination.city}}</h3>
                <p>{{flight.origin.iataCode}} - {{flight.destination.iataCode}} · {{flight.departureTime | date:'EEE d MMM, HH:mm'}} - {{flight.arrivalTime | date:'HH:mm'}}</p>
              </div>
              <div class="fare">
                <span>Desde</span>
                <strong>{{flight.price | currency:'USD':'symbol':'1.0-0'}}</strong>
                <small>{{flight.availableSeats}} asientos disponibles</small>
              </div>
              <a class="choose" [routerLink]="['/checkout', flight.id]">Elegir vuelo</a>
            </article>
          }
        } @else {
          <article class="empty-state">
            <mat-icon>travel_explore</mat-icon>
            <h3>No encontramos vuelos para esa ruta</h3>
            <p>Prueba con GUA como origen o selecciona uno de los destinos recomendados.</p>
          </article>
        }
      </section>
    </main>

    <button class="chat-bubble" aria-label="Chat de soporte"><mat-icon>chat</mat-icon></button>
  `,
  styles: [`
    .booking-hero {
      background: linear-gradient(180deg, #75c9de 0%, #dff7fb 82%, #f7f9fb 100%);
      min-height: 310px;
      overflow: hidden;
      position: relative;
    }
    .sky {
      animation: drift 18s ease-in-out infinite alternate;
      background: rgba(255, 255, 255, .22);
      clip-path: polygon(0 0, 100% 20%, 78% 100%, 12% 82%);
      height: 260px;
      position: absolute;
      width: 62vw;
    }
    .sky-a { left: -6vw; top: -42px; }
    .sky-b { animation-delay: -5s; right: -10vw; top: 42px; transform: rotate(12deg); }
    .hero-content {
      margin: 0 auto;
      max-width: 1560px;
      padding: 58px clamp(16px, 9vw, 170px) 34px;
      position: relative;
      z-index: 1;
    }
    .booking-panel {
      backdrop-filter: blur(14px);
      background: rgba(224, 249, 255, .74);
      border-radius: 20px;
      box-shadow: 0 24px 70px rgba(20, 70, 92, .22);
      padding: 20px 30px 26px;
    }
    .booking-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 22px;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .tab {
      align-items: center;
      background: white;
      border: 0;
      border-radius: 999px;
      color: #171717;
      display: flex;
      gap: 10px;
      min-height: 50px;
      padding: 0 24px;
      white-space: nowrap;
    }
    .tab span {
      border: 1px solid #a9b4bd;
      border-radius: 999px;
      height: 24px;
      width: 24px;
    }
    .tab.active span {
      border: 7px solid #24bf50;
    }
    .tab.wide mat-icon { font-size: 20px; height: 20px; width: 20px; }
    .search-card {
      align-items: stretch;
      background: white;
      border-radius: 18px;
      display: grid;
      gap: 18px;
      grid-template-columns: 1.25fr 1.25fr .85fr .85fr .7fr auto;
      padding: 26px 30px;
    }
    .field {
      align-items: center;
      border: 1px solid #d2d8df;
      border-radius: 6px;
      display: grid;
      gap: 0 12px;
      grid-template-columns: 36px 1fr;
      min-height: 66px;
      padding: 10px 14px;
    }
    .field mat-icon { grid-row: span 2; }
    .field span {
      color: #5f6c78;
      font-size: 13px;
    }
    .field input,
    .field select {
      border: 0;
      color: #171717;
      font-size: 21px;
      font-weight: 800;
      outline: 0;
      width: 100%;
    }
    .field strong { font-size: 20px; }
    .search-button {
      background: #171717;
      border: 0;
      border-radius: 999px;
      color: white;
      cursor: pointer;
      font-size: 22px;
      font-weight: 900;
      padding: 0 30px;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .search-button:hover {
      box-shadow: 0 12px 26px rgba(0, 0, 0, .2);
      transform: translateY(-2px);
    }
    .home-page { padding-top: 56px; }
    .promo-card {
      border-radius: 18px;
      display: grid;
      grid-template-columns: 1.2fr .82fr;
      min-height: 318px;
      overflow: hidden;
    }
    .promo-photo {
      background:
        linear-gradient(90deg, rgba(0, 12, 24, .86), rgba(0, 12, 24, .44)),
        url('https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?auto=format&fit=crop&w=1300&q=80') center/cover;
      color: white;
      padding: 34px;
    }
    .promo-photo span {
      background: #9d0000;
      border-radius: 999px;
      display: inline-block;
      font-weight: 800;
      padding: 8px 22px;
    }
    .promo-photo h2 {
      font-size: clamp(44px, 7vw, 78px);
      line-height: .9;
      margin: 70px 0 0;
      max-width: 520px;
    }
    .promo-copy {
      background: #f40d0d;
      color: white;
      padding: clamp(32px, 5vw, 72px) 40px;
      position: relative;
    }
    .promo-copy mat-icon {
      font-size: 58px;
      height: 58px;
      position: absolute;
      right: 34px;
      top: 34px;
      transform: rotate(34deg);
      width: 58px;
    }
    .promo-copy h3 {
      font-size: clamp(34px, 4vw, 48px);
      line-height: 1.05;
      margin: 34px 0 12px;
    }
    .promo-copy p { font-size: 20px; line-height: 1.35; }
    .promo-copy a {
      background: white;
      border-radius: 999px;
      color: #171717;
      display: inline-block;
      font-weight: 900;
      margin-top: 12px;
      padding: 10px 18px;
    }
    .offers-head {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      justify-content: space-between;
      margin: 78px 0 22px;
    }
    .offers-head h2 {
      font-size: clamp(30px, 4vw, 42px);
      margin: 0;
    }
    .offers-head h2 button {
      background: transparent;
      border: 0;
      border-bottom: 3px solid #0093a8;
      color: #0093a8;
      cursor: pointer;
      font-size: inherit;
      font-weight: 900;
    }
    .destination-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .destination-pills button {
      background: white;
      border: 1px solid #d9e4eb;
      border-radius: 999px;
      cursor: pointer;
      padding: 11px 16px;
    }
    .flight-results {
      display: grid;
      gap: 14px;
    }
    .flight-card {
      align-items: center;
      background: white;
      border: 1px solid #dce7ef;
      border-radius: 8px;
      box-shadow: 0 14px 40px rgba(17, 31, 43, .07);
      display: grid;
      gap: 18px;
      grid-template-columns: 1fr auto auto;
      padding: 22px;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .flight-card:hover {
      box-shadow: 0 18px 46px rgba(17, 31, 43, .12);
      transform: translateY(-3px);
    }
    .eyebrow {
      color: #00839a;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .flight-card h3 {
      font-size: 26px;
      margin: 6px 0 8px;
    }
    .flight-card p { color: #5f6c78; margin: 0; }
    .fare {
      text-align: right;
    }
    .fare span,
    .fare small {
      color: #5f6c78;
      display: block;
    }
    .fare strong {
      display: block;
      font-size: 30px;
    }
    .choose {
      background: #171717;
      border-radius: 999px;
      color: white;
      font-weight: 900;
      padding: 14px 22px;
      text-align: center;
    }
    .empty-state {
      background: white;
      border: 1px dashed #b9c9d5;
      border-radius: 8px;
      padding: 38px;
      text-align: center;
    }
    .empty-state mat-icon {
      color: #00839a;
      font-size: 52px;
      height: 52px;
      width: 52px;
    }
    .chat-bubble {
      align-items: center;
      background: #81ddec;
      border: 0;
      border-radius: 999px;
      bottom: 34px;
      box-shadow: 0 18px 46px rgba(32, 145, 164, .26);
      color: #17343d;
      cursor: pointer;
      display: flex;
      height: 78px;
      justify-content: center;
      position: fixed;
      right: 34px;
      width: 78px;
      z-index: 20;
    }
    @keyframes drift {
      from { transform: translateX(-18px) rotate(-4deg); }
      to { transform: translateX(22px) rotate(8deg); }
    }
    @media (max-width: 1160px) {
      .search-card { grid-template-columns: 1fr 1fr; }
      .search-button { min-height: 62px; }
    }
    @media (max-width: 760px) {
      .booking-panel { padding: 16px; }
      .search-card,
      .promo-card,
      .flight-card {
        grid-template-columns: 1fr;
      }
      .fare { text-align: left; }
      .chat-bubble { height: 58px; width: 58px; }
    }
  `]
})
export class HomeComponent {
  private api = inject(ApiService);
  flights = signal<Flight[]>([]);
  origin = 'GUA';
  destination = '';
  passengers = 1;
  quickDestinations = [
    { city: 'Miami', code: 'MIA' },
    { city: 'Panama', code: 'PTY' },
    { city: 'San Salvador', code: 'SAL' },
    { city: 'Madrid', code: 'MAD' }
  ];

  ngOnInit() {
    this.load();
  }

  load() {
    const origin = this.clean(this.origin);
    const destination = this.clean(this.destination);
    this.origin = origin;
    this.destination = destination;
    this.api.flights(origin || undefined, destination || undefined).subscribe(flights => this.flights.set(flights));
  }

  pickDestination(code: string) {
    this.origin = 'GUA';
    this.destination = code;
    this.load();
  }

  private clean(value: string) {
    return value.trim().toUpperCase();
  }
}
