// src/types/inventory.ts

export type CategoryType = 'office-supplies' | 'technology' | 'tools' | 'clothing' | 'electronics' | 'furniture' | 'vehicles' | 'safety-equipment' | 'medical-supplies' | 'cleaning-supplies' | 'construction-materials' | 'laboratory-equipment';

export type StatusType = 'good-condition' | 'on-revision' | 'scrap' | 'repaired';

export type ItemType = 'consumable' | 'non-consumable' | 'pending-purchase';

export interface Article {
  id: number;
  imageUrl?: string;
  sku: string;
  name: string;
  description: string;
  category: CategoryType | string;
  type: ItemType;
  currentStock: number;
  cost: number;
  binCode: string;
  unit: string;
  supplier: string;
  minStock: number;
  location: string;
  status: StatusType | string;
  createdAt: string;
}

export interface KitItem {
  articleDescription: any;
  imageUrl: any;
  articleId: number;
  articleSku: string;
  articleName: string;
  quantity: number;
}

export interface Kit {
  id: number;
  binCode: string;
  name: string;
  description: string;
  category: CategoryType | string;
  quantity: number;
  items: KitItem[];
  imageUrl?: string;
  status: StatusType | string;
  createdAt: string;
}

// API response types for templates
export interface TemplateItemResponse {
  id: number;
  imageUrl?: string | null;
  sku: string;
  name: string;
  description: string;
  quantity: number;
}

export interface TemplateResponse {
  id: number;
  templateName: string;
  description: string;
  isActive: boolean;
  items: TemplateItemResponse[];
  createdAt: string;
  updatedAt: string;
}

// Application template type (for internal use)
export interface Template {
  id: number;
  name: string;
  description?: string;
  category: CategoryType | string;
  items: KitItem[];
  createdAt: string;
  isActive?: boolean;
  updatedAt?: string;
}

export type ViewMode = 'items' | 'kits' | 'create-kit' | 'bins' | 'transactions';
