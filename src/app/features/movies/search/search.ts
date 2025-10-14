import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap } from 'rxjs';
import { MovieService, MovieDto } from '../../../core/services/movie.service';
import { AuthService } from '../../../core/services/auth.service';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { MovieResultsComponent } from './components/movie-results/movie-results.component';
import { Router } from '@angular/router';
import { PaginationService } from '../../../core/services/pagination.service';
import { UserMovieAddModalComponent } from '../shared/user-movie-add-modal/user-movie-add-modal.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchBarComponent,
    MovieResultsComponent,
    UserMovieAddModalComponent
  ],
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
  selectedMovie = signal<MovieDto | null>(null);
  pagedMovies = computed(() => {
    return this.pagination.paginate(this.movies(), this.currentPage(), this.PAGE_SIZE);
  });

  totalPages = computed(() => {
    return this.pagination.totalPages(this.movies().length, this.PAGE_SIZE);
  });

  pageNumbers = computed(() => {
    return this.pagination.pageNumbers(this.totalPages());
  });

  private movieService = inject(MovieService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private pagination = inject(PaginationService);

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
    if (!user) {
      return;
    }

    this.router.navigate(['/user', user.id]);
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
    this.selectedMovie.set(movie);
    this.isAddModalOpen.set(true);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
    this.selectedMovie.set(null);
  }

  handleModalSubmitted() {
    this.closeAddModal();
  }

  viewMovieInformation(movie: MovieDto) {
    const movieId = movie.id;
    if (movieId == null) {
      return;
    }

    this.router.navigate(['informations', movieId], {
      state: { movie }
    });
  }
}
