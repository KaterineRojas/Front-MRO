import { API_BASE_URL } from "../services/api";
import { store } from "../../../../store/store";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types
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
  status: 'pending-manager' | 'pending-engineer' | 'approved' | 'rejected';
  transferPhoto?: string;
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

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  image: string;
  project: string;
  projectCode: string;
  quantity: number;
  sku?: string;
  warehouse?: string;
  warehouseCode?: string;
}

export interface User {
  id: string;
  name: string;
  department: string;
  avatar: string;
}

// Mock Data
const mockUsers: User[] = [
  { id: '2', name: 'Ana Martínez', department: 'Development', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' },
  { id: '3', name: 'Luis González', department: 'Design', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis' },
  { id: '4', name: 'María Rodriguez', department: 'Marketing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
  { id: '5', name: 'Juan Pérez', department: 'Engineering', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan' }
];

const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-1',
    itemId: 'hammer-001',
    name: 'Hammer',
    description: 'Professional grade hammer',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    project: 'Proyecto Amazonas',
    projectCode: 'AMZ-2024',
    quantity: 4,
    sku: 'HAM-001',
    warehouse: 'Amax',
    warehouseCode: 'AMAX'
  },
  {
    id: 'inv-2',
    itemId: 'hammer-001',
    name: 'Hammer',
    description: 'Professional grade hammer',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    project: 'Proyecto Innova',
    projectCode: 'INN-2024',
    quantity: 6,
    sku: 'HAM-001',
    warehouse: 'Best',
    warehouseCode: 'BEST'
  },
  {
    id: 'inv-3',
    itemId: 'keyboard-001',
    name: 'Mechanical Keyboard RGB2',
    description: 'Gaming keyboard with RGB lighting',
    image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 2,
    sku: 'MECH-KB-001',
    warehouse: 'Central',
    warehouseCode: 'CENT'
  },
  {
    id: 'inv-4',
    itemId: 'monitor-001',
    name: 'Samsung 27" Monitor',
    description: 'Full HD display',
    image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 1,
    sku: 'SAM-003',
    warehouse: 'Amax',
    warehouseCode: 'AMAX'
  },
  {
    id: 'inv-5',
    itemId: 'drill-001',
    name: 'Power Drill',
    description: 'Cordless drill with battery',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
    project: 'Proyecto Construcción',
    projectCode: 'CONS-2024',
    quantity: 3,
    sku: 'DRL-001',
    warehouse: 'Best',
    warehouseCode: 'BEST'
  }
];

const mockTransfers: Transfer[] = [
  {
    id: 'TR003',
    type: 'outgoing',
    toUser: 'Luis González',
    toUserId: '3',
    items: [
      {
        itemId: '1',
        itemName: 'Mechanical Keyboard RGB',
        code: 'MECH-KB-001',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=100',
        description: 'Gaming keyboard',
        warehouse: 'Central',
        warehouseCode: 'CENT'
      }
    ],
    notes: 'Transferring for their project',
    requestDate: '2024-01-17',
    status: 'pending-manager',
    transferPhoto: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400'
  },
  {
    id: 'TR001',
    type: 'incoming',
    fromUser: 'Juan Pérez',
    fromUserId: '5',
    items: [
      {
        itemId: '3',
        itemName: 'Samsung 27" Monitor',
        code: 'SAM-003',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=100',
        description: 'Full HD display',
        warehouse: 'Amax',
        warehouseCode: 'AMAX'
      }
    ],
    notes: 'Additional monitor for development project',
    requestDate: '2024-01-16',
    status: 'pending-engineer',
    transferPhoto: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400'
  },
  {
    id: 'TR004',
    type: 'outgoing',
    toUser: 'Ana Martínez',
    toUserId: '2',
    items: [
      {
        itemId: '1',
        itemName: 'Hammer',
        code: 'IT-HT-NC-2025001',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100',
        description: 'Professional grade hammer',
        warehouse: 'Amax',
        warehouseCode: 'AMAX'
      },
      {
        itemId: '1',
        itemName: 'Hammer',
        code: 'IT-HT-NC-2025001',
        quantity: 3,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100',
        description: 'Professional grade hammer',
        warehouse: 'Best',
        warehouseCode: 'BEST'
      },
      {
        itemId: '2',
        itemName: 'Power Drill',
        code: 'DRL-001',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=100',
        description: 'Cordless drill',
        warehouse: 'Central',
        warehouseCode: 'CENT'
      }
    ],
    notes: 'Multiple items from different warehouses for construction project',
    requestDate: '2024-01-18',
    status: 'pending-engineer',
    transferPhoto: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'
  },
  {
    id: 'TR005',
    type: 'incoming',
    fromUser: 'María Rodriguez',
    fromUserId: '4',
    items: [
      {
        itemId: '4',
        itemName: 'Screwdriver Set',
        code: 'HT-NC-002',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=100',
        description: '5-piece Phillips set',
        warehouse: 'Best',
        warehouseCode: 'BEST'
      },
      {
        itemId: '5',
        itemName: 'Safety Goggles',
        code: 'SG-002',
        quantity: 5,
        image: 'https://images.unsplash.com/photo-1577760258779-e787a1733016?w=100',
        description: 'Clear protective safety goggles',
        warehouse: 'Best',
        warehouseCode: 'BEST'
      },
      {
        itemId: '6',
        itemName: 'Webcam 1080p',
        code: 'WEB-001',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=100',
        description: 'High definition webcam',
        warehouse: 'Central',
        warehouseCode: 'CENT'
      }
    ],
    notes: 'Safety equipment and webcam from different warehouses',
    requestDate: '2024-01-15',
    status: 'approved',
    transferPhoto: 'https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400'
  }
];

// API Simulation Functions

/**
 * Get all transfers desde el backend
 */
export async function getTransfers(): Promise<Transfer[]> {
  try {
    const senderId = getCurrentUserId();
    const url = `${API_BASE_URL}/transfer-requests?senderId=${senderId}&pageNumber=1&pageSize=20`;
    console.log('Fetching transfers from URL:', url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Si tu backend requiere autenticación, aquí se añade el token:
        // "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener transferencias: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Mapear la respuesta del backend a nuestro formato Transfer
    const currentUserId = getCurrentUserId();
    console.log('Current User ID:', currentUserId);
    console.log('Backend Response:', responseData.data);
    
    const transfers: Transfer[] = responseData.data.map((item: any) => {
      const type = item.senderId === currentUserId ? 'outgoing' : 'incoming';
      console.log(`Transfer ${item.requestNumber}: senderId=${item.senderId}, currentUserId=${currentUserId}, type=${type}`);
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
        })), // Aquí irán los items reales cuando la API los envíe
        notes: '',
        requestDate: item.createdAt,
        status: mapBackendStatusToLocal(item.status),
        transferPhoto: item.hasImage ? `${API_BASE_URL}/transfer-requests/${item.requestNumber}/image` : undefined,
      };
    });

    return transfers;
  } catch (error) {
    console.error('Error fetching transfers:', error);
    // Fallback a mock data en caso de error
    await delay(300);
    return [...mockTransfers];
  }
}

