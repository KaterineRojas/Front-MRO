// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types
export interface BorrowItem {
  id: number;
  imageUrl: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  warehouseId?: string;
  warehouseName?: string;
}

export interface BorrowRequest {
  requestId: string;
  department: string;
  project: string;
  returnDate: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  items: BorrowItem[];
  createdAt?: string;
  warehouseId: string;
  warehouseName: string;
}

// Mock Data - Borrow Requests
const mockBorrowRequests: BorrowRequest[] = [
  {
    requestId: 'BRW001',
    department: 'Engineering',
    project: 'Proyecto Amazonas',
    returnDate: '2024-02-15',
    notes: 'Equipment for field testing',
    status: 'completed',
    items: [
      {
        id: 1,
        imageUrl: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400',
        sku: 'MECH-KB-001',
        name: 'Mechanical Keyboard RGB',
        description: 'Gaming keyboard with RGB lighting',
        quantity: 2,
        warehouseId: 'wh-1',
        warehouseName: 'Amax'
      },
      {
        id: 2,
        imageUrl: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400',
        sku: 'SAM-003',
        name: 'Samsung 27" Monitor',
        description: 'Full HD display',
        quantity: 1,
        warehouseId: 'wh-1',
        warehouseName: 'Amax'
      }
    ],
    createdAt: '2024-01-15',
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    requestId: 'BRW002',
    department: 'Design',
    project: 'Proyecto Web',
    returnDate: '2024-02-20',
    notes: 'Design workstation setup',
    status: 'approved',
    items: [
      {
        id: 3,
        imageUrl: 'https://images.unsplash.com/photo-1625961332600-f6eac385c6ba?w=400',
        sku: 'PROJ-EP-001',
        name: 'Proyector Epson PowerLite',
        description: 'HD projector for presentations',
        quantity: 1,
        warehouseId: 'wh-2',
        warehouseName: 'Best'
      }
    ],
    createdAt: '2024-01-14',
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    requestId: 'BRW003',
    department: 'Development',
    project: 'Proyecto Innova',
    returnDate: '2024-02-10',
    notes: 'Testing equipment',
    status: 'pending',
    items: [
      {
        id: 4,
        imageUrl: 'https://images.unsplash.com/photo-1625738323142-01e6d7906e0a?w=400',
        sku: 'HDMI-001',
        name: 'Cable HDMI 2.0',
        description: '4K HDMI cable 2m',
        quantity: 5,
        warehouseId: 'wh-3',
        warehouseName: 'Central'
      }
    ],
    createdAt: '2024-01-12',
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    requestId: 'BRW004',
    department: 'Engineering',
    project: 'Proyecto Construcción',
    returnDate: '2024-03-01',
    notes: 'Workshop tools needed',
    status: 'rejected',
    items: [
      {
        id: 5,
        imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
        sku: 'DRL-001',
        name: 'Power Drill',
        description: 'Cordless drill with battery',
        quantity: 2,
        warehouseId: 'wh-2',
        warehouseName: 'Best'
      }
    ],
    createdAt: '2024-01-10',
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    requestId: 'BRW005',
    department: 'Marketing',
    project: 'Campaign 2024',
    returnDate: '2024-02-25',
    notes: 'Event equipment',
    status: 'completed',
    items: [
      {
        id: 6,
        imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
        sku: 'WEB-001',
        name: 'Webcam HD',
        description: 'Full HD webcam',
        quantity: 3,
        warehouseId: 'wh-1',
        warehouseName: 'Amax'
      }
    ],
    createdAt: '2024-01-08',
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  }
];

// API Simulation Functions

/**
 * Get all borrow requests
 */
export async function getBorrowRequests(): Promise<BorrowRequest[]> {
  await delay(300);
  return [...mockBorrowRequests];
}

/**
 * Get borrow request by ID
 */
export async function getBorrowRequestById(requestId: string): Promise<BorrowRequest | null> {
  await delay(200);
  const request = mockBorrowRequests.find(r => r.requestId === requestId);
  return request ? { ...request } : null;
}

/**
 * Create a new borrow request
 */
export async function createBorrowRequest(
  request: Omit<BorrowRequest, 'requestId' | 'status' | 'createdAt'>
): Promise<BorrowRequest> {
  await delay(500);
  
  // Validate required fields
  if (!request.department || !request.project) {
    throw new Error('Department and project are required');
  }
  
  if (!request.returnDate) {
    throw new Error('Return date is required');
  }
  
  if (request.items.length === 0) {
    throw new Error('At least one item must be included');
  }

  // Generate new request ID
  const newId = `BRW${String(mockBorrowRequests.length + 1).padStart(3, '0')}`;
  
  const newRequest: BorrowRequest = {
    ...request,
    requestId: newId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  mockBorrowRequests.push(newRequest);
  return newRequest;
}

/**
 * Update borrow request status
 */
export async function updateBorrowRequestStatus(
  requestId: string,
  status: BorrowRequest['status']
): Promise<BorrowRequest | null> {
  await delay(300);
  
  const requestIndex = mockBorrowRequests.findIndex(r => r.requestId === requestId);
  
  if (requestIndex === -1) {
    throw new Error('Borrow request not found');
  }
  
  mockBorrowRequests[requestIndex] = {
    ...mockBorrowRequests[requestIndex],
    status
  };
  
  return { ...mockBorrowRequests[requestIndex] };
}

/**
 * Delete borrow request (cancel)
 */
export async function deleteBorrowRequest(requestId: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  
  const requestIndex = mockBorrowRequests.findIndex(r => r.requestId === requestId);
  
  if (requestIndex === -1) {
    return {
      success: false,
      message: 'Borrow request not found'
    };
  }
  
  const request = mockBorrowRequests[requestIndex];
  
  // Only pending requests can be deleted
  if (request.status !== 'pending') {
    return {
      success: false,
      message: 'Only pending requests can be cancelled'
    };
  }

  mockBorrowRequests.splice(requestIndex, 1);
  
  return {
    success: true,
    message: 'Request cancelled successfully'
  };
}

/**
 * Return all items from a borrow request
 */
export async function returnBorrowedItems(
  requestId: string
): Promise<{ success: boolean; message: string }> {
  await delay(400);
  
  const requestIndex = mockBorrowRequests.findIndex(r => r.requestId === requestId);
  
  if (requestIndex === -1) {
    return {
      success: false,
      message: 'Borrow request not found'
    };
  }
  
  const request = mockBorrowRequests[requestIndex];
  
  if (request.status !== 'completed' && request.status !== 'approved') {
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