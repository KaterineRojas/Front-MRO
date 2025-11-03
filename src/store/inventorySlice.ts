import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Article } from '@/components/features/inventory/types/inventory';
import type { Kit } from '@/services/kitsService';
import { getKitsWithItems } from '@/services/kitsService';

export interface InventoryState {
  articles: Article[];
  kits: Kit[];
  selectedView: 'items' | 'kits' | 'create-kit' | 'bins' | 'transactions';
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  articles: [],
  kits: [],
  selectedView: 'items',
  loading: false,
  error: null,
};

// Async thunks
export const fetchKits = createAsyncThunk(
  'inventory/fetchKits',
  async (_, { rejectWithValue }) => {
    try {
      const kits = await getKitsWithItems();
      return kits;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch kits');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Articles
    setArticles: (state, action: PayloadAction<Article[]>) => {
      state.articles = action.payload;
    },
    addArticle: (state, action: PayloadAction<Article>) => {
      state.articles.push(action.payload);
    },
    updateArticle: (state, action: PayloadAction<Article>) => {
      const index = state.articles.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.articles[index] = action.payload;
      }
    },
    deleteArticle: (state, action: PayloadAction<number>) => {
      state.articles = state.articles.filter(a => a.id !== action.payload);
    },
    updateArticleStock: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const article = state.articles.find(a => a.id === action.payload.id);
      if (article) {
        article.currentStock += action.payload.quantity;
      }
    },

    // Kits
    setKits: (state, action: PayloadAction<Kit[]>) => {
      state.kits = action.payload;
    },
    addKit: (state, action: PayloadAction<Kit>) => {
      state.kits.push(action.payload);
    },
    updateKit: (state, action: PayloadAction<Kit>) => {
      const index = state.kits.findIndex(k => k.id === action.payload.id);
      if (index !== -1) {
        state.kits[index] = action.payload;
      }
    },
    deleteKit: (state, action: PayloadAction<number>) => {
      state.kits = state.kits.filter(k => k.id !== action.payload);
    },

    // View management
    setSelectedView: (state, action: PayloadAction<InventoryState['selectedView']>) => {
      state.selectedView = action.payload;
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Bulk operations
    bulkUpdateArticles: (state, action: PayloadAction<Article[]>) => {
      action.payload.forEach(updatedArticle => {
        const index = state.articles.findIndex(a => a.id === updatedArticle.id);
        if (index !== -1) {
          state.articles[index] = updatedArticle;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch kits
      .addCase(fetchKits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKits.fulfilled, (state, action) => {
        state.loading = false;
        state.kits = action.payload;
        state.error = null;
      })
      .addCase(fetchKits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setArticles,
  addArticle,
  updateArticle,
  deleteArticle,
  updateArticleStock,
  setKits,
  addKit,
  updateKit,
  deleteKit,
  setSelectedView,
  setLoading,
  setError,
  bulkUpdateArticles,
} = inventorySlice.actions;

export default inventorySlice.reducer;
