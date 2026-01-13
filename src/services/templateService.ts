// src/services/templateService.ts
import { API_URL } from '../url';
import type {
  TemplateResponse,
  TemplateItemResponse,
  Template,
  KitItem,
  CreateTemplateRequest,
  UpdateTemplateRequest
} from '@/components/features/inventory/types/inventory';

/**
 * Transforms API response item to application KitItem format
 */
function transformTemplateItem(apiItem: TemplateItemResponse): KitItem {
  return {
    articleId: apiItem.id,
    articleSku: apiItem.sku,
    articleName: apiItem.name,
    imageUrl: apiItem.imageUrl,
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
    const response = await fetch(`${API_URL}/KitTemplates/with-items?isActive=true`, {
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

/**
 * Creates a new kit template
 */
export async function createTemplate(templateData: CreateTemplateRequest): Promise<Template> {
  try {
    const response = await fetch(`${API_URL}/KitTemplates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create template: ${response.status} ${response.statusText}`);
    }

    const data: TemplateResponse = await response.json();
    return transformTemplate(data);
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

/**
 * Updates an existing kit template
 */
export async function updateTemplate(id: number, templateData: UpdateTemplateRequest): Promise<Template> {
  try {
    const response = await fetch(`${API_URL}/KitTemplates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update template: ${response.status} ${response.statusText}`);
    }

    const data: TemplateResponse = await response.json();
    return transformTemplate(data);
  } catch (error) {
    console.error(`Error updating template ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a kit template by ID
 */
export async function deleteTemplate(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/KitTemplates/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete template: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error deleting template ${id}:`, error);
    throw error;
  }
}
