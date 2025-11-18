import { createSelector } from '@reduxjs/toolkit';
// Use the main app store instead of local store
import type { RootState } from '../../../../store';
import type { CartItem, InventoryItem } from '../types/index';
import type { Notification } from '../../../../store/slices/notificationsSlice';

// Cart selectors - using engineerCart from main store
export const selectCartItems = (state: RootState): CartItem[] => state.engineerCart.items;
export const selectCartLastAction = (state: RootState) => state.engineerCart.lastAction;

export const selectCartItemsCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.quantity, 0)
);

export const selectCartTotal = createSelector(
  [selectCartItems],
  (items) => items.length
);

export const selectIsItemInCart = (itemId: string) =>
  createSelector(
    [selectCartItems],
    (items) => items.some(item => item.item.id === itemId)
  );

// Notifications selectors
export const selectNotifications = (state: RootState): Notification[] => state.notifications.items;

export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter(n => !n.read)
);

export const selectUnreadNotificationsCount = createSelector(
  [selectUnreadNotifications],
  (notifications) => notifications.length
);

// Inventory selectors
export const selectInventoryItems = (state: RootState): InventoryItem[] => state.inventory.items;
export const selectSearchQuery = (state: RootState): string => state.inventory.searchQuery;
export const selectSelectedCategory = (state: RootState): string | null => state.inventory.selectedCategory;

export const selectFilteredInventory = createSelector(
  [selectInventoryItems, selectSearchQuery, selectSelectedCategory],
  (items, searchQuery, selectedCategory) => {
    let filtered = items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    return filtered;
  }
);

export const selectCategories = createSelector(
  [selectInventoryItems],
  (items) => {
    const categories = new Set(items.map(item => item.category));
    return Array.from(categories).sort();
  }
);

// UI selectors
export const selectCurrentPage = (state: RootState) => state.ui.currentPage;
export const selectDarkMode = (state: RootState) => state.ui.darkMode;

// User selectors - using engineerUser from main store
export const selectCurrentUser = (state: RootState) => state.engineerUser.currentUser;
