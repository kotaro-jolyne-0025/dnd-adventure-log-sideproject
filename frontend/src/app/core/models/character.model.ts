export interface Character {
  id: string;           // UUID
  characterName: string;
  playerName: string;
  race: string;
  faction?: string;
  currentClassesString?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CharacterRequest {
  characterName: string;
  playerName: string;
  race: string;
  faction?: string | null;
  currentClassesString?: string | null;
}
