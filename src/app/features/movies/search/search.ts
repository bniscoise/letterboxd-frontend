import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap } from 'rxjs';
import { MovieService, MovieDto } from '../../../core/services/movie.service';
import { RatingStarsComponent } from '../../../shared/ui/rating-stars/rating-stars.component';
import { UserMovieDto, UserMovieService } from '../../../core/services/user-movie.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RatingStarsComponent],
  templateUrl: './search.component.html'
})
export class SearchComponent {
  queryControl = new FormControl('', { nonNullable: true });

  private readonly PAGE_SIZE = 10;

  movies = signal<MovieDto[]>([]);
  loading = signal(false);
  searchPerformed = signal(false);
  currentPage = signal(1);
  isAddModalOpen = signal(false);
  submitting = signal(false);
  submissionError = signal<string | null>(null);

  selectedMovie = signal<MovieDto | null>(null);
  modalRating = 0;
  reviewControl = new FormControl('', { nonNullable: true });
  isUserListOpen = signal(false);
  userMovies = signal<UserMovieDto[]>([]);
  reviewOpen = signal<Record<number, boolean>>({});

  pagedMovies = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.movies().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.movies().length / this.PAGE_SIZE));
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  });

  private movieService = inject(MovieService);
  private userMovieService = inject(UserMovieService);
  public authService = inject(AuthService);

  constructor() {
    this.queryControl.valueChanges
      .pipe(
        debounceTime(300), 
        distinctUntilChanged(),
        tap(() => {
          this.loading.set(true);
          this.searchPerformed.set(true);
        }),
        filter(query => query.trim().length > 0),
        switchMap(query =>
          this.movieService.searchMovies(query.trim())
            .pipe(finalize(() => this.loading.set(false)))
        )
      )
      .subscribe({
        next: results => {
          this.currentPage.set(1);
          this.movies.set(Array.isArray(results) ? results : []);
        },
        error: () => {
          this.currentPage.set(1);
          this.movies.set([]);
        }
      });
  }

  openUserMovies() {
  const user = this.authService.user();
  if (!user) return; 
  this.loading.set(true);
  this.userMovieService.getUserMovies(user.id, user.token)
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe({
      next: list => { this.userMovies.set(list ?? []); this.isUserListOpen.set(true); },
      error: () => { this.userMovies.set([]); this.isUserListOpen.set(true); }
    });
}

closeUserMovies() {
  this.isUserListOpen.set(false);
}

toggleReview(movieId: number) {
  const map = { ...this.reviewOpen() };
  map[movieId] = !map[movieId];
  this.reviewOpen.set(map);
}


  trackById(index: number, movie: MovieDto) {
    return movie.id;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  openAddModal(movie: MovieDto) {
    if (!this.authService.isAuthenticated()) {
      this.submissionError.set('Vous devez être connecté pour ajouter un film à votre liste.');
    } else {
      this.submissionError.set(null);
    }

    this.selectedMovie.set(movie);
    this.modalRating = 0;
    this.reviewControl.reset('');
    this.isAddModalOpen.set(true);
  }

  closeAddModal(force = false) {
    if (!force && this.submitting()) {
      return;
    }

    this.isAddModalOpen.set(false);
    this.selectedMovie.set(null);
    this.modalRating = 0;
    this.reviewControl.reset('');
    this.submissionError.set(null);
  }

  submitAddMovie() {
    const movie = this.selectedMovie();
    const user = this.authService.user();

    if (!movie) {
      return;
    }

    if (!user) {
      this.submissionError.set('Veuillez vous connecter pour ajouter un film.');
      return;
    }

    if (this.submitting()) {
      return;
    }

    this.submissionError.set(null);
    this.submitting.set(true);

    const ratingValue = this.modalRating > 0 ? this.modalRating : null;
    const reviewValue = this.reviewControl.value.trim();

    this.userMovieService
      .addOrUpdateUserMovie(
        user.id,
        movie.id,
        ratingValue,
        reviewValue.length > 0 ? reviewValue : null,
        user.token
      )
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.closeAddModal(true);
        },
        error: (error) => {
          console.error('Failed to add movie for user', error);
          this.submissionError.set('Une erreur est survenue lors de l\'ajout du film. Veuillez réessayer.');
        },
      });
  }
}
