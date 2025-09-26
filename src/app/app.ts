import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModalComponent, LoginPayload, RegisterPayload } from './features/auth/auth-modal/auth-modal.component';
import { SearchComponent } from './features/movies/search/search';

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
  onLogin(payload: LoginPayload): void {
    // TODO: connecter au backend d'authentification
    console.debug('Login submitted', payload);
  }

  onRegister(payload: RegisterPayload): void {
    // TODO: appeler l\'API d\'inscription
    console.debug('Register submitted', payload);
  }
}
