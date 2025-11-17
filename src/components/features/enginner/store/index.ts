import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import notificationsReducer from './slices/notificationsSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import inventoryReducer from './slices/inventorySlice';

// Middleware para persistir carrito en localStorage
const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  
  // Guardar carrito cuando cambie
  if (action.type?.startsWith('cart/')) {
    const state = store.getState();
    try {
      localStorage.setItem('cart', JSON.stringify(state.cart.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
  
  return result;
};

// Cargar estado inicial del carrito desde localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      return { items: JSON.parse(savedCart), lastAction: null };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return { items: [], lastAction: null };
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    notifications: notificationsReducer,
    user: userReducer,
    ui: uiReducer,
    inventory: inventoryReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
  preloadedState: {
    cart: loadCartFromStorage()
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
