import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from './environment';
import { Airplane, Airport, Dashboard, Flight, Reservation, Seat } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  airports() { return this.http.get<Airport[]>(`${this.api}/api/airports`); }
  airplanes() { return this.http.get<Airplane[]>(`${this.api}/api/airplanes`); }
  flights(origin?: string, destination?: string) {
    let params = new HttpParams();
    if (origin) params = params.set('origin', origin);
    if (destination) params = params.set('destination', destination);
    return this.http.get<Flight[]>(`${this.api}/api/flights`, { params });
  }
  seats(flightId: number) { return this.http.get<Seat[]>(`${this.api}/api/flights/${flightId}/seats`); }
  reserve(flightId: number, seatNumber: string) { return this.http.post<Reservation>(`${this.api}/api/reservations`, { flightId, seatNumber }); }
  pay(code: string, payment: any) { return this.http.post(`${this.api}/api/reservations/${code}/pay`, payment); }
  myReservations() { return this.http.get<Reservation[]>(`${this.api}/api/reservations/me`); }
  ticket(code: string) { return this.http.get(`${this.api}/api/reservations/${code}/ticket`, { responseType: 'blob' }); }
  dashboard() { return this.http.get<Dashboard>(`${this.api}/api/admin/dashboard`); }
  createAirport(data: Partial<Airport>) { return this.http.post<Airport>(`${this.api}/api/airports`, data); }
  createAirplane(data: Partial<Airplane>) { return this.http.post<Airplane>(`${this.api}/api/airplanes`, data); }
  createFlight(data: any) { return this.http.post<Flight>(`${this.api}/api/flights`, data); }
}
