import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createPurchaseRequest,
  type CreatePurchaseRequestPayload,
  type CreatePurchaseRequestResponse
} from '../../components/features/requests/Purchase/purchaseService';

interface PurchaseSubmissionState {
  submitting: boolean;
  error: string | null;
  lastCreated: CreatePurchaseRequestResponse | null;
}

const initialState: PurchaseSubmissionState = {
  submitting: false,
  error: null,
  lastCreated: null,
};

export const submitPurchaseRequest = createAsyncThunk<
  CreatePurchaseRequestResponse,
  CreatePurchaseRequestPayload,
  { rejectValue: string }
>('purchase/submitPurchaseRequest', async (payload, { rejectWithValue }) => {
  try {
    const response = await createPurchaseRequest(payload);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create purchase request';
    return rejectWithValue(message);
  }
});

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState,
  reducers: {
    clearPurchaseSubmission(state) {
      state.error = null;
      state.lastCreated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPurchaseRequest.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitPurchaseRequest.fulfilled, (state, action) => {
        state.submitting = false;
        state.lastCreated = action.payload;
      })
      .addCase(submitPurchaseRequest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? action.error.message ?? 'Failed to create purchase request';
      });
  },
});

export const { clearPurchaseSubmission } = purchaseSlice.actions;

export default purchaseSlice.reducer;
