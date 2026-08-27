import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AdventureService } from '../../../core/services/adventure.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AdventureEntry } from '../../../core/models/adventure.model';
import { InventoryItem, ITEM_RARITY_LABELS, RARITY_COLORS } from '../../../core/models/inventory.model';
import { catchError, forkJoin, of } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import { LucideCoins, LucideTent, LucideSparkles, LucideFlaskConical } from '@lucide/angular';

@Component({
  selector: 'app-adventure-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    LucideCoins,
    LucideTent,
    LucideSparkles,
    LucideFlaskConical,
  ],
  templateUrl: './adventure-detail.component.html',
  styleUrl: './adventure-detail.component.scss',
})
export class AdventureDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adventureService = inject(AdventureService);
  private readonly inventoryService = inject(InventoryService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected entry = signal<AdventureEntry | null>(null);
  protected magicItems = signal<InventoryItem[]>([]);
  protected consumableItems = signal<InventoryItem[]>([]);
  protected isLoading = signal(true);

  readonly rarityLabels = ITEM_RARITY_LABELS;
  readonly rarityColors = RARITY_COLORS;

  private characterId!: string;
  private entryId!: string;

  ngOnInit(): void {
    this.characterId =
      this.route.parent?.snapshot.paramMap.get('id') ??
      this.route.snapshot.paramMap.get('characterId') ?? '';
    this.entryId = this.route.snapshot.paramMap.get('entryId') ?? '';
    this.loadEntry();
  }

  private loadEntry(): void {
    this.isLoading.set(true);
    forkJoin({
      entry: this.adventureService.getById(this.characterId, this.entryId),
      items: this.inventoryService.getAllByCharacter(this.characterId).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ entry, items }) => {
        this.entry.set(entry);
        this.processGainedItems(entry, items);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('找不到此冒險記錄', '關閉', { duration: 3000 });
        this.router.navigate(['/characters', this.characterId, 'adventures']);
      },
    });
  }

  private processGainedItems(entry: AdventureEntry, items: InventoryItem[]): void {
    const advName = entry.adventureName?.trim().toLowerCase();
    const advCode = entry.adventureCode?.trim().toLowerCase();
    const matchedMagic = items.filter(item => {
      if (item.itemType !== 'PERMANENT' || !item.source) return false;
      const s = item.source.trim().toLowerCase();
      return (advName && s.includes(advName)) || (advCode && s.includes(advCode));
    });
    this.magicItems.set(matchedMagic);

    const matchedConsumables = items.filter(item => {
      if (item.itemType !== 'CONSUMABLE' || !item.source) return false;
      const s = item.source.trim().toLowerCase();
      return (advName && s.includes(advName)) || (advCode && s.includes(advCode));
    });
    this.consumableItems.set(matchedConsumables);
  }

  protected formatClassesDisplay(classesString?: string | null, level?: number | null): string {
    if (classesString && classesString.trim()) {
      const parts = classesString.split('/').map(seg => {
        const match = seg.trim().match(/^(.+?)(\d+)$/);
        if (match) {
          return `${match[1]} Lv.${match[2]}`;
        }
        return seg.trim();
      });
      return parts.join(' / ');
    }
    return level != null ? `Lv.${level}` : '—';
  }

  protected formatChange(val?: number | null, prefix = ''): string {
    if (val == null || val === 0) return '—';
    const rounded = typeof val === 'number' ? Math.round(val * 100) / 100 : val;
    return rounded > 0 ? `+${rounded}${prefix}` : `${rounded}${prefix}`;
  }

  protected onBack(): void {
    this.router.navigate(['/characters', this.characterId, 'adventures']);
  }

  protected onEdit(): void {
    this.router.navigate([
      '/characters', this.characterId, 'adventures', this.entryId, 'edit',
    ]);
  }

  protected onDelete(): void {
    const data: ConfirmDialogData = {
      title: '刪除冒險記錄',
      message: '確定要刪除此冒險記錄嗎？此操作無法復原。',
      confirmText: '確認刪除',
      cancelText: '取消',
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '360px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.adventureService.delete(this.characterId, this.entryId).subscribe({
          next: () => {
            this.snackBar.open('冒險記錄已刪除', '關閉', { duration: 2500 });
            this.router.navigate(['/characters', this.characterId, 'adventures']);
          },
          error: () => this.snackBar.open('刪除失敗', '關閉', { duration: 3000 }),
        });
      });
  }
}
