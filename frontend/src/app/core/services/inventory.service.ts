import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryItem, InventoryItemRequest } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/characters`;

  getAllByCharacter(characterId: number): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(
      `${this.base}/${characterId}/inventory-items`
    );
  }

  create(characterId: number, req: InventoryItemRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(
      `${this.base}/${characterId}/inventory-items`,
      req
    );
  }

  update(
    characterId: number,
    itemId: number,
    req: InventoryItemRequest
  ): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(
      `${this.base}/${characterId}/inventory-items/${itemId}`,
      req
    );
  }

  delete(characterId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${characterId}/inventory-items/${itemId}`
    );
  }
}
