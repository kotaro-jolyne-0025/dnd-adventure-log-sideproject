import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { LucideMinus, LucidePlus, LucideFlaskConical, LucideAlertTriangle } from '@lucide/angular';

export interface ConsumeDialogData {
  itemName: string;
  currentQuantity: number;
}

@Component({
  selector: 'app-consume-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    LucideMinus,
    LucidePlus,
    LucideFlaskConical,
    LucideAlertTriangle,
  ],
  template: `
    <div class="consume-dialog-container">
      <div class="dialog-header">
        <div class="header-icon-wrap">
          <svg lucideFlaskConical [size]="22" class="header-icon"></svg>
        </div>
        <div>
          <h2 class="dialog-title">使用消耗品</h2>
          <p class="dialog-subtitle">選擇本次要消耗的數量</p>
        </div>
      </div>

      <div class="item-summary-card">
        <div class="item-name">{{ data.itemName }}</div>
        <div class="stock-info">
          目前持有：<span class="stock-num">{{ data.currentQuantity }}</span> 個
        </div>
      </div>

      <!-- 數量調整區塊 -->
      <div class="stepper-section">
        <div class="stepper-row">
          <button type="button" class="ctrl-btn"
            [disabled]="consumeQty() <= 1"
            (click)="onDecrement()">
            <svg lucideMinus [size]="16"></svg>
          </button>

          <div class="input-wrap">
            <input
              type="number"
              class="qty-input"
              [min]="1"
              [max]="data.currentQuantity"
              [ngModel]="consumeQty()"
              (ngModelChange)="onQtyChange($event)"
            />
          </div>

          <button type="button" class="ctrl-btn"
            [disabled]="consumeQty() >= data.currentQuantity"
            (click)="onIncrement()">
            <svg lucidePlus [size]="16"></svg>
          </button>
        </div>

        <!-- 快捷標籤 -->
        <div class="quick-tags">
          <button type="button" class="quick-chip"
            [class.active]="consumeQty() === 1"
            (click)="setQty(1)">
            使用 1 個
          </button>
          @if (data.currentQuantity > 1) {
            <button type="button" class="quick-chip"
              [class.active]="consumeQty() === data.currentQuantity"
              (click)="setQty(data.currentQuantity)">
              全部用盡 ({{ data.currentQuantity }}個)
            </button>
          }
        </div>
      </div>

      <!-- 提示狀態列 -->
      <div class="status-tip-box" [class.exhausted]="isExhausted()">
        @if (isExhausted()) {
          <div class="tip-content warning">
            <svg lucideAlertTriangle [size]="15" class="tip-icon"></svg>
            <span>使用後數量將歸零，並自動自倉庫清單中移除。</span>
          </div>
        } @else {
          <div class="tip-content info">
            <span>使用後倉庫將剩餘 <strong>{{ remainingQty() }}</strong> 個。</span>
          </div>
        }
      </div>

      <div class="dialog-actions">
        <button mat-button class="cancel-btn" (click)="onCancel()">取消</button>
        <button mat-flat-button color="primary" class="submit-btn" (click)="onConfirm()">
          確認使用
        </button>
      </div>
    </div>
  `,
  styles: [`
    .consume-dialog-container {
      padding: 1.25rem 1.5rem;
      color: var(--text-primary, #1e293b);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .header-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.12);
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }

    .dialog-subtitle {
      font-size: 0.8rem;
      color: var(--text-secondary, #64748b);
      margin: 0.2rem 0 0 0;
    }

    .item-summary-card {
      background: var(--surface-muted, #f8fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-bottom: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-primary, #1e293b);
      max-width: 65%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .stock-info {
      font-size: 0.85rem;
      color: var(--text-secondary, #64748b);
    }

    .stock-num {
      font-weight: 700;
      color: #2563eb;
    }

    .stepper-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .stepper-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .ctrl-btn {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      border: 1px solid var(--border-color, #cbd5e1);
      background: var(--surface-card, #ffffff);
      color: var(--text-primary, #1e293b);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(:disabled) {
        background: #f1f5f9;
        border-color: #94a3b8;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .input-wrap {
      width: 90px;
    }

    .qty-input {
      width: 100%;
      height: 42px;
      text-align: center;
      font-size: 1.25rem;
      font-weight: 700;
      border-radius: 10px;
      border: 1px solid var(--border-color, #cbd5e1);
      background: var(--surface-card, #ffffff);
      color: var(--text-primary, #1e293b);
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      }

      /* 隱藏原生 number spinner */
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      appearance: textfield;
      -moz-appearance: textfield;
    }

    .quick-tags {
      display: flex;
      gap: 0.5rem;
    }

    .quick-chip {
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid var(--border-color, #e2e8f0);
      background: transparent;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #f1f5f9;
        color: var(--text-primary, #1e293b);
      }

      &.active {
        background: rgba(59, 130, 246, 0.1);
        border-color: #3b82f6;
        color: #2563eb;
        font-weight: 600;
      }
    }

    .status-tip-box {
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      margin-bottom: 1.25rem;
      font-size: 0.82rem;
      background: rgba(59, 130, 246, 0.06);
      border: 1px solid rgba(59, 130, 246, 0.18);
      color: #1e40af;

      &.exhausted {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.3);
        color: #b45309;
      }
    }

    .tip-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      line-height: 1.4;
    }

    .tip-icon {
      flex-shrink: 0;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 0.5rem;
    }

    .cancel-btn {
      min-width: 72px;
      height: 38px;
      border-radius: 8px;
    }

    .submit-btn {
      min-width: 96px;
      height: 38px;
      border-radius: 8px;
      font-weight: 600;
    }
  `],
})
export class ConsumeDialogComponent {
  protected readonly data: ConsumeDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConsumeDialogComponent, number>);

  protected readonly consumeQty = signal<number>(1);

  protected readonly isExhausted = computed(
    () => this.consumeQty() >= this.data.currentQuantity
  );

  protected readonly remainingQty = computed(() =>
    Math.max(0, this.data.currentQuantity - this.consumeQty())
  );

  protected onIncrement(): void {
    if (this.consumeQty() < this.data.currentQuantity) {
      this.consumeQty.update((q) => q + 1);
    }
  }

  protected onDecrement(): void {
    if (this.consumeQty() > 1) {
      this.consumeQty.update((q) => q - 1);
    }
  }

  protected setQty(val: number): void {
    const clamped = Math.max(1, Math.min(this.data.currentQuantity, val));
    this.consumeQty.set(clamped);
  }

  protected onQtyChange(val: any): void {
    const num = Number(val);
    if (!isNaN(num)) {
      this.setQty(num);
    }
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected onConfirm(): void {
    this.dialogRef.close(this.consumeQty());
  }
}
