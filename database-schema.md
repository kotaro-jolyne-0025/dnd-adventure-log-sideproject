# D&D 冒險日誌系統 — 資料庫 Schema
# 請到 Supabase Dashboard → SQL Editor 依序執行以下 SQL

---

## Step 1：建立 character 資料表

```sql
CREATE TABLE IF NOT EXISTS character (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_name VARCHAR(100) NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    race VARCHAR(100) NOT NULL,
    faction VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Step 2：建立 character_class_level 資料表（職業/等級動態列）

```sql
CREATE TABLE IF NOT EXISTS character_class_level (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

> **職業名稱允許值（前端下拉選單對應，共 13 種官方核心職業）：**
> `戰士` `法師` `牧師` `遊蕩者` `遊俠` `吟遊詩人` `德魯伊` `武僧` `聖騎士` `契術師` `術士` `野蠻人` `奇械師`

---

## Step 3：建立 adventure_entry 資料表

```sql
CREATE TABLE IF NOT EXISTS adventure_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
    adventure_code VARCHAR(100),
    adventure_name VARCHAR(255),
    play_date DATE,
    dm_name VARCHAR(100),
    starting_level INTEGER,
    ending_level INTEGER,
    starting_gold DECIMAL(10,2),
    gold_change DECIMAL(10,2),
    gold_total DECIMAL(10,2),
    starting_downtime INTEGER,
    downtime_change INTEGER,
    downtime_total INTEGER,
    starting_magic_items INTEGER,
    magic_items_change INTEGER,
    magic_items_total INTEGER,
    gold_downtime_change DECIMAL(10,2),
    downtime_downtime_change INTEGER,
    magic_items_downtime_change INTEGER,
    level_up_class_name VARCHAR(100),
    catchup_class_name VARCHAR(100),
    catchup_count INTEGER DEFAULT 0,
    adventure_notes TEXT,
    soul_coin_charges_used VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

> **注意（已部署資料庫的 Migration）：**
> 若 `adventure_entry` 資料表已存在，請在 Supabase SQL Editor 依序執行以下 ALTER：
>
> **Migration 1（T08）：**
> ```sql
> ALTER TABLE adventure_entry
>     ADD COLUMN IF NOT EXISTS starting_level INTEGER,
>     ADD COLUMN IF NOT EXISTS ending_level INTEGER;
> ```
>
> **Migration 2（T10）：**
> ```sql
> ALTER TABLE adventure_entry
>     ADD COLUMN IF NOT EXISTS gold_downtime_change DECIMAL(10,2),
>     ADD COLUMN IF NOT EXISTS downtime_downtime_change INTEGER,
>     ADD COLUMN IF NOT EXISTS magic_items_downtime_change INTEGER;
> ```
>
> **Migration 3（T12）：**
> ```sql
> ALTER TABLE adventure_entry
>     ADD COLUMN IF NOT EXISTS level_up_class_name VARCHAR(100);
> ```
>
> **Migration 4（T14）：**
> ```sql
> ALTER TABLE adventure_entry
>     ADD COLUMN IF NOT EXISTS catchup_class_name VARCHAR(100),
>     ADD COLUMN IF NOT EXISTS catchup_count INTEGER DEFAULT 0;
> ```

---

## Step 4a：建立 adventure_entry_class_snapshot 資料表（職業快照）

```sql
CREATE TABLE IF NOT EXISTS adventure_entry_class_snapshot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adventure_entry_id UUID NOT NULL REFERENCES adventure_entry(id) ON DELETE CASCADE,
    snapshot_type VARCHAR(10) NOT NULL,  -- 'starting' 或 'ending'
    class_name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0
);
```

> **Migration 5（T15）：**（若資料表不存在則建立）
> ```sql
> CREATE TABLE IF NOT EXISTS adventure_entry_class_snapshot (
>     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>     adventure_entry_id UUID NOT NULL REFERENCES adventure_entry(id) ON DELETE CASCADE,
>     snapshot_type VARCHAR(10) NOT NULL,
>     class_name VARCHAR(100) NOT NULL,
>     level INTEGER NOT NULL,
>     sort_order INTEGER DEFAULT 0
> );
> ```

---

## Step 4：建立 downtime_activity 資料表（休整期活動）

```sql
CREATE TABLE IF NOT EXISTS downtime_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adventure_entry_id UUID NOT NULL REFERENCES adventure_entry(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Step 5：建立 inventory_item 資料表（倉庫）

```sql
CREATE TYPE item_type AS ENUM ('PERMANENT', 'CONSUMABLE');
CREATE TYPE item_rarity AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE', 'LEGENDARY');

CREATE TABLE IF NOT EXISTS inventory_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    item_type item_type NOT NULL,
    rarity item_rarity,
    quantity INTEGER DEFAULT 1,
    source VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Step 6：建立自動更新 updated_at 的觸發器

```sql
-- 建立觸發器函式
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 套用到 character
CREATE TRIGGER update_character_updated_at
    BEFORE UPDATE ON character
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 套用到 adventure_entry
CREATE TRIGGER update_adventure_entry_updated_at
    BEFORE UPDATE ON adventure_entry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 套用到 downtime_activity
CREATE TRIGGER update_downtime_activity_updated_at
    BEFORE UPDATE ON downtime_activity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 套用到 inventory_item
CREATE TRIGGER update_inventory_item_updated_at
    BEFORE UPDATE ON inventory_item
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 資料表關聯圖

```
character
├── character_class_level  (1:N，CASCADE DELETE)
├── adventure_entry        (1:N，CASCADE DELETE)
│   ├── downtime_activity              (1:N，CASCADE DELETE)
│   └── adventure_entry_class_snapshot (1:N，CASCADE DELETE)
└── inventory_item         (1:N，CASCADE DELETE)
```
