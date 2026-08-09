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
  startingLevel?: number;
  endingLevel?: number;
  levelUpClassName?: string;
  catchupClassName?: string;
  catchupCount?: number;
  startingGold?: number;
  goldChange?: number;
  goldDowntimeChange?: number;
  goldTotal?: number;
  startingDowntime?: number;
  downtimeChange?: number;
  downtimeDowntimeChange?: number;
  downtimeTotal?: number;
  startingMagicItems?: number;
  magicItemsChange?: number;
  magicItemsDowntimeChange?: number;
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
  startingLevel?: number | null;
  endingLevel?: number | null;
  levelUpClassName?: string | null;
  catchupClassName?: string | null;
  catchupCount?: number | null;
  startingGold?: number | null;
  goldChange?: number | null;
  goldDowntimeChange?: number | null;
  startingDowntime?: number | null;
  downtimeChange?: number | null;
  downtimeDowntimeChange?: number | null;
  startingMagicItems?: number | null;
  magicItemsChange?: number | null;
  magicItemsDowntimeChange?: number | null;
  adventureNotes?: string | null;
  soulCoinChargesUsed?: string | null;
}

export interface EntryDefaults {
  startingLevel?: number | null;
  startingGold?: number | null;
  startingDowntime?: number | null;
  startingMagicItems?: number | null;
}
