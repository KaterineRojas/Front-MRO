import type { CartItem } from '../../types';
import type { User } from '../../types';
import type { LoanFormData, LoanItem, CatalogItem } from './types';

/**
 * Validates if a string is a valid URL
 */
export const isValidUrl = (urlString: string): boolean => {
  if (!urlString) return true; // Empty URL is valid (optional field)
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

/**
 * Formats a work order date for display
 */
export const formatWorkOrderDate = (value?: string): string => {
  if (!value) return 'No date provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Gets the minimum allowed date (tomorrow)
 */
export const getMinDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

/**
 * Creates a default empty loan item
 */
export const createDefaultLoanItem = (): LoanItem => ({
  itemId: '',
  itemName: '',
  quantity: 1,
});

/**
 * Maps a cart item to a loan item
 */
export const mapCartItemToLoanItem = (cartItem: CartItem): LoanItem => ({
  itemId: cartItem.item.id,
  itemName: cartItem.item.name,
  quantity: cartItem.quantity,
});

/**
 * Builds initial form data from props
 */
export const buildInitialFormData = (
  currentUser: User,
  cartItems: CartItem[]
): LoanFormData => {
  const cartWarehouseId = cartItems.length > 0 ? cartItems[0].warehouseId : '';

  return {
    items: cartItems.length > 0
      ? cartItems.map(mapCartItemToLoanItem)
      : [createDefaultLoanItem()],
    department: currentUser.departmentId || currentUser.department || '',
    returnDate: '',
    notes: '',
    warehouseId: cartWarehouseId || '',
    company: '',
    customer: '',
    project: '',
    workOrder: '',
    address: '',
    googleMapsUrl: '',
    zipCode: '',
  };
};

/**
 * Builds initial item searches from cart items
 */
export const buildInitialItemSearches = (
  cartItems: CartItem[]
): Record<number, string> => {
  const searches: Record<number, string> = {};
  cartItems.forEach((item, index) => {
    searches[index] = item.item.name;
  });
  return searches;
};

/**
 * Recomputes filtered items based on current selections
 */
export const recomputeFilteredItems = (
  itemsList: { itemId: string }[],
  catalogItems: CatalogItem[]
): Record<number, CatalogItem[]> => {
  const selectedItemIds = itemsList
    .map((i) => i.itemId)
    .filter((id) => id !== '');

  const updatedFiltered: Record<number, CatalogItem[]> = {};

  itemsList.forEach((_, index) => {
    updatedFiltered[index] = catalogItems.filter(
      (ci) => !selectedItemIds.includes(ci.id)
    );
  });

  return updatedFiltered;
};

/**
 * Validates stock for an item
 */
export const validateStock = (
  itemId: string,
  quantity: number,
  catalogItems: CatalogItem[]
): boolean => {
  const item = catalogItems.find((i) => i.id === itemId);
  return item ? quantity <= item.availableQuantity : false;
};

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates the form data before submission
 */
export const validateLoanForm = (
  formData: LoanFormData,
  catalogItems: CatalogItem[],
  offlineMode: boolean
): ValidationResult => {
  if (offlineMode) {
    return {
      isValid: false,
      errorMessage: 'You cannot submit requests while offline. Please check your connection.',
    };
  }

  if (formData.googleMapsUrl && !isValidUrl(formData.googleMapsUrl)) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid URL for the location',
    };
  }

  if (formData.zipCode && formData.zipCode.length > 6) {
    return {
      isValid: false,
      errorMessage: 'ZIP code cannot exceed 6 characters',
    };
  }

  if (!formData.project) {
    return {
      isValid: false,
      errorMessage: 'Please select a project',
    };
  }

  if (!formData.workOrder) {
    return {
      isValid: false,
      errorMessage: 'Please select a work order',
    };
  }

  for (const item of formData.items) {
    if (!item.itemId) {
      return {
        isValid: false,
        errorMessage: 'Please select all items before submitting.',
      };
    }
    if (!validateStock(item.itemId, item.quantity, catalogItems)) {
      return {
        isValid: false,
        errorMessage: `Insufficient stock for ${item.itemName}`,
      };
    }
  }

  return { isValid: true };
};
