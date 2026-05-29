import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api.service';
import { AdminReservation, AdminUser, Airplane, Airport, Dashboard, Flight } from '../../core/models';

@Component({
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, MatButtonModule, MatIconModule],
  template: `
    <main class="admin-shell">
      <section class="admin-hero">
        <div>
          <span class="eyebrow">CRM AeroNova</span>
          <h1>Operacion, ventas y experiencia del pasajero</h1>
          <p>Publica rutas, controla inventario, revisa tickets vendidos y da seguimiento a cada cliente.</p>
        </div>
        <button mat-flat-button color="primary" (click)="reload()"><mat-icon>refresh</mat-icon> Actualizar</button>
      </section>

      @if (dashboard(); as d) {
        <section class="metrics">
          <article><span>Ventas aprobadas</span><strong>{{d.sales | currency:'USD'}}</strong></article>
          <article><span>Vuelos activos</span><strong>{{d.activeFlights}}</strong></article>
          <article><span>Usuarios</span><strong>{{d.registeredUsers}}</strong></article>
          <article><span>Tickets confirmados</span><strong>{{d.confirmedReservations}}</strong></article>
        </section>
      }

      <section class="crm-section">
        <div class="section-head">
          <div>
            <span class="eyebrow">Ventas y soporte</span>
            <h2>Tickets vendidos</h2>
          </div>
          <span>{{reservations().length}} registros recientes</span>
        </div>
        <div class="reservation-list">
          @for (item of reservations(); track item.id) {
            <article>
              <div class="route">
                <strong>{{item.flightNumber}} - {{item.route}}</strong>
                <span>{{item.originCity}} a {{item.destinationCity}} - {{item.departureTime | date:'dd MMM HH:mm'}}</span>
              </div>
              <div>
                <strong>{{item.passengerName}}</strong>
                <span>{{item.passengerEmail}}</span>
              </div>
              <div>
                <strong>{{item.seatNumber}}</strong>
                <span>{{item.status}}</span>
              </div>
              <div class="amount">{{item.amount | currency:'USD'}}</div>
              <div class="actions">
                <button mat-stroked-button (click)="openTicket(item.code)"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
                <button mat-stroked-button (click)="sendEmail(item.code)"><mat-icon>mail</mat-icon> Correo</button>
              </div>
            </article>
          } @empty {
            <p class="empty">Aun no hay reservas registradas.</p>
          }
        </div>
      </section>

      <section class="ops-grid">
        <form class="ops-card wide" (ngSubmit)="createFlight()">
          <div class="card-head">
            <mat-icon>flight_takeoff</mat-icon>
            <div>
              <h2>Publicar vuelo</h2>
              <p>Este vuelo queda disponible inmediatamente en la busqueda del usuario final.</p>
            </div>
          </div>

          <div class="form-grid">
            <label>
              <span>No. vuelo</span>
              <input name="flightNumber" [(ngModel)]="flight.flightNumber" placeholder="AN450">
            </label>
            <label>
              <span>Origen</span>
              <select name="originId" [(ngModel)]="flight.originId">
                <option [ngValue]="0">Seleccionar</option>
                @for (airport of airports(); track airport.id) {
                  <option [ngValue]="airport.id">{{airport.city}} ({{airport.iataCode}})</option>
                }
              </select>
            </label>
            <label>
              <span>Destino</span>
              <select name="destinationId" [(ngModel)]="flight.destinationId">
                <option [ngValue]="0">Seleccionar</option>
                @for (airport of airports(); track airport.id) {
                  <option [ngValue]="airport.id">{{airport.city}} ({{airport.iataCode}})</option>
                }
              </select>
            </label>
            <label>
              <span>Avion</span>
              <select name="airplaneId" [(ngModel)]="flight.airplaneId">
                <option [ngValue]="0">Seleccionar</option>
                @for (airplane of airplanes(); track airplane.id) {
                  <option [ngValue]="airplane.id">{{airplane.airline}} - {{airplane.model}} ({{airplane.capacity}})</option>
                }
              </select>
            </label>
            <label>
              <span>Salida</span>
              <input name="departureTime" type="datetime-local" [(ngModel)]="flight.departureTime">
            </label>
            <label>
              <span>Llegada</span>
              <input name="arrivalTime" type="datetime-local" [(ngModel)]="flight.arrivalTime">
            </label>
            <label>
              <span>Precio USD</span>
              <input name="price" type="number" min="1" step="0.01" [(ngModel)]="flight.price">
            </label>
            <label>
              <span>Estado</span>
              <select name="status" [(ngModel)]="flight.status">
                <option value="SCHEDULED">Programado</option>
                <option value="BOARDING">Abordando</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </label>
          </div>

          @if (message()) { <p class="message"><mat-icon>check_circle</mat-icon>{{message()}}</p> }
          @if (error()) { <p class="error"><mat-icon>error</mat-icon>{{error()}}</p> }
          <button mat-flat-button color="primary"><mat-icon>publish</mat-icon> Publicar vuelo</button>
        </form>

        <form class="ops-card" (ngSubmit)="createAirport()">
          <div class="card-head">
            <mat-icon>location_on</mat-icon>
            <div>
              <h2>Destino</h2>
              <p>Agrega aeropuertos para nuevas rutas.</p>
            </div>
          </div>
          <label><span>Nombre</span><input name="an" [(ngModel)]="airport.name"></label>
          <label><span>Ciudad</span><input name="ac" [(ngModel)]="airport.city"></label>
          <label><span>Pais</span><input name="ap" [(ngModel)]="airport.country"></label>
          <label><span>IATA</span><input name="ai" maxlength="3" [(ngModel)]="airport.iataCode"></label>
          <button mat-stroked-button>Guardar destino</button>
        </form>

        <form class="ops-card" (ngSubmit)="createAirplane()">
          <div class="card-head">
            <mat-icon>airlines</mat-icon>
            <div>
              <h2>Flota</h2>
              <p>Registra aeronaves y capacidad.</p>
            </div>
          </div>
          <label><span>Modelo</span><input name="pm" [(ngModel)]="airplane.model"></label>
          <label><span>Capacidad</span><input name="pc" type="number" [(ngModel)]="airplane.capacity"></label>
          <label><span>Aerolinea</span><input name="pa" [(ngModel)]="airplane.airline"></label>
          <button mat-stroked-button>Guardar avion</button>
        </form>
      </section>

      <section class="published">
        <div class="section-head">
          <div>
            <span class="eyebrow">Inventario</span>
            <h2>Vuelos publicados</h2>
          </div>
          <span>{{flights().length}} activos</span>
        </div>
        <div class="flight-table">
          @for (item of flights(); track item.id) {
            <article>
              <div>
                <strong>{{item.flightNumber}}</strong>
                <span>{{item.origin.city}} - {{item.destination.city}}</span>
              </div>
              <div>{{item.departureTime | date:'dd MMM HH:mm'}}</div>
              <div>{{item.availableSeats}} asientos</div>
              <div class="price">{{item.price | currency:'USD'}}</div>
            </article>
          }
        </div>
      </section>

      <section class="crm-section">
        <div class="section-head">
          <div>
            <span class="eyebrow">Clientes</span>
            <h2>Directorio de usuarios</h2>
          </div>
          <span>{{users().length}} recientes</span>
        </div>
        <div class="users-grid">
          @for (user of users(); track user.id) {
            <article>
              <strong>{{user.fullName}}</strong>
              <span>{{user.email}}</span>
              <small>{{user.role}} - {{user.documentNumber || 'sin documento'}}</small>
            </article>
          }
        </div>
      </section>
    </main>
  `,
  styles: [`
    .admin-shell {
      display: grid;
      gap: 22px;
      margin: 0 auto;
      max-width: 1360px;
      padding: 34px 20px;
    }
    .admin-hero {
      align-items: center;
      background:
        linear-gradient(120deg, rgba(17, 24, 39, .96), rgba(0, 87, 110, .92)),
        url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80') center/cover;
      border-radius: 18px;
      color: white;
      display: flex;
      justify-content: space-between;
      min-height: 260px;
      padding: clamp(28px, 5vw, 54px);
    }
    .eyebrow {
      color: #0089a4;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .admin-hero .eyebrow { color: #a7ecf5; }
    .admin-hero h1 {
      font-size: clamp(38px, 6vw, 66px);
      line-height: .98;
      margin: 8px 0;
      max-width: 880px;
    }
    .admin-hero p { font-size: 18px; margin: 0; max-width: 680px; }
    .metrics {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(4, 1fr);
    }
    .metrics article,
    .ops-card,
    .published,
    .crm-section {
      background: white;
      border: 1px solid #dce7ef;
      border-radius: 12px;
      box-shadow: 0 16px 44px rgba(17, 31, 43, .08);
    }
    .metrics article { padding: 20px; }
    .metrics span { color: #657484; font-weight: 800; }
    .metrics strong { display: block; font-size: 32px; margin-top: 6px; }
    .section-head {
      align-items: center;
      background: #f3f8fb;
      display: flex;
      justify-content: space-between;
      padding: 18px 22px;
    }
    .section-head h2 { margin: 3px 0 0; }
    .section-head > span { color: #657484; font-weight: 900; }
    .reservation-list article {
      align-items: center;
      border-top: 1px solid #edf2f6;
      display: grid;
      gap: 16px;
      grid-template-columns: 1.5fr 1.1fr .55fr .6fr auto;
      padding: 18px 22px;
    }
    .reservation-list strong,
    .reservation-list span,
    .users-grid strong,
    .users-grid span,
    .users-grid small { display: block; }
    .reservation-list span,
    .users-grid span,
    .users-grid small { color: #657484; margin-top: 4px; }
    .amount,
    .price { font-weight: 900; text-align: right; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; }
    .empty { color: #657484; margin: 0; padding: 24px; }
    .ops-grid {
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(2, 1fr);
    }
    .ops-card {
      display: grid;
      gap: 14px;
      padding: 22px;
    }
    .ops-card.wide { grid-column: 1 / -1; }
    .card-head {
      align-items: center;
      display: flex;
      gap: 14px;
    }
    .card-head mat-icon {
      align-items: center;
      background: #e8f8fb;
      border-radius: 999px;
      color: #0089a4;
      display: flex;
      height: 44px;
      justify-content: center;
      padding: 10px;
      width: 44px;
    }
    .card-head h2 { margin: 0; }
    .card-head p { color: #657484; margin: 2px 0 0; }
    .form-grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(4, 1fr);
    }
    label {
      display: grid;
      gap: 7px;
    }
    label span {
      color: #5e6c78;
      font-size: 13px;
      font-weight: 800;
    }
    input,
    select {
      background: white;
      border: 1px solid #cfdbe5;
      border-radius: 8px;
      min-height: 52px;
      outline: 0;
      padding: 0 12px;
      width: 100%;
    }
    input:focus,
    select:focus {
      border-color: #0089a4;
      box-shadow: 0 0 0 4px rgba(0, 137, 164, .12);
    }
    .message,
    .error {
      align-items: center;
      border-radius: 8px;
      display: flex;
      gap: 8px;
      margin: 0;
      padding: 12px;
    }
    .message {
      background: #eafaf3;
      color: #087044;
    }
    .error {
      background: #fff0f0;
      color: #b00020;
    }
    .published { overflow: hidden; }
    .flight-table article {
      align-items: center;
      border-top: 1px solid #edf2f6;
      display: grid;
      gap: 16px;
      grid-template-columns: 1.5fr 1fr 1fr .8fr;
      padding: 18px 22px;
    }
    .flight-table strong,
    .flight-table span { display: block; }
    .flight-table span { color: #657484; margin-top: 4px; }
    .users-grid {
      display: grid;
      gap: 14px;
      grid-template-columns: repeat(3, 1fr);
      padding: 22px;
    }
    .users-grid article {
      border: 1px solid #edf2f6;
      border-radius: 10px;
      padding: 16px;
    }
    @media (max-width: 1100px) {
      .admin-hero,
      .metrics,
      .ops-grid,
      .form-grid,
      .reservation-list article,
      .flight-table article,
      .users-grid {
        grid-template-columns: 1fr;
      }
      .admin-hero { display: grid; }
      .amount,
      .price { text-align: left; }
      .actions { justify-content: flex-start; }
    }
  `]
})
export class AdminDashboardComponent {
  private api = inject(ApiService);
  dashboard = signal<Dashboard | null>(null);
  airports = signal<Airport[]>([]);
  airplanes = signal<Airplane[]>([]);
  flights = signal<Flight[]>([]);
  reservations = signal<AdminReservation[]>([]);
  users = signal<AdminUser[]>([]);
  message = signal('');
  error = signal('');

