// src/services/kitsService.ts
//KITS DUDA ORIGINAL
import { Article2 } from "../types";
import { API_URL } from "../../../../url";
import { store } from "../../../../store/store";
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
  quantityAvailable: number; 
  quantityLoan: number; 
  quantityReserved: number; 
  items: KitItemResponse[];
}

/**
 * Application Kit type
 */
export interface Kit {
  id: number;
  sku: string;
  binCode: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
    quantityAvailable: number; 
  quantityLoan: number; 
  quantityReserved: number; 
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
    sku: apiKit.sku || '',
    binCode: apiKit.binCode || '',
    binId: apiKit.binId || 0,
    name: apiKit.name || '',
    description: apiKit.description || '',
    category: inferCategoryFromSKU(apiKit.sku || ''),
    quantity: apiKit.quantity || 0,
    quantityAvailable: apiKit.quantityAvailable || 0, 
    quantityLoan: apiKit.quantityLoan || 0, 
    quantityReserved: apiKit.quantityReserved || 0, 
    items: (apiKit.items || []).map(transformKitItem),
    status: 'good-condition',
    createdAt: new Date().toISOString().split('T')[0],
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
 * Parameters for retrieving the default bin for a kit
 * Mapped from query parameters in GET /api/Kits/default-bin
 */
export interface KitDefaultBinParams {
  kitId: number;
  warehouseId: number;
}

/**
 * API response format for Kit Default Bin endpoint
 * Matches strictly the JSON schema from Swagger
 */
export interface KitDefaultBinResponse {
  id: number;
  kitId: number;
  kitSku: string;
  kitName: string;
  binId: number;
  binCode: string;
  quantity: number;
  quantityOnLoan: number;     
  quantityReserved: number;
  default: boolean;           
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetches all kit categories from the API
 */
export async function getKitCategories(): Promise<KitCategory[]> {
  try {
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Kits/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Kits/with-items?isActive=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Kits/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
  binId: number; 
  quantity: number;
  notes?: string;
}

/**
 * Creates physical kits (builds/assembles kits)
 */
export async function createPhysicalKit(kitData: CreatePhysicalKitRequest): Promise<void> {
  console.log(kitData);
  
  const token = store.getState().auth.accessToken as string;
  const response = await fetch(`${API_URL}/Kits/create-physical`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Bins/check-item-occupation?kitId=${kitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

/**
 * Deletes a kit by ID

 */
export async function deleteKit(kitId: number): Promise<void> {
  try {
    console.log('🗑️ Deleting kit with ID:', kitId);
    
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Kits/${kitId}/deactivate`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete kit: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Kit deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting kit:', error);
    throw error;
  }
}



/**
 * Request payload for dismantling a kit
 */
export interface DismantleKitRequest {
  quantity: number;
  notes?: string;
}

/**
 * Dismantles (disassembles) a kit
 */
export async function dismantleKit(kitId: number, data: DismantleKitRequest): Promise<void> {
  try {
    console.log(' Dismantling kit:', { kitId, ...data });
    
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Kits/${kitId}/dismantle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantity: data.quantity,
        notes: data.notes || '',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to dismantle kit: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Kit dismantled successfully');
  } catch (error) {
    console.error('❌ Error dismantling kit:', error);
    throw error;
  }
}



/**
 * Fetches the default bin information for a specific kit and warehouse.
 * Endpoint: GET /api/Kits/default-bin
 */
/**
 * Obtiene el Bin por defecto. 
 * Retorna el objeto si existe.
 * Retorna NULL si recibe un 404 (Sin asignación).
 * Lanza error para otros códigos (500, 401, etc).
 */
export const getKitDefaultBin = async (
  params: KitDefaultBinParams,
  signal?: AbortSignal
): Promise<KitDefaultBinResponse | null> => {
  
  if (!params.kitId || !params.warehouseId) {
    throw new Error('Parámetros insuficientes: kitId y warehouseId son requeridos');
  }

  const queryParams = new URLSearchParams({
    kitId: params.kitId.toString(),
    warehouseId: params.warehouseId.toString(),
  });

  try {
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Kits/default-bin?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal,
    });

    if (response.ok) {
      return await response.json();
    }

    if (response.status === 404) {
      return null; 
    }

    const errorBody = await response.text();
    throw new Error(`Error del servidor (${response.status}): ${errorBody}`);

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.error('Error fetching default bin:', error);
    throw error;
  }
};