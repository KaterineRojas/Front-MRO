// Simula las llamadas al backend para Transfers
import { apiCall } from './errorHandler';

export interface TransferItem {
  id: string;
  imageUrl: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
}

export interface TransferRequest {
  requestId: string;
  fromEngineer: string;
  toEngineer: string;
  department: string;
  project: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'transferred';
  items: TransferItem[];
  photoUrl: string;
  createdAt: string;
  completedAt?: string;
  rejectionReason?: string;
  warehouseId: string;
  warehouseName: string;
}

// Datos mock para Transfer Requests
const mockTransferRequests: TransferRequest[] = [
  {
    requestId: "TR-2025001",
    fromEngineer: "John Smith",
    toEngineer: "Ana Martínez",
    department: "Design",
    project: "UI/UX Redesign",
    notes: "Transferring monitors for new workstation setup",
    status: "pending",
    photoUrl: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400",
    createdAt: "2025-01-12",
    warehouseId: 'wh-1',
    warehouseName: 'Amax',
    items: [
      {
        id: '1',
        imageUrl: "https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400",
        sku: "SAM-003",
        name: "Samsung 27\" Monitor",
        description: "Full HD display",
        quantity: 1
      },
      {
        id: '2',
        imageUrl: "https://images.unsplash.com/photo-1733913106110-3f9832a788a0?w=400",
        sku: "HDMI-004",
        name: "HDMI 2.0 Cable",
        description: "High speed HDMI cable 6ft",
        quantity: 3
      }
    ]
  },
  {
    requestId: "TR-2025002",
    fromEngineer: "John Smith",
    toEngineer: "Luis González",
    department: "Engineering",
    project: "Construction Site",
    notes: "Needed for field work",
    status: "approved",
    photoUrl: "https://images.unsplash.com/photo-1581092580497-e7d24e29d284?w=400",
    createdAt: "2025-01-10",
    warehouseId: 'wh-2',
    warehouseName: 'Best',
    items: [
      {
        id: '3',
        imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
        sku: "DRL-001",
        name: "Power Drill",
        description: "Cordless drill with battery",
        quantity: 1
      },
      {
        id: '4',
        imageUrl: "https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400",
        sku: "SG-002",
        name: "Safety Goggles",
        description: "Clear protective safety goggles",
        quantity: 5
      }
    ]
  },
  {
    requestId: "TR-2025003",
    fromEngineer: "María Rodriguez",
    toEngineer: "John Smith",
    department: "Development",
    project: "Web Platform",
    notes: "Equipment no longer needed",
    status: "rejected",
    photoUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400",
    createdAt: "2025-01-09",
    completedAt: "2025-01-10",
    rejectionReason: "Recipient already has similar equipment assigned",
    warehouseId: 'wh-1',
    warehouseName: 'Amax',
    items: [
      {
        id: '5',
        imageUrl: "https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400",
        sku: "MECH-KB-001",
        name: "Mechanical Keyboard RGB",
        description: "Gaming keyboard with RGB lighting",
        quantity: 1
      }
    ]
  },
  {
    requestId: "TR-2025004",
    fromEngineer: "Luis González",
    toEngineer: "Ana Martínez",
    department: "Marketing",
    project: "Content Creation",
    notes: "Transfer completed successfully",
    status: "transferred",
    photoUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    createdAt: "2024-12-15",
    completedAt: "2024-12-20",
    warehouseId: 'wh-3',
    warehouseName: 'Central',
    items: [
      {
        id: '6',
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
        sku: "GM-002",
        name: "Gaming Mouse",
        description: "Ergonomic gaming mouse",
        quantity: 2
      }
    ]
  }
];

// Simula delay de red
const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * GET - Obtiene todas las solicitudes de transferencia
 */
export const getTransferRequests = async (): Promise<TransferRequest[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return [...mockTransferRequests];
  });
};

/**
 * GET - Obtiene una solicitud de transferencia por ID
 */
export const getTransferRequestById = async (requestId: string): Promise<TransferRequest | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const request = mockTransferRequests.find(req => req.requestId === requestId);
    return request || null;
  });
};

/**
 * GET - Obtiene transferencias enviadas por un ingeniero
 */
export const getTransferRequestsByFrom = async (engineer: string): Promise<TransferRequest[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockTransferRequests.filter(req => req.fromEngineer === engineer);
  });
};

/**
 * GET - Obtiene transferencias recibidas por un ingeniero
 */
export const getTransferRequestsByTo = async (engineer: string): Promise<TransferRequest[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockTransferRequests.filter(req => req.toEngineer === engineer);
  });
};

/**
 * POST - Crea una nueva solicitud de transferencia
 */
export const createTransferRequest = async (
  request: Omit<TransferRequest, 'requestId' | 'status' | 'createdAt'>
): Promise<TransferRequest> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const newRequest: TransferRequest = {
      ...request,
      requestId: `TR-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    mockTransferRequests.push(newRequest);
    return newRequest;
  });
};

/**
 * PUT - Actualiza el estado de una solicitud de transferencia
 */
export const updateTransferRequestStatus = async (
  requestId: string,
  status: TransferRequest['status'],
  rejectionReason?: string
): Promise<TransferRequest | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockTransferRequests.findIndex(req => req.requestId === requestId);
    if (index === -1) return null;
    
    mockTransferRequests[index].status = status;
    
    if (status === 'rejected' && rejectionReason) {
      mockTransferRequests[index].rejectionReason = rejectionReason;
    }
    
    if (status === 'completed' || status === 'transferred' || status === 'rejected') {
      mockTransferRequests[index].completedAt = new Date().toISOString().split('T')[0];
    }
    
    return mockTransferRequests[index];
  });
};

/**
 * DELETE - Elimina una solicitud de transferencia
 */
export const deleteTransferRequest = async (requestId: string): Promise<{ success: boolean; message: string }> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockTransferRequests.findIndex(req => req.requestId === requestId);
    if (index === -1) {
      return { success: false, message: 'Transfer request not found' };
    }
    
    // Solo permitir eliminar si está en estado pending
    if (mockTransferRequests[index].status !== 'pending') {
      return { success: false, message: 'Only pending transfer requests can be deleted' };
    }
    
    mockTransferRequests.splice(index, 1);
    return { success: true, message: 'Transfer request deleted successfully' };
  });
};

/**
 * PUT - Aprueba una transferencia (requiere dual approval)
 */
export const approveTransferRequest = async (
  requestId: string,
  approver: 'manager' | 'recipient'
): Promise<TransferRequest | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockTransferRequests.findIndex(req => req.requestId === requestId);
    if (index === -1) return null;
    
    // En un sistema real, aquí se gestionaría el proceso de doble aprobación
    // Por ahora, simplemente cambiamos el estado a approved
    mockTransferRequests[index].status = 'approved';
    
    return mockTransferRequests[index];
  });
};

/**
 * PUT - Completa una transferencia (marca como transferred)
 */
export const completeTransferRequest = async (requestId: string): Promise<TransferRequest | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockTransferRequests.findIndex(req => req.requestId === requestId);
    if (index === -1) return null;
    
    mockTransferRequests[index].status = 'transferred';
    mockTransferRequests[index].completedAt = new Date().toISOString().split('T')[0];
    
    return mockTransferRequests[index];
  });
};