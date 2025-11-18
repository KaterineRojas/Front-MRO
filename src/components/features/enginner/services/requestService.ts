// services/requestService.ts
import { apiCall } from './errorHandler';
import { API_BASE_URL } from './api';

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
    const response = await fetch(`${API_BASE_URL}/borrow-requests`, {
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
export const getBorrowRequestById = async (requestId: string): Promise<BorrowRequest | null> => {
  return apiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/borrow-requests/${requestId}`, {
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
    const response = await fetch(`${API_BASE_URL}/borrow-requests`, {
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
    const response = await fetch(`${API_BASE_URL}/borrow-requests/${requestId}/status`, {
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
    const response = await fetch(`${API_BASE_URL}/borrow-requests/${requestId}`, {
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
    const response = await fetch(`${API_BASE_URL}/purchase-requests`, {
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
    const response = await fetch(`${API_BASE_URL}/purchase-requests/${requestId}`, {
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
    const response = await fetch(`${API_BASE_URL}/purchase-requests`, {
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
    const response = await fetch(`${API_BASE_URL}/purchase-requests/${requestId}/status`, {
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
    const response = await fetch(`${API_BASE_URL}/purchase-requests/${requestId}`, {
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
    const response = await fetch(`${API_BASE_URL}/purchase-requests/${requestId}/priority`, {
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
