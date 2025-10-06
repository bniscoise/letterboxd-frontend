import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingStarsComponent } from '../../../../../shared/ui/rating-stars/rating-stars.component';
import { UserMovieDto } from '../../../../../core/services/user-movie.service';

@Component({
  selector: 'app-user-movie-list',
  standalone: true,
  imports: [CommonModule, RatingStarsComponent],
  templateUrl: './user-movie-list.component.html'
})
export class UserMovieListComponent {
  @Input({ required: true }) userMovies: UserMovieDto[] = [];
  @Input({ required: true }) pagedUserMovies: UserMovieDto[] = [];
  @Input() loading = false;
  @Input() reviewOpen: Record<number, boolean> = {};
  @Input() canToggleReview = false;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pageNumbers: number[] = [];

  @Output() readonly reviewToggle = new EventEmitter<number>();
  @Output() readonly viewInformation = new EventEmitter<UserMovieDto>();
  @Output() readonly deleteUserMovie = new EventEmitter<UserMovieDto>();
  @Output() readonly previousPage = new EventEmitter<void>();
  @Output() readonly nextPage = new EventEmitter<void>();
  @Output() readonly goToPage = new EventEmitter<number>();

  onToggleReview(movieId: number) {
    this.reviewToggle.emit(movieId);
  }
  onViewInformation(movie: UserMovieDto) {
    this.viewInformation.emit(movie);
  }

  onDeleteMovie(movie: UserMovieDto) {
    this.deleteUserMovie.emit(movie);
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
}
