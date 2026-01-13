import { RootState } from './store';

// Auth Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUserRole = (state: RootState) => state.auth.user?.role;

// UI Selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectDarkMode = (state: RootState) => state.ui.darkMode;
export const selectNotificationsOpen = (state: RootState) => state.ui.notificationsOpen;

// Notifications Selectors
export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadNotifications = (state: RootState) => 
  state.notifications.items.filter(n => !n.read);
export const selectUnreadCount = (state: RootState) => 
  state.notifications.items.filter(n => !n.read).length;

// Inventory Selectors
export const selectArticles = (state: RootState) => state.inventory.articles;
export const selectKits = (state: RootState) => state.inventory.kits;
export const selectInventoryLoading = (state: RootState) => state.inventory.loading;
export const selectInventoryError = (state: RootState) => state.inventory.error;

// Inventory Computed Selectors
export const selectLowStockArticles = (state: RootState) => 
  state.inventory.articles.filter(article => article.currentStock <= article.minStock);
export const selectOutOfStockArticles = (state: RootState) => 
  state.inventory.articles.filter(article => article.currentStock === 0);
export const selectArticleById = (state: RootState, id: number) => 
  state.inventory.articles.find(article => article.id === id);
export const selectKitById = (state: RootState, id: number) => 
  state.inventory.kits.find(kit => kit.id === id);

// Permission Helpers
export const selectCanAccessAdminFeatures = (state: RootState) => 
  state.auth.user?.role === 'administrator';
export const selectCanAccessManagerFeatures = (state: RootState) => 
  state.auth.user?.role === 'administrator' || state.auth.user?.role === 'manager';
export const selectCanAccessPurchasingFeatures = (state: RootState) => 
  state.auth.user?.role === 'administrator' || state.auth.user?.role === 'purchasing';
