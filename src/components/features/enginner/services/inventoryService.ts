// Simula las llamadas al backend para My Inventory (Items y Kits)
import { apiCall } from './errorHandler';

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  image: string;
  project: string;
  projectCode: string;
  quantity: number;
  sku: string;
  warehouseId: string;
  warehouseName: string;
}

export interface KitItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  image?: string;
}

export interface Kit {
  id: string;
  kitId: string;
  name: string;
  description: string;
  project: string;
  projectCode: string;
  quantity: number;
  items: KitItem[];
  warehouseId: string;
  warehouseName: string;
}

// Datos mock para Items
const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-1',
    itemId: 'hammer-001',
    name: '*********Hammer',
    description: 'Professional grade hammer',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    project: 'Proyecto Amazonas',
    projectCode: 'AMZ-2024',
    quantity: 4,
    sku: 'HAM-001',
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 'inv-2',
    itemId: 'hammer-001',
    name: 'Hammer',
    description: 'OTRA PRUEBAProfessional grade hammer2',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    project: 'Proyecto Innova',
    projectCode: 'INN-2024',
    quantity: 6,
    sku: 'HAM-001',
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    id: 'inv-3',
    itemId: 'keyboard-001',
    name: 'Mechanical Keyboard RGB',
    description: 'Gaming keyboard with RGB lighting',
    image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 2,
    sku: 'MECH-KB-001',
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
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
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
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
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  }
];

// Datos mock para Kits
const mockKits: Kit[] = [
  {
    id: 'kit-1',
    kitId: 'electrical-kit-001',
    name: 'Electrical Maintenance Kit',
    description: 'Complete electrical maintenance toolkit',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 2,
    warehouseId: 'wh-1',
    warehouseName: 'Amax',
    items: [
      { 
        id: 'kit-item-1', 
        sku: 'EL-MC-001', 
        name: 'Digital Multimeter', 
        description: 'Professional multimeter', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581092580497-e7d24e29d284?w=400'
      },
      { 
        id: 'kit-item-2', 
        sku: 'ST-WC-002', 
        name: 'Screwdriver Set', 
        description: '5-piece Phillips set', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'
      },
      { 
        id: 'kit-item-3', 
        sku: 'SE-MC-001', 
        name: 'Safety Glasses', 
        description: 'Clear safety glasses', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400'
      }
    ]
  },
  {
    id: 'kit-2',
    kitId: 'power-tool-kit-001',
    name: 'Power Tools Kit',
    description: 'Complete power tools set for construction',
    project: 'Proyecto Construcción',
    projectCode: 'CONS-2024',
    quantity: 1,
    warehouseId: 'wh-2',
    warehouseName: 'Best',
    items: [
      { 
        id: 'kit-item-4', 
        sku: 'DR-BC-001', 
        name: 'Cordless Drill', 
        description: '18V cordless drill', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'
      },
      { 
        id: 'kit-item-5', 
        sku: 'SA-BC-002', 
        name: 'Circular Saw', 
        description: '7.25" circular saw', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'
      },
      { 
        id: 'kit-item-6', 
        sku: 'IM-BC-003', 
        name: 'Impact Driver', 
        description: '18V impact driver', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'
      }
    ]
  },
  {
    id: 'kit-3',
    kitId: 'networking-kit-001',
    name: 'Network Installation Kit',
    description: 'Complete networking tools',
    project: 'Proyecto Innova',
    projectCode: 'INN-2024',
    quantity: 1,
    warehouseId: 'wh-3',
    warehouseName: 'Central',
    items: [
      { 
        id: 'kit-item-7', 
        sku: 'CR-NC-001', 
        name: 'Cable Crimper', 
        description: 'RJ45 cable crimper', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
      },
      { 
        id: 'kit-item-8', 
        sku: 'CA-NC-002', 
        name: 'Cable Tester', 
        description: 'Network cable tester', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400'
      },
      { 
        id: 'kit-item-9', 
        sku: 'PU-NC-003', 
        name: 'Punch Down Tool', 
        description: 'Professional punch tool', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581092580497-e7d24e29d284?w=400'
      }
    ]
  }
];

// Simula delay de red
const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ==================== INVENTORY ITEMS ====================

/**
 * GET - Obtiene todos los items del inventario del usuario
 */
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return [...mockInventoryItems];
  });
};

/**
 * GET - Obtiene un item específico por ID
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItem | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const item = mockInventoryItems.find(item => item.id === id);
    return item || null;
  });
};

/**
 * GET - Obtiene items por proyecto
 */
export const getInventoryItemsByProject = async (project: string): Promise<InventoryItem[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockInventoryItems.filter(item => item.project === project);
  });
};

/**
 * PUT - Actualiza la cantidad de un item
 */
export const updateInventoryItemQuantity = async (
  id: string, 
  quantity: number
): Promise<InventoryItem | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockInventoryItems.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    mockInventoryItems[index].quantity = quantity;
    return mockInventoryItems[index];
  });
};

/**
 * POST - Añade un item al inventario del usuario
 */
export const addInventoryItem = async (
  item: Omit<InventoryItem, 'id'>
): Promise<InventoryItem> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`
    };
    
    mockInventoryItems.push(newItem);
    return newItem;
  });
};

/**
 * DELETE - Elimina un item del inventario
 */
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockInventoryItems.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    mockInventoryItems.splice(index, 1);
    return true;
  });
};

// ==================== KITS ====================

/**
 * GET - Obtiene todos los kits del inventario del usuario
 */
export const getKits = async (): Promise<Kit[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return [...mockKits];
  });
};

/**
 * GET - Obtiene un kit específico por ID
 */
export const getKitById = async (id: string): Promise<Kit | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const kit = mockKits.find(kit => kit.id === id);
    return kit || null;
  });
};

/**
 * GET - Obtiene kits por proyecto
 */
export const getKitsByProject = async (project: string): Promise<Kit[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockKits.filter(kit => kit.project === project);
  });
};

/**
 * PUT - Actualiza la cantidad de un kit
 */
export const updateKitQuantity = async (
  id: string, 
  quantity: number
): Promise<Kit | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockKits.findIndex(kit => kit.id === id);
    if (index === -1) return null;
    
    mockKits[index].quantity = quantity;
    return mockKits[index];
  });
};

/**
 * POST - Añade un kit al inventario del usuario
 */
export const addKit = async (
  kit: Omit<Kit, 'id'>
): Promise<Kit> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const newKit: Kit = {
      ...kit,
      id: `kit-${Date.now()}`
    };
    
    mockKits.push(newKit);
    return newKit;
  });
};

/**
 * DELETE - Elimina un kit del inventario
 */
export const deleteKit = async (id: string): Promise<boolean> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    
    const index = mockKits.findIndex(kit => kit.id === id);
    if (index === -1) return false;
    
    mockKits.splice(index, 1);
    return true;
  });
};