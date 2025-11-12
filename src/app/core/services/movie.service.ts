import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

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
  private readonly apiUrl = `${API_BASE_URL}/movies`;

  searchMovies(query: string): Observable<MovieDto[]> {
    if (!query.trim()) {
      return of([]);
    }

    const url = `${this.apiUrl}/search?q=${encodeURIComponent(query)}`;
    return this.http.get<MovieDto[]>(url);
  }

  getMovieById(id: number): Observable<MovieDto> {
    return this.http.get<MovieDto>(`${this.apiUrl}/${id}`);
  }
}
