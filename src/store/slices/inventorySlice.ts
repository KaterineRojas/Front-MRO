import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Article, Kit, Template, Bin, Transaction, MovementData } from '../../components/features/inventory/types';
import { 
  fetchArticlesFromApi, 
  fetchKitsFromApi, 
  fetchTemplatesFromApi, 
  fetchBinsFromApi, 
  fetchTransactionsFromApi,
  createArticleApi,
  updateArticleApi,
  createKitApi,
  updateKitApi,
  createTemplateApi,
  updateTemplateApi,
  createBinApi,
  updateBinApi,
  recordMovementApi
} from '../../components/features/inventory/services/inventoryApi';

interface InventoryState {
  articles: Article[];
  kits: Kit[];
  templates: Template[];
  bins: Bin[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  articles: [],
  kits: [],
  templates: [],
  bins: [],
  transactions: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchArticles = createAsyncThunk(
  'inventory/fetchArticles',
  async () => {
    const articles = await fetchArticlesFromApi();
    return articles;
  }
);

export const fetchKits = createAsyncThunk(
  'inventory/fetchKits',
  async () => {
    const kits = await fetchKitsFromApi();
    return kits;
  }
);

export const fetchTemplates = createAsyncThunk(
  'inventory/fetchTemplates',
  async () => {
    const templates = await fetchTemplatesFromApi();
    return templates;
  }
);

export const fetchBins = createAsyncThunk(
  'inventory/fetchBins',
  async () => {
    const bins = await fetchBinsFromApi();
    return bins;
  }
);

export const fetchTransactions = createAsyncThunk(
  'inventory/fetchTransactions',
  async () => {
    const transactions = await fetchTransactionsFromApi();
    return transactions;
  }
);

// Create operations with API simulation
export const createArticleAsync = createAsyncThunk(
  'inventory/createArticle',
  async (articleData: Omit<Article, 'id' | 'createdAt' | 'currentStock' | 'location' | 'status'>) => {
    const newArticle = await createArticleApi(articleData);
    return newArticle;
  }
);

export const updateArticleAsync = createAsyncThunk(
  'inventory/updateArticle',
  async ({ id, data }: { id: number; data: Partial<Article> }) => {
    const updatedArticle = await updateArticleApi(id, data);
    return { id, data };
  }
);

export const createKitAsync = createAsyncThunk(
  'inventory/createKit',
  async (kitData: Omit<Kit, 'id' | 'createdAt'>) => {
    const newKit = await createKitApi(kitData);
    return newKit;
  }
);

export const updateKitAsync = createAsyncThunk(
  'inventory/updateKit',
  async ({ id, data }: { id: number; data: Partial<Kit> }) => {
    const updatedKit = await updateKitApi(id, data);
    return { id, data };
  }
);

export const createTemplateAsync = createAsyncThunk(
  'inventory/createTemplate',
  async (templateData: Omit<Template, 'id' | 'createdAt'>) => {
    const newTemplate = await createTemplateApi(templateData);
    return newTemplate;
  }
);

export const updateTemplateAsync = createAsyncThunk(
  'inventory/updateTemplate',
  async ({ id, data }: { id: number; data: Partial<Template> }) => {
    const updatedTemplate = await updateTemplateApi(id, data);
    return { id, data };
  }
);

export const createBinAsync = createAsyncThunk(
  'inventory/createBin',
  async (binData: Omit<Bin, 'id'>) => {
    const newBin = await createBinApi(binData);
    return newBin;
  }
);

export const updateBinAsync = createAsyncThunk(
  'inventory/updateBin',
  async ({ id, data }: { id: number; data: Partial<Bin> }) => {
    const updatedBin = await updateBinApi(id, data);
    return { id, data };
  }
);

export const recordMovementAsync = createAsyncThunk(
  'inventory/recordMovement',
  async (movementData: MovementData) => {
    const result = await recordMovementApi(movementData);
    return { movementData, transaction: result.transaction };
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Article reducers
    createArticle: (state, action: PayloadAction<Article>) => {
      state.articles.push(action.payload);
    },
    updateArticle: (state, action: PayloadAction<{ id: number; data: Partial<Article> }>) => {
      const index = state.articles.findIndex(article => article.id === action.payload.id);
      if (index !== -1) {
        state.articles[index] = { ...state.articles[index], ...action.payload.data };
      }
    },
    deleteArticle: (state, action: PayloadAction<number>) => {
      state.articles = state.articles.filter(article => article.id !== action.payload);
    },
    
    // Kit reducers
    createKit: (state, action: PayloadAction<Kit>) => {
      state.kits.push(action.payload);
    },
    updateKit: (state, action: PayloadAction<{ id: number; data: Partial<Kit> }>) => {
      const index = state.kits.findIndex(kit => kit.id === action.payload.id);
      if (index !== -1) {
        state.kits[index] = { ...state.kits[index], ...action.payload.data };
      }
    },
    deleteKit: (state, action: PayloadAction<number>) => {
      state.kits = state.kits.filter(kit => kit.id !== action.payload);
    },

    // Template reducers
    createTemplate: (state, action: PayloadAction<Template>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<{ id: number; data: Partial<Template> }>) => {
      const index = state.templates.findIndex(template => template.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = { ...state.templates[index], ...action.payload.data };
      }
    },
    deleteTemplate: (state, action: PayloadAction<number>) => {
      state.templates = state.templates.filter(template => template.id !== action.payload);
    },

    // Bin reducers
    createBin: (state, action: PayloadAction<Bin>) => {
      state.bins.push(action.payload);
    },
    updateBin: (state, action: PayloadAction<{ id: number; data: Partial<Bin> }>) => {
      const index = state.bins.findIndex(bin => bin.id === action.payload.id);
      if (index !== -1) {
        state.bins[index] = { ...state.bins[index], ...action.payload.data };
      }
    },
    deleteBin: (state, action: PayloadAction<number>) => {
      state.bins = state.bins.filter(bin => bin.id !== action.payload);
    },

    // Transaction reducers
    createTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },

    // Movement reducer
    recordMovement: (state, action: PayloadAction<MovementData>) => {
      const movementData = action.payload;
      
      if (movementData.itemType === 'item') {
        let selectedArticle: Article | undefined;
        
        if (movementData.movementType === 'entry') {
          selectedArticle = state.articles.find(article => article.sku === movementData.articleSKU);
        } else {
          selectedArticle = state.articles.find(article => article.binCode === movementData.articleBinCode);
        }
        
        if (!selectedArticle) return;

        const quantityChange = parseInt(movementData.quantity);
        let newStock = selectedArticle.currentStock;

        switch (movementData.movementType) {
          case 'entry':
            newStock += quantityChange;
            break;
          case 'exit':
            newStock -= quantityChange;
            break;
          case 'relocation':
            // Stock doesn't change for relocation
            break;
        }

        const index = state.articles.findIndex(article => 
          movementData.movementType === 'entry' 
            ? article.sku === movementData.articleSKU 
            : article.binCode === movementData.articleBinCode
        );

        if (index !== -1) {
          state.articles[index] = {
            ...state.articles[index],
            currentStock: Math.max(0, newStock),
            location: movementData.newLocation || state.articles[index].location
          };
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch articles
    builder.addCase(fetchArticles.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchArticles.fulfilled, (state, action) => {
      state.loading = false;
      state.articles = action.payload;
    });
    builder.addCase(fetchArticles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch articles';
    });

    // Fetch kits
    builder.addCase(fetchKits.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchKits.fulfilled, (state, action) => {
      state.loading = false;
      state.kits = action.payload;
    });
    builder.addCase(fetchKits.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch kits';
    });

    // Fetch templates
    builder.addCase(fetchTemplates.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTemplates.fulfilled, (state, action) => {
      state.loading = false;
      state.templates = action.payload;
    });
    builder.addCase(fetchTemplates.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch templates';
    });

    // Fetch bins
    builder.addCase(fetchBins.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBins.fulfilled, (state, action) => {
      state.loading = false;
      state.bins = action.payload;
    });
    builder.addCase(fetchBins.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch bins';
    });

    // Fetch transactions
    builder.addCase(fetchTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.transactions = action.payload;
    });
    builder.addCase(fetchTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch transactions';
    });

    // Create article
    builder.addCase(createArticleAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createArticleAsync.fulfilled, (state, action) => {
      state.loading = false;
      //state.articles.push(action.payload);
    });
    builder.addCase(createArticleAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create article';
    });

    // Update article
    builder.addCase(updateArticleAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateArticleAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.articles.findIndex(article => article.id === action.payload.id);
      if (index !== -1) {
        state.articles[index] = { ...state.articles[index], ...action.payload.data };
      }
    });
    builder.addCase(updateArticleAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update article';
    });

    // Create kit
    builder.addCase(createKitAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createKitAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.kits.push(action.payload);
    });
    builder.addCase(createKitAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create kit';
    });

    // Update kit
    builder.addCase(updateKitAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateKitAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.kits.findIndex(kit => kit.id === action.payload.id);
      if (index !== -1) {
        state.kits[index] = { ...state.kits[index], ...action.payload.data };
      }
    });
    builder.addCase(updateKitAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update kit';
    });

    // Create template
    builder.addCase(createTemplateAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTemplateAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.templates.push(action.payload);
    });
    builder.addCase(createTemplateAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create template';
    });

    // Update template
    builder.addCase(updateTemplateAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTemplateAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.templates.findIndex(template => template.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = { ...state.templates[index], ...action.payload.data };
      }
    });
    builder.addCase(updateTemplateAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update template';
    });

    // Create bin
    builder.addCase(createBinAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createBinAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.bins.push(action.payload);
    });
    builder.addCase(createBinAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create bin';
    });

    // Update bin
    builder.addCase(updateBinAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateBinAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.bins.findIndex(bin => bin.id === action.payload.id);
      if (index !== -1) {
        state.bins[index] = { ...state.bins[index], ...action.payload.data };
      }
    });
    builder.addCase(updateBinAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update bin';
    });

    // Record movement
    builder.addCase(recordMovementAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(recordMovementAsync.fulfilled, (state, action) => {
      state.loading = false;
      const { movementData, transaction } = action.payload;
      
      // Add transaction to state
      state.transactions.unshift(transaction);
      
      // Update article stock based on movement
      if (movementData.itemType === 'item') {
        let selectedArticle: Article | undefined;
        
        if (movementData.movementType === 'entry') {
          selectedArticle = state.articles.find(article => article.sku === movementData.articleSKU);
        } else {
          selectedArticle = state.articles.find(article => article.binCode === movementData.articleBinCode);
        }
        
        if (!selectedArticle) return;

        const quantityChange = parseInt(movementData.quantity);
        let newStock = selectedArticle.currentStock;

        switch (movementData.movementType) {
          case 'entry':
            newStock += quantityChange;
            break;
          case 'exit':
            newStock -= quantityChange;
            break;
          case 'relocation':
            // Stock doesn't change for relocation
            break;
        }

        const index = state.articles.findIndex(article => 
          movementData.movementType === 'entry' 
            ? article.sku === movementData.articleSKU 
            : article.binCode === movementData.articleBinCode
        );

        if (index !== -1) {
          state.articles[index] = {
            ...state.articles[index],
            currentStock: Math.max(0, newStock),
            location: movementData.newLocation || state.articles[index].location
          };
        }
      }
    });
    builder.addCase(recordMovementAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to record movement';
    });
  },
});

export const {
  createArticle,
  updateArticle,
  deleteArticle,
  createKit,
  updateKit,
  deleteKit,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createBin,
  updateBin,
  deleteBin,
  createTransaction,
  recordMovement,
} = inventorySlice.actions;

export default inventorySlice.reducer;
