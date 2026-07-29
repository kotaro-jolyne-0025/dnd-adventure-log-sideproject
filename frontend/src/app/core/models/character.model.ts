// ── CharacterClassLevel ──────────────────────────────────────────────────────

export interface CharacterClassLevel {
  id?: string;          // UUID
  className: string;
  level: number;
  sortOrder?: number;
}

// ── Character ────────────────────────────────────────────────────────────────

export interface Character {
  id: string;           // UUID
  characterName: string;
  playerName: string;
  race: string;
  faction?: string;
  classLevels: CharacterClassLevel[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

export interface CharacterClassLevelRequest {
  className: string;
  level: number;
}

export interface CharacterRequest {
  characterName: string;
  playerName: string;
  race: string;
  faction?: string | null;
  classLevels: CharacterClassLevelRequest[];
}
