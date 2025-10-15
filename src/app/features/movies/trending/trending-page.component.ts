import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import {
  RecentTrendingMovie,
  TopTrendingMovie,
  TrendingService,
} from '../../../core/services/trending.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-trending-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './trending-page.component.html',
  styleUrls: ['./trending-page.component.css'],
})
export class TrendingPageComponent {
  private readonly trendingService = inject(TrendingService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly latestMovies = signal<RecentTrendingMovie[]>([]);
  readonly latestLoading = signal(false);
  readonly latestError = signal<string | null>(null);

  readonly topMovies = signal<TopTrendingMovie[]>([]);
  readonly topLoading = signal(false);
  readonly topError = signal<string | null>(null);

  constructor() {
    this.loadLatest();
    this.loadTop();
  }

  viewMovie(movieId: number, title: string, posterUrl: string | null) {
    if (!movieId) {
      return;
    }

    this.router.navigate(['informations', movieId], {
      state: {
        movie: {
          id: movieId,
          primaryTitle: title,
          posterUrl: posterUrl ?? undefined,
        },
      },
    });
  }

  protected loadLatest() {
    this.latestLoading.set(true);
    this.latestError.set(null);

    this.trendingService
      .getLatestRatings()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.latestLoading.set(false)),
      )
      .subscribe({
        next: (movies) => this.latestMovies.set(movies ?? []),
        error: () => {
          this.latestMovies.set([]);
          this.latestError.set('Impossible de récupérer les dernières notes pour le moment.');
        },
      });
  }

  protected loadTop() {
    this.topLoading.set(true);
    this.topError.set(null);

    this.trendingService
      .getTopRated()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.topLoading.set(false)),
      )
      .subscribe({
        next: (movies) => this.topMovies.set(movies ?? []),
        error: () => {
          this.topMovies.set([]);
          this.topError.set('Impossible de récupérer les films les mieux notés pour le moment.');
        },
      });
  }
}
