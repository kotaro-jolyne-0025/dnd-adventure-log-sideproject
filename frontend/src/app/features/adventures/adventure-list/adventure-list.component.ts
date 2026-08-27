import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdventureService } from '../../../core/services/adventure.service';
import { AdventureEntry } from '../../../core/models/adventure.model';

import { LucideCoins, LucideTent, LucideSparkles } from '@lucide/angular';

@Component({
  selector: 'app-adventure-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    LucideCoins,
    LucideTent,
    LucideSparkles,
  ],
  templateUrl: './adventure-list.component.html',
  styleUrl: './adventure-list.component.scss',
})
export class AdventureListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adventureService = inject(AdventureService);
  private readonly snackBar = inject(MatSnackBar);

  protected entries = signal<AdventureEntry[]>([]);
  protected isLoading = signal(true);
  protected characterId!: string;

  ngOnInit(): void {
    this.characterId =
      this.route.parent?.snapshot.paramMap.get('id') ??
      this.route.snapshot.paramMap.get('id') ?? '';
    this.loadEntries();
  }

  private loadEntries(): void {
    this.isLoading.set(true);
    this.adventureService.getAllByCharacter(this.characterId).subscribe({
      next: (list) => {
        // Sort newest first by playDate & createdAt
        const sorted = [...list].sort((a, b) => {
          const dateA = a.playDate ? new Date(a.playDate).getTime() : 0;
          const dateB = b.playDate ? new Date(b.playDate).getTime() : 0;
          return dateB - dateA;
        });
        this.entries.set(sorted);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('載入冒險記錄失敗', '關閉', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  protected onAddEntry(): void {
    this.router.navigate(['/characters', this.characterId, 'adventures', 'new']);
  }

  protected onViewEntry(entryId: string): void {
    this.router.navigate(['/characters', this.characterId, 'adventures', entryId]);
  }

  protected formatGoldChange(entry: AdventureEntry): string | null {
    const change = Math.round(((entry.goldChange ?? 0) + (entry.goldDowntimeChange ?? 0)) * 100) / 100;
    if (change === 0 && entry.goldChange == null && entry.goldDowntimeChange == null) return null;
    return change >= 0 ? `+${change} GP` : `${change} GP`;
  }

  protected formatDowntimeChange(entry: AdventureEntry): string | null {
    const change = (entry.downtimeChange ?? 0) + (entry.downtimeDowntimeChange ?? 0);
    if (change === 0 && entry.downtimeChange == null && entry.downtimeDowntimeChange == null) return null;
    return change >= 0 ? `+${change} 天` : `${change} 天`;
  }

  protected formatMagicItemChange(entry: AdventureEntry): string | null {
    const change = (entry.magicItemsChange ?? 0) + (entry.magicItemsDowntimeChange ?? 0);
    if (change === 0 && entry.magicItemsChange == null && entry.magicItemsDowntimeChange == null) return null;
    return change >= 0 ? `+${change} 魔法物品` : `${change} 魔法物品`;
  }

  protected getLevelProgress(entry: AdventureEntry): string {
    const start = entry.startingLevel;
    const end = entry.endingLevel;
    if (start != null && end != null) {
      if (end > start) {
        return `Lv.${start} ➔ Lv.${end}`;
      }
      return `Lv.${end}`;
    }
    if (end != null) return `Lv.${end}`;
    if (start != null) return `Lv.${start}`;
    return '—';
  }
}
