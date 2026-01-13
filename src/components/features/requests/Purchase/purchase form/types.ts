import type { CartItem, User as UserType } from '../../types';
import type { PurchaseRequest } from '../purchaseService';

export interface CartSnapshot {
  items: CartItem[];
  warehouseId?: string | number;
}

export interface PurchaseFormProps {
  currentUser: UserType;
  onBack: (() => void) | null;
  initialRequest?: PurchaseRequest | null;
  cartItems?: CartItem[];
  cartSnapshot?: CartSnapshot | null;
  clearCart?: () => void;
}

export interface PurchaseItem {
  name: string;
  isExisting: boolean;
  quantity: number;
  estimatedCost: number;
  link: string;
  createdItemId?: number;
}

export interface PurchaseFormData {
  items: PurchaseItem[];
  department: string;
  project: string;
  selfPurchase: boolean;
  warehouseId: string;
  purchaseReason: string;
  expectedDeliveryDate: string;
  clientBilled: 'yes' | 'no';
  company: string;
  customer: string;
  projectReference: string;
  workOrder: string;
  justification: string;
  address: string;
  googleMapsUrl: string;
  zipCode: string;
}

export interface DropdownState {
  [key: number]: boolean;
}

export interface ItemSearches {
  [key: number]: string;
}

export interface FilteredItems {
  [key: number]: import('../../services/sharedServices').CatalogItem[];
}
