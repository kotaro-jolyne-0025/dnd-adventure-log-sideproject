import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AdventureService } from '../../../core/services/adventure.service';
import { AdventureEntry } from '../../../core/models/adventure.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-adventure-detail',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './adventure-detail.component.html',
  styleUrl: './adventure-detail.component.scss',
})
export class AdventureDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adventureService = inject(AdventureService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected entry = signal<AdventureEntry | null>(null);
  protected isLoading = signal(true);

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
    this.adventureService.getById(this.characterId, this.entryId).subscribe({
      next: (e) => {
        this.entry.set(e);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('找不到此冒險記錄', '關閉', { duration: 3000 });
        this.router.navigate(['/characters', this.characterId, 'adventures']);
      },
    });
  }

  protected formatChange(val?: number | null): string {
    if (val == null) return '—';
    return val > 0 ? `+${val}` : `${val}`;
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
