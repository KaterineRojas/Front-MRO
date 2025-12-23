import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { LoanRequest } from '../../components/features/manage-requests/types';
import { 
  getPackingRequests as getPackingRequestsApi, 
  getEngineerReturns as getEngineerReturnsApi 
} from '../../components/features/manage-requests/services/requestManagementService';

interface RequestsState {
  packingRequests: LoanRequest[];
  returns: LoanRequest[];
  loadingPacking: boolean;
  loadingReturns: boolean;
  errorPacking: string | null;
  errorReturns: string | null;
  lastFetchPacking: number | null;
  lastFetchReturns: number | null;
}

const initialState: RequestsState = {
  packingRequests: [],
  returns: [],
  loadingPacking: false,
  loadingReturns: false,
  errorPacking: null,
  errorReturns: null,
  lastFetchPacking: null,
  lastFetchReturns: null,
};

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

// Async thunks
export const fetchPackingRequests = createAsyncThunk(
  'requests/fetchPackingRequests',
  async (warehouseId: number | undefined, { getState }) => {
    const state = getState() as { requests: RequestsState };
    const now = Date.now();
    
    // Check cache validity
    if (state.requests.lastFetchPacking && 
        (now - state.requests.lastFetchPacking) < CACHE_DURATION &&
        state.requests.packingRequests.length > 0) {
      console.log('✅ Using cached packing requests');
      return state.requests.packingRequests;
    }
    
    console.log('🔄 Fetching fresh packing requests for warehouse:', warehouseId);
    const requests = await getPackingRequestsApi(warehouseId);
    return requests;
  }
);

export const fetchReturns = createAsyncThunk(
  'requests/fetchReturns',
  async ({ engineerId, warehouseId }: { engineerId: string; warehouseId?: number }, { getState }) => {
    // No usar cache para returns - cada ingeniero tiene datos diferentes
    console.log('🔄 Fetching returns for engineerId:', engineerId, 'warehouseId:', warehouseId);
    const returns = await getEngineerReturnsApi(engineerId, warehouseId);
    console.log('✅ Fetched', returns.length, 'returns');
    return returns;
  }
);

// Force refresh actions (bypass cache)
export const refreshPackingRequests = createAsyncThunk(
  'requests/refreshPackingRequests',
  async (warehouseId: number | undefined) => {
    console.log('🔄 Force refreshing packing requests for warehouse:', warehouseId);
    const requests = await getPackingRequestsApi(warehouseId);
    return requests;
  }
);

export const refreshReturns = createAsyncThunk(
  'requests/refreshReturns',
  async ({ engineerId, warehouseId }: { engineerId: string; warehouseId?: number }) => {
    console.log('🔄 Force refreshing returns...');
    const returns = await getEngineerReturnsApi(engineerId, warehouseId);
    return returns;
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearPackingRequests: (state) => {
      state.packingRequests = [];
      state.lastFetchPacking = null;
      state.errorPacking = null;
    },
    clearReturns: (state) => {
      state.returns = [];
      state.lastFetchReturns = null;
      state.errorReturns = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Packing Requests
    builder.addCase(fetchPackingRequests.pending, (state) => {
      state.loadingPacking = true;
      state.errorPacking = null;
    });
    builder.addCase(fetchPackingRequests.fulfilled, (state, action) => {
      state.loadingPacking = false;
      state.packingRequests = action.payload;
      state.lastFetchPacking = Date.now();
      state.errorPacking = null;
    });
    builder.addCase(fetchPackingRequests.rejected, (state, action) => {
      state.loadingPacking = false;
      state.errorPacking = action.error.message || 'Failed to fetch packing requests';
    });

    // Refresh Packing Requests
    builder.addCase(refreshPackingRequests.pending, (state) => {
      state.loadingPacking = true;
      state.errorPacking = null;
    });
    builder.addCase(refreshPackingRequests.fulfilled, (state, action) => {
      state.loadingPacking = false;
      state.packingRequests = action.payload;
      state.lastFetchPacking = Date.now();
      state.errorPacking = null;
    });
    builder.addCase(refreshPackingRequests.rejected, (state, action) => {
      state.loadingPacking = false;
      state.errorPacking = action.error.message || 'Failed to refresh packing requests';
    });

    // Fetch Returns
    builder.addCase(fetchReturns.pending, (state) => {
      state.loadingReturns = true;
      state.errorReturns = null;
    });
    builder.addCase(fetchReturns.fulfilled, (state, action) => {
      state.loadingReturns = false;
      state.returns = action.payload;
      state.lastFetchReturns = Date.now();
      state.errorReturns = null;
    });
    builder.addCase(fetchReturns.rejected, (state, action) => {
      state.loadingReturns = false;
      state.errorReturns = action.error.message || 'Failed to fetch returns';
    });

    // Refresh Returns
    builder.addCase(refreshReturns.pending, (state) => {
      state.loadingReturns = true;
      state.errorReturns = null;
    });
    builder.addCase(refreshReturns.fulfilled, (state, action) => {
      state.loadingReturns = false;
      state.returns = action.payload;
      state.lastFetchReturns = Date.now();
      state.errorReturns = null;
    });
    builder.addCase(refreshReturns.rejected, (state, action) => {
      state.loadingReturns = false;
      state.errorReturns = action.error.message || 'Failed to refresh returns';
    });
  },
});

export const { 
  clearPackingRequests, 
  clearReturns,
} = requestsSlice.actions;

export default requestsSlice.reducer;
