// Simula las llamadas al backend para el Catálogo de Inventario
import { apiCall } from './errorHandler';

export interface CatalogItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  isActive: boolean;
  consumible: boolean;
  imageUrl: string;
  availableQuantity?: number;
  warehouseId: string;
  warehouseName: string;
}

// Datos mock
const mockCatalogItems: CatalogItem[] = [
  {
    id: 9,
    sku: "IT-HT-NC-2025001",
    name: "Hammer",
    description: "Professional grade hammer",
    category: "HandTools",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400",
    availableQuantity: 15,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 1,
    sku: "HT-NC-001",
    name: "Adjustable Wrench 10\"",
    description: "Heavy duty wrench",
    category: "ElectricalSupplies",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400",
    availableQuantity: 8,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 2,
    sku: "HT-NC-002",
    name: "Screwdriver Set",
    description: "5-piece Phillips set",
    category: "HandTools",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
    availableQuantity: 12,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    id: 3,
    sku: "MECH-KB-001",
    name: "Mechanical Keyboard RGB",
    description: "Gaming keyboard with RGB lighting",
    category: "Electronics",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400",
    availableQuantity: 5,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    id: 4,
    sku: "SAM-003",
    name: "Samsung 27\" Monitor",
    description: "Full HD display",
    category: "Electronics",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400",
    availableQuantity: 3,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 5,
    sku: "DRL-001",
    name: "Power Drill",
    description: "Cordless drill with battery",
    category: "PowerTools",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
    availableQuantity: 7,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    id: 6,
    sku: "SG-002",
    name: "Safety Goggles",
    description: "Clear protective safety goggles",
    category: "SafetyEquipment",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400",
    availableQuantity: 20,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    id: 7,
    sku: "HDMI-004",
    name: "HDMI 2.0 Cable",
    description: "High speed HDMI cable 6ft",
    category: "Electronics",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1733913106110-3f9832a788a0?w=400",
    availableQuantity: 25,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 8,
    sku: "GM-002",
    name: "Gaming Mouse",
    description: "Ergonomic gaming mouse with RGB",
    category: "Electronics",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
    availableQuantity: 10,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    id: 10,
    sku: "LAP-001",
    name: "Dell Latitude Laptop",
    description: "15.6\" Business laptop Intel i7",
    category: "Electronics",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400",
    availableQuantity: 4,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 11,
    sku: "MSE-002",
    name: "Measuring Tape 25ft",
    description: "Professional grade measuring tape",
    category: "HandTools",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400",
    availableQuantity: 18,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    id: 12,
    sku: "WEB-001",
    name: "Webcam 1080p",
    description: "High definition webcam with microphone",
    category: "Electronics",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400",
    availableQuantity: 6,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    id: 13,
    sku: "CHR-001",
    name: "Office Chair Ergonomic",
    description: "Comfortable ergonomic office chair",
    category: "Furniture",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400",
    availableQuantity: 8,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 14,
    sku: "PLR-001",
    name: "Pliers Set",
    description: "3-piece professional pliers set",
    category: "HandTools",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400",
    availableQuantity: 14,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    id: 15,
    sku: "HDS-001",
    name: "Headset Wireless",
    description: "Bluetooth wireless headset with noise canceling",
    category: "Electronics",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
    availableQuantity: 11,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    id: 16,
    sku: "EXT-001",
    name: "Extension Cord 50ft",
    description: "Heavy duty outdoor extension cord",
    category: "ElectricalSupplies",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=400",
    availableQuantity: 9,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 17,
    sku: "SAW-001",
    name: "Circular Saw",
    description: "7.25\" circular saw with laser guide",
    category: "PowerTools",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
    availableQuantity: 5,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    id: 18,
    sku: "PRJ-001",
    name: "Projector HD",
    description: "Full HD projector 3000 lumens",
    category: "Electronics",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1518416177092-ec985e4d6c14?w=400",
    availableQuantity: 2,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    id: 19,
    sku: "HLM-001",
    name: "Hard Hat Safety Helmet",
    description: "ANSI approved safety hard hat",
    category: "SafetyEquipment",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400",
    availableQuantity: 30,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 20,
    sku: "TAB-001",
    name: "iPad Pro 12.9\"",
    description: "Apple tablet with Apple Pencil",
    category: "Electronics",
    unit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    availableQuantity: 3,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  }
];

// Simula delay de red
const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * GET - Obtiene todos los items del catálogo
 */
export const getCatalogItems = async (): Promise<CatalogItem[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return [...mockCatalogItems];
  });
};

/**
 * GET - Obtiene un item específico por ID
 */
export const getCatalogItemById = async (id: number): Promise<CatalogItem | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const item = mockCatalogItems.find(item => item.id === id);
    return item || null;
  });
};

/**
 * GET - Obtiene items por categoría
 */
export const getCatalogItemsByCategory = async (category: string): Promise<CatalogItem[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockCatalogItems.filter(item => item.category === category);
  });
};

/**
 * POST - Crea un nuevo item en el catálogo
 */
export const createCatalogItem = async (item: Omit<CatalogItem, 'id'>): Promise<CatalogItem> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const newItem: CatalogItem = {
      ...item,
      id: Math.max(...mockCatalogItems.map(i => i.id)) + 1
    };
    mockCatalogItems.push(newItem);
    return newItem;
  });
};

/**
 * PUT - Actualiza un item existente
 */
export const updateCatalogItem = async (id: number, updates: Partial<CatalogItem>): Promise<CatalogItem | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const index = mockCatalogItems.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    mockCatalogItems[index] = { ...mockCatalogItems[index], ...updates };
    return mockCatalogItems[index];
  });
};

/**
 * DELETE - Elimina un item del catálogo (soft delete)
 */
export const deleteCatalogItem = async (id: number): Promise<boolean> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const index = mockCatalogItems.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    // Soft delete - marca como inactivo
    mockCatalogItems[index].isActive = false;
    return true;
  });
};

/**
 * PUT - Actualiza la cantidad disponible de un item
 */
export const updateItemQuantity = async (id: number, quantity: number): Promise<CatalogItem | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const index = mockCatalogItems.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    mockCatalogItems[index].availableQuantity = quantity;
    return mockCatalogItems[index];
  });
};

/**
 * GET - Obtiene items por warehouse
 */
export const getCatalogItemsByWarehouse = async (warehouseId: string): Promise<CatalogItem[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockCatalogItems.filter(item => item.warehouseId === warehouseId);
  });
};