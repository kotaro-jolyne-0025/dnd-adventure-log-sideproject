import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CharacterService } from '../../../core/services/character.service';
import { AdventureService } from '../../../core/services/adventure.service';
import { Character } from '../../../core/models/character.model';
import { EntryDefaults } from '../../../core/models/adventure.model';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-character-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './character-shell.component.html',
  styleUrl: './character-shell.component.scss',
})
export class CharacterShellComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly characterService = inject(CharacterService);
  private readonly adventureService = inject(AdventureService);
  private readonly snackBar = inject(MatSnackBar);

  protected character = signal<Character | null>(null);
  protected defaults = signal<EntryDefaults | null>(null);
  protected isLoading = signal(true);
  protected characterId!: string;

  ngOnInit(): void {
    this.characterId = this.route.snapshot.paramMap.get('id')!;
    this.loadCharacterData();
  }

  private loadCharacterData(): void {
    this.isLoading.set(true);
    this.characterService.getById(this.characterId).subscribe({
      next: (c) => {
        this.character.set(c);
        this.isLoading.set(false);
        this.loadDefaults();
      },
      error: () => {
        this.snackBar.open('找不到此角色', '關閉', { duration: 3000 });
        this.router.navigate(['/characters']);
      },
    });
  }

  private loadDefaults(): void {
    this.adventureService.getDefaults(this.characterId).subscribe({
      next: (d) => this.defaults.set(d),
      error: () => {
        // Defaults are optional summary, don't block
      },
    });
  }

  protected formatClasses(character: Character): string {
    return character.currentClassesString || '無職業紀錄';
  }

  protected parseTotalLevel(): number {
    if (this.defaults()?.startingLevel) {
      return this.defaults()!.startingLevel!;
    }
    const str = this.character()?.currentClassesString;
    if (!str) return 1;
    let total = 0;
    const segments = str.split('/');
    for (const seg of segments) {
      const match = seg.match(/(\d+)$/);
      if (match) {
        try {
          total += parseInt(match[1], 10);
        } catch {}
      } else {
        total += 1;
      }
    }
    return total > 0 ? total : 1;
  }

  protected getInitial(name?: string): string {
    return name ? name.trim().charAt(0).toUpperCase() : '?';
  }

  protected onTabChange(index: number): void {
    if (index === 0) {
      this.router.navigate(['/characters', this.characterId, 'adventures']);
    } else {
      this.router.navigate(['/characters', this.characterId, 'inventory']);
    }
  }

  protected getActiveTab(): number {
    const url = this.router.url;
    return url.includes('/inventory') ? 1 : 0;
  }

  protected onBack(): void {
    this.router.navigate(['/characters']);
  }

  protected onEdit(): void {
    this.router.navigate(['/characters', this.characterId, 'edit']);
  }
}
