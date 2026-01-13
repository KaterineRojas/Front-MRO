import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, InventoryItem } from '../../../enginner/types/index';

interface CartState {
  items: CartItem[];
  lastAction: 'added' | 'updated' | 'removed' | 'cleared' | null;
}

const initialState: CartState = {
  items: [],
  lastAction: null
};

const cartSlice = createSlice({
  name: 'engineerCart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ item: InventoryItem; quantity: number; warehouseId?: string; warehouseName?: string; skipStockValidation?: boolean }>) => {
      const { item, quantity, warehouseId, warehouseName, skipStockValidation } = action.payload;
      const existingItem = state.items.find(cartItem => cartItem.item.id === item.id);
      
      // Validar que la cantidad no exceda el stock disponible (skip for purchase requests)
      if (!skipStockValidation) {
        const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
        if (totalQuantity > item.availableQuantity) {
          console.warn('Cannot add more items than available in stock');
          return;
        }
      }
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ item, quantity, warehouseId, warehouseName });
      }
      state.lastAction = 'added';
    },
    updateCartItem: (state, action: PayloadAction<{ itemId: string; quantity: number; skipStockValidation?: boolean }>) => {
      const { itemId, quantity, skipStockValidation } = action.payload;
      
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.item.id !== itemId);
        state.lastAction = 'removed';
      } else {
        const cartItem = state.items.find(item => item.item.id === itemId);
        if (cartItem) {
          // Validar stock disponible (skip for purchase requests)
          if (skipStockValidation || quantity <= cartItem.item.availableQuantity) {
            cartItem.quantity = quantity;
            state.lastAction = 'updated';
          } else {
            console.warn('Cannot set quantity higher than available stock');
          }
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.item.id !== action.payload);
      state.lastAction = 'removed';
    },
    clearCart: (state) => {
      state.items = [];
      state.lastAction = 'cleared';
    },
    resetLastAction: (state) => {
      state.lastAction = null;
    }
  }
});

export const { addToCart, updateCartItem, removeFromCart, clearCart, resetLastAction } = cartSlice.actions;
export default cartSlice.reducer;
