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

  getAllByCharacter(characterId: number): Observable<AdventureEntry[]> {
    return this.http.get<AdventureEntry[]>(
      `${this.base}/${characterId}/adventure-entries`
    );
  }

  getById(characterId: number, entryId: number): Observable<AdventureEntry> {
    return this.http.get<AdventureEntry>(
      `${this.base}/${characterId}/adventure-entries/${entryId}`
    );
  }

  create(characterId: number, req: AdventureEntryRequest): Observable<AdventureEntry> {
    return this.http.post<AdventureEntry>(
      `${this.base}/${characterId}/adventure-entries`,
      req
    );
  }

  update(
    characterId: number,
    entryId: number,
    req: AdventureEntryRequest
  ): Observable<AdventureEntry> {
    return this.http.put<AdventureEntry>(
      `${this.base}/${characterId}/adventure-entries/${entryId}`,
      req
    );
  }

  delete(characterId: number, entryId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${characterId}/adventure-entries/${entryId}`
    );
  }

  // ── DowntimeActivity ────────────────────────────────────────────────────

  addDowntime(entryId: number, req: DowntimeActivityRequest): Observable<DowntimeActivity> {
    return this.http.post<DowntimeActivity>(
      `${environment.apiUrl}/adventure-entries/${entryId}/downtime-activities`,
      req
    );
  }

  deleteDowntime(entryId: number, downtimeId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/adventure-entries/${entryId}/downtime-activities/${downtimeId}`
    );
  }
}
