// Simula las llamadas al backend para Request Orders (Borrow, Purchase)
import { apiCall } from '../../enginner/services/errorHandler';
import { API_BASE_URL } from '../../enginner/services/api';

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

// Datos mock para Borrow Requests
const mockBorrowRequests: BorrowRequest[] = [
  {
    requestId: "BT-2025001",
    department: "Systems",
    returnDate: "2025-02-15",
    project: "Amazonas",
    notes: "Need for weekend project setup",
    status: "pending",
    createdAt: "2025-01-10",
    warehouseId: 'wh-1',
    warehouseName: 'Amax',
    items: [
      {
        id: 1,
        imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400",
        sku: "HT-NC-001",
        name: "Adjustable Wrench 10\"",
        description: "Heavy duty wrench",
        quantity: 2
      },
      {
        id: 2,
        imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
        sku: "HT-NC-002",
        name: "Screwdriver Set",
        description: "5-piece Phillips set",
        quantity: 1
      },
      {
        id: 3,
        imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400",
        sku: "HT-NC-003",
        name: "Hammer 16oz",
        description: "Claw hammer",
        quantity: 1
      }
    ]
  },
  {
    requestId: "BT-2025002",
    department: "Development",
    returnDate: "2025-01-25",
    project: "Web Platform",
    notes: "Testing equipment for QA",
    status: "approved",
    createdAt: "2025-01-08",
    warehouseId: 'wh-2',
    warehouseName: 'Best',
    items: [
      {
        id: 4,
        imageUrl: "https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400",
        sku: "MECH-KB-001",
        name: "Mechanical Keyboard RGB",
        description: "Gaming keyboard with RGB lighting",
        quantity: 1
      },
      {
        id: 5,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
        sku: "GM-002",
        name: "Gaming Mouse",
        description: "Ergonomic gaming mouse",
        quantity: 1
      }
    ]
  },
  {
    requestId: "BT-2025003",
    department: "Engineering",
    returnDate: "2025-02-20",
    project: "Construction Site",
    notes: "Required for site inspection",
    status: "pending",
    createdAt: "2025-01-12",
    warehouseId: 'wh-3',
    warehouseName: 'Central',
    items: [
      {
        id: 6,
        imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
        sku: "DRL-001",
        name: "Power Drill",
        description: "Cordless drill with battery",
        quantity: 1
      },
      {
        id: 7,
        imageUrl: "https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400",
        sku: "SG-002",
        name: "Safety Goggles",
        description: "Clear protective safety goggles",
        quantity: 3
      }
    ]
  }
];

// Datos mock para Purchase Requests
const mockPurchaseRequests: PurchaseRequest[] = [
  {
    requestId: "PC-2025001",
    department: "IT",
    project: "Infrastructure Upgrade",
    notes: "Urgent hardware needed for server room",
    status: "pending",
    priority: "urgent",
    selfPurchase: false,
    totalCost: 2500,
    createdAt: "2025-01-11",
    warehouseId: 'wh-1',
    warehouseName: 'Amax',
    items: [
      {
        id: 8,
        imageUrl: "https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400",
        sku: "SAM-003",
        name: "Samsung 27\" Monitor",
        description: "Full HD display",
        quantity: 2,
        estimatedCost: 300,
        productUrl: "https://example.com/monitor"
      },
      {
        id: 9,
        imageUrl: "https://images.unsplash.com/photo-1733913106110-3f9832a788a0?w=400",
        sku: "HDMI-004",
        name: "HDMI 2.0 Cable",
        description: "High speed HDMI cable 6ft",
        quantity: 5,
        estimatedCost: 15,
        productUrl: "https://example.com/hdmi"
      }
    ]
  },
  {
    requestId: "PC-2025002",
    department: "Design",
    project: "Creative Studio",
    notes: "New equipment for design team",
    status: "approved",
    priority: "medium",
    selfPurchase: false,
    totalCost: 1800,
    createdAt: "2025-01-09",
    warehouseId: 'wh-2',
    warehouseName: 'Best',
    items: [
      {
        id: 10,
        imageUrl: "https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400",
        sku: "MECH-KB-001",
        name: "Mechanical Keyboard RGB",
        description: "Gaming keyboard with RGB lighting",
        quantity: 3,
        estimatedCost: 120,
        productUrl: "https://example.com/keyboard"
      }
    ]
  },
  {
    requestId: "PC-2025003",
    department: "Engineering",
    project: "Construction Tools",
    notes: "Will purchase locally for immediate use",
    status: "pending",
    priority: "urgent",
    selfPurchase: true,
    totalCost: 450,
    createdAt: "2025-01-13",
    warehouseId: 'wh-3',
    warehouseName: 'Central',
    items: [
      {
        id: 11,
        imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
        sku: "DRL-001",
        name: "Power Drill",
        description: "Cordless drill with battery",
        quantity: 2,
        estimatedCost: 150,
        productUrl: "https://example.com/drill"
      },
      {
        id: 12,
        imageUrl: "https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400",
        sku: "SG-002",
        name: "Safety Goggles",
        description: "Clear protective safety goggles",
        quantity: 10,
        estimatedCost: 15,
        productUrl: "https://example.com/goggles"
      }
    ]
  }
];

