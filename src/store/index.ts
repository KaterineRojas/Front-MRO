// Main store exports
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Selectors
export * from './selectors';

// Auth slice
export { setUser, logout, updateUserRole } from './slices/authSlice';
export type { UserRole } from './slices/authSlice';

// UI slice
export {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  toggleNotifications,
  setNotificationsOpen,
} from './slices/uiSlice';

// Notifications slice
export {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} from './slices/notificationsSlice';
export type { Notification } from './slices/notificationsSlice';

// Inventory slice
export {
  fetchArticles,
  fetchKits,
  createArticle,
  updateArticle,
  deleteArticleAsync,
  createKit,
  updateKit,
  deleteKit,
  recordMovement,
} from './slices/inventorySlice';
