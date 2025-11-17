import type { RootState } from './index';

// Helper to check if cart has specific item
export const isItemInCart = (state: RootState, itemId: string): boolean => {
  return state.cart.items.some(item => item.item.id === itemId);
};

// Helper to get cart item quantity
export const getCartItemQuantity = (state: RootState, itemId: string): number => {
  const item = state.cart.items.find(item => item.item.id === itemId);
  return item?.quantity || 0;
};

// Helper to calculate total items in cart
export const getTotalCartItems = (state: RootState): number => {
  return state.cart.items.reduce((total, item) => total + item.quantity, 0);
};

// Helper to get unread notifications count
export const getUnreadNotificationsCount = (state: RootState): number => {
  return state.notifications.items.filter(n => !n.read).length;
};

// Helper to check if user can add more items to cart (stock validation)
export const canAddToCart = (
  state: RootState, 
  itemId: string, 
  quantityToAdd: number
): boolean => {
  const inventoryItem = state.inventory.items.find(item => item.id === itemId);
  if (!inventoryItem) return false;
  
  const currentInCart = getCartItemQuantity(state, itemId);
  return (currentInCart + quantityToAdd) <= inventoryItem.availableQuantity;
};
