import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Article, Kit, Template } from '@/components/features/inventory/types/inventory';

export interface InventoryState {
  articles: Article[];
  kits: Kit[];
  templates: Template[];
  selectedView: 'items' | 'kits' | 'create-kit' | 'templates' | 'edit-template' | 'bins' | 'transactions';
  selectedTemplate: Template | null;
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  articles: [],
  kits: [],
  templates: [],
  selectedView: 'items',
  selectedTemplate: null,
  loading: false,
  error: null,
};

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

    // Templates
    setTemplates: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<Template>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<Template>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    deleteTemplate: (state, action: PayloadAction<number>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    },
    setSelectedTemplate: (state, action: PayloadAction<Template | null>) => {
      state.selectedTemplate = action.payload;
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
  setTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  setSelectedTemplate,
  setSelectedView,
  setLoading,
  setError,
  bulkUpdateArticles,
} = inventorySlice.actions;

export default inventorySlice.reducer;
