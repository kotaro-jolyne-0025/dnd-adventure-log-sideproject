# D&D 冒險日誌 — 工作 Backlog

## 🚀 新 Session 啟動指引（給 AI 看）

每次新對話開始，只需讀這個檔案。不要主動掃描整個專案。

**執行工作前，只讀取該工作項目「需要讀取的檔案」欄位所列的檔案。**

## 🎯 AI 角色定義

**你是這個專案的 PM（產品經理）**，不只是執行者。你需要：
- 每次需求變更時，主動判斷哪些文件需要更新（User Stories、SRS、database-schema、backlog）
- 有規格不清楚時，主動提問，確認後再動手
- 發現設計矛盾或潛在問題時，主動提出，不要默默略過
- 開始實作前，先確認規格文件已同步更新

---

## 專案快速背景

| 項目 | 內容 |
|---|---|
| **目的** | D&D 冒險聯盟（AL）紙本記錄表數位化 PWA |
| **前端** | Angular 22 + Angular Material → `frontend/src/app/` |
| **後端** | Spring Boot 4.1 (Java 17) → `backend/src/main/java/com/dndadvlog/backend/` |
| **資料庫** | PostgreSQL on Supabase |
| **部署** | 前端 + 後端皆部署至 Zeabur |
| **詳細計畫** | `dnd-adv-log-plan.md` |
| **資料庫 Schema** | `database-schema.md` |
| **系統需求** | `system-requirements-spec.md` |

---

## 工作項目清單

### T01 — 子任務 1：專案初始化（monorepo + Angular + Spring Boot）
- **狀態：** `[x] 已完成`
- **對應計畫：** `dnd-adv-log-plan.md` 子任務 1
- **備註：** monorepo 結構已建立，前後端框架已生成

---

### T02 — 子任務 2：資料庫 Schema 與 Supabase 設定
- **狀態：** `[x] 已完成`
- **對應計畫：** `dnd-adv-log-plan.md` 子任務 2
- **備註：** Schema 已設計，JPA Entity 已建立，Spring Boot 連線設定完成

---

### T03 — 子任務 3：後端 REST API（Spring Boot）
- **狀態：** `[x] 已完成`
- **對應計畫：** `dnd-adv-log-plan.md` 子任務 3
- **需要讀取的檔案：**
  - `backend/src/main/java/com/dndadvlog/backend/controller/` 下各 Controller
  - `backend/src/main/java/com/dndadvlog/backend/service/` 下各 Service
  - `backend/src/main/java/com/dndadvlog/backend/dto/` 下各 DTO
  - `backend/src/main/java/com/dndadvlog/backend/entity/` 下各 Entity
- **待完成項目：**
  - [ ] 確認 CharacterController / AdventureEntryController 端點完整
  - [ ] 確認自動帶入邏輯（starting_gold / starting_downtime / starting_magic_items）
  - [ ] 輸入驗證（@Valid）
  - [ ] 全域例外處理器（@ControllerAdvice）
  - [ ] CORS 設定

---

### T04 — 子任務 4：前端角色管理（Angular）
- **狀態：** `[x] 已完成`
- **對應計畫：** `dnd-adv-log-plan.md` 子任務 4
- **需要讀取的檔案：**
  - `frontend/src/app/features/characters/` 整個目錄
  - `frontend/src/app/core/services/character.service.ts`
  - `frontend/src/app/core/models/character.model.ts`
  - `frontend/src/app/app.routes.ts`

---

### T05 — 子任務 5：前端冒險日誌 CRUD（Angular）
- **狀態：** `[x] 已完成`
- **對應計畫：** `dnd-adv-log-plan.md` 子任務 5
- **需要讀取的檔案：**
  - `frontend/src/app/features/adventures/` 整個目錄
  - `frontend/src/app/core/services/adventure.service.ts`
  - `frontend/src/app/core/models/adventure.model.ts`
  - `frontend/src/app/app.routes.ts`

---

### T06 — 子任務 6：PWA 設定與離線支援
- **狀態：** `[ ] 待執行`
- **對應計畫：** `dnd-adv-log-plan.md` 子任務 6
- **需要讀取的檔案：**
  - `frontend/ngsw-config.json`
  - `frontend/src/manifest.webmanifest`
  - `frontend/angular.json`（只看 build 設定段落）

---

