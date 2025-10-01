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
  @Input() loading = false;
  @Input() reviewOpen: Record<number, boolean> = {};
  @Input() canToggleReview = false;

  @Output() readonly reviewToggle = new EventEmitter<number>();

  onToggleReview(movieId: number) {
    this.reviewToggle.emit(movieId);
  }
}
