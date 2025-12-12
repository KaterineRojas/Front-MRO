import { API_URL } from "../../../../url";

// Types
export interface BorrowItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  imageUrl: string;
  quantityRequested: number;
  quantityFulfilled?: number;
}

export interface BorrowRequest {
  requestNumber: string;
  requesterName: string;
  departmentName: string;
  warehouseId: string;
  warehouseName: string;
  projectName: string;
  status: 'Pending' | 'Packing' | 'Sent' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';
  expectedReturnDate: string;
  createdAt?: string;
  totalItems?: number;
  totalQuantity?: number;
  notes: string;
  items: BorrowItem[];
}



// Mock Data - Borrow Requests (mantener como fallback)
const mockBorrowRequests: BorrowRequest[] = [
  {
    requestNumber: 'BRW001',
    requesterName: 'John Smith',
    departmentName: 'Engineering',
    projectName: 'Proyecto Amazonas',
    expectedReturnDate: '2024-02-15',
    notes: 'Equipment for field testing',
    status: 'Completed',
    items: [
      {
        id: 1,
        imageUrl: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400',
        sku: 'MECH-KB-001',
        name: 'Mechanical Keyboard RGB',
        description: 'Gaming keyboard with RGB lighting',
        quantityRequested: 2
      },
      {
        id: 2,
        imageUrl: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400',
        sku: 'SAM-003',
        name: 'Samsung 27" Monitor',
        description: 'Full HD display',
        quantityRequested: 1
      }
    ],
    createdAt: '2024-01-15',
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    requestNumber: 'BRW005',
    requesterName: 'Carol Davis',
    departmentName: 'Marketing',
    projectName: 'Campaign 2024',
    expectedReturnDate: '2024-02-25',
    notes: 'Event equipment',
    status: 'Completed',
    items: [
      {
        id: 6,
        imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
        sku: 'WEB-001',
        name: 'Webcam HD',
        description: 'Full HD webcam',
        quantityRequested: 3
      }
    ],
    createdAt: '2024-01-08',
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  }
];

// API Functions

// Definimos el tipo de respuesta según lo que Swagger muestra.
// Normalmente devuelve un PagedResponseDto con una lista de LoanRequest.
export interface LoanRequest {
  requestNumber: string;
  requesterId: string;
  requesterName: string;
  warehouseName: string;
  companyId: string;
  customerId: string;
  departmentId: string;
  departmentName: string;
  projectId: string;
  workOrderId: string;
  status: string;
  expectedReturnDate: string;
  createdAt: string;
  totalItems: number;
  totalQuantity: number;
  notes: string;
  items: BorrowItem[];
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Implementación de la API call
export async function getBorrowRequests(
  requesterId: string,
  pageNumber?: number,
  pageSize?: number
): Promise<PagedResponse<LoanRequest>> {
  if (!requesterId) {
    throw new Error('requesterId is required');
  }
  const page = pageNumber ?? 1;
  const size = pageSize ?? 20;

  const url = `${API_URL}/loan-requests?requesterId=${encodeURIComponent(
    requesterId
  )}&pageNumber=${page}&pageSize=${size}`;

  console.log('Fetching borrow requests from URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching borrow requests: ${response.status}`);
    }

    const responseData = await response.json();
    
    // La respuesta viene envuelta en "data"
    const apiData = responseData.data || responseData;

    console.log('Borrow requests data received:', apiData);

    return {
      items: apiData as LoanRequest[],
      totalCount: responseData.totalCount,
      pageNumber: responseData.pageNumber,
      pageSize: responseData.pageSize,
    };
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    
    return {
      items: [],
      totalCount: 0,
      pageNumber: page,
      pageSize: size,
    };
  }
}


/**
 * Get borrow request by ID
 * @param requestId - The request ID to search for
 * @param requesterId - The requester ID (from authSlice)
 * @returns Promise with BorrowRequest or null
 */
export async function getBorrowRequestById(requestId: string, requesterId: string): Promise<BorrowRequest | null> {
  try {
    const url = `${API_URL}/loan-requests/${requestId}?requesterId=${encodeURIComponent(requesterId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching borrow request: ${response.status}`);
    }

    const data = await response.json();

    // Si la respuesta viene envuelta en 'data'
    if (data.data) {
      return data.data as BorrowRequest;
    }

    return data as BorrowRequest;

  } catch (error) {
    console.error('Error fetching borrow request by ID:', error);
    // Fallback to mock data
    const request = mockBorrowRequests.find(r => r.requestNumber === requestId);
    return request ? { ...request } : null;
  }
}

