export type Page = 'dashboard' | 'catalog' | 'borrow' | 'purchase' | 'transfer' | 'my-inventory' | 'complete-history';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  employeeId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  description: string;
  image: string;
  availableQuantity: number;
  totalQuantity: number;
  category: string;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
  warehouseId?: string;
  warehouseName?: string;
}

export interface BorrowRequest {
  id: string;
  items: { itemId: string; itemName: string; quantity: number; status?: 'active' | 'transfer-pending' | 'returned' }[];
  department: string;
  project: string;
  projectCode?: string;
  returnDate: string;
  status: 'pending' | 'approved' | 'active' | 'transfer-pending' | 'completed' | 'rejected';
  requestDate: string;
  type: 'borrow';
}

export interface PurchaseRequest {
  id: string;
  items: { name: string; quantity: number; estimatedCost: number; justification: string; link?: string }[];
  department: string;
  project: string;
  projectCode?: string;
  priority: 'low' | 'medium' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  type: 'purchase';
  selfPurchase: boolean;
}
