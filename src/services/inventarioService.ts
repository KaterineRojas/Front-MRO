// src/services/inventarioService.ts
import type { Article, ItemType } from '../components/features/inventory/types/inventory';

const API_URL = 'http://localhost:5044/api';

/**
 * API response format for items
 */
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

/**
 * Transforms API item response to application Article format
 */
function transformItemToArticle(apiItem: ItemResponse): Article {
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

/**
 * Fetches all items from the API
 */
export async function getItems(): Promise<Article[]> {
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
