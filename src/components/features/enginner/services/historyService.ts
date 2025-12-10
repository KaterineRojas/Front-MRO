
import { API_URL } from "../../../../url";
// Simula las llamadas al backend para Complete History
import { apiCall } from './errorHandler';
import { store } from "../../../../store/store";

export interface HistoryItem {
  id: string;
  name: string;
  code?: string;
  quantity: number;
  image?: string;
  estimatedCost?: number;
}

export interface HistoryRecord {
  id: string;
  type: 'purchase' | 'purchase-on-site' | 'transfer';
  status: 'completed' | 'rejected' | 'transferred';
  requestDate: string;
  completionDate: string;
  items: HistoryItem[];
  department: string;
  project: string;
  priority?: 'low' | 'medium' | 'urgent';
  totalCost?: number;
  selfPurchase?: boolean;
  transferTo?: string;
  transferFrom?: string;
  rejectionReason?: string;
  warehouseId: string;
  warehouseName: string;
}

export interface TransferItem {
  itemId: string;
  itemName: string;
  code?: string;
  quantity: number;
  image: string;
  description?: string;
  warehouse?: string;
  warehouseCode?: string;
}

export interface Transfer {
  id: string;
  type: 'outgoing' | 'incoming';
  fromUser?: string;
  toUser?: string;
  fromUserId?: string;
  toUserId?: string;
  items: TransferItem[];
  notes: string;
  requestDate: string;
  status: 'pending' | 'completed' | 'rejected';
  transferPhoto?: string;
  imageUrl?: string;
  warehouseName?: string;
}

