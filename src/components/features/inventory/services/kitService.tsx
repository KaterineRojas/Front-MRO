// src/services/kitsService.ts
//KITS DUDA ORIGINAL
import { Article2 } from "../types";
import { API_URL } from "../../../../url";
//const API_URL = 'http://localhost:5000/api';

/**
 * API response format for kit items
 */
interface KitItemResponse {
  id: number;
  imageUrl: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
}

/**
 * API response format for kits from /api/Kits/with-items endpoint
 */
interface KitResponse {
  id: number;
  sku: string;
  name: string;
  description: string;
  binId: number;
  binCode: string;
  quantity: number;
  items: KitItemResponse[];
}

/**
 * Application Kit type
 */
export interface Kit {
  id: number;
  binCode: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  imageUrl?: string;
  items: {
    articleId: number;
    articleSku: string;
    articleName: string;
    articleDescription?: string;
    imageUrl?: string;
    quantity: number;
  }[];
  status: string;
  createdAt: string;
}

/**
 * Infers kit category from SKU
 * SKU format: KIT-XX-YYYYNNN where XX is the category abbreviation
 */
function inferCategoryFromSKU(sku: string): string {
  const categoryMap: { [key: string]: string } = {
    'BT': 'BasicTools',
    'ET': 'ElectricalTesting',
    'SOL': 'Soldering',
    'MC': 'Microcontrollers',
    'SBC': 'SingleBoardComputers',
    'MEAS': 'Measurement',
    'PROTO': 'Prototyping',
    'CAB': 'Cabling',
    'NET': 'Networking',
    'IND': 'IndustrialInstruments',
    'PM': 'PrecisionMechanics',
    'PS': 'PowerSupplies',
    'SENS': 'Sensors',
    'PCB': 'PCBFabrication',
    'ROB': 'Robotics',
    'WC': 'WirelessComms',
    'AUDIO': 'AudioElectronics',
    'LIGHT': 'Lighting',
    'MAINT': 'Maintenance',
    'ML': 'MobileLab',
  };

  // Extract category code from SKU (KIT-XX-...)
  const match = sku.match(/^KIT-([A-Z]+)-/);
  if (match && match[1]) {
    return categoryMap[match[1]] || 'BasicTools';
  }

  return 'BasicTools'; // Default fallback
}

/**
 * Transforms API kit item response to application format
 */
function transformKitItem(apiItem: KitItemResponse) {
  return {
    articleId: apiItem.id,
    articleSku: apiItem.sku,
    articleName: apiItem.name,
    articleDescription: apiItem.description,
    imageUrl: apiItem.imageUrl || undefined,
    quantity: apiItem.quantity,
  };
}

/**
 * Transforms API kit response to application Kit format
 */
function transformKit(apiKit: KitResponse): Kit {
  return {
    id: apiKit.id,
    binCode: apiKit.binCode || '',
    name: apiKit.name || '',
    description: apiKit.description || '',
    category: inferCategoryFromSKU(apiKit.sku || ''),
    quantity: apiKit.quantity || 0,
    items: (apiKit.items || []).map(transformKitItem),
    status: 'good-condition', // Default status
    createdAt: new Date().toISOString().split('T')[0], // Use current date as API doesn't provide it
  };
}

/**
 * Category for kits
 */
export interface KitCategory {
  id: number;
  name: string;
}

/**
 * Request body for creating a new kit
 */
export interface CreateKitRequest {
  name: string;
  description: string;
  category: number;
  items: {
    itemId: number;
    quantity: number;
  }[];
}

/**
 * Fetches all kit categories from the API
 */
export async function getKitCategories(): Promise<KitCategory[]> {
  try {
    const response = await fetch(`${API_URL}/Kits/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch kit categories: ${response.status} ${response.statusText}`);
    }

    // API returns an array of strings, transform to objects with id and name
    const data: string[] = await response.json();
    return data.map((name, index) => ({
      id: index,
      name: name
    }));
  } catch (error) {
    console.error('Error fetching kit categories:', error);
    throw error;
  }
}

/**
 * Fetches all kits with their items from the API
 */
export async function getKitsWithItems(): Promise<Kit[]> {
  try {
    const response = await fetch(`${API_URL}/Kits/with-items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch kits: ${response.status} ${response.statusText}`);
    }

    const data: KitResponse[] = await response.json();
    return data.map(transformKit);
  } catch (error) {
    console.error('Error fetching kits:', error);
    throw error;
  }
}

/**
 * Creates a new kit
 */
export async function createKit(kitData: CreateKitRequest): Promise<Kit> {
  try {
    const response = await fetch(`${API_URL}/Kits/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kitData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create kit: ${response.status} ${response.statusText}`);
    }

    const data: KitResponse = await response.json();
    return transformKit(data);
  } catch (error) {
    console.error('Error creating kit:', error);
    throw error;
  }
}

/**
 * Request body for creating physical kits
 */
export interface CreatePhysicalKitRequest {
  kitId: number;
  binCode: string;
  quantity: number;
  notes?: string;
}

/**
 * Creates physical kits (builds/assembles kits)
 */
export async function createPhysicalKit(kitData: CreatePhysicalKitRequest): Promise<void> {
  const response = await fetch(`${API_URL}/Kits/create-physical`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(kitData),
  });

  if (!response.ok) {
    // Backend always returns error in format: { "message": "error description" }
    let errorMessage = 'Failed to build kit';

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || 'Failed to build kit';
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(errorMessage);
  }

  // Endpoint might return void or success message
  return;
}

/**
 * API response format for check-item-occupation endpoint
 */
interface CheckItemOccupationResponse {
  isOccupied: boolean;
  message: string;
  occupiedBin: {
    id: number;
    binCode: string;
    description: string;
    binPurpose: number;
    binPurposeDisplay: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  quantity: number;
}
export async function getKitCurrentBin(kitId: number): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/Bins/check-item-occupation?kitId=${kitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch kit bin: ${response.status} ${response.statusText}`);
    }

    const data: CheckItemOccupationResponse = await response.json();
    // Extract the binCode from the occupiedBin object
    return data.occupiedBin.binCode;
  } catch (error) {
    console.error('Error fetching kit current bin:', error);
    throw error;
  }
}

export interface Category {
  value: string;
  label: string;
}

interface ItemResponse {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  isActive: boolean;
  consumible: boolean;
  urlImage: string | null;
  createdAt: string;
  updatedAt: string;
}

function transformItemToArticle(apiItem: ItemResponse): Article2 {
  return {
    id: apiItem.id,
    sku: apiItem.sku,
    name: apiItem.name,
    description: apiItem.description,
    category: apiItem.category,
    type: apiItem.consumible ? 'consumable' : 'non-consumable',
    unit: apiItem.unit,
    minStock: apiItem.minStock,
    imageUrl: apiItem.urlImage || undefined,
    createdAt: apiItem.createdAt,
    // Default values for fields not in API
    currentStock: 0,
    cost: 0,
    binCode: '',
    supplier: '',
    location: '',
    status: 'good-condition',
  };
}
export async function getItems(): Promise<Article2[]> {
  try {
    const response = await fetch(`${API_URL}/Items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
    }

    const data: ItemResponse[] = await response.json();
    return data.map(transformItemToArticle);
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}