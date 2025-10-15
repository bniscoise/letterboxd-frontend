import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingStarsComponent } from '../../../../../shared/ui/rating-stars/rating-stars.component';
import { UserMovieDto } from '../../../../../core/services/user-movie.service';

export enum UserMovieSort {
  Original = 'original',
  RatingAsc = 'ratingAsc',
  RatingDesc = 'ratingDesc',
}

@Component({
  selector: 'app-user-movie-list',
  standalone: true,
  imports: [CommonModule, RatingStarsComponent],
  templateUrl: './user-movie-list.component.html',
})
export class UserMovieListComponent implements OnChanges {
  @Input({ required: true }) userMovies: UserMovieDto[] = [];
  @Input({ required: true }) pagedUserMovies: UserMovieDto[] = [];
  @Input() loading = false;
  @Input() reviewOpen: Record<number, boolean> = {};
  @Input() canToggleReview = false;
  @Input() canDelete = false;
  @Input() reviewButtonLabel = 'Voir la review';
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pageNumbers: number[] = [];
  @Input() sortMode: UserMovieSort = UserMovieSort.Original;

  @Output() readonly reviewToggle = new EventEmitter<number>();
  @Output() readonly viewInformation = new EventEmitter<UserMovieDto>();
  @Output() readonly deleteUserMovie = new EventEmitter<UserMovieDto>();
  @Output() readonly previousPage = new EventEmitter<void>();
  @Output() readonly nextPage = new EventEmitter<void>();
  @Output() readonly goToPage = new EventEmitter<number>();
  @Output() readonly sortChange = new EventEmitter<UserMovieSort>();

  readonly UserMovieSort = UserMovieSort;

  displayedPagedMovies: UserMovieDto[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pagedUserMovies']) {
      this.displayedPagedMovies = [...(this.pagedUserMovies ?? [])];
    }

    if (changes['userMovies'] && !changes['pagedUserMovies']) {
      this.displayedPagedMovies = [...(this.pagedUserMovies ?? [])];
    }
  }

  onSortChange(mode: UserMovieSort): void {
    if (this.sortMode === mode) {
      return;
    }

    this.sortChange.emit(mode);
  }

  onToggleReview(movieId: number) {
    this.reviewToggle.emit(movieId);
  }
  onViewInformation(movie: UserMovieDto) {
    this.viewInformation.emit(movie);
  }

  onDeleteMovie(movie: UserMovieDto) {
    if (this.canDelete) {
      this.deleteUserMovie.emit(movie);
    }
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
