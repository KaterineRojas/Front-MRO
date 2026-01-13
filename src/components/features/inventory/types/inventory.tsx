// src/types/inventory.ts

export interface Article {
  id: number;
  imageUrl?: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  type: 'consumable' | 'non-consumable' | 'pending-purchase';
  currentStock: number;
  cost: number;
  binCode: string;
  unit: string;
  supplier: string;
  minStock: number;
  location: string;
  status: 'good-condition' | 'on-revision' | 'scrap' | 'repaired';
  createdAt: string;
}

export interface KitItem {
  articleId: number;
  articleBinCode: string;
  articleName: string;
  quantity: number;
}

export interface Kit {
  id: number;
  binCode: string;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  imageUrl?: string;
  createdAt: string;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  createdAt: string;
}
