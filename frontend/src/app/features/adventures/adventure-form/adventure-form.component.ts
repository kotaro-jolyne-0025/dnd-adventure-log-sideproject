import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdventureService } from '../../../core/services/adventure.service';
import { AdventureEntryRequest } from '../../../core/models/adventure.model';

@Component({
  selector: 'app-adventure-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './adventure-form.component.html',
  styleUrl: './adventure-form.component.scss',
})
export class AdventureFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adventureService = inject(AdventureService);
  private readonly snackBar = inject(MatSnackBar);

  protected isEditMode = signal(false);
  protected isSaving = signal(false);
  private characterId!: number;
  private entryId?: number;

  protected form: FormGroup = this.fb.group({
    adventureCode: [''],
    adventureName: [''],
    playDate: [null],
    dmName: [''],
    goldStart: [null],
    goldChange: [null],
    goldTotal: [null],
    downtimeDaysStart: [null],
    downtimeDaysChange: [null],
    downtimeDaysTotal: [null],
    magicItemsStart: [null],
    magicItemsChange: [null],
    magicItemsTotal: [null],
    notes: [''],
    renownChange: [''],
  });

  ngOnInit(): void {
    this.characterId = Number(
      this.route.parent?.snapshot.paramMap.get('id') ??
      this.route.snapshot.paramMap.get('characterId')
    );
    const entryIdParam = this.route.snapshot.paramMap.get('entryId');
    if (entryIdParam) {
      this.isEditMode.set(true);
      this.entryId = Number(entryIdParam);
      this.loadEntry(this.entryId);
    }
  }

  private loadEntry(id: number): void {
    this.adventureService.getById(this.characterId, id).subscribe({
      next: (entry) => {
        this.form.patchValue({
          adventureCode: entry.adventureCode ?? '',
          adventureName: entry.adventureName ?? '',
          playDate: entry.playDate ? new Date(entry.playDate) : null,
          dmName: entry.dmName ?? '',
          goldStart: entry.goldStart ?? null,
          goldChange: entry.goldChange ?? null,
          goldTotal: entry.goldTotal ?? null,
          downtimeDaysStart: entry.downtimeDaysStart ?? null,
          downtimeDaysChange: entry.downtimeDaysChange ?? null,
          downtimeDaysTotal: entry.downtimeDaysTotal ?? null,
          magicItemsStart: entry.magicItemsStart ?? null,
          magicItemsChange: entry.magicItemsChange ?? null,
          magicItemsTotal: entry.magicItemsTotal ?? null,
          notes: entry.notes ?? '',
          renownChange: entry.renownChange ?? '',
        });
      },
      error: () => {
        this.snackBar.open('載入記錄失敗', '關閉', { duration: 3000 });
        this.onBack();
      },
    });
  }

  private buildRequest(): AdventureEntryRequest {
    const raw = this.form.getRawValue();
    const toDateStr = (val: Date | null): string | null => {
      if (!val) return null;
      const d = val instanceof Date ? val : new Date(val);
      return d.toISOString().split('T')[0];
    };
    return {
      adventureCode: raw.adventureCode?.trim() || null,
      adventureName: raw.adventureName?.trim() || null,
      playDate: toDateStr(raw.playDate),
      dmName: raw.dmName?.trim() || null,
      goldStart: raw.goldStart !== '' && raw.goldStart !== null ? Number(raw.goldStart) : null,
      goldChange: raw.goldChange !== '' && raw.goldChange !== null ? Number(raw.goldChange) : null,
      goldTotal: raw.goldTotal !== '' && raw.goldTotal !== null ? Number(raw.goldTotal) : null,
      downtimeDaysStart: raw.downtimeDaysStart !== '' && raw.downtimeDaysStart !== null ? Number(raw.downtimeDaysStart) : null,
      downtimeDaysChange: raw.downtimeDaysChange !== '' && raw.downtimeDaysChange !== null ? Number(raw.downtimeDaysChange) : null,
      downtimeDaysTotal: raw.downtimeDaysTotal !== '' && raw.downtimeDaysTotal !== null ? Number(raw.downtimeDaysTotal) : null,
      magicItemsStart: raw.magicItemsStart !== '' && raw.magicItemsStart !== null ? Number(raw.magicItemsStart) : null,
      magicItemsChange: raw.magicItemsChange !== '' && raw.magicItemsChange !== null ? Number(raw.magicItemsChange) : null,
      magicItemsTotal: raw.magicItemsTotal !== '' && raw.magicItemsTotal !== null ? Number(raw.magicItemsTotal) : null,
      notes: raw.notes?.trim() || null,
      renownChange: raw.renownChange?.trim() || null,
    };
  }

  protected onSubmit(): void {
    this.isSaving.set(true);
    const req = this.buildRequest();

    if (this.isEditMode() && this.entryId) {
      this.adventureService.update(this.characterId, this.entryId, req).subscribe({
        next: (updated) => {
          this.snackBar.open('記錄已更新', '關閉', { duration: 2500 });
          this.router.navigate(['/characters', this.characterId, 'adventures', updated.id]);
        },
        error: () => {
          this.isSaving.set(false);
          this.snackBar.open('更新失敗，請稍後再試', '關閉', { duration: 3000 });
        },
      });
    } else {
      this.adventureService.create(this.characterId, req).subscribe({
        next: (created) => {
          this.snackBar.open('冒險記錄已新增', '關閉', { duration: 2500 });
          this.router.navigate(['/characters', this.characterId, 'adventures', created.id]);
        },
        error: () => {
          this.isSaving.set(false);
          this.snackBar.open('新增失敗，請稍後再試', '關閉', { duration: 3000 });
        },
      });
    }
  }

  protected onBack(): void {
    if (this.isEditMode() && this.entryId) {
      this.router.navigate(['/characters', this.characterId, 'adventures', this.entryId]);
    } else {
      this.router.navigate(['/characters', this.characterId, 'adventures']);
    }
  }
}
