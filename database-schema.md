# Supabase 資料庫建表 SQL
# 請到 Supabase Dashboard → SQL Editor 執行以下 SQL

## 建立 character 資料表

```sql
CREATE TABLE IF NOT EXISTS character (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_name VARCHAR(100) NOT NULL,
    race_classes_levels VARCHAR(255),
    player_name VARCHAR(100),
    faction VARCHAR(100),
    soul_coins_carried INTEGER DEFAULT 0,
    sheet_number INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 建立 adventure_entry 資料表

```sql
CREATE TABLE IF NOT EXISTS adventure_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES character(id) ON DELETE CASCADE,
    adventure_code VARCHAR(100),
    adventure_name VARCHAR(255),
    play_date DATE,
    dm_name VARCHAR(100),
    starting_level INTEGER,
    level_accepted BOOLEAN DEFAULT FALSE,
    ending_level INTEGER,
    starting_gold DECIMAL(10,2) DEFAULT 0,
    gold_change DECIMAL(10,2) DEFAULT 0,
    gold_total DECIMAL(10,2) DEFAULT 0,
    starting_downtime INTEGER DEFAULT 0,
    downtime_change INTEGER DEFAULT 0,
    downtime_used INTEGER DEFAULT 0,
    downtime_total INTEGER DEFAULT 0,
    starting_magic_items INTEGER DEFAULT 0,
    magic_items_change INTEGER DEFAULT 0,
    magic_items_total INTEGER DEFAULT 0,
    adventure_notes TEXT,
    soul_coin_charges_used VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 建立自動更新 updated_at 的觸發器

```sql
-- 建立觸發器函式
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 套用到 character 資料表
CREATE TRIGGER update_character_updated_at
    BEFORE UPDATE ON character
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 套用到 adventure_entry 資料表
CREATE TRIGGER update_adventure_entry_updated_at
    BEFORE UPDATE ON adventure_entry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
