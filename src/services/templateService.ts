// src/services/templateService.ts
import type { TemplateResponse, TemplateItemResponse, Template, KitItem } from '@/components/features/inventory/types/inventory';

const API_URL = 'http://localhost:5044/api';

/**
 * Transforms API response item to application KitItem format
 */
function transformTemplateItem(apiItem: TemplateItemResponse): KitItem {
  return {
    articleId: apiItem.id,
    articleBinCode: apiItem.sku,
    articleName: apiItem.name,
    quantity: apiItem.quantity,
  };
}

/**
 * Transforms API response template to application Template format
 */
function transformTemplate(apiTemplate: TemplateResponse): Template {
  return {
    id: apiTemplate.id,
    name: apiTemplate.templateName,
    description: apiTemplate.description,
    category: 'tools', // Default category since API doesn't provide it
    items: apiTemplate.items.map(transformTemplateItem),
    createdAt: apiTemplate.createdAt,
    isActive: apiTemplate.isActive,
    updatedAt: apiTemplate.updatedAt,
  };
}

/**
 * Fetches all kit templates with their items from the API
 */
export async function getTemplatesWithItems(): Promise<Template[]> {
  try {
    const response = await fetch(`${API_URL}/KitTemplates/with-items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
    }

    const data: TemplateResponse[] = await response.json();
    return data.map(transformTemplate);
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

/**
 * Fetches a single template by ID
 */
export async function getTemplateById(id: number): Promise<Template> {
  try {
    const response = await fetch(`${API_URL}/KitTemplates/${id}/with-items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }

    const data: TemplateResponse = await response.json();
    return transformTemplate(data);
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    throw error;
  }
}
