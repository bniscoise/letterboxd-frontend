import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModalComponent } from './features/auth/auth-modal/auth-modal.component';
import { SearchComponent } from './features/movies/search/search';
import { AuthService, LoginPayload, RegisterPayload } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthModalComponent, SearchComponent],
  template: `
    <div class="min-h-screen bg-monokai-background text-monokai-text">
      <div class="mx-auto max-w-5xl px-4 py-12 space-y-10">
        <app-auth-modal
          [isAuthenticated]="isAuthenticated()"
          [user]="currentUser()"
          (login)="onLogin($event)"
          (register)="onRegister($event)"
          (logout)="onLogout()"
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
  private readonly authService = inject(AuthService);

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly currentUser = this.authService.user;

  onLogin(payload: LoginPayload): void {
    this.authService.login(payload).subscribe({
      next: (user) => console.debug('Login succeeded', user),
      error: (error) => console.error('Login failed', error),
    });
  }

  onRegister(payload: RegisterPayload): void {
    this.authService.register(payload).subscribe({
      next: (user) => console.debug('Registration succeeded', user),
      error: (error) => console.error('Registration failed', error),
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