### T07 — 子任務 7：部署至 Zeabur
- **狀態：** `[ ] 待執行`
- **對應計畫：** `dnd-adv-log-plan.md` 子任務 7
- **需要讀取的檔案：**
  - `frontend/src/environments/`
  - `backend/Dockerfile`（若存在）
  - `backend/src/main/resources/application.properties`

---

---

### T08 — 功能變更：職業固定選項 + 等級追蹤 + 合計自動計算
- **狀態：** `[x] 已完成`
- **規格文件：** 已更新（user-stories.md、system-requirements-spec.md、database-schema.md）
- **變更摘要：**
  1. 職業改為固定下拉選單（13選項 + 其他＋自訂輸入）
  2. adventure_entry 新增 starting_level / ending_level 欄位
  3. 新增記錄時起始值自動帶入（等級/金幣/休假/魔法物品）
  4. 合計欄位由後端計算，前端唯讀
  5. 角色卡顯示目前等級（最後一筆記錄的 ending_level）
- **需要讀取的檔案：**
  - `system-requirements-spec.md`（看第 2.1、2.2、3.3 節）
  - `database-schema.md`（看 Step 2、Step 3）
- **完成項目（後端）：**
  - [x] `adventure_entry` 表 Migration SQL 已在 database-schema.md 備妥（需在 Supabase 執行）
  - [x] `AdventureEntry` Entity 新增 startingLevel / endingLevel 欄位
  - [x] `AdventureEntryRequest` 移除 goldTotal / downtimeTotal / magicItemsTotal 輸入欄位
  - [x] `AdventureEntryService` 實作合計計算邏輯（calcTotal / calcTotalInt）
  - [x] 新增 `GET /characters/{id}/entries/defaults` 端點
  - [x] `CharacterResponse` 新增 currentLevel；CharacterService 計算最後一筆 endingLevel
- **完成項目（前端）：**
  - [x] 職業表單欄位改為 `<mat-select>`，選項對應固定清單（14 選項）
  - [x] 選「其他」時顯示自由文字輸入框（customClassName）
  - [x] adventure-form 新增起始等級 / 結束等級欄位
  - [x] adventure-form 新增記錄時呼叫 `/entries/defaults` 預填起始值
  - [x] 金幣合計 / 休假合計 / 魔法物品合計改為 computed signal（即時顯示，不可輸入）
  - [x] adventure-detail 基本資訊區塊新增起始等級 / 結束等級顯示
  - [x] character-list 卡片新增目前等級 Lv.X 顯示
- **備註：** 請到 Supabase SQL Editor 執行 database-schema.md Step 3 的 ALTER TABLE 語句

---

### T09 — 功能變更：起始等級來源改為職業等級加總
- **狀態：** `[x] 已完成`
- **變更摘要：**
  - 新增冒險記錄時，`startingLevel` 預填值改為從 `character_class_level` 表的等級加總（例如聖騎士6＋術士4＝10），取代原本「前一筆 ending_level」的做法
- **完成項目：**
  - [x] `CharacterRepository` 新增 `sumClassLevelsByCharacterId()` JPQL 加總查詢
  - [x] `AdventureEntryService.getDefaults()` 改為讀取職業等級加總作為 `startingLevel`（加總為 0 時不設值）

---

### T10 — 功能變更：三種資源各新增「休整期變化」欄位
- **狀態：** `[x] 已完成`
- **變更摘要：**
  - 金幣、休整期天數、魔法物品各自新增一個「休整期變化」欄位
  - 合計公式改為：`合計 = 起始 + 冒險中變化 + 休整期變化`
  - 表單分兩區塊顯示：冒險中資源 / 休整期資源
  - 前端「休假天數」文字全面改為「休整期天數」
- **資料庫 Migration（需在 Supabase 執行）：**
  ```sql
  ALTER TABLE adventure_entry
      ADD COLUMN IF NOT EXISTS gold_downtime_change DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS downtime_downtime_change INTEGER,
      ADD COLUMN IF NOT EXISTS magic_items_downtime_change INTEGER;
  ```
- **影響範圍：**
  - DB：`adventure_entry` 新增三欄
  - 後端 Entity / Request / Response / Service（合計計算邏輯）
  - 前端 Model / Form / Detail
