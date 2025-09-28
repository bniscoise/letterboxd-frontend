import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div class="space-y-3">
        <span class="text-xs uppercase tracking-[0.3em] text-monokai-muted">Notez vos films préférés!</span>
        <h1 class="text-4xl font-semibold text-monokai-green drop-shadow">Movieboxd par Benkamin Nisçoise</h1>
        <p class="max-w-xl text-monokai-yellow/90">
          Un projet en Java Spring Boot et Angular
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-lg border border-monokai-border bg-monokai-surface px-4 py-2 text-sm font-medium transition hover:border-monokai-accent hover:text-monokai-accent"
          (click)="openLoginModal()"
        >
          Se connecter
        </button>
        <button
          type="button"
          class="rounded-lg bg-monokai-green px-4 py-2 text-sm font-semibold text-monokai-background transition hover:bg-monokai-yellow hover:text-monokai-background"
          (click)="openRegisterModal()"
        >
          Créer un compte
        </button>
      </div>
    </div>

    <div *ngIf="isModalOpen" class="fixed inset-0 z-40 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/70" (click)="closeModals()"></div>

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
export class AuthModalComponent {
  @Output() login = new EventEmitter<LoginPayload>();
  @Output() register = new EventEmitter<RegisterPayload>();

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
  }

  openRegisterModal(): void {
    this.resetForms();
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  closeModals(): void {
    this.showLoginModal = false;
    this.showRegisterModal = false;
  }

  submitLogin(): void {
    this.login.emit({ ...this.loginForm });
    this.closeModals();
  }

  submitRegister(): void {
    this.register.emit({ ...this.registerForm });
    this.closeModals();
  }

  private resetForms(): void {
    this.loginForm = { username: '', password: '' };
    this.registerForm = { username: '', email: '', password: '' };
  }
}
