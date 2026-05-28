import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../core/api.service';
import { Seat } from '../../core/models';

@Component({
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <main class="page">
      <section class="panel">
        <h2>Selecciona asiento</h2>
        <div class="seats">
          @for (seat of seats(); track seat.id) {
            <button mat-stroked-button [disabled]="!seat.available" [class.selected]="seat.seatNumber === selected" (click)="selected = seat.seatNumber">{{seat.seatNumber}}</button>
          }
        </div>
      </section>
      <section class="panel pay">
        <h2>Pago simulado</h2>
        <mat-form-field appearance="outline"><mat-label>Tarjeta</mat-label><input matInput [(ngModel)]="cardNumber"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Titular</mat-label><input matInput [(ngModel)]="cardHolder"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>MM/YY</mat-label><input matInput [(ngModel)]="expiry"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>CVV</mat-label><input matInput [(ngModel)]="cvv"></mat-form-field>
        <button mat-flat-button [disabled]="!selected" (click)="checkout()"><mat-icon>payments</mat-icon> Pagar y emitir ticket</button>
      </section>
    </main>
  `,
  styles: [`.page{display:grid;gap:18px}.seats{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:10px}.selected{background:#dbeafe}.pay{display:grid;gap:10px;max-width:520px}`]
})
export class CheckoutComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  flightId = Number(this.route.snapshot.paramMap.get('flightId'));
  seats = signal<Seat[]>([]);
  selected = '';
  cardNumber = '4111111111111111'; cardHolder = 'Cliente Demo'; expiry = '12/30'; cvv = '123';

  ngOnInit() { this.api.seats(this.flightId).subscribe(s => this.seats.set(s)); }
  checkout() {
    this.api.reserve(this.flightId, this.selected).subscribe(r => {
      this.api.pay(r.code, { cardNumber: this.cardNumber, cardHolder: this.cardHolder, expiry: this.expiry, cvv: this.cvv })
        .subscribe(() => this.router.navigateByUrl('/client'));
    });
  }
}
