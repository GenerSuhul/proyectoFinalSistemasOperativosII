export interface User { id: number; fullName: string; email: string; role: 'ADMIN' | 'CLIENT'; phone?: string; documentNumber?: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; user: User; }
export interface Airport { id: number; name: string; city: string; country: string; iataCode: string; }
export interface Airplane { id: number; model: string; capacity: number; airline: string; }
export interface Flight { id: number; flightNumber: string; origin: Airport; destination: Airport; airplane: Airplane; departureTime: string; arrivalTime: string; price: number; availableSeats: number; status: string; }
export interface Seat { id: number; seatNumber: string; available: boolean; }
export interface Reservation { id: number; code: string; flightId: number; flightNumber: string; route: string; seatNumber: string; amount: number; status: string; createdAt: string; }
export interface PaymentResponse { id: number; authorizationCode: string; status: string; amount: number; ticketEmailSent: boolean; ticketEmailMessage: string; }
export interface TicketEmailResponse { sent: boolean; message: string; }
export interface Dashboard { sales: number; activeFlights: number; registeredUsers: number; confirmedReservations: number; }
