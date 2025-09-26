import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from './features/movies/search/search';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SearchComponent],
  template: `
    <div class="min-h-screen bg-monokai-background">
      <div class="mx-auto max-w-5xl px-4 py-12 space-y-10">
        <header class="space-y-3">
          <span class="text-xs uppercase tracking-[0.3em] text-monokai-muted">Notez vos films préférés!</span>
          <h1 class="text-4xl font-semibold text-monokai-green drop-shadow">Movieboxd par Benjamin Nisçoise</h1>
          <p class="text-monokai-yellow/90 max-w-xl">
            Un projet en Java Spring Boot et Angular
          </p>
        </header>

        <section class="rounded-xl border border-monokai-border bg-monokai-surface-highlight/80 p-6 shadow-monokai">
          <app-search></app-search>
        </section>
      </div>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class App {}
