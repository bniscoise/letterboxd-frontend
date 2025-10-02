import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDto } from '../../../../../core/services/movie.service';

@Component({
  selector: 'app-movie-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-results.component.html'
})
export class MovieResultsComponent {
  @Input() loading = false;
  @Input() searchPerformed = false;
  @Input() query = '';
  @Input({ required: true }) movies: MovieDto[] = [];
  @Input({ required: true }) pagedMovies: MovieDto[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pageNumbers: number[] = [];

  @Output() readonly addMovie = new EventEmitter<MovieDto>();
  @Output() readonly previousPage = new EventEmitter<void>();
  @Output() readonly nextPage = new EventEmitter<void>();
  @Output() readonly goToPage = new EventEmitter<number>();
  @Output() readonly viewInformation = new EventEmitter<MovieDto>();

  trackById(index: number, movie: MovieDto) {
    return movie.id;
  }

  onAddMovie(movie: MovieDto) {
    this.addMovie.emit(movie);
  }

  onPreviousPage() {
    this.previousPage.emit();
  }

  onNextPage() {
    this.nextPage.emit();
  }

  onGoToPage(page: number) {
    this.goToPage.emit(page);
  }

  onViewInformation(movie: MovieDto) {
    this.viewInformation.emit(movie);
  }
}
