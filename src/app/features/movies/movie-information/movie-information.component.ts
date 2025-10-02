import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MovieDto } from '../../../core/services/movie.service';

@Component({
  selector: 'app-movie-information',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-information.component.html',
  styleUrl: './movie-information.component.css'
})
export class MovieInformationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly movieId = this.route.snapshot.paramMap.get('movieId');
  readonly movie: MovieDto | null;

  constructor() {
    const navigationMovie = this.router.currentNavigation()?.extras.state?.['movie'] as MovieDto | undefined;
    const historyMovie = history.state?.['movie'] as MovieDto | undefined;
    this.movie = navigationMovie ?? historyMovie ?? null;
  }
}
