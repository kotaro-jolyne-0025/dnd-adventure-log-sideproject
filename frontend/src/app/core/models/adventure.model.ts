// ── DowntimeActivity ─────────────────────────────────────────────────────────

export interface DowntimeActivity {
  id: number;
  description: string;
  createdAt?: string;
}

export interface DowntimeActivityRequest {
  description: string;
}

// ── AdventureEntry ───────────────────────────────────────────────────────────

export interface AdventureEntry {
  id: number;
  characterId: number;
  adventureCode?: string;
  adventureName?: string;
  playDate?: string;       // ISO date string YYYY-MM-DD
  dmName?: string;
  goldStart?: number;
  goldChange?: number;
  goldTotal?: number;
  downtimeDaysStart?: number;
  downtimeDaysChange?: number;
  downtimeDaysTotal?: number;
  magicItemsStart?: number;
  magicItemsChange?: number;
  magicItemsTotal?: number;
  notes?: string;
  renownChange?: string;
  downtimeActivities: DowntimeActivity[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdventureEntryRequest {
  adventureCode?: string | null;
  adventureName?: string | null;
  playDate?: string | null;
  dmName?: string | null;
  goldStart?: number | null;
  goldChange?: number | null;
  goldTotal?: number | null;
  downtimeDaysStart?: number | null;
  downtimeDaysChange?: number | null;
  downtimeDaysTotal?: number | null;
  magicItemsStart?: number | null;
  magicItemsChange?: number | null;
  magicItemsTotal?: number | null;
  notes?: string | null;
  renownChange?: string | null;
}
