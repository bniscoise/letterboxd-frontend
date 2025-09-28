import { inject, Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'authUser';

  private readonly userSignal = signal<AuthUser | null>(this.restoreUser());

  readonly user = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  login(payload: LoginPayload): Observable<AuthUser> {
    return this.http
      .post<AuthUser>('http://localhost:8080/api/auth/login', payload)
      .pipe(tap((user) => this.persistUser(user)));
  }

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http
      .post<AuthUser>('http://localhost:8080/api/auth/register', payload)
      .pipe(tap((user) => this.persistUser(user)));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.userSignal.set(null);
  }

  private persistUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSignal.set(user);
  }

  private restoreUser(): AuthUser | null {
    const serialized = localStorage.getItem(this.storageKey);
    if (!serialized) {
      return null;
    }

    try {
      const parsed = JSON.parse(serialized) as AuthUser;
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof parsed.id === 'number' &&
        typeof parsed.username === 'string' &&
        typeof parsed.email === 'string' &&
        typeof parsed.token === 'string'
      ) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to restore auth user from storage', error);
    }

    localStorage.removeItem(this.storageKey);
    return null;
  }
}
