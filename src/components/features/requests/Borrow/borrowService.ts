import { API_BASE_URL } from "../services/api";
// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// Interface para la respuesta de la API
interface ApiResponse {
  data: BorrowRequest[];
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

/**
 * Get all borrow requests from the real API
 * @param userId - The user ID to filter requests by (sent as requesterId)
 * @returns Promise with array of BorrowRequest
 */
export async function getBorrowRequests(userId?: string): Promise<BorrowRequest[]> {
  try {
    // Console.log con el id del usuario
    if (userId) {
      console.log('Usuario ID:', userId);
    }

    // Construir los parámetros de la query
    const params = new URLSearchParams();

    // Si hay un userId, lo enviamos como requesterId
    if (userId) {
      params.append('requesterId', userId);
    }

    // Agregar parámetros de paginación por defecto
    params.append('pageNumber', '1');
    params.append('pageSize', '20');

    // Realizar la petición a la API real
    const response = await fetch(`${API_BASE_URL}/loan-requests?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching borrow requests: ${response.status}`);
    }

    // Parsear el JSON de la respuesta
    const responseData: ApiResponse = await response.json();

    // La API devuelve los datos en la propiedad 'data'
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data;
    }

    // Si no hay datos, devolver array vacío
    console.warn('No data found in API response');
    return [];

  } catch (error) {
    console.error('Error fetching borrow requests:', error);

    // En caso de error, usar datos mock como fallback
    console.log('Using mock data due to API error');
    return [...mockBorrowRequests];
  }
}

/**
 * Get borrow request by ID
 * @param requestId - The request ID to search for
 * @returns Promise with BorrowRequest or null
 */
export async function getBorrowRequestById(requestId: string): Promise<BorrowRequest | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/loan-requests/${requestId}`, {
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
 * @param request - The request data without ID, status, or createdAt
 * @returns Promise with the created BorrowRequest
 */
export async function createBorrowRequest(
  request: Omit<BorrowRequest, 'requestNumber' | 'status' | 'createdAt'>
): Promise<BorrowRequest> {
  console.log('Creating borrow request:', request);
  try {
    const response = await fetch(`${API_BASE_URL}/loan-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Error creating borrow request: ${response.status}`);
    }

    const data = await response.json();

    // Si la respuesta viene envuelta en 'data'
    if (data.data) {
      return data.data as BorrowRequest;
    }

    return data as BorrowRequest;

  } catch (error) {
    console.error('Error creating borrow request:', error);

    // Fallback to mock implementation
    console.log('Using mock implementation for create');

    // Generate new request ID
    const newId = `BRW${String(mockBorrowRequests.length + 1).padStart(3, '0')}`;

    const newRequest: BorrowRequest = {
      ...request,
      requestNumber: newId,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    mockBorrowRequests.push(newRequest);
    return newRequest;
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
    const response = await fetch(`${API_BASE_URL}/loan-requests/${requestId}/status`, {
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
  const url = `${API_BASE_URL}/loan-requests/${requestNumber}`;

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
    const response = await fetch(`${API_BASE_URL}/loan-requests/${requestId}/return`, {
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