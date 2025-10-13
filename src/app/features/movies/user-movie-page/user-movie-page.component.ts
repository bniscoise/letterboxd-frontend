import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { UserMovieDto, UserMovieService } from '../../../core/services/user-movie.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaginationService } from '../../../core/services/pagination.service';
import {
  UserMovieListComponent,
  UserMovieSort,
} from '../search/components/user-movie-list/user-movie-list.component';
import { MovieDto, MovieService } from '../../../core/services/movie.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-movie-page',
  standalone: true,
  imports: [CommonModule, RouterModule, UserMovieListComponent],
  templateUrl: './user-movie-page.component.html',
  styleUrls: ['./user-movie-page.component.css'],
})
export class UserMoviePageComponent {
  private readonly PAGE_SIZE = 10;

  private readonly route = inject(ActivatedRoute);
  private readonly userMovieService = inject(UserMovieService);
  public readonly authService = inject(AuthService);
  private readonly pagination = inject(PaginationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly movieService = inject(MovieService);
  private readonly userService = inject(UserService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly userMovies = signal<UserMovieDto[]>([]);
  readonly currentPage = signal(1);
  readonly reviewOpen = signal<Record<number, boolean>>({});
  readonly viewingUserId = signal<number | null>(null);
  readonly viewingUsername = signal<string | null>(null);
  readonly sortMode = signal<UserMovieSort>(UserMovieSort.Original);

  readonly isOwner = computed(() => {
    const authUser = this.authService.user();
    const target = this.viewingUserId();
    return !!authUser && target !== null && authUser.id === target;
  });

  readonly canToggleReview = computed(() =>
    this.userMovies().some((movie) => (movie.review ?? '').trim().length > 0),
  );

  readonly reviewButtonLabel = computed(() =>
    this.isOwner() ? 'Voir votre review' : 'Voir la review',
  );

  readonly sortedUserMovies = computed(() => {
    const movies = this.userMovies();
    const mode = this.sortMode();

    if (!movies.length || mode === UserMovieSort.Original) {
      return movies;
    }

    const clone = [...movies];

    if (mode === UserMovieSort.RatingAsc) {
      return clone.sort((a, b) => {
        const ratingA = typeof a.rating === 'number' ? a.rating : Number.POSITIVE_INFINITY;
        const ratingB = typeof b.rating === 'number' ? b.rating : Number.POSITIVE_INFINITY;
        return ratingA - ratingB;
      });
    }

    if (mode === UserMovieSort.RatingDesc) {
      return clone.sort((a, b) => {
        const ratingA = typeof a.rating === 'number' ? a.rating : Number.NEGATIVE_INFINITY;
        const ratingB = typeof b.rating === 'number' ? b.rating : Number.NEGATIVE_INFINITY;
        return ratingB - ratingA;
      });
    }

    return clone;
  });

  readonly pagedUserMovies = computed(() =>
    this.pagination.paginate(this.sortedUserMovies(), this.currentPage(), this.PAGE_SIZE),
  );

  readonly totalPages = computed(() =>
    this.pagination.totalPages(this.sortedUserMovies().length, this.PAGE_SIZE),
  );

  readonly pageNumbers = computed(() => this.pagination.pageNumbers(this.totalPages()));

  constructor() {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((params) => Number(params.get('userId'))),
        tap((userId) => {
          if (!Number.isFinite(userId)) {
            this.error.set('Utilisateur introuvable.');
            this.userMovies.set([]);
            this.viewingUserId.set(null);
            this.viewingUsername.set(null);
          }
        }),
        switchMap((userId) => {
          if (!Number.isFinite(userId)) {
            return of<{ list: UserMovieDto[]; username: string | null } | null>(null);
          }

          const safeId = Math.floor(userId);
          this.viewingUserId.set(safeId);
          this.viewingUsername.set(null);
          this.loading.set(true);
          this.error.set(null);

          const list$ = this.userMovieService.getUserMovies(safeId).pipe(
            catchError(() => {
              this.error.set('Impossible de récupérer cette liste.');
              return of<UserMovieDto[]>([]);
            }),
          );

          const user$ = this.userService.getUserById(safeId).pipe(
            map((user) => user.username),
            catchError(() => of<string | null>(null)),
          );

          return forkJoin({ list: list$, username: user$ }).pipe(
            finalize(() => this.loading.set(false)),
          );
        }),
      )
      .subscribe((result) => {
        if (result === null) {
          return;
        }

        const { list, username } = result;

        this.viewingUsername.set(username);
        this.userMovies.set(list ?? []);
        this.reviewOpen.set({});
        this.sortMode.set(UserMovieSort.Original);
        this.currentPage.set(1);
        this.syncCurrentPage();
      });
  }

  toggleReview(movieId: number) {
    const next = { ...this.reviewOpen() };
    next[movieId] = !next[movieId];
    this.reviewOpen.set(next);
  }

  goToPage(page: number) {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.currentPage.set(page);
    }
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  onSortChange(mode: UserMovieSort) {
    this.sortMode.set(mode);
    this.currentPage.set(1);
  }

  deleteUserMovie(userMovie: UserMovieDto) {
    if (!this.isOwner()) {
      return;
    }

    const authUser = this.authService.user();
    if (!authUser) {
      return;
    }

    this.loading.set(true);
    this.userMovieService
      .deleteUserMovie(authUser.id, userMovie.movieId, authUser.token)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.userMovies.update((list) =>
            list.filter((movie) => movie.movieId !== userMovie.movieId),
          );

          this.reviewOpen.update((map) => {
            const copy = { ...map };
            delete copy[userMovie.movieId];
            return copy;
          });

          this.error.set(null);
          this.syncCurrentPage();
        },
        error: () => {
          this.error.set('Impossible de supprimer ce film pour le moment.');
        },
      });
  }

  viewUserMovieInformation(userMovie: UserMovieDto) {
    const movieId = userMovie.movieId;
    if (movieId == null) {
      return;
    }

    this.loading.set(true);

    this.movieService
      .getMovieById(movieId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (movie) => {
          const payload = movie ?? this.buildFallbackMovie(movieId, userMovie);
          this.router.navigate(['informations', movieId], {
            state: { movie: payload },
          });
        },
        error: () => {
          this.router.navigate(['informations', movieId], {
            state: { movie: this.buildFallbackMovie(movieId, userMovie) },
          });
        },
      });
  }

  navigateBackToSearch() {
    this.router.navigate(['search']);
  }

  private syncCurrentPage() {
    const adjusted = this.pagination.clampPage(
      this.currentPage(),
      this.sortedUserMovies().length,
      this.PAGE_SIZE,
    );

    if (adjusted !== this.currentPage()) {
      this.currentPage.set(adjusted);
    }
  }

  private buildFallbackMovie(movieId: number, userMovie: UserMovieDto): MovieDto {
    return {
      id: movieId,
      primaryTitle: userMovie.movieTitle,
      posterUrl: userMovie.posterUrl ?? undefined,
    };
  }

  onOpenUserMovies() {
    const user = this.authService.user();
    if (!user) {
      return;
    }
    this.router.navigate(['/user', user.id]);
  }
}
