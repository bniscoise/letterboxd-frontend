import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModalComponent, LoginPayload, RegisterPayload } from './features/auth/auth-modal/auth-modal.component';
import { SearchComponent } from './features/movies/search/search';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthModalComponent, SearchComponent],
  template: `
    <div class="min-h-screen bg-monokai-background text-monokai-text">
      <div class="mx-auto max-w-5xl px-4 py-12 space-y-10">
        <app-auth-modal
          (login)="onLogin($event)"
          (register)="onRegister($event)"
        ></app-auth-modal>

        <section class="rounded-xl border border-monokai-border bg-monokai-surfaceHighlight/80 p-6 shadow-monokai">
          <app-search></app-search>
        </section>
      </div>

      <router-outlet></router-outlet>
    </div>
  `,
})
export class App {
  private readonly http = inject(HttpClient);

  onLogin(payload: LoginPayload): void {
    this.http
      .post<{ token?: string }>('http://localhost:8080/api/auth/login', payload)
      .subscribe({
        next: (response) => {
          if (response?.token) {
            localStorage.setItem('authToken', response.token);
          }
          console.debug('Login succeeded', response);
        },
        error: (error) => {
          console.error('Login failed', error);
        },
      });
  }

  onRegister(payload: RegisterPayload): void {
    this.http
      .post<{ token?: string }>('http://localhost:8080/api/auth/register', payload)
      .subscribe({
        next: (response) => {
          if (response?.token) {
            localStorage.setItem('authToken', response.token);
          }
          console.debug('Registration succeeded', response);
        },
        error: (error) => {
          console.error('Registration failed', error);
        },
      });
  }
}
