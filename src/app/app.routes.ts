import { Routes } from '@angular/router';
import { redirectIfAuthenticatedGuard } from './core/guards/redirect-if-authenticated.guard';
import { requireAuthGuard } from './core/guards/require-auth.guard';
import { LandingPageComponent } from './home/landing-page/landing-page.component';
import { SearchComponent } from './features/movies/search/search';
import { MovieInformationComponent } from './features/movies/movie-information/movie-information.component';
import { UserMoviePageComponent } from './features/movies/user-movie-page/user-movie-page.component';
import { FriendsPageComponent } from './features/social/friends/friends-page.component';
import { TrendingPageComponent } from './features/movies/trending/trending-page.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    canActivate: [redirectIfAuthenticatedGuard],
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [requireAuthGuard],
  },
  {
    path: 'user/:userId',
    component: UserMoviePageComponent,
    canActivate: [requireAuthGuard],
  },
  {
    path: 'friends',
    component: FriendsPageComponent,
    canActivate: [requireAuthGuard],
  },
  {
    path: 'trending',
    component: TrendingPageComponent,
    canActivate: [requireAuthGuard],
  },
  {
    path: 'informations/:movieId',
    component: MovieInformationComponent,
    canActivate: [requireAuthGuard],
  },
];