// Datos mock
const mockHistoryRecords: HistoryRecord[] = [
  {
    id: 'PU001',
    type: 'purchase',
    status: 'completed',
    requestDate: '2024-01-05',
    completionDate: '2024-01-15',
    warehouseId: 'wh-1',
    warehouseName: 'Amax',
    items: [
      { 
        id: '1', 
        name: 'Dell XPS Laptop', 
        code: 'DELL-XPS-001',
        quantity: 2, 
        estimatedCost: 1200,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
      },
      { 
        id: '2', 
        name: 'USB-C Docking Station', 
        code: 'DOCK-002',
        quantity: 2, 
        estimatedCost: 150,
        image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400'
      }
    ],
    department: 'IT',
    project: 'Hardware Upgrade 2024',
    priority: 'urgent',
    totalCost: 2700,
    selfPurchase: false
  },
  {
    id: 'PU002',
    type: 'purchase',
    status: 'rejected',
    requestDate: '2023-12-01',
    completionDate: '2023-12-05',
    warehouseId: 'wh-2',
    warehouseName: 'Best',
    items: [
      { 
        id: '1', 
        name: 'Standing Desk', 
        code: 'SD-001',
        quantity: 5, 
        estimatedCost: 600,
        image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400'
      }
    ],
    department: 'HR',
    project: 'Office Ergonomics',
    priority: 'low',
    totalCost: 3000,
    selfPurchase: false,
    rejectionReason: 'Requires additional budget approval from management'
  },
  {
    id: 'PC001',
    type: 'purchase-on-site',
    status: 'completed',
    requestDate: '2023-12-20',
    completionDate: '2024-01-05',
    warehouseId: 'wh-1',
    warehouseName: 'Amax',
    items: [
      { 
        id: '1', 
        name: 'Mechanical Keyboard', 
        code: 'MECH-KB-001',
        quantity: 1, 
        estimatedCost: 120,
        image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400'
      },
      { 
        id: '2', 
        name: 'Gaming Mouse', 
        code: 'GM-002',
        quantity: 1, 
        estimatedCost: 80,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'
      },
      { 
        id: '3', 
        name: 'Mouse Pad', 
        code: 'MP-003',
        quantity: 1, 
        estimatedCost: 20,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400'
      }
    ],
    department: 'Development',
    project: 'Workstation Improvements',
    priority: 'medium',
    totalCost: 220,
    selfPurchase: false
  },
  {
    id: 'PC002',
    type: 'purchase-on-site',
    status: 'rejected',
    requestDate: '2023-11-25',
    completionDate: '2023-11-30',
    warehouseId: 'wh-3',
    warehouseName: 'Central',
    items: [
      { 
        id: '1', 
        name: 'Premium Gaming Chair', 
        code: 'PGC-001',
        quantity: 1, 
        estimatedCost: 500,
        image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400'
      }
    ],
    department: 'Development',
    project: 'Ergonomic Improvements',
    priority: 'low',
    totalCost: 500,
    selfPurchase: false,
    rejectionReason: 'Budget exceeded for Q4'
  },
  {
    id: 'TR001',
    type: 'transfer',
    status: 'transferred',
    requestDate: '2023-12-10',
    completionDate: '2023-12-12',
    warehouseId: 'wh-1',
    warehouseName: 'Amax',
    items: [
      { 
        id: '3', 
        name: 'Samsung 27" Monitor',
        code: 'SAM-003',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400'
      },
      { 
        id: '4', 
        name: 'HDMI 2.0 Cable',
        code: 'HDMI-004',
        quantity: 3,
        image: 'https://images.unsplash.com/photo-1733913106110-3f9832a788a0?w=400'
      }
    ],
    department: 'Design',
    project: 'UI/UX Redesign',
    transferTo: 'Ana Martínez'
  },
  {
    id: 'TR002',
    type: 'transfer',
    status: 'rejected',
    requestDate: '2023-11-15',
    completionDate: '2023-11-16',
    warehouseId: 'wh-2',
    warehouseName: 'Best',
    items: [
      { 
        id: '5', 
        name: 'iPad Pro',
        code: 'IPAD-005',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'
      }
    ],
    department: 'Marketing',
    project: 'Content Creation',
    transferTo: 'Carlos Rodríguez',
    rejectionReason: 'Destination engineer already has similar equipment assigned'
  },
  {
    id: 'PC003',
    type: 'purchase-on-site',
    status: 'completed',
    requestDate: '2023-11-10',
    completionDate: '2023-11-20',
    warehouseId: 'wh-2',
    warehouseName: 'Best',
    items: [
      { 
        id: '5', 
        name: 'Power Drill',
        code: 'DRL-001',
        quantity: 2,
        estimatedCost: 150,
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'
      },
      { 
        id: '6', 
        name: 'Safety Goggles',
        code: 'SG-002',
        quantity: 5,
        estimatedCost: 15,
        image: 'https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400'
      }
    ],
    department: 'Engineering',
    project: 'Proyecto Construcción',
    priority: 'urgent',
    totalCost: 375,
    selfPurchase: true
  },
  {
    id: 'PC004',
    type: 'purchase-on-site',
    status: 'rejected',
    requestDate: '2023-10-15',
    completionDate: '2023-10-18',
    warehouseId: 'wh-3',
    warehouseName: 'Central',
    items: [
      { 
        id: '7', 
        name: 'Laptop Stand',
        code: 'LS-001',
        quantity: 3,
        estimatedCost: 45,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'
      }
    ],
    department: 'Design',
    project: 'Workspace Optimization',
    priority: 'low',
    totalCost: 135,
    selfPurchase: false,
    rejectionReason: 'Similar items already available in inventory'
  },
  {
    id: 'PU003',
    type: 'purchase',
    status: 'completed',
    requestDate: '2023-10-01',
    completionDate: '2023-10-10',
    warehouseId: 'wh-1',
    warehouseName: 'Amax',
    items: [
      { 
        id: '8', 
        name: 'Office Chairs',
        code: 'OC-001',
        quantity: 10,
        estimatedCost: 200,
        image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400'
      }
    ],
    department: 'Administration',
    project: 'Office Refurbishment',
    priority: 'medium',
    totalCost: 2000,
    selfPurchase: false
  },
  {
    id: 'TR003',
    type: 'transfer',
    status: 'completed',
    requestDate: '2023-09-15',
    completionDate: '2023-09-18',
    warehouseId: 'wh-3',
    warehouseName: 'Central',
    items: [
      { 
        id: '9', 
        name: 'Projector',
        code: 'PROJ-001',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400'
      }
    ],
    department: 'Sales',
    project: 'Client Presentations',
    transferTo: 'Juan Pérez'
  }
];

// Simula delay de red
const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * GET - Obtiene todo el historial completo (ahora usando getTransfersOutgoing)
 */
export const getCompleteHistory = async (): Promise<HistoryRecord[]> => {
  return apiCall(async () => {
    const transfers = await getTransfersOutgoing();
    
    // Convertir Transfer[] a HistoryRecord[]
    return transfers.map((transfer): HistoryRecord => ({
      id: transfer.id,
      type: 'transfer',
      status: transfer.status === 'completed' ? 'completed' : transfer.status === 'rejected' ? 'rejected' : 'transferred',
      requestDate: transfer.requestDate,
      completionDate: transfer.requestDate, // Usar requestDate como completionDate
      items: transfer.items.map(item => ({
        id: item.itemId,
        name: item.itemName,
        code: item.code,
        quantity: item.quantity,
        image: item.image,
        description: item.description
      })),
      department: '', // No disponible en Transfer
      project: '', // No disponible en Transfer
      warehouseId: '', // No disponible en Transfer
      warehouseName: transfer.warehouseName || ''
    }));
  });
};



/**
 * GET - Obtiene un registro de historial por ID
 */
