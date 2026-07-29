import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from '../../../core/services/inventory.service';
import {
  InventoryItem,
  ItemType,
  ITEM_RARITY_LABELS,
  RARITY_COLORS,
} from '../../../core/models/inventory.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss',
})
export class InventoryListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly inventoryService = inject(InventoryService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected allItems = signal<InventoryItem[]>([]);
  protected isLoading = signal(true);
  protected activeTab = signal(0); // 0=PERMANENT, 1=CONSUMABLE
  protected characterId!: string;

  protected permanentItems = computed(() =>
    this.allItems().filter((i) => i.itemType === 'PERMANENT')
  );
  protected consumableItems = computed(() =>
    this.allItems().filter((i) => i.itemType === 'CONSUMABLE')
  );

  readonly rarityLabels = ITEM_RARITY_LABELS;
  readonly rarityColors = RARITY_COLORS;

  ngOnInit(): void {
    this.characterId =
      this.route.parent?.snapshot.paramMap.get('id') ??
      this.route.snapshot.paramMap.get('id') ?? '';
    this.loadItems();
  }

  private loadItems(): void {
    this.isLoading.set(true);
    this.inventoryService.getAllByCharacter(this.characterId).subscribe({
      next: (items) => {
        this.allItems.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('載入倉庫失敗', '關閉', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  protected onAddItem(): void {
    const type: ItemType = this.activeTab() === 0 ? 'PERMANENT' : 'CONSUMABLE';
    this.router.navigate(['/characters', this.characterId, 'inventory', 'new'], {
      queryParams: { type },
    });
  }

  protected onEditItem(event: Event, itemId: string): void {
    event.stopPropagation();
    this.router.navigate(['/characters', this.characterId, 'inventory', itemId, 'edit']);
  }

  protected onDeleteItem(event: Event, item: InventoryItem): void {
    event.stopPropagation();
    const data: ConfirmDialogData = {
      title: '刪除物品',
      message: `確定要刪除「${item.itemName}」嗎？此操作無法復原。`,
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '360px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.inventoryService.delete(this.characterId, item.id).subscribe({
          next: () => {
            this.snackBar.open(`已刪除「${item.itemName}」`, '關閉', { duration: 2500 });
            this.loadItems();
          },
          error: () => this.snackBar.open('刪除失敗', '關閉', { duration: 3000 }),
        });
      });
  }

  protected getRarityColor(item: InventoryItem): string {
    return item.rarity ? this.rarityColors[item.rarity] : '#9e9e9e';
  }

  protected getRarityLabel(item: InventoryItem): string {
    return item.rarity ? this.rarityLabels[item.rarity] : '—';
  }
}