/**
 * Mapear estado del backend al estado local
 */
function mapBackendStatusToLocal(backendStatus: string): 'pending-manager' | 'pending-engineer' | 'approved' | 'rejected' {
  const statusMap: Record<string, 'pending-manager' | 'pending-engineer' | 'approved' | 'rejected'> = {
    'Pending': 'pending-manager',
    'Approved': 'approved',
    'Rejected': 'rejected',
  };
  return statusMap[backendStatus] || 'pending-manager';
}

/**
 * Obtener ID del usuario actualmente logueado desde authSlice
 */
function getCurrentUserId(): string {
  try {
    const state = store.getState();
    // Obtener del authSlice - la estructura es state.auth.user.id
    const userId = state.auth?.user?.id;
    console.log('Redux auth state:', state.auth);
    console.log('Retrieved userId from Redux:', userId);
    return userId || '';
  } catch (error) {
    console.error('Error getting user ID from Redux:', error);
    return localStorage.getItem('userId') || '';
  }
}

/**
 * Get available users for transfer
 */
export async function getAvailableUsers(): Promise<User[]> {
  await delay(200);
  return [...mockUsers];
}

/**
 * Get inventory items available for transfer
 */
export async function getInventoryItems(): Promise<InventoryItem[]> {
  await delay(400);
  return [...mockInventoryItems];
}

/**
 * Get inventory items for a specific engineer and warehouse
 * Based on getInventoryEngineer but with warehouseId filter
 */