  airport = { name: '', city: '', country: '', iataCode: '' };
  airplane = { model: 'Airbus A320neo', capacity: 60, airline: 'AeroNova' };
  flight = {
    flightNumber: 'AN450',
    originId: 0,
    destinationId: 0,
    airplaneId: 0,
    departureTime: this.futureDateTime(24),
    arrivalTime: this.futureDateTime(27),
    price: 199.99,
    status: 'SCHEDULED'
  };

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.dashboard().subscribe(dashboard => this.dashboard.set(dashboard));
    this.api.adminReservations().subscribe(reservations => this.reservations.set(reservations));
    this.api.adminUsers().subscribe(users => this.users.set(users));
    this.api.airports().subscribe(airports => {
      this.airports.set(airports);
      this.flight.originId ||= airports.find(a => a.iataCode === 'GUA')?.id ?? airports[0]?.id ?? 0;
      this.flight.destinationId ||= airports.find(a => a.iataCode === 'FRS')?.id ?? airports[1]?.id ?? 0;
    });
    this.api.airplanes().subscribe(airplanes => {
      this.airplanes.set(airplanes);
      this.flight.airplaneId ||= airplanes[0]?.id ?? 0;
    });
    this.api.flights().subscribe(flights => this.flights.set(flights));
  }

  createAirport() {
    this.clear();
    this.api.createAirport({ ...this.airport, iataCode: this.airport.iataCode.toUpperCase() }).subscribe({
      next: () => {
        this.airport = { name: '', city: '', country: '', iataCode: '' };
        this.message.set('Destino guardado.');
        this.reload();
      },
      error: err => this.error.set(err?.error?.message ?? 'No se pudo guardar el destino.')
    });
  }

  createAirplane() {
    this.clear();
    this.api.createAirplane(this.airplane).subscribe({
      next: () => {
        this.airplane = { model: 'Airbus A320neo', capacity: 60, airline: 'AeroNova' };
        this.message.set('Avion guardado.');
        this.reload();
      },
      error: err => this.error.set(err?.error?.message ?? 'No se pudo guardar el avion.')
    });
  }

  createFlight() {
    this.clear();
    if (!this.flight.originId || !this.flight.destinationId || !this.flight.airplaneId) {
      this.error.set('Selecciona origen, destino y avion.');
      return;
    }
    this.api.createFlight({
      ...this.flight,
      flightNumber: this.flight.flightNumber.toUpperCase(),
      price: Number(this.flight.price)
    }).subscribe({
      next: () => {
        this.message.set('Vuelo publicado en la busqueda del cliente.');
        this.flight.flightNumber = 'AN' + Math.floor(100 + Math.random() * 899);
        this.reload();
      },
      error: err => this.error.set(err?.error?.message ?? 'No se pudo publicar el vuelo.')
    });
  }

  openTicket(code: string) {
    const ticketWindow = window.open('', '_blank');
    this.api.ticket(code).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      if (ticketWindow) {
        ticketWindow.location.href = url;
      } else {
        window.location.href = url;
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    });
  }

  sendEmail(code: string) {
    this.clear();
    this.api.emailTicket(code).subscribe({
      next: result => this.message.set(result.message),
      error: err => this.error.set(err?.error?.message ?? 'No fue posible enviar el correo.')
    });
  }

  private clear() {
    this.message.set('');
    this.error.set('');
  }

  private futureDateTime(hours: number) {
    const date = new Date(Date.now() + hours * 60 * 60 * 1000);
    date.setMinutes(0, 0, 0);
    return date.toISOString().slice(0, 16);
  }
}
