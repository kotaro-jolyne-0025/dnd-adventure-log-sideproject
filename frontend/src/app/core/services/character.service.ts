import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Character, CharacterRequest } from '../models/character.model';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/characters`;

  getAll(): Observable<Character[]> {
    return this.http.get<Character[]>(this.base);
  }

  getById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.base}/${id}`);
  }

  create(req: CharacterRequest): Observable<Character> {
    return this.http.post<Character>(this.base, req);
  }

  update(id: number, req: CharacterRequest): Observable<Character> {
    return this.http.put<Character>(`${this.base}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