export async function getInventoryTransfer(
  engineerId: string,
  warehouseId: string
): Promise<InventoryItem[]> {
  try {
    const url = `${API_BASE_URL}/engineer-holdings/${engineerId}?warehouseId=${warehouseId}`;
    console.log(`Fetching transfer inventory for engineer: ${engineerId}, warehouse: ${warehouseId}`);
    console.log(`API URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Si tu API requiere autenticación, agrega aquí el token:
        // "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Transfer Inventory API Response:', data);

    // Procesar la respuesta: puede venir como array directo o dentro de holdingsByWarehouse
    const items: InventoryItem[] = [];

    // Si la respuesta es un array directo de items
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        items.push({
          id: `${item.itemId}-${item.warehouseCode || warehouseId}`,
          itemId: item.itemId.toString(),
          name: item.name,
          description: item.description,
          image: item.imageUrl || '',
          project: item.projectIds?.[0] || 'general expenses',
          projectCode: item.projectCode || 'GEN',
          quantity: item.quantity,
          sku: item.sku,
          warehouse: item.warehouseName || '',
          warehouseCode: item.warehouseCode || warehouseId,
        });
      });
    } 
    // Si la respuesta viene con estructura holdingsByWarehouse
    else if (data.holdingsByWarehouse && Array.isArray(data.holdingsByWarehouse)) {
      data.holdingsByWarehouse.forEach((warehouse: any) => {
        if (warehouse.items && Array.isArray(warehouse.items)) {
          warehouse.items.forEach((item: any) => {
            items.push({
              id: `${item.itemId}-${warehouse.warehouse.code}`,
              itemId: item.itemId.toString(),
              name: item.name,
              description: item.description,
              image: item.imageUrl || '',
              project: item.projectIds?.[0] || 'general expenses',
              projectCode: item.projectCode || 'GEN',
              quantity: item.quantity,
              sku: item.sku,
              warehouse: warehouse.warehouse.name,
              warehouseCode: warehouse.warehouse.code,
            });
          });
        }
      });
    }

    return items;
  } catch (error) {
    console.error('Error fetching transfer inventory:', error);
    // Fallback a mock data en caso de error
    await delay(300);
    return [...mockInventoryItems];
  }
}

/**
 * Create a new transfer
 */
export async function createTransfer(data: {
  targetEngineerId: string;
  items: { id: string; quantity: number }[];
  photo: string;
  notes?: string;
}): Promise<{ success: boolean; transferId: string }> {
  await delay(500);
  
  // Simulate validation
  if (!data.targetEngineerId) {
    throw new Error('Target engineer is required');
  }
  
  if (!data.photo) {
    throw new Error('Transfer photo is required');
  }
  
  if (data.items.length === 0) {
    throw new Error('At least one item must be selected');
  }

  // Generate new transfer ID
  const newId = `TR${String(mockTransfers.length + 1).padStart(3, '0')}`;
  
  return {
    success: true,
    transferId: newId
  };
}

/**
 * Accept an incoming transfer
 */
export async function acceptTransfer(
  transferId: string, 
  projectId: string
): Promise<{ success: boolean; message: string }> {
  await delay(400);
  
  const transfer = mockTransfers.find(t => t.id === transferId);
  
  if (!transfer) {
    throw new Error('Transfer not found');
  }
  
  if (transfer.type !== 'incoming') {
    throw new Error('Only incoming transfers can be accepted');
  }
  
  if (!projectId) {
    throw new Error('Project assignment is required');
  }

  return {
    success: true,
    message: 'Transfer accepted successfully'
  };
}

/**
 * Reject an incoming transfer
 */
export async function rejectTransfer(transferId: string): Promise<{ success: boolean }> {
  await delay(300);
  
  const transfer = mockTransfers.find(t => t.id === transferId);
  
  if (!transfer) {
    throw new Error('Transfer not found');
  }

  return {
    success: true
  };
}

/**
 * Cancel an outgoing transfer
 */
export async function cancelTransfer(transferId: string): Promise<{ success: boolean }> {
  await delay(300);
  
  const transfer = mockTransfers.find(t => t.id === transferId);
  
  if (!transfer) {
    throw new Error('Transfer not found');
  }
  
  if (transfer.type !== 'outgoing') {
    throw new Error('Only outgoing transfers can be cancelled');
  }

  return {
    success: true
  };
}

/**
 * Delete a transfer by ID
 */
export async function deleteTransfer(transferId: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${API_BASE_URL}/transfer-requests/${transferId}`;
    console.log('Deleting transfer from URL:', url);
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // Si tu backend requiere autenticación, aquí se añade el token:
        // "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar transferencia: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Delete response:', responseData);

    return {
      success: true,
      message: 'Transfer deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting transfer:', error);
    throw error;
  }
}