import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdventureEntry,
  AdventureEntryRequest,
  DowntimeActivity,
  DowntimeActivityRequest,
} from '../models/adventure.model';

@Injectable({ providedIn: 'root' })
export class AdventureService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/characters`;

  // ── AdventureEntry ───────────────────────────────────────────────────────
  // 後端路徑：/api/characters/{id}/entries

  getAllByCharacter(characterId: string): Observable<AdventureEntry[]> {
    return this.http.get<AdventureEntry[]>(
      `${this.base}/${characterId}/entries`
    );
  }

  getById(characterId: string, entryId: string): Observable<AdventureEntry> {
    return this.http.get<AdventureEntry>(
      `${environment.apiUrl}/entries/${entryId}`
    );
  }

  create(characterId: string, req: AdventureEntryRequest): Observable<AdventureEntry> {
    return this.http.post<AdventureEntry>(
      `${this.base}/${characterId}/entries`,
      req
    );
  }

  update(
    characterId: string,
    entryId: string,
    req: AdventureEntryRequest
  ): Observable<AdventureEntry> {
    return this.http.put<AdventureEntry>(
      `${environment.apiUrl}/entries/${entryId}`,
      req
    );
  }

  delete(characterId: string, entryId: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/entries/${entryId}`
    );
  }

  // ── DowntimeActivity ────────────────────────────────────────────────────
  // 後端路徑：/api/entries/{entryId}/downtime-activities

  addDowntime(entryId: string, req: DowntimeActivityRequest): Observable<DowntimeActivity> {
    return this.http.post<DowntimeActivity>(
      `${environment.apiUrl}/entries/${entryId}/downtime-activities`,
      req
    );
  }

  deleteDowntime(entryId: string, downtimeId: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/downtime-activities/${downtimeId}`
    );
  }
}