- **需要讀取的檔案：**
  - `database-schema.md`
  - `system-requirements-spec.md`
  - `backend/src/main/java/com/dndadvlog/backend/entity/AdventureEntry.java`
  - `backend/src/main/java/com/dndadvlog/backend/dto/AdventureEntryRequest.java`
  - `backend/src/main/java/com/dndadvlog/backend/dto/AdventureEntryResponse.java`
  - `backend/src/main/java/com/dndadvlog/backend/service/AdventureEntryService.java`
  - `frontend/src/app/core/models/adventure.model.ts`
  - `frontend/src/app/features/adventures/adventure-form/adventure-form.component.ts`
  - `frontend/src/app/features/adventures/adventure-form/adventure-form.component.html`
  - `frontend/src/app/features/adventures/adventure-detail/adventure-detail.component.html`
- **完成項目（後端）：**
  - [x] `AdventureEntry` Entity 新增 `goldDowntimeChange` / `downtimeDowntimeChange` / `magicItemsDowntimeChange`
  - [x] `AdventureEntryRequest` 新增三個休整期變化欄位
  - [x] `AdventureEntryResponse` 新增三個休整期變化欄位
  - [x] `AdventureEntryService.mapRequestToEntry()` 更新合計計算：`合計 = 起始 + 冒險變化 + 休整期變化`
  - [x] 更新 `database-schema.md` 加入三個新欄位定義（含 Migration 2 ALTER TABLE SQL）
- **完成項目（前端）：**
  - [x] `adventure.model.ts` 新增三個休整期變化欄位
  - [x] `adventure-form.component.ts` 表單新增三個控制項；computed 合計更新為三項加總
  - [x] `adventure-form.component.html` 資源變動區塊新增標題列，每列新增「休整期變化」欄位
  - [x] `adventure-detail.component.html` 資源表格新增「冒險中變化」＋「休整期變化」兩欄
  - [x] 全前端「休假天數」文字改為「休整期天數」
- **備註：** 請到 Supabase SQL Editor 執行 database-schema.md Migration 2（T10）的 ALTER TABLE 語句

---

### T12 — 功能變更：冒險結束升級流程

- **狀態：** `[ ] 待執行`
- **變更摘要：**
  - 在冒險表單「起始等級」欄位旁，新增「本次冒險升級」Slide Toggle
  - Toggle 開啟後，顯示「升哪個職業」下拉選單，直接列出完整職業清單（CLASS_OPTIONS，共 13 個固定職業 + 其他）
  - 若選擇的職業角色已有，則該職業等級 +1；若角色尚無該職業，則新增並從 1 級開始
    - 範例：原本法師2、戰士2。選「法師」→ 法師3、戰士2；選「聖騎士」→ 法師2、戰士2、聖騎士1
  - 結束等級改為唯讀，由系統自動計算：`startingLevel + (levelUp ? 1 : 0)`
  - 儲存冒險記錄時，同步更新 `character_class_level` 表
  - 升級職業名稱記錄在冒險記錄上（新欄位 `level_up_class_name`），供編輯時還原
- **資料庫 Migration（需在 Supabase 執行）：**
  ```sql
  ALTER TABLE adventure_entry
      ADD COLUMN IF NOT EXISTS level_up_class_name VARCHAR(100);
  ```
- **影響範圍：**
  - DB：`adventure_entry` 新增 `level_up_class_name` 欄位
  - 後端 Entity / Request / Response / Service（建立＆更新時同步更新角色職業等級）
  - 前端 Model / Form（升級 UI 邏輯）/ Detail（顯示升級職業）
- **需要讀取的檔案：**
  - `database-schema.md`
  - `backend/src/main/java/com/dndadvlog/backend/entity/AdventureEntry.java`
  - `backend/src/main/java/com/dndadvlog/backend/entity/Character.java`
  - `backend/src/main/java/com/dndadvlog/backend/entity/CharacterClassLevel.java`
  - `backend/src/main/java/com/dndadvlog/backend/dto/AdventureEntryRequest.java`
  - `backend/src/main/java/com/dndadvlog/backend/dto/AdventureEntryResponse.java`
  - `backend/src/main/java/com/dndadvlog/backend/repository/CharacterRepository.java`
  - `backend/src/main/java/com/dndadvlog/backend/service/AdventureEntryService.java`
  - `frontend/src/app/core/models/adventure.model.ts`
  - `frontend/src/app/core/models/character.model.ts`
  - `frontend/src/app/core/services/character.service.ts`
  - `frontend/src/app/features/adventures/adventure-form/adventure-form.component.ts`
  - `frontend/src/app/features/adventures/adventure-form/adventure-form.component.html`
  - `frontend/src/app/features/adventures/adventure-detail/adventure-detail.component.html`
  - `frontend/src/app/features/characters/character-form/character-form.component.ts`（參考 CLASS_OPTIONS 清單）
