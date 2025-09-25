import { Routes } from '@angular/router';
import { SearchComponent } from './features/movies/search/search';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
];
