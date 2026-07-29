export type ItemType = 'PERMANENT' | 'CONSUMABLE';
export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE' | 'LEGENDARY';

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  PERMANENT: '永久魔法物品',
  CONSUMABLE: '消耗品',
};

export const ITEM_RARITY_LABELS: Record<ItemRarity, string> = {
  COMMON: 'Common',
  UNCOMMON: 'Uncommon',
  RARE: 'Rare',
  VERY_RARE: 'Very Rare',
  LEGENDARY: 'Legendary',
};

export const RARITY_COLORS: Record<ItemRarity, string> = {
  COMMON: '#9e9e9e',
  UNCOMMON: '#4caf50',
  RARE: '#2196f3',
  VERY_RARE: '#9c27b0',
  LEGENDARY: '#ff9800',
};

export interface InventoryItem {
  id: string;           // UUID
  characterId: string;  // UUID
  itemName: string;
  itemType: ItemType;
  rarity?: ItemRarity;
  quantity: number;
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItemRequest {
  itemName: string;
  itemType: ItemType;
  rarity?: ItemRarity | null;
  quantity?: number;
  source?: string | null;
  notes?: string | null;
}
