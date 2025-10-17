import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface UserDto {
  id: number;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://movieboxd-backend-2sw9.onrender.com/api/users';

  getUserById(userId: number, token?: string): Observable<UserDto> {
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.get<UserDto>(`${this.baseUrl}/${userId}`, { headers });
  }

  searchUsers(query: string): Observable<UserDto[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<UserDto[]>(`${this.baseUrl}/search`, { params });
  }

  followUser(userId: number, targetUserId: number, token?: string): Observable<UserDto> {
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post<UserDto>(`${this.baseUrl}/${userId}/follow/${targetUserId}`, null, {
      headers,
    });
  }

  unfollowUser(userId: number, targetUserId: number, token?: string) {
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete<void>(`${this.baseUrl}/${userId}/follow/${targetUserId}`, {
      headers,
    });
  }

  getFollowingUsers(userId: number, token?: string): Observable<UserDto[]> {
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<UserDto[]>(`${this.baseUrl}/${userId}/following`, { headers });
  }
}
