// ── DowntimeActivity ─────────────────────────────────────────────────────────

export interface DowntimeActivity {
  id: string;           // UUID
  adventureEntryId?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DowntimeActivityRequest {
  description: string;
}

// ── AdventureEntry ───────────────────────────────────────────────────────────

export interface AdventureEntry {
  id: string;           // UUID
  characterId: string;  // UUID
  adventureCode?: string;
  adventureName?: string;
  playDate?: string;            // ISO date YYYY-MM-DD
  dmName?: string;
  startingGold?: number;
  goldChange?: number;
  goldTotal?: number;
  startingDowntime?: number;
  downtimeChange?: number;
  downtimeTotal?: number;
  startingMagicItems?: number;
  magicItemsChange?: number;
  magicItemsTotal?: number;
  adventureNotes?: string;
  soulCoinChargesUsed?: string;
  downtimeActivities: DowntimeActivity[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdventureEntryRequest {
  adventureCode?: string | null;
  adventureName?: string | null;
  playDate?: string | null;
  dmName?: string | null;
  startingGold?: number | null;
  goldChange?: number | null;
  goldTotal?: number | null;
  startingDowntime?: number | null;
  downtimeChange?: number | null;
  downtimeTotal?: number | null;
  startingMagicItems?: number | null;
  magicItemsChange?: number | null;
  magicItemsTotal?: number | null;
  adventureNotes?: string | null;
  soulCoinChargesUsed?: string | null;
}
