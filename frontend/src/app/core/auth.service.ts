import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from './environment';
import { AuthResponse, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenKey = 'airport_access';
  private refreshKey = 'airport_refresh';
  user = signal<User | null>(this.readUser());
  token = computed(() => localStorage.getItem(this.tokenKey));

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, { email, password }).pipe(tap(r => this.save(r)));
  }

  register(payload: { fullName: string; email: string; password: string; phone?: string; documentNumber?: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, payload).pipe(tap(r => this.save(r)));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem('airport_user');
    this.user.set(null);
    this.router.navigateByUrl('/');
  }

  private save(response: AuthResponse) {
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.refreshKey, response.refreshToken);
    localStorage.setItem('airport_user', JSON.stringify(response.user));
    this.user.set(response.user);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem('airport_user');
    return raw ? JSON.parse(raw) as User : null;
  }
}
