// Engineer Module Types

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  departmentId?: string;
  departmentName?: string;
  avatar?: string;
  employeeId: string
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  code?: string;
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


