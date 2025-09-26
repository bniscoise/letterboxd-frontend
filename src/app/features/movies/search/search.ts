import { Component, signal, inject } from '@angular/core';
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

  movies = signal<MovieDto[]>([]);
  loading = signal(false);
  searchPerformed = signal(false);

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
        next: results => this.movies.set(Array.isArray(results) ? results : []),
        error: () => this.movies.set([]),
      });
  }

  trackById(index: number, movie: MovieDto) {
    return movie.id;
  }
}
