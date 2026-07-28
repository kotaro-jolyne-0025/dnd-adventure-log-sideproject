import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CharacterService } from '../../../core/services/character.service';
import { CharacterRequest } from '../../../core/models/character.model';

@Component({
  selector: 'app-character-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './character-form.component.html',
  styleUrl: './character-form.component.scss',
})
export class CharacterFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly characterService = inject(CharacterService);
  private readonly snackBar = inject(MatSnackBar);

  protected isEditMode = signal(false);
  protected isSaving = signal(false);
  private characterId: number | null = null;

  protected form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    playerName: ['', Validators.required],
    race: ['', Validators.required],
    faction: [''],
    classesList: this.fb.array([this.createClassLevelGroup()]),
  });

  get classesArray(): FormArray {
    return this.form.get('classesList') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.characterId = Number(id);
      this.loadCharacter(this.characterId);
    }
  }

  private loadCharacter(id: number): void {
    this.characterService.getById(id).subscribe({
      next: (character) => {
        // Clear default array and fill with existing data
        while (this.classesArray.length > 0) {
          this.classesArray.removeAt(0);
        }
        character.classesList.forEach((cl) => {
          this.classesArray.push(
            this.fb.group({
              className: [cl.className, Validators.required],
              level: [cl.level, [Validators.required, Validators.min(1), Validators.max(20)]],
            })
          );
        });
        this.form.patchValue({
          name: character.name,
          playerName: character.playerName,
          race: character.race,
          faction: character.faction ?? '',
        });
      },
      error: () => {
        this.snackBar.open('載入角色資料失敗', '關閉', { duration: 3000 });
        this.router.navigate(['/characters']);
      },
    });
  }

  private createClassLevelGroup(): FormGroup {
    return this.fb.group({
      className: ['', Validators.required],
      level: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    });
  }

  protected addClassLevel(): void {
    this.classesArray.push(this.createClassLevelGroup());
  }

  protected removeClassLevel(index: number): void {
    if (this.classesArray.length > 1) {
      this.classesArray.removeAt(index);
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const req: CharacterRequest = {
      name: raw.name.trim(),
      playerName: raw.playerName.trim(),
      race: raw.race.trim(),
      faction: raw.faction?.trim() || null,
      classesList: raw.classesList.map((cl: { className: string; level: number }) => ({
        className: cl.className.trim(),
        level: Number(cl.level),
      })),
    };

    if (this.isEditMode() && this.characterId) {
      this.characterService.update(this.characterId, req).subscribe({
        next: (updated) => {
          this.snackBar.open('角色資料已更新', '關閉', { duration: 2500 });
          this.router.navigate(['/characters', updated.id, 'adventures']);
        },
        error: () => {
          this.isSaving.set(false);
          this.snackBar.open('更新失敗，請稍後再試', '關閉', { duration: 3000 });
        },
      });
    } else {
      this.characterService.create(req).subscribe({
        next: (created) => {
          this.snackBar.open(`角色「${created.name}」已建立！`, '關閉', { duration: 2500 });
          this.router.navigate(['/characters', created.id, 'adventures']);
        },
        error: () => {
          this.isSaving.set(false);
          this.snackBar.open('建立失敗，請稍後再試', '關閉', { duration: 3000 });
        },
      });
    }
  }

  protected onBack(): void {
    if (this.isEditMode() && this.characterId) {
      this.router.navigate(['/characters', this.characterId, 'adventures']);
    } else {
      this.router.navigate(['/characters']);
    }
  }
}
