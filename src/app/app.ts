import { Component, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModalComponent } from './features/auth/auth-modal/auth-modal.component';
import { AuthService, LoginPayload, RegisterPayload } from './core/services/auth.service';
import { AppHeaderComponent } from './layout/app-header/app-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthModalComponent, AppHeaderComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-monokai-background text-monokai-text">
      <app-header
        [isAuthenticated]="isAuthenticated()"
        [user]="currentUser()"
        (openLogin)="showLoginModal()"
        (openRegister)="showRegisterModal()"
        (logout)="onLogout()"
      ></app-header>

      <div class="flex-1">
        <div class="mx-auto max-w-5xl px-4 py-12 space-y-10">
          <app-auth-modal
            #authModal
            [isAuthenticated]="isAuthenticated()"
            [user]="currentUser()"
            [authError]="authError"
            (login)="onLogin($event)"
            (register)="onRegister($event)"
            (clearError)="authError = null"
          ></app-auth-modal>

          <section
            class="rounded-xl border border-monokai-border bg-monokai-surfaceHighlight/80 p-6 shadow-monokai"
          >
            <router-outlet></router-outlet>
          </section>
        </div>
      </div>
    </div>
  `,
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly authModal = viewChild(AuthModalComponent);

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly currentUser = this.authService.user;
  protected authError: string | null = null;

  onLogin(payload: LoginPayload): void {
    this.authError = null;
    this.authService.login(payload).subscribe({
      next: () => {
        this.authError = null;
      },
      error: (error) => {
        console.error('Login failed', error);
        this.authError = error?.message || 'Impossible de se connecter.';
      },
    });
  }

  onRegister(payload: RegisterPayload): void {
    this.authError = null;
    this.authService.register(payload).subscribe({
      next: () => {
        this.authError = null;
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.authError = error?.message || 'La création du compte a échoué.';
      },
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.authModal()?.closeModals();
  }

  protected showLoginModal(): void {
    this.authModal()?.openLoginModal();
  }

  protected showRegisterModal(): void {
    this.authModal()?.openRegisterModal();
  }
}
