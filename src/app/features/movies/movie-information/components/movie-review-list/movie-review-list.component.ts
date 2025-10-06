import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingStarsComponent } from '../../../../../shared/ui/rating-stars/rating-stars.component';
import { UserMovieDto } from '../../../../../core/services/user-movie.service';

@Component({
  selector: 'app-movie-review-list',
  imports: [CommonModule, RatingStarsComponent],
  templateUrl: './movie-review-list.component.html',
  styleUrl: './movie-review-list.component.css'
})
export class MovieReviewListComponent {
  @Input() reviews: UserMovieDto[] = [];;
  @Input() loading = false
  

}
