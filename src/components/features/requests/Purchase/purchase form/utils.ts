import type { CartItem, User as UserType } from '../../types';
import type { PurchaseRequest } from '../purchaseService';
import type { CartSnapshot, PurchaseFormData, PurchaseItem, ItemSearches } from './types';

/**
 * Creates a default empty purchase item
 */
export const createDefaultPurchaseItem = (): PurchaseItem => ({
  name: '',
  isExisting: true,
  quantity: 1,
  estimatedCost: 0,
  link: '',
  createdItemId: undefined
});

/**
 * Maps a cart item to a purchase item
 */
export const mapCartItemToPurchaseItem = (cartItem: CartItem): PurchaseItem => {
  const numericId = Number(cartItem.item.id);
  return {
    name: cartItem.item.name,
    isExisting: true,
    quantity: cartItem.quantity,
    estimatedCost: 0,
    link: '',
    createdItemId: Number.isFinite(numericId) ? numericId : undefined
  };
};

/**
 * Gets cart snapshot from sessionStorage
 */
export const getStoredSnapshot = (): CartSnapshot | null => {
  try {
    const raw = sessionStorage.getItem('purchaseCartSnapshot');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CartSnapshot;
    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse stored snapshot', e);
  }
  return null;
};

/**
 * Builds the initial form data based on user, request, cart items and snapshot
 */
export const buildInitialFormData = (
  user: UserType,
  request?: PurchaseRequest | null,
  cartItems?: CartItem[],
  cartSnapshot?: CartSnapshot | null
): PurchaseFormData => {
  if (request) {
    return {
      items: request.items.map((item) => ({
        name: item.name,
        isExisting: true,
        quantity: item.quantity,
        estimatedCost: item.estimatedCost ?? 0,
        link: item.productUrl ?? '',
        createdItemId: Number.isFinite(Number(item.itemId)) ? Number(item.itemId) : undefined
      })),
      department: request.departmentId || user.departmentId || user.department || '',
      project: request.projectName || '',
      selfPurchase: request.selfPurchase ?? false,
      warehouseId: request.warehouseId ? String(request.warehouseId) : '',
      purchaseReason: request.reasonId !== undefined ? String(request.reasonId) : '',
      expectedDeliveryDate: request.expectedDeliveryDate ?? '',
      clientBilled: request.clientBilled ? 'yes' : 'no',
      company: request.companyId ?? '',
      customer: request.customerId ?? '',
      projectReference: '',
      workOrder: request.workOrderId ?? '',
      justification: request.notes || '',
      address: '',
      googleMapsUrl: '',
      zipCode: ''
    };
  }

  // Try to get snapshot from props first, then from sessionStorage
  const snapshotItems = cartSnapshot?.items;
  const hasSnapshotItems = Array.isArray(snapshotItems) && snapshotItems.length > 0;

  // Fallback to sessionStorage if props are empty
  let effectiveSnapshot = hasSnapshotItems ? cartSnapshot : null;
  if (!effectiveSnapshot) {
    effectiveSnapshot = getStoredSnapshot();
  }

  const effectiveCartItems = effectiveSnapshot?.items ?? cartItems;
  const hasCartItems = (effectiveCartItems?.length ?? 0) > 0;

  const items = hasCartItems
    ? effectiveCartItems!.map(mapCartItemToPurchaseItem)
    : [createDefaultPurchaseItem()];

  return {
    items,
    department: user.departmentId || user.department || '',
    project: '',
    selfPurchase: false,
    warehouseId: hasCartItems
      ? String(effectiveSnapshot?.warehouseId ?? effectiveCartItems![0].warehouseId ?? '')
      : '',
    purchaseReason: '',
    expectedDeliveryDate: '',
    clientBilled: 'no',
    company: '',
    customer: '',
    projectReference: '',
    workOrder: '',
    justification: '',
    address: '',
    googleMapsUrl: '',
    zipCode: ''
  };
};

/**
 * Builds initial item searches based on existing data
 */
export const buildInitialItemSearches = (
  request?: PurchaseRequest | null,
  cartItems?: CartItem[],
  cartSnapshot?: CartSnapshot | null
): ItemSearches => {
  const searches: ItemSearches = {};
  
  if (request) {
    request.items.forEach((item, index) => {
      searches[index] = item.name;
    });
    return searches;
  }

  // Try to get snapshot from props first, then from sessionStorage
  const snapshotItems = cartSnapshot?.items;
  const hasSnapshotItems = Array.isArray(snapshotItems) && snapshotItems.length > 0;
  let effectiveSnapshot = hasSnapshotItems ? cartSnapshot : null;
  if (!effectiveSnapshot) {
    effectiveSnapshot = getStoredSnapshot();
  }

  const sourceItems = effectiveSnapshot?.items ?? cartItems;

  sourceItems?.forEach((cartItem, index) => {
    searches[index] = cartItem.item.name;
  });

  return searches;
};

/**
 * Validates a URL string
 */
export const validateUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Calculates total cost of all items
 */
export const calculateTotalCost = (items: PurchaseItem[]): number => {
  return items.reduce((sum, item) => sum + (item.estimatedCost * item.quantity), 0);
};

/**
 * Reason map for converting string reasons to numeric values
 */
export const REASON_MAP: Record<string, 0 | 1 | 2> = {
  'low-stock': 0,
  'urgent': 1,
  'new-project': 2
};
