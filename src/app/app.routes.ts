import { Routes } from '@angular/router';
import { SearchComponent } from './features/movies/search/search';
import { MovieInformationComponent } from './features/movies/movie-information/movie-information.component';
import { UserMoviePageComponent } from './features/movies/user-movie-page/user-movie-page.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  { path: 'user/:userId', component: UserMoviePageComponent },
  { path: 'informations/:movieId', component: MovieInformationComponent }
];
