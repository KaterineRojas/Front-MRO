// services/requestService.ts
import { apiCall } from '../../enginner/services/errorHandler';
import {API_URL} from '../../../../url'
import {PaginatedLoanRequestResponse} from '../types/loanTypes'
import {authService} from '../../../../services/authService'

export interface RequestItem {
  id: number;
  imageUrl: string; 
  sku: string;
  name: string;
  description: string;
  quantity: number;
  estimatedCost?: number;
  productUrl?: string;
  warehouseId?: string;
  warehouseName?: string;
}

export interface BorrowRequest {
  requestId: string;
  department: string;
  returnDate: string;
  project: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  items: RequestItem[];
  createdAt?: string;
  warehouseId: string;
  warehouseName: string;
}

export interface PurchaseRequest {
  requestId: string;
  department: string;
  project: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'urgent';
  selfPurchase: boolean;
  items: RequestItem[];
  totalCost: number;
  createdAt?: string;
  warehouseId: string;
  warehouseName: string;
}

// ==================== BORROW REQUESTS ====================

/**
 * GET - Obtiene todas las solicitudes de préstamo
 */
export const getBorrowRequests = async (): Promise<BorrowRequest[]> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/borrow-requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  });
};

/**
 * GET - Obtiene una solicitud de préstamo por ID
 */
export const getBorrowRequestById = async (requestId: string, requesterId: string): Promise<BorrowRequest | null> => {
  return apiCall(async () => {
    const url = `${API_URL}/borrow-requests/${requestId}?requesterId=${encodeURIComponent(requesterId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  });
};

/**
 * POST - Crea una nueva solicitud de préstamo
 */
export const createBorrowRequest = async (
  request: Omit<BorrowRequest, 'requestId' | 'status' | 'createdAt'>
): Promise<BorrowRequest> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/borrow-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  });
};

/**
 * PUT - Actualiza el estado de una solicitud de préstamo
 */
export const updateBorrowRequestStatus = async (
  requestId: string,
  status: BorrowRequest['status']
): Promise<BorrowRequest | null> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/borrow-requests/${requestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  });
};

/**
 * DELETE - Elimina una solicitud de préstamo
 */
export const deleteBorrowRequest = async (requestId: string): Promise<{ success: boolean; message: string }> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/borrow-requests/${requestId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete request' }));
      return { 
        success: false, 
        message: errorData.message || 'Failed to delete request' 
      };
    }

    const data = await response.json().catch(() => ({ success: true, message: 'Request deleted successfully' }));
    return data;
  });
};

// ==================== PURCHASE REQUESTS ====================

/**
 * GET - Obtiene todas las solicitudes de compra
 */
export const getPurchaseRequests = async (): Promise<PurchaseRequest[]> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/purchase-requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  });
};

/**
 * GET - Obtiene una solicitud de compra por ID
 */
export const getPurchaseRequestById = async (requestId: string): Promise<PurchaseRequest | null> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/purchase-requests/${requestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  });
};

/**
 * POST - Crea una nueva solicitud de compra
 */
export const createPurchaseRequest = async (
  request: Omit<PurchaseRequest, 'requestId' | 'status' | 'createdAt'>
): Promise<PurchaseRequest> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/purchase-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  });
};

/**
 * PUT - Actualiza el estado de una solicitud de compra
 */
export const updatePurchaseRequestStatus = async (
  requestId: string,
  status: PurchaseRequest['status']
): Promise<PurchaseRequest | null> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/purchase-requests/${requestId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  });
};

/**
 * DELETE - Elimina una solicitud de compra
 */
export const deletePurchaseRequest = async (requestId: string): Promise<{ success: boolean; message: string }> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/purchase-requests/${requestId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete request' }));
      return { 
        success: false, 
        message: errorData.message || 'Failed to delete request' 
      };
    }

    const data = await response.json().catch(() => ({ success: true, message: 'Request deleted successfully' }));
    return data;
  });
};

/**
 * PUT - Actualiza la prioridad de una solicitud de compra
 */
export const updatePurchaseRequestPriority = async (
  requestId: string,
  priority: PurchaseRequest['priority']
): Promise<PurchaseRequest | null> => {
  return apiCall(async () => {
    const response = await fetch(`${API_URL}/purchase-requests/${requestId}/priority`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priority }),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  });
};


// loanRequestService.ts

/**
 * Approves a loan request.
 * Endpoint: PUT /api/loan-requests/{requestNumber}/approve
 */
export async function approveLoanRequest(
  requestNumber: string, 
  approvedByEmployeeId: string 
): Promise<void> {
  
  // Validaciones defensivas
  if (!requestNumber) throw new Error("Request number is required");
  if (!approvedByEmployeeId) throw new Error("Employee ID is required for approval");

  const params = new URLSearchParams({
    approvedByEmployeeId: approvedByEmployeeId
  });

  const url = `${API_URL}/loan-requests/${requestNumber}/approve?${params.toString()}`;

  const response = await fetch(url, {
    method: 'PUT', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authService.getToken()}` 
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to approve request: ${errorText}`);
  }
}


// loanRequestService.ts

/**
 * Rejects a loan request.
 * Endpoint: PUT /api/loan-requests/{requestNumber}/reject
 */
export async function rejectLoanRequest(
  requestNumber: string,
  rejectedByEmployeeId: string,
  rejectionReason: string
): Promise<void> {
  
  if (!requestNumber) throw new Error("Request number is required");
  if (!rejectedByEmployeeId) throw new Error("Employee ID is required");
  if (!rejectionReason) throw new Error("Rejection reason is required");

  const params = new URLSearchParams({
    rejectedByEmployeeId: rejectedByEmployeeId,
    rejectionReason: rejectionReason
  });

  const url = `${API_URL}/loan-requests/${requestNumber}/reject?${params.toString()}`;

  const response = await fetch(url, {
    method: 'PUT', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authService.getToken()}` 
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to reject request: ${errorText}`);
  }
}

/**
 * Fetches paginated loan requests.
 * @param pageNumber - Current page number
 * @param pageSize - Items per page
 * @param signal - (Optional) AbortSignal to cancel the request
 */
export async function getLoanRequests(
  pageNumber: number, 
  pageSize: number,
  signal?: AbortSignal
): Promise<PaginatedLoanRequestResponse> {
  
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString()
  });

  const response = await fetch(`${API_URL}/loan-requests?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authService.getToken()}` 
    },
    signal: signal 
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}