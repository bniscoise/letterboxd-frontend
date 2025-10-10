import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserMovieDto, UserMovieService } from '../../../core/services/user-movie.service';
import { MovieDto } from '../../../core/services/movie.service';
import { MovieReviewListComponent } from './components/movie-review-list/movie-review-list.component';

@Component({
  selector: 'app-movie-information',
  standalone: true,
  imports: [CommonModule, RouterLink, MovieReviewListComponent],
  templateUrl: './movie-information.component.html',
  styleUrl: './movie-information.component.css'
})
export class MovieInformationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userMovieService = inject(UserMovieService);

  readonly movieId = Number(this.route.snapshot.paramMap.get('movieId'));
  readonly movie =
    (this.router.currentNavigation()?.extras.state?.['movie'] ?? history.state?.['movie']) as
      | MovieDto
      | undefined ?? null;


  readonly loadingReviews = signal(true);
  readonly reviews = signal<UserMovieDto[]>([]);
  readonly loadError = signal<string | null>(null);
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly currentUser = this.authService.user;

  constructor() {
    // movie déjà récupéré
    if (!Number.isFinite(this.movieId)) {
      this.loadingReviews.set(false);
      this.loadError.set('Identifiant de film invalide.');
      return;
    }

    this.userMovieService.getMovieReviews(this.movieId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loadingReviews.set(false);
      },
      error: () => {
        this.loadError.set('Impossible de charger les critiques.');
        this.loadingReviews.set(false);
      }
    });
  }

  onOpenUserMovies(): void {
    const user = this.currentUser();
    if (!user) {
      return;
    }
    this.router.navigate(['/user', user.id]);
  }
}
