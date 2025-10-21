// src/services/kitsService.ts

const API_URL = 'http://localhost:5044/api';

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
 * API response format for kits
 */
interface KitResponse {
  id: number;
  kitCode: string;
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
    binCode: apiKit.binCode,
    name: apiKit.name,
    description: apiKit.description,
    category: 'tools', // Default category since API doesn't provide it
    quantity: apiKit.quantity,
    items: apiKit.items.map(transformKitItem),
    status: 'good-condition', // Default status
    createdAt: new Date().toISOString().split('T')[0],
  };
}

/**
 * Request body for creating a new kit
 */
export interface CreateKitRequest {
  binCode: string;
  name: string;
  description: string;
  items: {
    itemId: number;
    quantity: number;
  }[];
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
    const response = await fetch(`${API_URL}/Kits`, {
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
