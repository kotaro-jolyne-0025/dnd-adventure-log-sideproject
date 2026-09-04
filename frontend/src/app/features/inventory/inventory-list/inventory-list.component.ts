import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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

import {
  LucideSparkles,
  LucideFlaskConical,
  LucideClock,
  LucideArrowDown,
  LucideArrowUp,
  LucidePackage,
  LucidePlus,
  LucideBookmark,
  LucidePencil,
  LucideTrash2,
  LucideDroplet,
  LucideSlidersHorizontal,
  LucideChevronDown,
} from '@lucide/angular';

export type InventorySortField = 'createdAt' | 'rarity';

const RARITY_WEIGHT: Record<string, number> = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  VERY_RARE: 4,
  LEGENDARY: 5,
  ARTIFACT: 6,
};

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    LucideSparkles,
    LucideFlaskConical,
    LucideClock,
    LucideArrowDown,
    LucideArrowUp,
    LucidePackage,
    LucidePlus,
    LucideBookmark,
    LucidePencil,
    LucideTrash2,
    LucideDroplet,
    LucideSlidersHorizontal,
    LucideChevronDown,
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

  private readonly SORT_FIELD_KEY = 'inventory_sort_field';
  private readonly SORT_ORDER_KEY = 'inventory_sort_order';

  protected allItems = signal<InventoryItem[]>([]);
  protected isLoading = signal(true);
  protected activeTab = signal(0); // 0=PERMANENT, 1=CONSUMABLE
  protected characterId!: string;

  // 排序欄位與方向
  protected readonly sortField = signal<InventorySortField>(
    (localStorage.getItem(this.SORT_FIELD_KEY) as InventorySortField) === 'rarity' ? 'rarity' : 'createdAt'
  );
  protected readonly sortOrder = signal<'desc' | 'asc'>(
    (localStorage.getItem(this.SORT_ORDER_KEY) as 'desc' | 'asc') || 'desc'
  );

  protected readonly sortFieldLabel = computed(() => {
    return this.sortField() === 'rarity' ? '稀有度' : '取得時間';
  });

  protected readonly directionLabel = computed(() => {
    const field = this.sortField();
    const order = this.sortOrder();
    if (field === 'rarity') {
      return order === 'desc' ? '由高至低' : '由低至高';
    }
    return order === 'desc' ? '由新至舊' : '由舊至新';
  });

  protected readonly directionTooltip = computed(() => {
    const field = this.sortField();
    const order = this.sortOrder();
    if (field === 'rarity') {
      return order === 'desc' ? '目前：由高至低（點擊切換為由低至高）' : '目前：由低至高（點擊切換為由高至低）';
    }
    return order === 'desc' ? '目前：由新至舊（點擊切換為由舊至新）' : '目前：由舊至新（點擊切換為由新至舊）';
  });

  protected permanentItems = computed(() => {
    const list = this.allItems().filter((i) => i.itemType === 'PERMANENT');
    return this.sortItems(list, this.sortField(), this.sortOrder());
  });

  protected consumableItems = computed(() => {
    const list = this.allItems().filter((i) => i.itemType === 'CONSUMABLE');
    return this.sortItems(list, this.sortField(), this.sortOrder());
  });

  readonly rarityLabels = ITEM_RARITY_LABELS;
  readonly rarityColors = RARITY_COLORS;

  ngOnInit(): void {
    this.characterId =
      this.route.parent?.snapshot.paramMap.get('id') ??
      this.route.snapshot.paramMap.get('id') ?? '';

    this.loadItems();
  }

  protected onSortFieldChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const field = target.value as InventorySortField;
    this.sortField.set(field);
    this.sortOrder.set('desc');
    localStorage.setItem(this.SORT_ORDER_KEY, 'desc');
    localStorage.setItem(this.SORT_FIELD_KEY, field);
  }

  protected toggleSortOrder(): void {
    const next = this.sortOrder() === 'desc' ? 'asc' : 'desc';
    this.sortOrder.set(next);
    localStorage.setItem(this.SORT_ORDER_KEY, next);
  }

  private sortItems(
    items: InventoryItem[],
    field: InventorySortField,
    order: 'desc' | 'asc'
  ): InventoryItem[] {
    return [...items].sort((a, b) => {
      let diff = 0;
      if (field === 'createdAt') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const validTimeA = isNaN(timeA) ? 0 : timeA;
        const validTimeB = isNaN(timeB) ? 0 : timeB;
        diff = validTimeB - validTimeA;
      } else if (field === 'rarity') {
        const rA = a.rarity ? (RARITY_WEIGHT[a.rarity] ?? 0) : 0;
        const rB = b.rarity ? (RARITY_WEIGHT[b.rarity] ?? 0) : 0;
        diff = rB - rA;
      }

      // 次要排序 (Tie-breaker): 若主要欄位相同，依物品名稱與 ID 排序
      if (diff === 0) {
        const nameDiff = (a.itemName || '').localeCompare(b.itemName || '', 'zh-Hant');
        if (nameDiff !== 0) {
          return order === 'desc' ? -nameDiff : nameDiff;
        }
        const idDiff = (a.id || '').localeCompare(b.id || '');
        return order === 'desc' ? -idDiff : idDiff;
      }

      return order === 'desc' ? diff : -diff;
    });
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

  protected onQuickConsume(event: Event, item: InventoryItem): void {
    event.stopPropagation();
    const currentQty = item.quantity || 1;

    if (currentQty > 1) {
      const newQty = currentQty - 1;
      this.inventoryService.update(this.characterId, item.id, {
        itemName: item.itemName,
        itemType: item.itemType,
        rarity: item.rarity,
        quantity: newQty,
        source: item.source,
        notes: item.notes,
      }).subscribe({
        next: () => {
          this.snackBar.open(`已使用 1 份「${item.itemName}」（剩餘 ${newQty} 份）`, '關閉', { duration: 2500 });
          this.loadItems();
        },
        error: () => this.snackBar.open('扣減失敗', '關閉', { duration: 3000 }),
      });
    } else {
      const data: ConfirmDialogData = {
        title: '使用並用盡消耗品',
        message: `已使用最後 1 份「${item.itemName}」，要將其從倉庫移除嗎？`,
        confirmText: '使用並移除',
        cancelText: '取消',
      };
      this.dialog.open(ConfirmDialogComponent, { data, width: '380px' })
        .afterClosed()
        .subscribe((confirmed) => {
          if (!confirmed) return;
          this.inventoryService.delete(this.characterId, item.id).subscribe({
            next: () => {
              this.snackBar.open(`已使用完「${item.itemName}」`, '關閉', { duration: 2500 });
              this.loadItems();
            },
            error: () => this.snackBar.open('操作失敗', '關閉', { duration: 3000 }),
          });
        });
    }
  }

  protected getRarityColor(item: InventoryItem): string {
    return item.rarity ? this.rarityColors[item.rarity] : '#9e9e9e';
  }

  protected getRarityLabel(item: InventoryItem): string {
    return item.rarity ? this.rarityLabels[item.rarity] : '—';
  }
}