export const getHistoryRecordById = async (id: string): Promise<HistoryRecord | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const record = mockHistoryRecords.find(rec => rec.id === id);
    return record || null;
  });
};

/**
 * GET - Obtiene historial filtrado por tipo
 */
export const getHistoryByType = async (type: HistoryRecord['type']): Promise<HistoryRecord[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockHistoryRecords.filter(rec => rec.type === type);
  });
};

/**
 * GET - Obtiene historial filtrado por estado
 */
export const getHistoryByStatus = async (status: HistoryRecord['status']): Promise<HistoryRecord[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockHistoryRecords.filter(rec => rec.status === status);
  });
};

/**
 * GET - Obtiene historial por proyecto
 */
export const getHistoryByProject = async (project: string): Promise<HistoryRecord[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockHistoryRecords.filter(rec => rec.project === project);
  });
};

/**
 * GET - Obtiene historial por departamento
 */
export const getHistoryByDepartment = async (department: string): Promise<HistoryRecord[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockHistoryRecords.filter(rec => rec.department === department);
  });
};

/**
 * GET - Obtiene historial por rango de fechas
 */
export const getHistoryByDateRange = async (startDate: string, endDate: string): Promise<HistoryRecord[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockHistoryRecords.filter(rec => {
      const recordDate = new Date(rec.completionDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return recordDate >= start && recordDate <= end;
    });
  });
};

/**
 * POST - Crea un nuevo registro en el historial (generalmente automático cuando se completa una solicitud)
 */
export const createHistoryRecord = async (
  record: Omit<HistoryRecord, 'id'>
): Promise<HistoryRecord> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const newRecord: HistoryRecord = {
      ...record,
      id: `HIST-${Date.now()}`
    };
    
    mockHistoryRecords.push(newRecord);
    return newRecord;
  });
};

/**
 * GET - Obtiene estadísticas del historial
 */
export const getHistoryStats = async (): Promise<{
  totalRecords: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalCost: number;
}> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const stats = {
      totalRecords: mockHistoryRecords.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalCost: 0
    };
    
    mockHistoryRecords.forEach(record => {
      // Count by type
      stats.byType[record.type] = (stats.byType[record.type] || 0) + 1;
      
      // Count by status
      stats.byStatus[record.status] = (stats.byStatus[record.status] || 0) + 1;
      
      // Sum total cost
      if (record.totalCost) {
        stats.totalCost += record.totalCost;
      }
    });
    
    return stats;
  });
};

/**
 * Obtener ID del usuario actualmente logueado desde authSlice
 */
function getCurrentUserId(): string {
  try {
    const state = store.getState();
    const userId = state.auth?.user?.id;
    
    if (!userId) {
      const localStorageId = localStorage.getItem('userId');
      return localStorageId || '';
    }
    
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    const fallbackId = localStorage.getItem('userId') || '';
    return fallbackId;
  }
}

/**
 * Mapear estado del backend al estado local
 */
function mapBackendStatusToLocal(backendStatus: string): 'pending' | 'completed' | 'rejected' {
  const statusMap: Record<string, 'pending' | 'completed' | 'rejected'> = {
    'Pending': 'pending',
    'Completed': 'completed',
    'Rejected': 'rejected',
  };
  return statusMap[backendStatus] || 'pending';
}

/**
 * Get outgoing transfers (sent by current user)
 */
export async function getTransfersOutgoing(): Promise<Transfer[]> {
  try {
    const senderId = getCurrentUserId();
    
    const url = `${API_URL}/transfer-requests?senderId=${senderId}&pageNumber=1&pageSize=20`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching outgoing transfers:', errorText);
      throw new Error(`Error al obtener transferencias: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    if (!responseData.data) {
      return [];
    }

    if (!Array.isArray(responseData.data)) {
      return [];
    }
    
    const transfers: Transfer[] = responseData.data.map((item: any) => {
      const type = 'outgoing';
      return {
        id: item.requestNumber,
        type: type,
        fromUser: item.senderName,
        toUser: item.recipientName,
        fromUserId: item.senderId,
        toUserId: item.recipientId,
        items: Array(item.totalItems).fill(null).map((_, idx) => ({
          itemId: `item-${idx}`,
          itemName: `Item ${idx + 1}`,
          code: '',
          quantity: 1,
          image: '',
          description: '',
          warehouse: item.warehouseName,
          warehouseCode: ''
        })),
        notes: '',
        requestDate: item.createdAt,
        status: mapBackendStatusToLocal(item.status),
        transferPhoto: undefined,
        warehouseName: item.warehouseName,
      };
    });

    return transfers;
  } catch (error) {
    console.error('Error in getTransfersOutgoing:', error);
    throw error;
  }
}
