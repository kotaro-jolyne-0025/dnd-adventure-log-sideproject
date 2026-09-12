import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryItem, InventoryItemRequest } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/characters`;

  // 後端路徑：/api/characters/{id}/inventory

  getAllByCharacter(characterId: string): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(
      `${this.base}/${characterId}/inventory`
    );
  }

  create(characterId: string, req: InventoryItemRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(
      `${this.base}/${characterId}/inventory`,
      req
    );
  }

  update(
    characterId: string,
    itemId: string,
    req: InventoryItemRequest
  ): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(
      `${this.base}/${characterId}/inventory/${itemId}`,
      req
    );
  }

  delete(characterId: string, itemId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${characterId}/inventory/${itemId}`
    );
  }
}