// Simula delay de red
const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ==================== BORROW REQUESTS ====================

/**
 * GET - Obtiene todas las solicitudes de préstamo
 */
export const getBorrowRequests = async (): Promise<BorrowRequest[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return [...mockBorrowRequests];
  });
};

/**
 * GET - Obtiene una solicitud de préstamo por ID
 */
export const getBorrowRequestById = async (requestId: string): Promise<BorrowRequest | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const request = mockBorrowRequests.find(req => req.requestId === requestId);
    return request || null;
  });
};

/**
 * POST - Crea una nueva solicitud de préstamo
 */
export const createBorrowRequest = async (
  request: Omit<BorrowRequest, 'requestId' | 'status' | 'createdAt'>
): Promise<BorrowRequest> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const newRequest: BorrowRequest = {
      ...request,
      requestId: `BT-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    mockBorrowRequests.push(newRequest);
    return newRequest;
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
    await simulateNetworkDelay();
    
    const index = mockBorrowRequests.findIndex(req => req.requestId === requestId);
    if (index === -1) return null;
    
    mockBorrowRequests[index].status = status;
    return mockBorrowRequests[index];
  });
};

/**
 * DELETE - Elimina una solicitud de préstamo
 */
export const deleteBorrowRequest = async (requestId: string): Promise<{ success: boolean; message: string }> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockBorrowRequests.findIndex(req => req.requestId === requestId);
    if (index === -1) {
      return { success: false, message: 'Request not found' };
    }
    
    // Solo permitir eliminar si está en estado pending
    if (mockBorrowRequests[index].status !== 'pending') {
      return { success: false, message: 'Only pending requests can be deleted' };
    }
    
    mockBorrowRequests.splice(index, 1);
    return { success: true, message: 'Request deleted successfully' };
  });
};

// ==================== PURCHASE REQUESTS ====================

/**
 * GET - Obtiene todas las solicitudes de compra
 */
export const getPurchaseRequests = async (): Promise<PurchaseRequest[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return [...mockPurchaseRequests];
  });
};

/**
 * GET - Obtiene una solicitud de compra por ID
 */
export const getPurchaseRequestById = async (requestId: string): Promise<PurchaseRequest | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const request = mockPurchaseRequests.find(req => req.requestId === requestId);
    return request || null;
  });
};

/**
 * POST - Crea una nueva solicitud de compra
 */
export const createPurchaseRequest = async (
  request: Omit<PurchaseRequest, 'requestId' | 'status' | 'createdAt'>
): Promise<PurchaseRequest> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const newRequest: PurchaseRequest = {
      ...request,
      requestId: `PC-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    mockPurchaseRequests.push(newRequest);
    return newRequest;
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
    await simulateNetworkDelay();
    
    const index = mockPurchaseRequests.findIndex(req => req.requestId === requestId);
    if (index === -1) return null;
    
    mockPurchaseRequests[index].status = status;
    return mockPurchaseRequests[index];
  });
};

/**
 * DELETE - Elimina una solicitud de compra
 */
export const deletePurchaseRequest = async (requestId: string): Promise<{ success: boolean; message: string }> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockPurchaseRequests.findIndex(req => req.requestId === requestId);
    if (index === -1) {
      return { success: false, message: 'Request not found' };
    }
    
    // Solo permitir eliminar si está en estado pending
    if (mockPurchaseRequests[index].status !== 'pending') {
      return { success: false, message: 'Only pending requests can be deleted' };
    }
    
    mockPurchaseRequests.splice(index, 1);
    return { success: true, message: 'Request deleted successfully' };
  });
};

/**
 * PUT - Actualiza la prioridad de una solicitud de compra (auto-purchase)
 */
export const updatePurchaseRequestPriority = async (
  requestId: string,
  priority: PurchaseRequest['priority']
): Promise<PurchaseRequest | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockPurchaseRequests.findIndex(req => req.requestId === requestId);
    if (index === -1) return null;
    
    mockPurchaseRequests[index].priority = priority;
    return mockPurchaseRequests[index];
  });
};