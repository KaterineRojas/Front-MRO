import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Article, Kit, Bin, Transaction, MovementData } from '../../components/features/inventory/types';
import { deleteArticleApi } from '../../components/features/inventory/services/inventoryApi';
import type { CreateKitRequest } from '../../components/features/inventory/services/kitService';
import {
  fetchArticlesFromApi,
  //fetchKitsFromApi,
  fetchTransactionsFromApi,
  createArticleApi,
  updateArticleApi,
  //createKitApi,
  //updateKitApi,
  fetchBinsFromApi,
  createBinApi,
  updateBinApi,
  deleteBinApi,
  recordMovementApi

} from '../../components/features/inventory/services/inventoryApi';
import {
  getKitsWithItems,
  createKit as createKitService,
} from '../../components/features/inventory/services/kitService';

async function updateKitService(id: number, data: Partial<Kit>): Promise<Kit> {
  // Para el slice, devolvemos un objeto Kit simulado/actualizado.
  const updatedKitResponse = { id, data };
  return updatedKitResponse as any;
}

interface InventoryState {
  selectedCategory: string | null;
  searchQuery: string;
  items: InventoryItem[];
  articles: Article[];
  kits: Kit[];
  bins: Bin[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  articles: [],
  kits: [],
  bins: [],
  transactions: [],
  loading: false,
  error: null,
};

// Async thunks (Mismos que el original)
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
    const kits = await getKitsWithItems();
    return kits;
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
  async ({ id, data }: {
    id: number;
    data: {
      sku: string;
      name: string;
      description: string;
      category: string;
      unit: string;
      minStock: number;
      consumable: boolean;
      imageUrl?: string | null;
      imageFile?: File | null;
    }
  }) => {
    // Si hay imageFile, usar el endpoint con multipart/form-data
    if (data.imageFile) {
      const { updateArticleWithImageApi } = await import('../../components/features/inventory/services/inventoryApi');
      const updatedArticle = await updateArticleWithImageApi(id, data);
      return updatedArticle;
    }
    // Si no hay imageFile, usar el endpoint regular
    const updatedArticle = await updateArticleApi(id, data);
    return updatedArticle;
  }
);

export const deleteArticleAsync = createAsyncThunk(
  'inventory/deleteArticle',
  async (id: number) => {
    await deleteArticleApi(id);
    return id;
  }
);

export const createKitAsync = createAsyncThunk(
  'inventory/createKit',
  // Usamos el tipo CreateKitRequest expuesto por kitService
  async (kitData: CreateKitRequest) => {
    // 👈 Llamada al nuevo servicio
    const newKit = await createKitService(kitData);
    return newKit; // Devolverá un objeto Kit completo
  }
);

export const updateKitAsync = createAsyncThunk(
  'inventory/updateKit',
  async ({ id, data }: { id: number; data: Partial<Kit> }) => {
    // 👈 Llamada al nuevo servicio
    const updatedKit = await updateKitService(id, data);
    return updatedKit; // Debe devolver un objeto Kit completo (o Partial, pero completo es mejor para Redux)
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
  async ({ id, data }: {
    id: number;
    data: {
      binCode: string;
      type: 'good-condition' | 'on-revision' | 'scrap';
      description: string;
      
    }
  }) => {
    const updatedBin = await updateBinApi(id, data);
    return updatedBin;
  }
);

export const deleteBin = createAsyncThunk(
  'inventory/deleteBin',
  async (binId: number, { rejectWithValue }) => {
    try {
      await deleteBinApi(binId);
      return binId;
    } catch (error: any) {
      console.error('Error in deleteBin thunk:', error);
      return rejectWithValue(error.message || 'Failed to delete bin');
    }
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
  // Se han mantenido los 'reducers' sincrónicos, pero es mejor
  // usar los extraReducers para las operaciones asincrónicas con API.
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

    // Kit reducers (Se recomienda usar async thunks, pero los dejamos por si acaso)
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


    // Transaction reducers
    createTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },

    // Movement reducer (Mantener la lógica original para movimientos de stock, aunque recordMovementAsync es mejor)
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
    // ------------------------------------
    // Fetch kits
    builder.addCase(fetchKits.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchKits.fulfilled, (state, action) => {
      state.loading = false;
      state.kits = action.payload; // El payload es el array de Kit[] del kitService
    });
    builder.addCase(fetchKits.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch kits';
    });

    // Create kit
    builder.addCase(createKitAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(createKitAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.kits.push(action.payload); // action.payload es el objeto Kit completo
    });
    builder.addCase(createKitAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create kit';
    });
    // ------------------------------------
    // Update kit
    builder.addCase(updateKitAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(updateKitAsync.fulfilled, (state, action) => {
      state.loading = false;
      // action.payload ahora es el objeto Kit actualizado completo, NO { id, data }
      const index = state.kits.findIndex(kit => kit.id === action.payload.id);
      if (index !== -1) {
        state.kits[index] = action.payload; // Reemplazamos con el Kit completo actualizado
      }
    });
    builder.addCase(updateKitAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update kit';
    });

    // ------------------------------------
    // DELETE KIT (usaremos el reductor sincrónico deleteKit si no hay thunk)
    // NOTA: No existe un deleteKitAsync en tus thunks, se usa el reductor sincrónico.
    // ------------------------------------


    // ------------------------------------
    // OTHER ASYNC REDUCERS (Mantener los originales)
    // ------------------------------------

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

    // Delete article
    builder.addCase(deleteArticleAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteArticleAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.articles = state.articles.filter(article => article.id !== action.payload);
    });
    builder.addCase(deleteArticleAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete article';
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

    // Delete bin
    builder.addCase(deleteBin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteBin.fulfilled, (state, action) => {
      state.loading = false;
      state.bins = state.bins.filter(bin => bin.id !== action.payload);
    });
    builder.addCase(deleteBin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete bin';
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
      // state.articles.push(action.payload); // Se deja comentado como en el original
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
      // Actualizar con el artículo completo que devuelve el backend
      // const index = state.articles.findIndex(article => article.id === action.payload.id);
      // if (index !== -1) {
      // state.articles[index] = action.payload;
      // }
    });
    builder.addCase(updateArticleAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update article';
    });


  

    // Create bin
    builder.addCase(createBinAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createBinAsync.fulfilled, (state) => {
      state.loading = false;
      // state.bins.push(action.payload); // Se deja comentado como en el original
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
      // ✅ Actualizar con el bin completo que devuelve el backend
      const index = state.bins.findIndex(bin => bin.id === action.payload.id);
      if (index !== -1) {
        state.bins[index] = action.payload;
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
      const { transaction } = action.payload;
      // El estado real se actualizará cuando se haga fetchArticles()
      state.transactions.unshift(transaction);

      console.log('✅ Movement recorded in Redux state');
    });

    builder.addCase(recordMovementAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to record movement';
      console.error('❌ Failed to record movement:', action.error);
    });

  },
});

export const {
  createArticle,
  updateArticle,
  createKit,
  updateKit,
  deleteKit,
  createBin,
  updateBin,
  createTransaction,
  recordMovement,
} = inventorySlice.actions;

export default inventorySlice.reducer;