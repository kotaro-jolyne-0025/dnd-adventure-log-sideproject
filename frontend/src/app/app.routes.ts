import { Routes } from '@angular/router';
import { CharacterListComponent } from './features/characters/character-list/character-list.component';
import { CharacterFormComponent } from './features/characters/character-form/character-form.component';
import { CharacterShellComponent } from './features/characters/character-shell/character-shell.component';
import { AdventureListComponent } from './features/adventures/adventure-list/adventure-list.component';
import { AdventureDetailComponent } from './features/adventures/adventure-detail/adventure-detail.component';
import { AdventureFormComponent } from './features/adventures/adventure-form/adventure-form.component';
import { InventoryListComponent } from './features/inventory/inventory-list/inventory-list.component';
import { InventoryFormComponent } from './features/inventory/inventory-form/inventory-form.component';

export const routes: Routes = [
  // 預設導向角色列表
  { path: '', redirectTo: 'characters', pathMatch: 'full' },

  // ── Epic 1: 角色管理 ────────────────────────────────────────────────────────
  { path: 'characters', component: CharacterListComponent },
  { path: 'characters/new', component: CharacterFormComponent },
  { path: 'characters/:id/edit', component: CharacterFormComponent },

  // ── 角色 Shell（含 Tab 導覽） ────────────────────────────────────────────────
  {
    path: 'characters/:id',
    component: CharacterShellComponent,
    children: [
      // Epic 2: 冒險日誌
      { path: 'adventures', component: AdventureListComponent },
      { path: 'adventures/new', component: AdventureFormComponent },
      { path: 'adventures/:entryId', component: AdventureDetailComponent },
      { path: 'adventures/:entryId/edit', component: AdventureFormComponent },

      // Epic 3: 倉庫
      { path: 'inventory', component: InventoryListComponent },
      { path: 'inventory/new', component: InventoryFormComponent },
      { path: 'inventory/:itemId/edit', component: InventoryFormComponent },

      // 預設子路由
      { path: '', redirectTo: 'adventures', pathMatch: 'full' },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'characters' },
];
