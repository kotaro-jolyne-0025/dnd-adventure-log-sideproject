// ── CharacterClassLevel ──────────────────────────────────────────────────────

export interface CharacterClassLevel {
  id?: number;
  className: string;
  level: number;
}

// ── Character ────────────────────────────────────────────────────────────────

export interface Character {
  id: number;
  name: string;
  playerName: string;
  race: string;
  faction?: string;
  classesList: CharacterClassLevel[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

export interface CharacterClassLevelRequest {
  className: string;
  level: number;
}

export interface CharacterRequest {
  name: string;
  playerName: string;
  race: string;
  faction?: string | null;
  classesList: CharacterClassLevelRequest[];
}
