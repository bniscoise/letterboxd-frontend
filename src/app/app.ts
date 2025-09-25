import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from './features/movies/search/search';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SearchComponent],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6">Letterboxd</h1>
      <app-search></app-search>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class App {}