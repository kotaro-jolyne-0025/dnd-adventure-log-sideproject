import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdventureService } from '../../../core/services/adventure.service';
import { CharacterService } from '../../../core/services/character.service';
import { AdventureEntryRequest, DowntimeActivity } from '../../../core/models/adventure.model';
import { CharacterClassLevel } from '../../../core/models/character.model';
import { switchMap, from, concatMap, toArray } from 'rxjs';

export const CLASS_OPTIONS = [
  '戰士', '法師', '牧師', '遊蕩者', '遊俠',
  '吟遊詩人', '德魯伊', '武僧', '聖騎士', '契術師',
  '術士', '野蠻人', '奇械師', '其他',
];

@Component({
  selector: 'app-adventure-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './adventure-form.component.html',
  styleUrl: './adventure-form.component.scss',
})
export class AdventureFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adventureService = inject(AdventureService);
  private readonly characterService = inject(CharacterService);
  private readonly snackBar = inject(MatSnackBar);

  protected isEditMode = signal(false);
  protected isSaving = signal(false);
  private characterId!: string;
  private entryId?: string;

  /** 角色目前的職業等級清單，供選項顯示提示用 */
  protected characterClassLevels = signal<CharacterClassLevel[]>([]);

  /** 升級 Toggle */
  protected levelUp = signal(false);

  /** 迎頭趕上 Toggle */
  protected catchup = signal(false);

  /** CLASS_OPTIONS 供 template 使用 */
  protected readonly CLASS_OPTIONS = CLASS_OPTIONS;

  // ── 起始等級（唯讀，由 defaults/loadEntry 直接設值）──────────────────────
  protected readonly _startingLevel = signal<number | null>(null);

  // catchupCount signal（供 endingLevel computed 使用）
  private readonly _catchupCount = signal<number>(0);

  // 即時計算合計（顯示用）
  private readonly _startingGold = signal<number | null>(null);
  private readonly _goldChange = signal<number | null>(null);
  private readonly _goldDowntimeChange = signal<number | null>(null);
  private readonly _startingDowntime = signal<number | null>(null);
  private readonly _downtimeChange = signal<number | null>(null);
  private readonly _downtimeDowntimeChange = signal<number | null>(null);
  private readonly _startingMagicItems = signal<number | null>(null);
  private readonly _magicItemsChange = signal<number | null>(null);
  private readonly _magicItemsDowntimeChange = signal<number | null>(null);

  /** 結束等級：唯讀 computed = startingLevel + (levelUp ? 1 : 0) + (catchup ? catchupCount : 0) */
  protected readonly endingLevel = computed(() => {
    const sl = this._startingLevel();
    if (sl == null) return null;
    const cu = this.catchup() ? this._catchupCount() : 0;
    return sl + (this.levelUp() ? 1 : 0) + cu;
  });

  protected readonly goldTotal = computed(() => {
    const s = this._startingGold();
    const c = this._goldChange();
    const d = this._goldDowntimeChange();
    if (s == null && c == null && d == null) return null;
    return (s ?? 0) + (c ?? 0) + (d ?? 0);
  });
  protected readonly downtimeTotal = computed(() => {
    const s = this._startingDowntime();
    const c = this._downtimeChange();
    const d = this._downtimeDowntimeChange();
    if (s == null && c == null && d == null) return null;
    return (s ?? 0) + (c ?? 0) + (d ?? 0);
  });
  protected readonly magicItemsTotal = computed(() => {
    const s = this._startingMagicItems();
    const c = this._magicItemsChange();
    const d = this._magicItemsDowntimeChange();
    if (s == null && c == null && d == null) return null;
    return (s ?? 0) + (c ?? 0) + (d ?? 0);
  });

  // ── 休整期活動 ──────────────────────────────────────────────────────────────
  /** 新增模式：暫存待儲存的活動描述 */
  protected pendingActivities = signal<string[]>([]);
  /** 編輯模式：已存在的活動清單 */
  protected existingActivities = signal<DowntimeActivity[]>([]);
  /** 輸入列雙向綁定文字 */
  protected newActivityText = '';

  protected form: FormGroup = this.fb.group({
    adventureCode: [''],
    adventureName: [''],
    playDate: [null],
    dmName: [''],
    levelUpClassName: [null],
    catchupClassName: [null],
    catchupCount: [null],
    startingGold: [null],
    goldChange: [null],
    goldDowntimeChange: [null],
    startingDowntime: [null],
    downtimeChange: [null],
    downtimeDowntimeChange: [null],
    startingMagicItems: [null],
    magicItemsChange: [null],
    magicItemsDowntimeChange: [null],
    adventureNotes: [''],
    soulCoinChargesUsed: [''],
  });

  ngOnInit(): void {
    this.characterId =
      this.route.parent?.snapshot.paramMap.get('id') ??
      this.route.snapshot.paramMap.get('characterId') ?? '';
    const entryIdParam = this.route.snapshot.paramMap.get('entryId');

    // 載入角色職業清單（新增與編輯都需要）
    this.characterService.getById(this.characterId).subscribe({
      next: (c) => this.characterClassLevels.set(c.classLevels ?? []),
      error: () => { /* 靜默略過，選項提示不顯示等級 */ },
    });

    // 監聽數字欄位變更以更新 computed 合計
    this.form.get('startingGold')!.valueChanges.subscribe(v => this._startingGold.set(v != null && v !== '' ? Number(v) : null));
    this.form.get('goldChange')!.valueChanges.subscribe(v => this._goldChange.set(v != null && v !== '' ? Number(v) : null));
    this.form.get('goldDowntimeChange')!.valueChanges.subscribe(v => this._goldDowntimeChange.set(v != null && v !== '' ? Number(v) : null));
    this.form.get('startingDowntime')!.valueChanges.subscribe(v => this._startingDowntime.set(v != null && v !== '' ? Number(v) : null));
    this.form.get('downtimeChange')!.valueChanges.subscribe(v => this._downtimeChange.set(v != null && v !== '' ? Number(v) : null));
    this.form.get('downtimeDowntimeChange')!.valueChanges.subscribe(v => this._downtimeDowntimeChange.set(v != null && v !== '' ? Number(v) : null));
    this.form.get('startingMagicItems')!.valueChanges.subscribe(v => this._startingMagicItems.set(v != null && v !== '' ? Number(v) : null));
    this.form.get('magicItemsChange')!.valueChanges.subscribe(v => this._magicItemsChange.set(v != null && v !== '' ? Number(v) : null));
    this.form.get('magicItemsDowntimeChange')!.valueChanges.subscribe(v => this._magicItemsDowntimeChange.set(v != null && v !== '' ? Number(v) : null));
    this.form.get('catchupCount')!.valueChanges.subscribe(v => this._catchupCount.set(v != null && v !== '' ? Number(v) : 0));

    if (entryIdParam) {
      this.isEditMode.set(true);
      this.entryId = entryIdParam;
      this.loadEntry(this.entryId);
    } else {
      // 新增模式：呼叫 defaults API 預填起始值
      this.loadDefaults();
    }
  }

  private loadDefaults(): void {
    this.adventureService.getDefaults(this.characterId).subscribe({
      next: (d) => {
        if (d.startingLevel != null) {
          this._startingLevel.set(d.startingLevel);
        }
        this.form.patchValue({
          startingGold: d.startingGold ?? 0,
          startingDowntime: d.startingDowntime ?? 0,
          startingMagicItems: d.startingMagicItems ?? 0,
        });
      },
      error: () => { /* 無法取得預設值時靜默略過 */ },
    });
  }

  private loadEntry(id: string): void {
    this.adventureService.getById(this.characterId, id).subscribe({
      next: (entry) => {
        if (entry.levelUpClassName) {
          this.levelUp.set(true);
        }
        if (entry.catchupClassName && entry.catchupCount && entry.catchupCount > 0) {
          this.catchup.set(true);
        }
        // 起始等級直接寫入 signal（唯讀）
        this._startingLevel.set(entry.startingLevel ?? null);
        // 載入現有休整期活動
        this.existingActivities.set(entry.downtimeActivities ?? []);

        this.form.patchValue({
          adventureCode: entry.adventureCode ?? '',
          adventureName: entry.adventureName ?? '',
          playDate: entry.playDate ? new Date(entry.playDate) : null,
          dmName: entry.dmName ?? '',
          levelUpClassName: entry.levelUpClassName ?? null,
          catchupClassName: entry.catchupClassName ?? null,
          catchupCount: entry.catchupCount ?? null,
          startingGold: entry.startingGold ?? null,
          goldChange: entry.goldChange ?? null,
          goldDowntimeChange: entry.goldDowntimeChange ?? null,
          startingDowntime: entry.startingDowntime ?? null,
          downtimeChange: entry.downtimeChange ?? null,
          downtimeDowntimeChange: entry.downtimeDowntimeChange ?? null,
          startingMagicItems: entry.startingMagicItems ?? null,
          magicItemsChange: entry.magicItemsChange ?? null,
          magicItemsDowntimeChange: entry.magicItemsDowntimeChange ?? null,
          adventureNotes: entry.adventureNotes ?? '',
          soulCoinChargesUsed: entry.soulCoinChargesUsed ?? '',
        });
      },
      error: () => {
        this.snackBar.open('載入記錄失敗', '關閉', { duration: 3000 });
        this.onBack();
      },
    });
  }

  /** 取得職業選項顯示標籤（含等級提示） */
  protected getClassLabel(className: string): string {
    const found = this.characterClassLevels().find(cl => cl.className === className);
    if (found) {
      return `${className}（Lv.${found.level}）`;
    }
    return `${className}（新職業）`;
  }

  /** 迎頭趕上 Toggle 關閉時清除欄位 */
  protected onCatchupToggle(checked: boolean): void {
    this.catchup.set(checked);
    if (!checked) {
      this.form.get('catchupClassName')!.setValue(null);
      this.form.get('catchupCount')!.setValue(null);
    }
  }

  /** Toggle 關閉時清除 levelUpClassName；開啟時自動帶入第一個職業 */
  protected onLevelUpToggle(checked: boolean): void {
    this.levelUp.set(checked);
    if (!checked) {
      this.form.get('levelUpClassName')!.setValue(null);
    } else {
      const levels = this.characterClassLevels();
      if (levels.length > 0) {
        this.form.get('levelUpClassName')!.setValue(levels[0].className);
      }
    }
  }

  // ── 休整期活動操作 ──────────────────────────────────────────────────────────

  /** 新增模式：推入暫存清單；編輯模式：立即呼叫 API */
  protected addActivity(): void {
    const text = this.newActivityText.trim();
    if (!text) return;
    this.newActivityText = '';

    if (this.isEditMode() && this.entryId) {
      this.adventureService.addDowntime(this.entryId, { description: text }).subscribe({
        next: (created) => {
          this.existingActivities.update(list => [...list, created]);
        },
        error: () => {
          this.snackBar.open('新增活動失敗', '關閉', { duration: 3000 });
        },
      });
    } else {
      this.pendingActivities.update(list => [...list, text]);
    }
  }

  /** 新增模式：從暫存清單移除；編輯模式：立即呼叫 API 刪除 */
  protected removeActivity(index: number): void {
    if (this.isEditMode() && this.entryId) {
      const activity = this.existingActivities()[index];
      this.adventureService.deleteDowntime(this.entryId, activity.id).subscribe({
        next: () => {
          this.existingActivities.update(list => list.filter((_, i) => i !== index));
        },
        error: () => {
          this.snackBar.open('刪除活動失敗', '關閉', { duration: 3000 });
        },
      });
    } else {
      this.pendingActivities.update(list => list.filter((_, i) => i !== index));
    }
  }

  private buildRequest(): AdventureEntryRequest {
    const raw = this.form.getRawValue();
    const toNum = (v: unknown): number | null =>
      v !== '' && v !== null && v !== undefined ? Number(v) : null;
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
      startingLevel: this._startingLevel(),
      endingLevel: this.endingLevel(),
      levelUpClassName: this.levelUp() ? (raw.levelUpClassName || null) : null,
      catchupClassName: this.catchup() ? (raw.catchupClassName || null) : null,
      catchupCount: this.catchup() ? (toNum(raw.catchupCount)) : null,
      startingGold: toNum(raw.startingGold),
      goldChange: toNum(raw.goldChange),
      goldDowntimeChange: toNum(raw.goldDowntimeChange),
      startingDowntime: toNum(raw.startingDowntime),
      downtimeChange: toNum(raw.downtimeChange),
      downtimeDowntimeChange: toNum(raw.downtimeDowntimeChange),
      startingMagicItems: toNum(raw.startingMagicItems),
      magicItemsChange: toNum(raw.magicItemsChange),
      magicItemsDowntimeChange: toNum(raw.magicItemsDowntimeChange),
      adventureNotes: raw.adventureNotes?.trim() || null,
      soulCoinChargesUsed: raw.soulCoinChargesUsed?.trim() || null,
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
          const pending = this.pendingActivities();
          if (pending.length === 0) {
            this.snackBar.open('冒險記錄已新增', '關閉', { duration: 2500 });
            this.router.navigate(['/characters', this.characterId, 'adventures', created.id]);
            return;
          }
          // 依序 POST 所有暫存活動
          from(pending).pipe(
            concatMap(desc => this.adventureService.addDowntime(created.id, { description: desc })),
            toArray(),
          ).subscribe({
            next: () => {
              this.snackBar.open('冒險記錄已新增', '關閉', { duration: 2500 });
              this.router.navigate(['/characters', this.characterId, 'adventures', created.id]);
            },
            error: () => {
              // 主記錄已建立，活動部分失敗；仍導向 detail
              this.snackBar.open('冒險記錄已新增（部分活動儲存失敗）', '關閉', { duration: 3500 });
              this.router.navigate(['/characters', this.characterId, 'adventures', created.id]);
            },
          });
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
