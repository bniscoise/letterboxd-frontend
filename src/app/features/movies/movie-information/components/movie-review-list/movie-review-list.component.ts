import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RatingStarsComponent } from '../../../../../shared/ui/rating-stars/rating-stars.component';
import { UserMovieDto } from '../../../../../core/services/user-movie.service';

@Component({
  selector: 'app-movie-review-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingStarsComponent],
  templateUrl: './movie-review-list.component.html',
  styleUrls: ['./movie-review-list.component.css'],
})
export class MovieReviewListComponent {
  @Input() reviews: UserMovieDto[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
}
