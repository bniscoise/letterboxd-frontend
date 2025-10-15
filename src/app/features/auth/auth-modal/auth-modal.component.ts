import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthUser, LoginPayload, RegisterPayload } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isModalOpen" class="fixed inset-0 z-40 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/80" (click)="closeModals()"></div>

      <div
        class="relative z-50 w-full max-w-md rounded-2xl border border-monokai-border bg-monokai-surfaceHighlight p-6 text-monokai-text shadow-monokai"
        (click)="$event.stopPropagation()"
      >
        <button
          type="button"
          class="absolute right-4 top-4 text-2xl leading-none text-monokai-muted transition hover:text-monokai-accent"
          (click)="closeModals()"
          aria-label="Fermer la modale"
        >
          ×
        </button>

        <ng-container *ngIf="showLoginModal">
          <h2 class="mb-5 text-2xl font-semibold text-monokai-green">Connexion</h2>
          <form class="space-y-4" (ngSubmit)="submitLogin()">
            <label class="block text-sm">
              <span class="mb-2 block text-monokai-muted">Nom d'utilisateur</span>
              <input
                type="text"
                name="loginUsername"
                [(ngModel)]="loginForm.username"
                class="w-full rounded-lg border border-monokai-border bg-monokai-background px-3 py-2 text-monokai-text focus:border-monokai-accent focus:outline-none"
                autocomplete="username"
                required
              />
            </label>
            <label class="block text-sm">
              <span class="mb-2 block text-monokai-muted">Mot de passe</span>
              <input
                type="password"
                name="loginPassword"
                [(ngModel)]="loginForm.password"
                class="w-full rounded-lg border border-monokai-border bg-monokai-background px-3 py-2 text-monokai-text focus:border-monokai-accent focus:outline-none"
                autocomplete="current-password"
                required
              />
            </label>
            <div
              *ngIf="authError"
              class="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {{ authError }}
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-monokai-accent px-4 py-2 text-sm font-semibold text-monokai-background transition hover:bg-monokai-yellow"
            >
              Se connecter
            </button>
          </form>
        </ng-container>

        <ng-container *ngIf="showRegisterModal">
          <h2 class="mb-5 text-2xl font-semibold text-monokai-green">Créer un compte</h2>
          <form class="space-y-4" (ngSubmit)="submitRegister()">
            <label class="block text-sm">
              <span class="mb-2 block text-monokai-muted">Nom d'utilisateur</span>
              <input
                type="text"
                name="registerUsername"
                [(ngModel)]="registerForm.username"
                class="w-full rounded-lg border border-monokai-border bg-monokai-background px-3 py-2 text-monokai-text focus:border-monokai-accent focus:outline-none"
                autocomplete="username"
                required
              />
            </label>

            <label class="block text-sm">
              <span class="mb-2 block text-monokai-muted">Adresse e-mail</span>
              <input
                type="email"
                name="registerEmail"
                [(ngModel)]="registerForm.email"
                class="w-full rounded-lg border border-monokai-border bg-monokai-background px-3 py-2 text-monokai-text focus:border-monokai-accent focus:outline-none"
                autocomplete="email"
                required
              />
            </label>

            <label class="block text-sm">
              <span class="mb-2 block text-monokai-muted">Mot de passe</span>
              <input
                type="password"
                name="registerPassword"
                [(ngModel)]="registerForm.password"
                class="w-full rounded-lg border border-monokai-border bg-monokai-background px-3 py-2 text-monokai-text focus:border-monokai-accent focus:outline-none"
                autocomplete="new-password"
                required
              />
            </label>
            <div
              *ngIf="authError"
              class="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {{ authError }}
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-monokai-accent px-4 py-2 text-sm font-semibold text-monokai-background transition hover:bg-monokai-yellow"
            >
              Créer mon compte
            </button>
          </form>
        </ng-container>
      </div>
    </div>
  `,
})
export class AuthModalComponent implements OnChanges {
  @Input() isAuthenticated = false;
  @Input() user: AuthUser | null = null;
  @Input() authError: string | null = null;
  @Output() login = new EventEmitter<LoginPayload>();
  @Output() register = new EventEmitter<RegisterPayload>();
  @Output() clearError = new EventEmitter<void>();

  showLoginModal = false;
  showRegisterModal = false;

  loginForm: LoginPayload = {
    username: '',
    password: '',
  };

  registerForm: RegisterPayload = {
    username: '',
    email: '',
    password: '',
  };

  get isModalOpen(): boolean {
    return this.showLoginModal || this.showRegisterModal;
  }

  openLoginModal(): void {
    this.resetForms();
    this.showRegisterModal = false;
    this.showLoginModal = true;
    this.clearError.emit();
  }

  openRegisterModal(): void {
    this.resetForms();
    this.showLoginModal = false;
    this.showRegisterModal = true;
    this.clearError.emit();
  }

  closeModals(): void {
    this.showLoginModal = false;
    this.showRegisterModal = false;
    this.clearError.emit();
  }

  submitLogin(): void {
    this.login.emit({ ...this.loginForm });
  }

  submitRegister(): void {
    this.register.emit({ ...this.registerForm });
  }

  private resetForms(): void {
    this.loginForm = { username: '', password: '' };
    this.registerForm = { username: '', email: '', password: '' };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      // Close any open modal once user becomes available (success auth)
      if (this.isModalOpen) {
        this.closeModals();
      }
    }
  }
}
