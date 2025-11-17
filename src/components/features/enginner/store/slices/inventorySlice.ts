import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { InventoryItem } from '../../App';

interface InventoryState {
  items: InventoryItem[];
  searchQuery: string;
  selectedCategory: string | null;
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Mechanical Keyboard RGB',
    code: 'MECH-KB-001',
    description: 'Gaming mechanical keyboard with RGB lighting',
    image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmQlMjBnYW1pbmd8ZW58MXx8fHwxNzU5Nzc2MzM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    availableQuantity: 15,
    totalQuantity: 25,
    category: 'Peripherals'
  },
  {
    id: '2',
    name: 'Epson PowerLite Projector',
    code: 'EPSON-002',
    description: 'HD projector for presentations',
    image: 'https://images.unsplash.com/photo-1625961332600-f6eac385c6ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0b3IlMjBvZmZpY2UlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzU5MTc4ODkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    availableQuantity: 3,
    totalQuantity: 5,
    category: 'Audiovisual'
  },
  {
    id: '3',
    name: 'Samsung 27" Monitor',
    code: 'SAM-003',
    description: '4K monitor for design and development',
    image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMG1vbml0b3IlMjBkaXNwbGF5fGVufDF8fHx8MTc1OTA1ODE5Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    availableQuantity: 12,
    totalQuantity: 20,
    category: 'Monitors'
  },
  {
    id: '4',
    name: 'HDMI 2.0 Cable',
    code: 'HDMI-004',
    description: 'High-speed HDMI cable 2 meters',
    image: 'https://images.unsplash.com/photo-1733913106110-3f9832a788a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZG1pJTIwY2FibGVzJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTkxNzg4OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    availableQuantity: 25,
    totalQuantity: 50,
    category: 'Cables'
  }
];

const initialState: InventoryState = {
  items: mockInventory,
  searchQuery: '',
  selectedCategory: null
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    updateItemQuantity: (state, action: PayloadAction<{ itemId: string; availableQuantity: number }>) => {
      const item = state.items.find(i => i.id === action.payload.itemId);
      if (item) {
        item.availableQuantity = action.payload.availableQuantity;
      }
    }
  }
});

export const { setSearchQuery, setSelectedCategory, updateItemQuantity } = inventorySlice.actions;
export default inventorySlice.reducer;
