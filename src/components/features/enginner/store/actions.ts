// Centralized exports for all Redux actions
export { addToCart, updateCartItem, removeFromCart, clearCart, resetLastAction } from './slices/cartSlice';
export { markAsRead, addNotification, removeNotification } from './slices/notificationsSlice';
export { setUser, updateUser } from './slices/userSlice';
export { setCurrentPage, toggleDarkMode, setDarkMode } from './slices/uiSlice';
export { setSearchQuery, setSelectedCategory, updateItemQuantity } from './slices/inventorySlice';