- **待完成項目（後端）：**
  - [ ] `AdventureEntry` Entity 新增 `levelUpClassName` 欄位（`VARCHAR(100)`）
  - [ ] `AdventureEntryRequest` 新增 `levelUpClassName` 欄位
  - [ ] `AdventureEntryResponse` 新增 `levelUpClassName` 欄位
  - [ ] `AdventureEntryService.createEntry()` 儲存記錄時：若有 `levelUpClassName`，找 `character_class_level` 中同名職業 → `level + 1`；若不存在則新增一筆 `{className, level: 1}`
  - [ ] `AdventureEntryService.updateEntry()` 更新記錄時：若 `levelUpClassName` 有變動，先撤回舊職業（`level - 1`，降為 0 則移除該筆），再套用新職業（+1 或新增）；若新值為空則只撤回
  - [ ] 更新 `database-schema.md` 加入新欄位定義（含 Migration 3 ALTER TABLE SQL）
- **待完成項目（前端）：**
  - [ ] `adventure.model.ts` 的 `AdventureEntry` 與 `AdventureEntryRequest` 新增 `levelUpClassName` 欄位
  - [ ] `adventure-form.component.ts`：
    - 新增 `levelUp` signal（boolean，預設 false）與 `CLASS_OPTIONS` 常數（與 character-form 相同）
    - 新增 `levelUpClassName` 表單控制項（`<mat-select>`）
    - 結束等級改為 computed signal：`startingLevel + (levelUp() ? 1 : 0)`；從 FormGroup 移除 `endingLevel`，`buildRequest()` 回填 computed 結果
    - 表單載入時（新增＆編輯皆是）呼叫 `characterService.getById(characterId)` 取得角色職業清單，存入 `characterClassLevels` signal 供選項提示使用
  - [ ] `adventure-form.component.html`：
    - 起始等級旁新增 `<mat-slide-toggle>` 控制 `levelUp` signal
    - Toggle 開啟時顯示「升級職業」`<mat-select>`（`levelUpClassName` 控制項），選項為 CLASS_OPTIONS；顯示文字加入等級提示（例：「法師（目前 Lv.2）」或「聖騎士（新職業）」）
    - 結束等級改為唯讀文字 `{{ endingLevel() ?? '—' }}`（不再是 input）
  - [ ] `adventure-detail.component.html` 基本資訊區新增「升級職業」顯示欄（有值才顯示）
- **升級邏輯說明：**
  - 下拉選項顯示規則：查詢角色目前職業清單 → CLASS_OPTIONS 每一項若角色已有則顯示「職業（目前 Lv.X）」，否則顯示「職業（新職業）」
  - 後端 createEntry：找 `character.classLevels` 中 `className == levelUpClassName` → `level++`；找不到 → 新增 `{className, level: 1, sortOrder: 現有數量}`
  - 後端 updateEntry（levelUpClassName 有變動）：舊值不空 → 舊職業 `level--`（若降為 0 從清單移除）；新值不空 → 新職業 `level++`（若不存在則新增）

---

### T11 — 功能變更：角色表單玩家名稱預設帶入「可嵐」
- **狀態：** `[x] 已完成`
- **變更摘要：**
  - 建立角色時，「玩家名稱」欄位預設值帶入「可嵐」，使用者可手動修改
  - 無任何帳號/登入流程（MVP 單人版）
- **完成項目：**
  - [x] `character-form.component.ts` `playerName` 初始值改為 `'可嵐'`

---

### 📌 多人版本待辦（未來規劃，暫不實作）
- 玩家帳號系統（Email + 密碼 或 OAuth）
- 登入後自動帶入玩家名稱（取代目前的 localStorage / 硬寫預設值）
- 角色資料綁定玩家帳號，支援多玩家共用同一系統
- 角色列表只顯示當前登入玩家的角色

---

## 如何使用這個 Backlog

1. **開新 session 時**：把這個檔案貼給 AI，說「讀 backlog.md，然後執行 T0X」
2. **執行完一個工作**：將狀態從 `[ ]` 改為 `[x]`，並在備註補充完成摘要
3. **工作進行中**：將狀態改為 `[-]`，在備註記錄進度與阻礙
4. **臨時需求**：在上方的`工作項目清單`增加新項目

---