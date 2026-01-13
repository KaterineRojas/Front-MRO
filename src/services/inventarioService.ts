// src/services/inventarioService.ts
import type { Article, ItemType } from '../components/features/inventory/types/inventory';
import { API_URL } from '../url';

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

/**
 * Category format from API
 */
export interface Category {
  value: string;
  label: string;
}

/**
 * Fetches all categories from the API
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_URL}/Items/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }

    const data: string[] = await response.json();
    // Transform string array to Category format
    return data.map((category) => ({
      value: category.toLowerCase().replace(/\s+/g, '-'),
      label: category,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}
