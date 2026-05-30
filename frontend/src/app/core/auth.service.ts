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

  constructor() {
    window.addEventListener('airport-auth-cleared', () => this.user.set(null));
  }

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

  isAuthenticated() {
    return !!this.user() && this.hasUsableToken();
  }

  isAdmin() {
    return this.isAuthenticated() && this.user()?.role === 'ADMIN';
  }

  private save(response: AuthResponse) {
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.refreshKey, response.refreshToken);
    localStorage.setItem('airport_user', JSON.stringify(response.user));
    this.user.set(response.user);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem('airport_user');
    if (!raw || !this.hasUsableToken()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshKey);
      localStorage.removeItem('airport_user');
      return null;
    }
    return JSON.parse(raw) as User;
  }

  private hasUsableToken() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
