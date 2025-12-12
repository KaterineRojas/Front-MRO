// Simula las llamadas al backend para el Catálogo de Inventario

import { apiCall } from '../enginner/services/errorHandler';
import { store } from "../../../store/store";

export interface CatalogItem {
  itemId: number;
  itemSku: string;
  itemName: string;
  itemDescription: string;
  itemCategory: string;
  itemUnit: string;
  isActive: boolean;
  consumible: boolean;
  imageUrl: string;
  totalQuantity?: number;
  warehouseId: string;
  warehouseName: string;
}

// Datos mock
const mockCatalogItems: CatalogItem[] = [
  {
    itemId: 9,
    itemSku: "IT-HT-NC-2025001",
    itemName: "Hammer",
    itemDescription: "Professional grade hammer",
    itemCategory: "HandTools",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400",
    totalQuantity: 15,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    itemId: 1,
    itemSku: "HT-NC-001",
    itemName: "Adjustable Wrench 10\"",
    itemDescription: "Heavy duty wrench",
    itemCategory: "ElectricalSupplies",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400",
    totalQuantity: 8,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    itemId: 2,
    itemSku: "HT-NC-002",
    itemName: "Screwdriver Set",
    itemDescription: "5-piece Phillips set",
    itemCategory: "HandTools",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
    totalQuantity: 12,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    itemId: 3,
    itemSku: "MECH-KB-001",
    itemName: "Mechanical Keyboard RGB",
    itemDescription: "Gaming keyboard with RGB lighting",
    itemCategory: "Electronics",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400",
    totalQuantity: 5,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    itemId: 4,
    itemSku: "SAM-003",
    itemName: "Samsung 27\" Monitor",
    itemDescription: "Full HD display",
    itemCategory: "Electronics",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400",
    totalQuantity: 3,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    itemId: 5,
    itemSku: "DRL-001",
    itemName: "Power Drill",
    itemDescription: "Cordless drill with battery",
    itemCategory: "PowerTools",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
    totalQuantity: 7,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    itemId: 6,
    itemSku: "SG-002",
    itemName: "Safety Goggles",
    itemDescription: "Clear protective safety goggles",
    itemCategory: "SafetyEquipment",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400",
    totalQuantity: 20,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    itemId: 7,
    itemSku: "HDMI-004",
    itemName: "HDMI 2.0 Cable",
    itemDescription: "High speed HDMI cable 6ft",
    itemCategory: "Electronics",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1733913106110-3f9832a788a0?w=400",
    totalQuantity: 25,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    itemId: 8,
    itemSku: "GM-002",
    itemName: "Gaming Mouse",
    itemDescription: "Ergonomic gaming mouse with RGB",
    itemCategory: "Electronics",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
    totalQuantity: 10,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    itemId: 10,
    itemSku: "LAP-001",
    itemName: "Dell Latitude Laptop",
    itemDescription: "15.6\" Business laptop Intel i7",
    itemCategory: "Electronics",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400",
    totalQuantity: 4,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    itemId: 11,
    itemSku: "MSE-002",
    itemName: "Measuring Tape 25ft",
    itemDescription: "Professional grade measuring tape",
    itemCategory: "HandTools",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400",
    totalQuantity: 18,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    itemId: 12,
    itemSku: "WEB-001",
    itemName: "Webcam 1080p",
    itemDescription: "High definition webcam with microphone",
    itemCategory: "Electronics",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400",
    totalQuantity: 6,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    itemId: 13,
    itemSku: "CHR-001",
    itemName: "Office Chair Ergonomic",
    itemDescription: "Comfortable ergonomic office chair",
    itemCategory: "Furniture",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400",
    totalQuantity: 8,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    itemId: 14,
    itemSku: "PLR-001",
    itemName: "Pliers Set",
    itemDescription: "3-piece professional pliers set",
    itemCategory: "HandTools",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400",
    totalQuantity: 14,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    itemId: 15,
    itemSku: "HDS-001",
    itemName: "Headset Wireless",
    itemDescription: "Bluetooth wireless headset with noise canceling",
    itemCategory: "Electronics",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
    totalQuantity: 11,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    itemId: 16,
    itemSku: "EXT-001",
    itemName: "Extension Cord 50ft",
    itemDescription: "Heavy duty outdoor extension cord",
    itemCategory: "ElectricalSupplies",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=400",
    totalQuantity: 9,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    itemId: 17,
    itemSku: "SAW-001",
    itemName: "Circular Saw",
    itemDescription: "7.25\" circular saw with laser guide",
    itemCategory: "PowerTools",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
    totalQuantity: 5,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    itemId: 18,
    itemSku: "PRJ-001",
    itemName: "Projector HD",
    itemDescription: "Full HD projector 3000 lumens",
    itemCategory: "Electronics",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1518416177092-ec985e4d6c14?w=400",
    totalQuantity: 2,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    itemId: 19,
    itemSku: "HLM-001",
    itemName: "Hard Hat Safety Helmet",
    itemDescription: "ANSI approved safety hard hat",
    itemCategory: "SafetyEquipment",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400",
    totalQuantity: 30,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    itemId: 20,
    itemSku: "TAB-001",
    itemName: "iPad Pro 12.9\"",
    itemDescription: "Apple tablet with Apple Pencil",
    itemCategory: "Electronics",
    itemUnit: "units",
    isActive: true,
    consumible: false,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
    totalQuantity: 3,
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
    const item = mockCatalogItems.find(item => item.itemId === id);
    return item || null;
  });
};

/**
 * GET - Obtiene items por categoría
 */
export const getCatalogItemsByCategory = async (category: string): Promise<CatalogItem[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockCatalogItems.filter(item => item.itemCategory === category);
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
      itemId: Math.max(...mockCatalogItems.map(i => i.itemId)) + 1
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
    const index = mockCatalogItems.findIndex(item => item.itemId === id);
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
    const index = mockCatalogItems.findIndex(item => item.itemId === id);
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
    const index = mockCatalogItems.findIndex(item => item.itemId === id);
    if (index === -1) return null;
    
    mockCatalogItems[index].totalQuantity = quantity;
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