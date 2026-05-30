import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api.service';
import { Airport, Flight } from '../../core/models';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, MatButtonModule, MatIconModule],
  animations: [
    trigger('heroIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        animate('420ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('flightList', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(12px)' }),
          stagger(45, animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
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
            <button type="button" class="tab" [class.active]="tripType === 'round'" (click)="tripType = 'round'"><span></span> Ida y vuelta</button>
            <button type="button" class="tab" [class.active]="tripType === 'oneway'" (click)="tripType = 'oneway'"><span></span> Solo ida</button>
            <button type="button" class="tab wide" [class.active]="useCredits" (click)="useCredits = !useCredits"><mat-icon>credit_card</mat-icon> Reservar con creditos</button>
          </div>

          <div class="search-card">
            <label class="field airport-field" [class.open]="activePicker === 'origin'">
              <mat-icon>flight_takeoff</mat-icon>
              <span>Origen</span>
              <input
                [(ngModel)]="originText"
                placeholder="Selecciona origen"
                autocomplete="off"
                (focus)="activePicker = 'origin'"
                (input)="onAirportInput('origin')">
              @if (activePicker === 'origin') {
                <div class="airport-menu">
                  @for (airport of filteredAirports(originText); track airport.id) {
                    <button type="button" (mousedown)="pickAirport('origin', airport)">
                      <strong>{{airport.city}}</strong>
                      <span>{{airport.country}} - {{airport.name}}</span>
                      <em>{{airport.iataCode}}</em>
                    </button>
                  } @empty {
                    <p>No hay aeropuertos con ese texto.</p>
                  }
                </div>
              }
            </label>

            <label class="field airport-field" [class.open]="activePicker === 'destination'">
              <mat-icon>flight_land</mat-icon>
              <span>Destino</span>
              <input
                [(ngModel)]="destinationText"
                placeholder="Selecciona destino"
                autocomplete="off"
                (focus)="activePicker = 'destination'"
                (input)="onAirportInput('destination')">
              @if (activePicker === 'destination') {
                <div class="airport-menu">
                  @for (airport of filteredAirports(destinationText); track airport.id) {
                    <button type="button" (mousedown)="pickAirport('destination', airport)">
                      <strong>{{airport.city}}</strong>
                      <span>{{airport.country}} - {{airport.name}}</span>
                      <em>{{airport.iataCode}}</em>
                    </button>
                  } @empty {
                    <p>No hay aeropuertos con ese texto.</p>
                  }
                </div>
              }
            </label>

            <label class="field date">
              <mat-icon>calendar_month</mat-icon>
              <span>Ida</span>
              <input type="date" [min]="minDate" [(ngModel)]="departureDate">
            </label>

            <label class="field date">
              <mat-icon>event_repeat</mat-icon>
              <span>Vuelta</span>
              <input type="date" [min]="departureDate" [disabled]="tripType === 'oneway'" [(ngModel)]="returnDate">
            </label>

            <label class="field passengers">
              <mat-icon>group_add</mat-icon>
              <span>Pasajeros</span>
              <select [(ngModel)]="passengers">
                <option [ngValue]="1">1 adulto</option>
                <option [ngValue]="2">2 adultos</option>
                <option [ngValue]="3">3 adultos</option>
                <option [ngValue]="4">4 adultos</option>
              </select>
            </label>

            <button class="search-button" type="button" (click)="load()">Buscar</button>
          </div>

          @if (searchError()) {
            <p class="search-error"><mat-icon>error</mat-icon>{{searchError()}}</p>
          }
        </div>
      </div>
    </section>

    <main class="page home-page">
      <section id="flight-results" class="results-block" @flightList>
        <div class="results-head">
          <div>
            <span class="eyebrow">Vuelos disponibles</span>
            <h2>{{lastSearch()}}</h2>
          </div>
          <button type="button" class="link-button" (click)="setOrigin('GUA')">Ver salidas desde Guatemala</button>
        </div>

        <div class="flight-results">
          @if (flights().length) {
            @for (flight of flights(); track flight.id) {
              <article class="flight-card">
                <div class="flight-main">
                  <span class="eyebrow">{{flight.flightNumber}} - {{flight.airplane.airline}}</span>
                  <h3>{{flight.origin.city}} a {{flight.destination.city}}</h3>
                  <p>
                    {{flight.origin.iataCode}} - {{flight.destination.iataCode}}
                    <span>{{flight.departureTime | date:'EEE d MMM, HH:mm'}} - {{flight.arrivalTime | date:'HH:mm'}}</span>
                  </p>
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
              <h3>No encontramos vuelos para esa busqueda</h3>
              <p>Selecciona un aeropuerto de la lista o prueba con uno de los destinos recomendados.</p>
            </article>
          }
        </div>
      </section>

      <section class="offers-head">
        <h2>Destinos recomendados desde <button type="button" (click)="setOrigin('GUA')">Ciudad de Guatemala</button></h2>
        <div class="destination-pills">
          @for (item of quickDestinations; track item.code) {
            <button type="button" (click)="pickDestination(item.code)">
              {{item.city}} <strong>{{item.code}}</strong>
            </button>
          }
        </div>
      </section>

      <section class="destination-showcase">
        @for (card of destinationCards; track card.code) {
          <article [style.background-image]="destinationBackground(card.image)">
            <span>{{card.code}}</span>
            <h3>{{card.city}}</h3>
            <p>{{card.copy}}</p>
            <button type="button" (click)="pickDestination(card.code)">Ver vuelos</button>
          </article>
        }
      </section>

      <section class="promo-card">
        <div class="promo-photo">
          <span>No lo dejes para manana</span>
          <h2>Vuela a conocer el mundo</h2>
        </div>
        <div class="promo-copy">
          <mat-icon>flight_takeoff</mat-icon>
          <h3>Recibe tu boarding pass digital</h3>
          <p>Reserva, elige asiento, paga y recibe tu ticket PDF por correo.</p>
          <a routerLink="/register">Crear cuenta</a>
        </div>
      </section>
    </main>

    <button class="chat-bubble" aria-label="Chat de soporte"><mat-icon>chat</mat-icon></button>
  `,
  styles: [`
    .booking-hero {
      background: linear-gradient(180deg, #75c9de 0%, #dff7fb 82%, #f7f9fb 100%);
      min-height: 290px;
      overflow: visible;
      position: relative;
      z-index: 2;
    }
    .sky {
      animation: drift 18s ease-in-out infinite alternate;
      background: rgba(255, 255, 255, .22);
      clip-path: polygon(0 0, 100% 20%, 78% 100%, 12% 82%);
      height: 240px;
      position: absolute;
      width: 62vw;
    }
    .sky-a { left: -6vw; top: -42px; }
    .sky-b { animation-delay: -5s; right: -10vw; top: 42px; transform: rotate(12deg); }
    .hero-content {
      margin: 0 auto;
      max-width: 1560px;
      padding: 42px clamp(16px, 9vw, 170px) 34px;
      position: relative;
      z-index: 3;
    }
    .booking-panel {
      backdrop-filter: blur(14px);
      background: rgba(224, 249, 255, .78);
      border-radius: 18px;
      box-shadow: 0 24px 70px rgba(20, 70, 92, .22);
      overflow: visible;
      padding: 18px 24px 24px;
      position: relative;
      z-index: 4;
    }
    .booking-tabs {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-bottom: 18px;
    }
    .tab {
      align-items: center;
      background: white;
      border: 0;
      border-radius: 999px;
      color: #171717;
      display: flex;
      font-size: 16px;
      gap: 10px;
      justify-content: center;
      min-height: 52px;
      padding: 0 18px;
      white-space: nowrap;
    }
    .tab span {
      border: 1px solid #a9b4bd;
      border-radius: 999px;
      height: 24px;
      width: 24px;
    }
    .tab.active span { border: 7px solid #24bf50; }
    .tab.active {
      box-shadow: inset 0 0 0 2px rgba(36, 191, 80, .2);
      font-weight: 900;
    }
    .tab.wide mat-icon { font-size: 20px; height: 20px; width: 20px; }
    .search-card {
      align-items: stretch;
      background: white;
      border-radius: 18px;
      display: grid;
      gap: 14px;
      grid-template-columns: minmax(190px, 1.1fr) minmax(190px, 1.1fr) minmax(150px, .78fr) minmax(150px, .78fr) minmax(150px, .65fr) auto;
      overflow: visible;
      padding: 22px;
      position: relative;
      z-index: 5;
    }
    .field {
      align-items: center;
      border: 1px solid #d2d8df;
      border-radius: 8px;
      display: grid;
      gap: 0 12px;
      grid-template-columns: 34px 1fr;
      min-height: 64px;
      min-width: 0;
      padding: 10px 12px;
      position: relative;
    }
    .field.open,
    .field:focus-within {
      border-color: #0089a4;
      box-shadow: 0 0 0 4px rgba(0, 137, 164, .11);
    }
    .field mat-icon { grid-row: span 2; }
    .field span {
      color: #5f6c78;
      font-size: 12px;
      font-weight: 800;
      line-height: 1;
    }
    .field input,
    .field select {
      background: transparent;
      border: 0;
      color: #171717;
      font-size: 16px;
      font-weight: 900;
      min-width: 0;
      outline: 0;
      width: 100%;
    }
    .field input::placeholder { color: #6d7580; }
    .field.date input,
    .field.passengers select {
      cursor: pointer;
      font-weight: 900;
    }
    .airport-menu {
      background: white;
      border: 1px solid #d7e1e9;
      border-radius: 14px;
      box-shadow: 0 22px 52px rgba(17, 31, 43, .18);
      display: grid;
      gap: 4px;
      left: 0;
      max-height: 300px;
      overflow: auto;
      padding: 10px;
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      z-index: 80;
    }
    .airport-menu button {
      align-items: center;
      background: white;
      border: 0;
      border-radius: 10px;
      cursor: pointer;
      display: grid;
      gap: 2px 12px;
      grid-template-columns: 1fr auto;
      min-height: 58px;
      padding: 10px 12px;
      text-align: left;
    }
    .airport-menu button:hover,
    .airport-menu button:focus {
      background: #edf9fc;
      outline: 0;
    }
    .airport-menu strong {
      font-size: 15px;
      line-height: 1.1;
    }
    .airport-menu span,
    .airport-menu p {
      color: #5f6c78;
      font-size: 12px;
      margin: 0;
    }
    .airport-menu em {
      color: #00839a;
      font-style: normal;
      font-weight: 900;
      grid-column: 2;
      grid-row: 1 / span 2;
    }
    .search-button {
      background: #171717;
      border: 0;
      border-radius: 999px;
      color: white;
      cursor: pointer;
      font-size: 21px;
      font-weight: 900;
      min-height: 64px;
      padding: 0 30px;
      transition: transform .2s ease, box-shadow .2s ease;
      white-space: nowrap;
    }
    .search-button:hover {
      box-shadow: 0 12px 26px rgba(0, 0, 0, .2);
      transform: translateY(-2px);
    }
    .search-error {
      align-items: center;
      background: #fff0f0;
      border-radius: 10px;
      color: #b00020;
      display: flex;
      gap: 8px;
      margin: 14px 0 0;
      padding: 12px 14px;
    }
    .home-page {
      padding-top: 34px;
      position: relative;
      z-index: 1;
    }
    .results-block {
      background: #f7fafc;
      border: 1px solid #dce7ef;
      border-radius: 14px;
      box-shadow: 0 18px 46px rgba(17, 31, 43, .08);
      margin-bottom: 34px;
      overflow: hidden;
    }
    .results-head {
      align-items: center;
      display: flex;
      gap: 18px;
      justify-content: space-between;
      padding: 20px 22px;
    }
    .results-head h2 {
      font-size: clamp(24px, 3vw, 34px);
      margin: 4px 0 0;
    }
    .link-button {
      background: white;
      border: 1px solid #d9e4eb;
      border-radius: 999px;
      color: #00839a;
      cursor: pointer;
      font-weight: 900;
      padding: 10px 16px;
      white-space: nowrap;
    }
    .flight-results {
      display: grid;
      gap: 14px;
      padding: 0 18px 18px;
    }
    .flight-card {
      align-items: center;
      background: white;
      border: 1px solid #dce7ef;
      border-radius: 10px;
      box-shadow: 0 10px 26px rgba(17, 31, 43, .05);
      display: grid;
      gap: 18px;
      grid-template-columns: 1fr auto auto;
      padding: 22px 28px;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .flight-card:hover {
      box-shadow: 0 18px 46px rgba(17, 31, 43, .12);
      transform: translateY(-2px);
    }
    .flight-main { min-width: 0; }
    .eyebrow {
      color: #00839a;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .flight-card h3 {
      font-size: clamp(22px, 3vw, 30px);
      line-height: 1.1;
      margin: 6px 0 8px;
    }
    .flight-card p {
      color: #5f6c78;
      margin: 0;
    }
    .flight-card p span { margin-left: 6px; }
    .fare {
      min-width: 140px;
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
      white-space: nowrap;
    }
    .empty-state {
      background: white;
      border: 1px dashed #b9c9d5;
      border-radius: 10px;
      padding: 34px;
      text-align: center;
    }
    .empty-state mat-icon {
      color: #00839a;
      font-size: 48px;
      height: 48px;
      width: 48px;
    }
    .offers-head {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      justify-content: space-between;
      margin: 42px 0 22px;
    }
    .offers-head h2 {
      font-size: clamp(28px, 4vw, 42px);
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
    .destination-showcase {
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(4, 1fr);
      margin-bottom: 30px;
    }
    .destination-showcase article {
      align-content: end;
      background-position: center;
      background-size: cover;
      border-radius: 14px;
      box-shadow: 0 18px 46px rgba(17, 31, 43, .12);
      color: white;
      display: grid;
      min-height: 230px;
      overflow: hidden;
      padding: 22px;
      position: relative;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .destination-showcase article:hover {
      box-shadow: 0 24px 60px rgba(17, 31, 43, .18);
      transform: translateY(-4px);
    }
    .destination-showcase span {
      background: rgba(255,255,255,.92);
      border-radius: 999px;
      color: #111;
      font-weight: 900;
      padding: 6px 12px;
      position: absolute;
      right: 18px;
      top: 18px;
    }
    .destination-showcase h3 {
      font-size: 28px;
      margin: 0 0 8px;
    }
    .destination-showcase p {
      margin: 0 0 14px;
      max-width: 280px;
    }
    .destination-showcase button {
      background: white;
      border: 0;
      border-radius: 999px;
      color: #171717;
      cursor: pointer;
      font-weight: 900;
      justify-self: start;
      padding: 10px 16px;
    }
    .promo-card {
      border-radius: 18px;
      display: grid;
      grid-template-columns: 1.2fr .82fr;
      min-height: 300px;
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
      font-size: clamp(38px, 6vw, 68px);
      line-height: .92;
      margin: 70px 0 0;
      max-width: 520px;
    }
    .promo-copy {
      background: #f40d0d;
      color: white;
      padding: clamp(30px, 5vw, 64px) 40px;
      position: relative;
    }
    .promo-copy mat-icon {
      font-size: 52px;
      height: 52px;
      position: absolute;
      right: 34px;
      top: 34px;
      transform: rotate(34deg);
      width: 52px;
    }
    .promo-copy h3 {
      font-size: clamp(32px, 4vw, 46px);
      line-height: 1.05;
      margin: 34px 0 12px;
    }
    .promo-copy p { font-size: 19px; line-height: 1.35; }
    .promo-copy a {
      background: white;
      border-radius: 999px;
      color: #171717;
      display: inline-block;
      font-weight: 900;
      margin-top: 12px;
      padding: 10px 18px;
    }
    .chat-bubble {
      align-items: center;
      background: #81ddec;
      border: 0;
      border-radius: 999px;
      bottom: 24px;
      box-shadow: 0 18px 46px rgba(32, 145, 164, .26);
      color: #17343d;
      cursor: pointer;
      display: flex;
      height: 64px;
      justify-content: center;
      position: fixed;
      right: 24px;
      width: 64px;
      z-index: 20;
    }
    @keyframes drift {
      from { transform: translateX(-18px) rotate(-4deg); }
      to { transform: translateX(22px) rotate(8deg); }
    }
    @media (max-width: 1180px) {
      .search-card {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .search-button { min-height: 58px; }
      .destination-showcase { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 760px) {
      .booking-hero { min-height: auto; }
      .hero-content { padding: 18px 12px 20px; }
      .booking-panel {
        border-radius: 14px;
        padding: 12px;
      }
      .booking-tabs {
        gap: 8px;
        grid-template-columns: 1fr;
      }
      .tab {
        font-size: 15px;
        justify-content: flex-start;
        min-height: 46px;
      }
      .search-card {
        border-radius: 14px;
        gap: 10px;
        grid-template-columns: 1fr;
        padding: 12px;
      }
      .field {
        min-height: 58px;
      }
      .field input,
      .field select {
        font-size: 16px;
      }
      .airport-menu {
        max-height: 260px;
        position: fixed;
        left: 12px;
        right: 12px;
        top: auto;
        bottom: 16px;
        z-index: 120;
      }
      .search-button {
        font-size: 19px;
        min-height: 56px;
        width: 100%;
      }
      .home-page { padding: 18px 12px 64px; }
      .results-head,
      .flight-card,
      .promo-card,
      .destination-showcase {
        grid-template-columns: 1fr;
      }
      .results-head {
        align-items: flex-start;
        display: grid;
        padding: 16px;
      }
      .flight-results { padding: 0 10px 10px; }
      .flight-card { padding: 18px; }
      .flight-card p span {
        display: block;
        margin-left: 0;
        margin-top: 4px;
      }
      .fare { text-align: left; }
      .choose {
        display: block;
        width: 100%;
      }
      .offers-head {
        align-items: flex-start;
        display: grid;
        margin-top: 28px;
      }
      .offers-head h2 { font-size: 26px; }
      .destination-showcase { grid-template-columns: 1fr; }
      .promo-photo h2 { margin-top: 42px; }
      .chat-bubble {
        height: 54px;
        right: 14px;
        width: 54px;
      }
    }
  `]
})
export class HomeComponent {
  private api = inject(ApiService);
  flights = signal<Flight[]>([]);
  airports = signal<Airport[]>([]);
  lastSearch = signal('Salidas proximas desde Ciudad de Guatemala');
  searchError = signal('');
  origin = 'GUA';
  destination = 'FRS';
  originText = 'Ciudad de Guatemala (GUA)';
  destinationText = 'Flores (FRS)';
  activePicker: 'origin' | 'destination' | '' = '';
  tripType: 'round' | 'oneway' = 'round';
  useCredits = false;
  passengers = 1;
  minDate = this.isoDate(0);
  departureDate = this.isoDate(0);
  returnDate = this.isoDate(3);
  quickDestinations = [
    { city: 'Flores', code: 'FRS' },
    { city: 'Miami', code: 'MIA' },
    { city: 'San Salvador', code: 'SAL' },
    { city: 'Mexico', code: 'MEX' },
    { city: 'Nueva York', code: 'JFK' },
    { city: 'Bogota', code: 'BOG' },
    { city: 'Cancun', code: 'CUN' },
    { city: 'Madrid', code: 'MAD' }
  ];
  destinationCards = [
    {
      city: 'Flores',
      code: 'FRS',
      copy: 'Mundo Maya, escapadas nacionales y tickets listos con QR.',
      image: 'https://images.unsplash.com/photo-1566310095519-1d8358361b2d?auto=format&fit=crop&w=900&q=80'
    },
    {
      city: 'Miami',
      code: 'MIA',
      copy: 'Compras, playa y conexiones internacionales desde Guatemala.',
      image: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=900&q=80'
    },
    {
      city: 'Cancun',
      code: 'CUN',
      copy: 'Playas del Caribe con salidas semanales desde Guatemala.',
      image: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&w=900&q=80'
    },
    {
      city: 'Madrid',
      code: 'MAD',
      copy: 'Conecta con Europa en una experiencia de largo alcance.',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80'
    }
  ];

  ngOnInit() {
    this.api.airports().subscribe(airports => {
      this.airports.set(airports);
      this.syncAirportText();
      this.load(false);
    });
  }

  load(scrollToResults = true) {
    this.searchError.set('');
    const origin = this.resolveAirportCode('origin');
    const destination = this.resolveAirportCode('destination');
    if (!origin) {
      this.searchError.set('Selecciona un aeropuerto de origen desde la lista.');
      return;
    }
    if (this.destinationText.trim() && !destination) {
      this.searchError.set('Selecciona un aeropuerto de destino desde la lista.');
      return;
    }
    this.origin = origin;
    this.destination = destination;
    this.activePicker = '';
    this.syncAirportText();
    const from = this.departureDate ? `${this.departureDate}T00:00:00` : undefined;
    this.api.flights(origin, destination || undefined, from).subscribe(flights => {
      this.flights.set(flights);
      this.lastSearch.set(this.searchLabel(origin, destination));
      if (scrollToResults) {
        setTimeout(() => document.getElementById('flight-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    });
  }

  pickDestination(code: string) {
    this.origin = 'GUA';
    this.destination = code;
    this.syncAirportText();
    this.load();
  }

  setOrigin(code: string) {
    this.origin = code;
    this.destination = '';
    this.destinationText = '';
    this.syncAirportText();
    this.load();
  }

  pickAirport(target: 'origin' | 'destination', airport: Airport) {
    if (target === 'origin') {
      this.origin = airport.iataCode;
      this.originText = this.airportLabel(airport);
    } else {
      this.destination = airport.iataCode;
      this.destinationText = this.airportLabel(airport);
    }
    this.activePicker = '';
  }

  onAirportInput(target: 'origin' | 'destination') {
    if (target === 'origin') {
      this.origin = this.codeFromText(this.originText);
    } else {
      this.destination = this.codeFromText(this.destinationText);
    }
  }

  filteredAirports(query: string) {
    const needle = this.clean(query);
    return this.airports()
      .filter(airport => {
        const haystack = `${airport.city} ${airport.country} ${airport.name} ${airport.iataCode}`.toUpperCase();
        return !needle || haystack.includes(needle);
      })
      .slice(0, 8);
  }

  destinationBackground(image: string) {
    return `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.62)), url(${image})`;
  }

  private resolveAirportCode(target: 'origin' | 'destination') {
    const currentCode = target === 'origin' ? this.origin : this.destination;
    const currentText = target === 'origin' ? this.originText : this.destinationText;
    if (!currentText.trim() && target === 'destination') {
      return '';
    }
    const selected = this.airports().find(airport => airport.iataCode === currentCode);
    if (selected && this.airportLabel(selected) === currentText) {
      return selected.iataCode;
    }
    return this.codeFromText(currentText);
  }

  private searchLabel(origin: string, destination: string) {
    const originAirport = this.airports().find(airport => airport.iataCode === origin);
    const destinationAirport = this.airports().find(airport => airport.iataCode === destination);
    if (originAirport && destinationAirport) {
      return `${originAirport.city} a ${destinationAirport.city}`;
    }
    if (originAirport) {
      return `Salidas proximas desde ${originAirport.city}`;
    }
    return 'Vuelos disponibles';
  }

  private clean(value: string) {
    return value.trim().toUpperCase();
  }

  private codeFromText(value: string) {
    const cleaned = this.clean(value);
    const exact = this.airports().find(airport => airport.iataCode === cleaned || this.clean(this.airportLabel(airport)) === cleaned);
    return exact ? exact.iataCode : '';
  }

  private syncAirportText() {
    const origin = this.airports().find(airport => airport.iataCode === this.origin);
    const destination = this.airports().find(airport => airport.iataCode === this.destination);
    this.originText = origin ? this.airportLabel(origin) : this.originText;
    this.destinationText = destination ? this.airportLabel(destination) : this.destinationText;
  }

  private airportLabel(airport: Airport) {
    return `${airport.city} (${airport.iataCode})`;
  }

  private isoDate(offsetDays: number) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
