import { Routes } from '@angular/router';
import { SearchComponent } from './features/movies/search/search';
import { MovieInformationComponent } from './features/movies/movie-information/movie-information.component';
import { UserMoviePageComponent } from './features/movies/user-movie-page/user-movie-page.component';
import { FriendsPageComponent } from './features/social/friends/friends-page.component';
import { TrendingPageComponent } from './features/movies/trending/trending-page.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  { path: 'user/:userId', component: UserMoviePageComponent },
  { path: 'friends', component: FriendsPageComponent },
  { path: 'trending', component: TrendingPageComponent },
  { path: 'informations/:movieId', component: MovieInformationComponent },
];
