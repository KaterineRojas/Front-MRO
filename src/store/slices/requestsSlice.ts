import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { LoanRequest } from '../../components/features/manage-requests/types';
import type { LoanRequest as BorrowLoanRequest } from '../../components/features/requests/Borrow/borrowService';
import { 
  getPackingRequests as getPackingRequestsApi, 
  getEngineerReturns as getEngineerReturnsApi 
} from '../../components/features/manage-requests/services/requestManagementService';
import { getBorrowRequests as getBorrowRequestsApi } from '../../components/features/requests/Borrow/borrowService';

interface RequestsState {
  packingRequests: LoanRequest[];
  returns: LoanRequest[];
  borrowRequests: BorrowLoanRequest[];
  loadingPacking: boolean;
  loadingReturns: boolean;
  loadingBorrow: boolean;
  errorPacking: string | null;
  errorReturns: string | null;
  errorBorrow: string | null;
  lastFetchPacking: number | null;
  lastFetchReturns: number | null;
  lastFetchBorrow: number | null;
}

const initialState: RequestsState = {
  packingRequests: [],
  returns: [],
  borrowRequests: [],
  loadingPacking: false,
  loadingReturns: false,
  loadingBorrow: false,
  errorPacking: null,
  errorReturns: null,
  errorBorrow: null,
  lastFetchPacking: null,
  lastFetchReturns: null,
  lastFetchBorrow: null,
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

// Borrow Requests thunks
export const fetchBorrowRequests = createAsyncThunk(
  'requests/fetchBorrowRequests',
  async (requesterId: string, { getState }) => {
    const state = getState() as { requests: RequestsState };
    const now = Date.now();
    
    // Check cache validity
    if (state.requests.lastFetchBorrow && 
        (now - state.requests.lastFetchBorrow) < CACHE_DURATION &&
        state.requests.borrowRequests.length > 0) {
      console.log('✅ Using cached borrow requests');
      return state.requests.borrowRequests;
    }
    
    console.log('🔄 Fetching fresh borrow requests for requester:', requesterId);
    const response = await getBorrowRequestsApi(requesterId);
    return response.items || [];
  }
);

export const refreshBorrowRequests = createAsyncThunk(
  'requests/refreshBorrowRequests',
  async (requesterId: string) => {
    console.log('🔄 Force refreshing borrow requests...');
    const response = await getBorrowRequestsApi(requesterId);
    return response.items || [];
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
    clearBorrowRequests: (state) => {
      state.borrowRequests = [];
      state.lastFetchBorrow = null;
      state.errorBorrow = null;
    },
    removeBorrowRequest: (state, action: PayloadAction<string>) => {
      state.borrowRequests = state.borrowRequests.filter(
        req => req.requestNumber !== action.payload
      );
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

    // Fetch Borrow Requests
    builder.addCase(fetchBorrowRequests.pending, (state) => {
      state.loadingBorrow = true;
      state.errorBorrow = null;
    });
    builder.addCase(fetchBorrowRequests.fulfilled, (state, action) => {
      state.loadingBorrow = false;
      state.borrowRequests = action.payload;
      state.lastFetchBorrow = Date.now();
      state.errorBorrow = null;
    });
    builder.addCase(fetchBorrowRequests.rejected, (state, action) => {
      state.loadingBorrow = false;
      state.errorBorrow = action.error.message || 'Failed to fetch borrow requests';
    });

    // Refresh Borrow Requests
    builder.addCase(refreshBorrowRequests.pending, (state) => {
      state.loadingBorrow = true;
      state.errorBorrow = null;
    });
    builder.addCase(refreshBorrowRequests.fulfilled, (state, action) => {
      state.loadingBorrow = false;
      state.borrowRequests = action.payload;
      state.lastFetchBorrow = Date.now();
      state.errorBorrow = null;
    });
    builder.addCase(refreshBorrowRequests.rejected, (state, action) => {
      state.loadingBorrow = false;
      state.errorBorrow = action.error.message || 'Failed to refresh borrow requests';
    });
  },
});

export const { 
  clearPackingRequests, 
  clearReturns,
  clearBorrowRequests,
  removeBorrowRequest,
} = requestsSlice.actions;

export default requestsSlice.reducer;
