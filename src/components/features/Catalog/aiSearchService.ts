// Simula las llamadas al backend para AI Camera Search

import { CatalogItem } from './catalogService';
import { apiCall } from '../enginner/services/errorHandler';

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
      confidence: 95,
      matchType: 'exact'
    },
    {
      item: {
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
      confidence: 78,
      matchType: 'similar'
    },
    {
      item: {
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
      confidence: 65,
      matchType: 'similar'
    },
    {
      item: {
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
      confidence: 88,
      matchType: 'exact'
    },
    {
      item: {
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
