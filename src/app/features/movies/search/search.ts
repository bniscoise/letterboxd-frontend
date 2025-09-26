import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap } from 'rxjs';
import { MovieService, MovieDto } from '../../../core/services/movie.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html'
})
export class SearchComponent {
  queryControl = new FormControl('', { nonNullable: true });

  private readonly pageSize = 10;

  movies = signal<MovieDto[]>([]);
  loading = signal(false);
  searchPerformed = signal(false);
  currentPage = signal(1);

  pagedMovies = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.movies().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.movies().length / this.pageSize));
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  });

  private movieService = inject(MovieService);

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
}