/**
 * Create a new borrow request
 * @param request - The request data in the correct API format
 * @returns Promise with the created BorrowRequest
 */
export async function createBorrowRequest(payload: {
  requesterId: string;
  warehouseId: number;
  companyId: string;
  customerId: string;
  departmentId: string;
  projectId: string;
  workOrderId: string;
  expectedReturnDate: string;
  notes: string;
  items: { itemId: number; quantityRequested: number }[];
}): Promise<{ success: boolean; message: string; requestNumber?: string }> {
  try {
    const apiPayload = {
      ...payload
      // requesterId comes from payload (from currentUser.id in LoanForm)
    };

    const url = `${API_URL}/loan-requests`;
    console.log('===== CREANDO BORROW REQUEST =====');
    console.log('POST URL:', url);
    console.log('Enviando solicitud de préstamo:', apiPayload);
    console.log('JSON a enviar:', JSON.stringify(apiPayload, null, 2));
    console.log('===== FIN DATOS A ENVIAR =====');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Response is not valid JSON');
      throw new Error(`Server error ${response.status}: ${responseText}`);
    }
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to create borrow request: ${response.status}`);
    }
    
    console.log('Success! Response data:', data);
    
    return { 
      success: true, 
      message: 'Borrow request created successfully', 
      requestNumber: data.requestNumber 
    };
  } catch (error: any) {
    console.error('Error creating borrow request:', error);
    return { 
      success: false, 
      message: error.message || 'Error creating borrow request' 
    };
  }
}



/**
 * Update borrow request status
 * @param requestId - The request ID to update
 * @param status - The new status
 * @returns Promise with the updated BorrowRequest or null
 */
export async function updateBorrowRequestStatus(
  requestId: string,
  status: BorrowRequest['status']
): Promise<BorrowRequest | null> {
  try {
    const response = await fetch(`${API_URL}/loan-requests/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Borrow request not found');
      }
      throw new Error(`Error updating borrow request status: ${response.status}`);
    }

    const data = await response.json();

    // Si la respuesta viene envuelta en 'data'
    if (data.data) {
      return data.data as BorrowRequest;
    }

    return data as BorrowRequest;

  } catch (error) {
    console.error('Error updating borrow request status:', error);

    // Fallback to mock implementation
    const requestIndex = mockBorrowRequests.findIndex(r => r.requestNumber === requestId);

    if (requestIndex === -1) {
      throw new Error('Borrow request not found');
    }

    mockBorrowRequests[requestIndex] = {
      ...mockBorrowRequests[requestIndex],
      status
    };

    return { ...mockBorrowRequests[requestIndex] };
  }
}


export async function deleteBorrow(
  requestNumber: string | number,
  options?: {
    token?: string;
    signal?: AbortSignal;
  }
): Promise<{ success: boolean; message?: string; status: number }> {
  const url = `${API_URL}/loan-requests/${requestNumber}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const resp = await fetch(url, {
    method: "DELETE",
    headers,
    signal: options?.signal,
  });

  let message: string | undefined;
  try {
    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await resp.json();
      message = data?.message ?? data?.error ?? undefined;
    } else {
      message = await resp.text();
    }
  } catch {
    // ignoramos si no hay cuerpo
  }

  return {
    success: resp.ok,
    status: resp.status,
    message: message,
  };
}



/**
 * Return all items from a borrow request
 * @param requestId - The request ID to return items for
 * @returns Promise with success status and message
 */
export async function returnBorrowedItems(
  requestId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_URL}/loan-requests/${requestId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          message: 'Borrow request not found'
        };
      }
      throw new Error(`Error returning items: ${response.status}`);
    }

    return {
      success: true,
      message: 'All items returned successfully'
    };

  } catch (error) {
    console.error('Error returning borrowed items:', error);

    // Fallback to mock implementation
    const requestIndex = mockBorrowRequests.findIndex(r => r.requestNumber === requestId);

    if (requestIndex === -1) {
      return {
        success: false,
        message: 'Borrow request not found'
      };
    }

    const request = mockBorrowRequests[requestIndex];

    if (request.status !== 'Completed' && request.status !== 'Approved') {
      return {
        success: false,
        message: 'Only active or approved requests can be returned'
      };
    }

    // Mark as completed or remove from active requests
    mockBorrowRequests.splice(requestIndex, 1);

    return {
      success: true,
      message: 'All items returned successfully'
    };
  }
}