import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserMovieDto {
  movieId: number;
  movieTitle: string;
  rating: number | null;
  review: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserMovieService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/user-movies';

  addOrUpdateUserMovie(
    userId: number,
    movieId: number,
    rating: number | null,
    review: string | null,
    token?: string
  ): Observable<UserMovieDto> {
    let params = new HttpParams();
    if (rating !== null && rating !== undefined) {
      params = params.set('rating', rating.toString());
    }
    if (review) {
      params = params.set('review', review);
    }

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.post<UserMovieDto>(
      `${this.baseUrl}/${userId}/${movieId}`,
      null,
      { params, headers }
    );
  }
  
  getUserMovies(userId: number, token?: string) {
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  return this.http.get<UserMovieDto[]>(`${this.baseUrl}/${userId}`, { headers });
  }

  deleteUserMovie(userId: number, movieId: number, token?: string) {
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.delete<void>(`${this.baseUrl}/${userId}/${movieId}`, { headers });
  }
}
