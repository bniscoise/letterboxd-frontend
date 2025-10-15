import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecentTrendingMovie {
  movieId: number;
  title: string;
  posterUrl: string | null;
  rating: number | null;
  ratedAt: string;
  ratedBy: string;
}

export interface TopTrendingMovie {
  movieId: number;
  title: string;
  posterUrl: string | null;
  averageRating: number;
  ratingCount: number;
}

@Injectable({ providedIn: 'root' })
export class TrendingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/trending';

  getLatestRatings(): Observable<RecentTrendingMovie[]> {
    return this.http.get<RecentTrendingMovie[]>(`${this.baseUrl}/latest`);
  }

  getTopRated(): Observable<TopTrendingMovie[]> {
    return this.http.get<TopTrendingMovie[]>(`${this.baseUrl}/top`);
  }
}
