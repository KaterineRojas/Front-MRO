import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import notificationsReducer from './slices/notificationsSlice';
import inventoryReducer from './slices/inventorySlice';
import requestsReducer from './slices/requestsSlice';
// Engineer Module Slices
import engineerCartReducer from '../components/features/enginner/store/slices/cartSlice';
import engineerUserReducer from '../components/features/enginner/store/slices/userSlice';

// Middleware para persistir carrito de engineer en localStorage
const engineerCartMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  
  // Guardar carrito de engineer cuando cambie
  if (action.type?.startsWith('engineerCart/')) {
    const state = store.getState();
    try {
      localStorage.setItem('engineerCart', JSON.stringify(state.engineerCart.items));
    } catch (error) {
      console.error('Error saving engineer cart to localStorage:', error);
    }
  }
  
  return result;
};

// Cargar estado inicial del carrito de engineer desde localStorage
const loadEngineerCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('engineerCart');
    if (savedCart) {
      return { items: JSON.parse(savedCart), lastAction: null };
    }
  } catch (error) {
    console.error('Error loading engineer cart from localStorage:', error);
  }
  return { items: [], lastAction: null };
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    inventory: inventoryReducer,
    requests: requestsReducer,
    // Engineer Module State
    engineerCart: engineerCartReducer,
    engineerUser: engineerUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(engineerCartMiddleware),
  preloadedState: {
    engineerCart: loadEngineerCartFromStorage()
  } as any,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
