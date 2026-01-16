import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBorrowRequests, type LoanRequest } from '../Borrow/borrowService';
import { getPurchaseRequests, type PurchaseRequest } from '../Purchase/purchaseService';
import { getTransfersIncoming, getTransfersOutgoing, getTransferId, type Transfer } from '../Transfer/transferService';

export type RequestType = 'borrow' | 'purchase' | 'purchase on site' | 'transfer';

export interface UnifiedItem {
  id: string | number;
  name: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  quantity: number;
  cost?: number;
  productUrl?: string;
}

export interface UnifiedRequest {
  id: string;
  type: RequestType;
  requestNumber: string;
  requesterName: string;
  department: string;
  project: string;
  warehouse: string;
  status: string;
  date: string;
  itemCount: number;
  totalQuantity: number;
  notes: string;
  items: UnifiedItem[];
  // Transfer-specific fields
  fromUser?: string;
  toUser?: string;
  // Rejection field
  rejectionReason?: string;
}

interface HistoryState {
  requests: UnifiedRequest[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: HistoryState = {
  requests: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Normalize functions
function normalizeBorrowRequest(req: LoanRequest): UnifiedRequest {
  const items: UnifiedItem[] = (req.items || []).map(item => ({
    id: item.id,
    name: item.name || '',
    sku: item.sku,
    description: item.description,
    imageUrl: item.imageUrl,
    quantity: item.quantityRequested || 0,
  }));

  // Log para debugging de rejection reason
  if (req.status?.toLowerCase() === 'rejected') {
    console.log('Normalizing rejected borrow request:', {
      requestNumber: req.requestNumber,
      status: req.status,
      rejectionReason: req.rejectionReason,
      hasRejectionReason: !!req.rejectionReason
    });
  }

  return {
    id: `borrow-${req.requestNumber}`,
    type: 'borrow',
    requestNumber: req.requestNumber,
    requesterName: req.requesterName || '',
    department: req.departmentId || '',
    project: req.projectId || '',
    warehouse: req.warehouseName || '',
    status: req.status || 'unknown',
    date: req.createdAt || '',
    itemCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    notes: req.notes || '',
    items,
  };
}

function normalizePurchaseRequest(req: PurchaseRequest): UnifiedRequest {
  // Mapeo de status numérico a texto
  const statusCodeMap: Record<number, string> = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
    3: 'ordered',
    4: 'received',
    5: 'archived'
  };
  
  let statusName: string;
  if (req.statusName) {
    statusName = req.statusName.toLowerCase();
  } else if (typeof req.status === 'number') {
    statusName = statusCodeMap[req.status] || 'unknown';
  } else {
    statusName = String(req.status || 'unknown').toLowerCase();
  }
  
  const items: UnifiedItem[] = (req.items || []).map(item => ({
    id: item.id || item.itemId || 0,
    name: item.name || '',
    sku: item.sku,
    description: item.description,
    imageUrl: item.imageUrl,
    quantity: item.quantity || 0,
    cost: item.cost ?? item.estimatedCost,
    productUrl: item.productUrl,
  }));

  // Si es tipo 3, poner 'purchase on site' en type
  let typeValue = 'purchase';
  const typeRequest = (req as any)?.typeRequest;
  const typeRequestName = (req as any)?.typeRequestName;
  if (typeRequest === 3 || typeRequestName === 'PurchaseOnSiteRequest') {
    typeValue = 'purchase on site';
  }

  return {
    id: `purchase-${req.requestNumber || req.requestId}`,
    type: typeValue as RequestType,
    requestNumber: req.requestNumber || req.requestId || '',
    requesterName: req.requesterName || '',
    department: req.departmentName || req.departmentId || '',
    project: req.projectName || req.projectId || '',
    warehouse: req.warehouseName || '',
    status: statusName,
    date: req.createdAt || '',
    itemCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    notes: req.notes || '',
    items,
    rejectionReason: req.rejectionReason,
  };
}

function normalizeTransfer(transfer: Transfer): UnifiedRequest {
  const items: UnifiedItem[] = (transfer.items || []).map(item => ({
    id: item.itemId,
    name: item.itemName || '',
    sku: item.code,
    description: item.description,
    imageUrl: item.image,
    quantity: item.quantity || 0,
  }));

  return {
    id: `transfer-${transfer.id}`,
    type: 'transfer',
    requestNumber: transfer.id,
    requesterName: '',
    department: '',
    project: '',
    warehouse: transfer.warehouseName || '',
    status: transfer.status || 'unknown',
    date: transfer.requestDate || '',
    itemCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    notes: transfer.notes || '',
    items,
    fromUser: transfer.fromUser || '',
    toUser: transfer.toUser || '',
    rejectionReason: transfer.rejectionReason,
  };
}

// Async thunk to fetch all requests
export const fetchCompleteHistory = createAsyncThunk(
  'history/fetchAll',
  async (employeeId: string, { getState, rejectWithValue }) => {
    try {
      // Check cache
      const state = getState() as { history: HistoryState };
      const now = Date.now();
      if (state.history.lastFetched && (now - state.history.lastFetched) < CACHE_DURATION) {
        // Return existing data if cache is valid
        return { requests: state.history.requests, fromCache: true };
      }

      // Fetch all data in parallel
      const [borrowResult, purchaseResult, incomingResult, outgoingResult] = await Promise.allSettled([
        getBorrowRequests(employeeId),
        getPurchaseRequests(),
        getTransfersIncoming(['Completed', 'Rejected']),
        getTransfersOutgoing(['Completed', 'Rejected']),
      ]);

      const unifiedRequests: UnifiedRequest[] = [];

      // Process borrow requests
      if (borrowResult.status === 'fulfilled' && borrowResult.value.items) {
        borrowResult.value.items.forEach((req: LoanRequest) => {
          unifiedRequests.push(normalizeBorrowRequest(req));
        });
      }

      // Process purchase requests
      if (purchaseResult.status === 'fulfilled' && Array.isArray(purchaseResult.value)) {
        purchaseResult.value.forEach((req: PurchaseRequest) => {
          unifiedRequests.push(normalizePurchaseRequest(req));
        });
      }

      // Process incoming transfers - fetch details for each to get items
      if (incomingResult.status === 'fulfilled' && Array.isArray(incomingResult.value)) {
        // Fetch detailed transfer info with items for each transfer
        const incomingDetailsPromises = incomingResult.value.map((transfer: Transfer) => 
          getTransferId(transfer.id).catch(() => transfer) // Fallback to basic info if detail fetch fails
        );
        const incomingDetails = await Promise.all(incomingDetailsPromises);
        incomingDetails.forEach((transfer: Transfer) => {
          unifiedRequests.push(normalizeTransfer(transfer));
        });
      }

      // Process outgoing transfers - fetch details for each to get items
      if (outgoingResult.status === 'fulfilled' && Array.isArray(outgoingResult.value)) {
        // Fetch detailed transfer info with items for each transfer
        const outgoingDetailsPromises = outgoingResult.value.map((transfer: Transfer) => 
          getTransferId(transfer.id).catch(() => transfer) // Fallback to basic info if detail fetch fails
        );
        const outgoingDetails = await Promise.all(outgoingDetailsPromises);
        outgoingDetails.forEach((transfer: Transfer) => {
          unifiedRequests.push(normalizeTransfer(transfer));
        });
      }

      // Sort by date (most recent first)
      unifiedRequests.sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return dateB - dateA;
      });

      return { requests: unifiedRequests, fromCache: false };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch history');
    }
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    clearHistory: (state) => {
      state.requests = [];
      state.lastFetched = null;
      state.error = null;
    },
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompleteHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompleteHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload.fromCache) {
          state.requests = action.payload.requests;
          state.lastFetched = Date.now();
        }
      })
      .addCase(fetchCompleteHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch history';
      });
  },
});

export const { clearHistory, invalidateCache } = historySlice.actions;
export default historySlice.reducer;
