import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CharacterService } from '../../../core/services/character.service';
import { Character } from '../../../core/models/character.model';

@Component({
  selector: 'app-character-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './character-shell.component.html',
  styleUrl: './character-shell.component.scss',
})
export class CharacterShellComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly characterService = inject(CharacterService);
  private readonly snackBar = inject(MatSnackBar);

  protected character = signal<Character | null>(null);
  protected isLoading = signal(true);
  protected characterId!: string;

  ngOnInit(): void {
    this.characterId = this.route.snapshot.paramMap.get('id')!;
    this.characterService.getById(this.characterId).subscribe({
      next: (c) => {
        this.character.set(c);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('找不到此角色', '關閉', { duration: 3000 });
        this.router.navigate(['/characters']);
      },
    });
  }

  protected formatClasses(character: Character): string {
    return character.classLevels.map((c) => `${c.className} ${c.level}`).join(' / ');
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
