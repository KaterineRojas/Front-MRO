// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types
export interface ExistingItem {
  id: string;
  name: string;
  image: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface PurchaseItem {
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

export interface PurchaseRequest {
  requestId: string;
  department: string;
  project: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'urgent';
  selfPurchase: boolean;
  items: PurchaseItem[];
  totalCost: number;
  createdAt?: string;
  warehouseId: string;
  warehouseName: string;
}

// Mock Data - Existing Items
const mockExistingItems: ExistingItem[] = [
  { id: '1', name: 'Mechanical Keyboard RGB', image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmQlMjBnYW1pbmd8ZW58MXx8fHwxNzU5Nzc2MzM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '2', name: 'Proyector Epson PowerLite', image: 'https://images.unsplash.com/photo-1625961332600-f6eac385c6ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0b3IlMjBvZmZpY2UlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzU5MTc4ODkzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '3', name: 'Monitor Samsung 27"', image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMG1vbml0b3IlMjBkaXNwbGF5fGVufDF8fHx8MTc1OTA1ODE5Nnww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '4', name: 'Cable HDMI 2.0', image: 'https://images.unsplash.com/photo-1625738323142-01e6d7906e0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZG1pJTIwY2FibGV8ZW58MXx8fHwxNzU5MDgxODM0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '5', name: 'Teclado mecánico', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXlib2FyZCUyMG1lY2hhbmljYWx8ZW58MXx8fHwxNzU5MDgxODM0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '6', name: 'Mouse inalámbrico', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VzZSUyMHdpcmVsZXNzfGVufDF8fHx8MTc1OTA4MTgzNHww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '7', name: 'Webcam HD', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJjYW18ZW58MXx8fHwxNzU5MDgxODM0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '8', name: 'Auriculares con micrófono', image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbWljcm9waG9uZXxlbnwxfHx8fDE3NTkwODE4MzR8MA&ixlib=rb-4.1.0&q=80&w=1080' }
];

// Mock Data - Departments
const mockDepartments: Department[] = [
  { id: 'eng', name: 'Engineering' },
  { id: 'dev', name: 'Development' },
  { id: 'des', name: 'Design' },
  { id: 'mkt', name: 'Marketing' },
  { id: 'sal', name: 'Sales' },
  { id: 'adm', name: 'Administration' }
];

// Mock Data - Purchase Requests
const mockPurchaseRequests: PurchaseRequest[] = [
  {
    requestId: 'PUR001',
    department: 'Engineering',
    project: 'Proyecto Amazonas',
    notes: 'Urgente para desarrollo',
    status: 'pending',
    priority: 'urgent',
    selfPurchase: false,
    items: [
      {
        id: 1,
        imageUrl: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400',
        sku: 'MECH-KB-001',
        name: 'Mechanical Keyboard RGB',
        description: 'Gaming keyboard with RGB lighting',
        quantity: 2,
        estimatedCost: 150,
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
        estimatedCost: 350,
        warehouseId: 'wh-1',
        warehouseName: 'Amax'
      }
    ],
    totalCost: 650,
    createdAt: '2024-01-15',
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    requestId: 'PUR002',
    department: 'Design',
    project: 'Proyecto Web',
    notes: 'Para nueva estación de trabajo',
    status: 'approved',
    priority: 'medium',
    selfPurchase: true,
    items: [
      {
        id: 3,
        imageUrl: 'https://images.unsplash.com/photo-1625961332600-f6eac385c6ba?w=400',
        sku: 'PROJ-EP-001',
        name: 'Proyector Epson PowerLite',
        description: 'HD projector for presentations',
        quantity: 1,
        estimatedCost: 800,
        warehouseId: 'wh-2',
        warehouseName: 'Best'
      }
    ],
    totalCost: 800,
    createdAt: '2024-01-14',
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    requestId: 'PUR003',
    department: 'Development',
    project: 'Proyecto Innova',
    notes: 'Cables y accesorios varios',
    status: 'rejected',
    priority: 'low',
    selfPurchase: false,
    items: [
      {
        id: 4,
        imageUrl: 'https://images.unsplash.com/photo-1625738323142-01e6d7906e0a?w=400',
        sku: 'HDMI-001',
        name: 'Cable HDMI 2.0',
        description: '4K HDMI cable 2m',
        quantity: 5,
        estimatedCost: 15,
        warehouseId: 'wh-3',
        warehouseName: 'Central'
      }
    ],
    totalCost: 75,
    createdAt: '2024-01-12',
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    requestId: 'PUR004',
    department: 'Engineering',
    project: 'Proyecto Construcción',
    notes: 'Herramientas para taller',
    status: 'approved',
    priority: 'urgent',
    selfPurchase: true,
    items: [
      {
        id: 5,
        imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
        sku: 'DRL-001',
        name: 'Power Drill',
        description: 'Cordless drill with battery',
        quantity: 2,
        estimatedCost: 120,
        warehouseId: 'wh-2',
        warehouseName: 'Best'
      },
      {
        id: 6,
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
        sku: 'HAM-001',
        name: 'Hammer',
        description: 'Professional grade hammer',
        quantity: 3,
        estimatedCost: 25,
        warehouseId: 'wh-2',
        warehouseName: 'Best'
      }
    ],
    totalCost: 315,
    createdAt: '2024-01-10',
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  }
];

// API Simulation Functions

/**
 * Get all purchase requests
 */
export async function getPurchaseRequests(): Promise<PurchaseRequest[]> {
  await delay(300);
  return [...mockPurchaseRequests];
}

/**
 * Get purchase request by ID
 */
export async function getPurchaseRequestById(requestId: string): Promise<PurchaseRequest | null> {
  await delay(200);
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  return request ? { ...request } : null;
}

/**
 * Create a new purchase request
 */
export async function createPurchaseRequest(
  request: Omit<PurchaseRequest, 'requestId' | 'status' | 'createdAt'>
): Promise<PurchaseRequest> {
  await delay(500);
  
  // Validate required fields
  if (!request.department || !request.project) {
    throw new Error('Department and project are required');
  }
  
  if (request.items.length === 0) {
    throw new Error('At least one item must be included');
  }

  // Generate new request ID
  const newId = `PUR${String(mockPurchaseRequests.length + 1).padStart(3, '0')}`;
  
  const newRequest: PurchaseRequest = {
    ...request,
    requestId: newId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  return newRequest;
}

/**
 * Update purchase request status
 */
export async function updatePurchaseRequestStatus(
  requestId: string,
  status: PurchaseRequest['status']
): Promise<PurchaseRequest | null> {
  await delay(300);
  
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    throw new Error('Purchase request not found');
  }
  
  return {
    ...request,
    status
  };
}

/**
 * Delete purchase request
 */
export async function deletePurchaseRequest(requestId: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    return {
      success: false,
      message: 'Purchase request not found'
    };
  }
  
  // Only pending requests can be deleted
  if (request.status !== 'pending') {
    return {
      success: false,
      message: 'Only pending requests can be cancelled'
    };
  }

  return {
    success: true,
    message: 'Request cancelled successfully'
  };
}

/**
 * Update purchase request priority
 */
export async function updatePurchaseRequestPriority(
  requestId: string,
  priority: PurchaseRequest['priority']
): Promise<PurchaseRequest | null> {
  await delay(300);
  
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    throw new Error('Purchase request not found');
  }
  
  return {
    ...request,
    priority
  };
}

/**
 * Confirm purchase as bought (for self-purchase requests)
 */
export async function confirmPurchaseBought(
  requestId: string,
  quantities: { [itemId: number]: number }
): Promise<{ success: boolean; message: string }> {
  await delay(400);
  
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    return {
      success: false,
      message: 'Purchase request not found'
    };
  }
  
  if (!request.selfPurchase) {
    return {
      success: false,
      message: 'Only self-purchase requests can be confirmed'
    };
  }
  
  if (request.status !== 'approved') {
    return {
      success: false,
      message: 'Only approved requests can be confirmed as bought'
    };
  }

  return {
    success: true,
    message: 'Purchase confirmed! Items will appear in Borrow module as pending return'
  };
}

/**
 * Get all existing items for selection
 */
export async function getExistingItems(): Promise<ExistingItem[]> {
  await delay(200);
  return [...mockExistingItems];
}

/**
 * Get all departments
 */
export async function getDepartments(): Promise<Department[]> {
  await delay(100);
  return [...mockDepartments];
}