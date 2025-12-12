// Engineer Module Types

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  availableQuantity?: number;
  quantity?: number;
  project?: string;
  projectCode?: string;
  sku?: string;
  warehouse?: string;
  warehouseCode?: string;
}

export interface CatalogItem {
  id: number;
  name: string;
  description: string;
  sku: string;
  availableQuantity: number;
  category: string;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
  warehouseId?: string;
  warehouseName?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}
