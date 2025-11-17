// Simula las llamadas al backend para AI Camera Search

import { CatalogItem } from './catalogService';
import { apiCall } from './errorHandler';

export interface AISearchResult {
  item: CatalogItem;
  confidence: number; // 0-100
  matchType: 'exact' | 'similar' | 'partial';
}

export interface AISearchResponse {
  searchId: string;
  timestamp: string;
  results: AISearchResult[];
  imageUrl: string;
}

// Simula delay de red (más largo para simular procesamiento de IA)
const simulateNetworkDelay = (ms: number = 1500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * POST - Busca items por imagen usando IA
 * Simula el envío de una imagen y recibe resultados de coincidencias
 */
export const searchItemsByImage = async (imageData: string): Promise<AISearchResponse> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
  
  // Simula resultados de búsqueda con items de diferentes warehouses
  const mockResults: AISearchResult[] = [
    {
      item: {
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
      confidence: 95,
      matchType: 'exact'
    },
    {
      item: {
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
      confidence: 78,
      matchType: 'similar'
    },
    {
      item: {
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
      confidence: 65,
      matchType: 'similar'
    },
    {
      item: {
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
      confidence: 52,
      matchType: 'partial'
    }
  ];

  return {
    searchId: `AI-SEARCH-${Date.now()}`,
    timestamp: new Date().toISOString(),
    results: mockResults,
    imageUrl: imageData
  };
  });
};

/**
 * POST - Busca items por texto usando IA
 */
export const searchItemsByText = async (query: string): Promise<AISearchResponse> => {
  return apiCall(async () => {
    await simulateNetworkDelay(800);
  
  // Simula búsqueda por texto
  const mockResults: AISearchResult[] = [
    {
      item: {
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
      confidence: 88,
      matchType: 'exact'
    },
    {
      item: {
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
      confidence: 72,
      matchType: 'similar'
    }
  ];

  return {
    searchId: `AI-TEXT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    results: mockResults,
    imageUrl: ''
  };
  });
};
