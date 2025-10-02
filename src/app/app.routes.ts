import { Routes } from '@angular/router';
import { SearchComponent } from './features/movies/search/search';
import { MovieInformationComponent } from './features/movies/movie-information/movie-information.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  { path: 'informations/:movieId', component: MovieInformationComponent }
];
