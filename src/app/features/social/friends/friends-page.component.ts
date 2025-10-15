import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  tap,
  of,
  catchError,
  map,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserDto, UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  UserMovieListComponent,
  UserMovieSort,
} from '../../movies/search/components/user-movie-list/user-movie-list.component';
import { UserMovieDto, UserMovieService } from '../../../core/services/user-movie.service';
import { PaginationService } from '../../../core/services/pagination.service';
import { Router } from '@angular/router';
import { MovieDto, MovieService } from '../../../core/services/movie.service';

@Component({
  selector: 'app-friends-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserMovieListComponent],
  templateUrl: './friends-page.component.html',
  styleUrls: ['./friends-page.component.css'],
})
export class FriendsPageComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userMovieService = inject(UserMovieService);
  private readonly pagination = inject(PaginationService);
  private readonly movieService = inject(MovieService);
  private readonly router = inject(Router);

  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly searchResults = signal<UserDto[]>([]);
  readonly loadingSearch = signal(false);
  readonly searchPerformed = signal(false);
  readonly searchError = signal<string | null>(null);
  readonly selectedUser = signal<UserDto | null>(null);
  readonly lastQuery = signal('');
  readonly followingUsers = signal<UserDto[]>([]);
  readonly followMutationLoading = signal(false);
  readonly followError = signal<string | null>(null);
  readonly followingLoading = signal(false);
  readonly followingError = signal<string | null>(null);

  readonly selectedUserIsFollowed = computed(() => {
    const selected = this.selectedUser();
    if (!selected) {
      return false;
    }

    return this.followingUsers().some((user) => user.id === selected.id);
  });
  readonly canFollowSelectedUser = computed(() => {
    const viewer = this.currentUser();
    const selected = this.selectedUser();
    if (!viewer || !selected) {
      return false;
    }

    return viewer.id !== selected.id;
  });
  readonly selectedUserIsCurrent = computed(() => {
    const viewer = this.currentUser();
    const selected = this.selectedUser();
    if (!viewer || !selected) {
      return false;
    }

    return viewer.id === selected.id;
  });

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentUser = this.authService.user;

  private readonly PAGE_SIZE = 10;

  readonly selectedUserMovies = signal<UserMovieDto[]>([]);
  readonly moviesLoading = signal(false);
  readonly moviesError = signal<string | null>(null);
  readonly reviewOpen = signal<Record<number, boolean>>({});
  readonly sortMode = signal<UserMovieSort>(UserMovieSort.Original);
  readonly currentPage = signal(1);

  readonly sortedUserMovies = computed(() => {
    const movies = this.selectedUserMovies();
    const mode = this.sortMode();

    if (!movies.length || mode === UserMovieSort.Original) {
      return movies;
    }

    const copy = [...movies];

    if (mode === UserMovieSort.RatingAsc) {
      return copy.sort((a, b) => {
        const ratingA = typeof a.rating === 'number' ? a.rating : Number.POSITIVE_INFINITY;
        const ratingB = typeof b.rating === 'number' ? b.rating : Number.POSITIVE_INFINITY;
        return ratingA - ratingB;
      });
    }

    if (mode === UserMovieSort.RatingDesc) {
      return copy.sort((a, b) => {
        const ratingA = typeof a.rating === 'number' ? a.rating : Number.NEGATIVE_INFINITY;
        const ratingB = typeof b.rating === 'number' ? b.rating : Number.NEGATIVE_INFINITY;
        return ratingB - ratingA;
      });
    }

    return copy;
  });

  readonly pagedUserMovies = computed(() =>
    this.pagination.paginate(this.sortedUserMovies(), this.currentPage(), this.PAGE_SIZE),
  );

  readonly totalPages = computed(() =>
    this.pagination.totalPages(this.sortedUserMovies().length, this.PAGE_SIZE),
  );

  readonly pageNumbers = computed(() => this.pagination.pageNumbers(this.totalPages()));

  readonly canToggleReview = computed(() =>
    this.selectedUserMovies().some((movie) => (movie.review ?? '').trim().length > 0),
  );

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.loadFollowingList(user.id, user.token);
      } else {
        this.followingUsers.set([]);
        this.followingError.set(null);
        this.followingLoading.set(false);
      }
    });

    this.searchControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((value) => value.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => {
          this.lastQuery.set(query);

          if (!query) {
            this.resetSearchState();
            return;
          }

          if (query.length < 2) {
            this.searchPerformed.set(true);
            this.loadingSearch.set(false);
            this.searchResults.set([]);
            this.searchError.set(null);
          }
        }),
        switchMap((query) => {
          if (!query || query.length < 2) {
            return of<UserDto[]>([]);
          }

          this.loadingSearch.set(true);
          this.searchPerformed.set(true);
          this.searchError.set(null);

          return this.userService.searchUsers(query).pipe(
            catchError(() => {
              this.searchError.set('Impossible de rechercher des utilisateurs pour le moment.');
              return of<UserDto[]>([]);
            }),
            finalize(() => this.loadingSearch.set(false)),
          );
        }),
      )
      .subscribe((users) => {
        this.searchResults.set(users ?? []);
      });
  }

  onSelectUser(user: UserDto) {
    this.selectedUser.set(user);
    this.followError.set(null);
    this.sortMode.set(UserMovieSort.Original);
    this.reviewOpen.set({});
    this.currentPage.set(1);
    this.loadUserMovies(user.id);
  }

  private resetSearchState() {
    this.loadingSearch.set(false);
    this.searchResults.set([]);
    this.searchPerformed.set(false);
    this.searchError.set(null);
  }

  private loadUserMovies(userId: number) {
    this.moviesLoading.set(true);
    this.moviesError.set(null);
    this.userMovieService
      .getUserMovies(userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.moviesLoading.set(false)),
      )
      .subscribe({
        next: (movies) => {
          this.selectedUserMovies.set(movies ?? []);
          this.reviewOpen.set({});
          this.syncCurrentPage();
        },
        error: () => {
          this.selectedUserMovies.set([]);
          this.moviesError.set("Impossible de charger la liste de cet utilisateur pour le moment.");
        },
      });
  }

  toggleReview(movieId: number) {
    const current = { ...this.reviewOpen() };
    current[movieId] = !current[movieId];
    this.reviewOpen.set(current);
  }

  onSortChange(mode: UserMovieSort) {
    this.sortMode.set(mode);
    this.currentPage.set(1);
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

  viewUserMovieInformation(userMovie: UserMovieDto) {
    const movieId = userMovie.movieId;
    if (movieId == null) {
      return;
    }

    this.movieService
      .getMovieById(movieId)
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  followSelectedUser() {
    const viewer = this.currentUser();
    const target = this.selectedUser();

    if (!viewer || !target || viewer.id === target.id) {
      return;
    }

    if (this.selectedUserIsFollowed()) {
      this.unfollowSelectedUser();
      return;
    }

    this.followMutationLoading.set(true);
    this.followError.set(null);

    this.userService
      .followUser(viewer.id, target.id, viewer.token)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.followMutationLoading.set(false)),
      )
      .subscribe({
        next: (followedUser) => {
          this.followingUsers.update((list) => {
            if (list.some((user) => user.id === followedUser.id)) {
              return list;
            }
            return [...list, followedUser].sort((a, b) => a.username.localeCompare(b.username));
          });
        },
        error: () => {
          this.followError.set("Impossible de suivre cet utilisateur pour le moment.");
        },
      });
  }

  unfollowSelectedUser() {
    const viewer = this.currentUser();
    const target = this.selectedUser();

    if (!viewer || !target || viewer.id === target.id) {
      return;
    }

    this.followMutationLoading.set(true);
    this.followError.set(null);

    this.userService
      .unfollowUser(viewer.id, target.id, viewer.token)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.followMutationLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.followingUsers.update((list) =>
            list.filter((user) => user.id !== target.id),
          );
        },
        error: () => {
          this.followError.set("Impossible d'arrêter de suivre cet utilisateur pour le moment.");
        },
      });
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

  private loadFollowingList(userId: number, token: string) {
    this.followingLoading.set(true);
    this.followingError.set(null);

    this.userService
      .getFollowingUsers(userId, token)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.followingLoading.set(false)),
      )
      .subscribe({
        next: (users) => {
          const sorted = (users ?? []).slice().sort((a, b) =>
            a.username.localeCompare(b.username),
          );
          this.followingUsers.set(sorted);
        },
        error: () => {
          this.followingUsers.set([]);
          this.followingError.set("Impossible de récupérer vos suivis pour le moment.");
        },
      });
  }
}
