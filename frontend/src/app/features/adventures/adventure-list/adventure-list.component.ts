import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdventureService } from '../../../core/services/adventure.service';
import { AdventureEntry } from '../../../core/models/adventure.model';

@Component({
  selector: 'app-adventure-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
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
  protected characterId!: number;

  protected displayedColumns = ['playDate', 'adventureCode', 'adventureName', 'dmName'];

  ngOnInit(): void {
    // characterId comes from the parent shell route param
    this.characterId = Number(
      this.route.parent?.snapshot.paramMap.get('id') ??
      this.route.snapshot.paramMap.get('id')
    );
    this.loadEntries();
  }

  private loadEntries(): void {
    this.isLoading.set(true);
    this.adventureService.getAllByCharacter(this.characterId).subscribe({
      next: (list) => {
        this.entries.set(list);
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

  protected onViewEntry(entryId: number): void {
    this.router.navigate(['/characters', this.characterId, 'adventures', entryId]);
  }
}
