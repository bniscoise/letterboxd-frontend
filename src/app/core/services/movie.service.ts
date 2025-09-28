import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface MovieDto {
  id: number;
  primaryTitle: string;
  originalTitle?: string;
  startYear?: number;
  posterUrl?: string;
  aggregateRating?: number;
  voteCount?: number;
}


@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/movies';

  searchMovies(query: string): Observable<MovieDto[]> {
    if (!query.trim()) {
      return of([]);
    }

    const url = `${this.apiUrl}/search?q=${encodeURIComponent(query)}`;
    return this.http.get<MovieDto[]>(url);
  }
}
