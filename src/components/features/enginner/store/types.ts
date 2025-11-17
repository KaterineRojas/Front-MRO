// Re-export common types for easier imports
export type { User, InventoryItem, CartItem, Notification, Page } from '../App';

// Additional Redux-specific types
export interface StoreError {
  message: string;
  code?: string;
}

export type LoadingState = 'idle' | 'pending' | 'succeeded' | 'failed';
