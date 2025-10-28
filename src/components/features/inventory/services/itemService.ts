import type { Article, InventoryItemResponse, Bin } from '../types';
import { API_URL, mapCategory } from './inventoryService'; // Importar utilidades compartidas

// Mapeo específico de la respuesta de Bin en el Article, usando el mapa global
function mapBinPurpose(purpose: string): Bin['binPurpose'] {
    const purposeMap: Record<string, Bin['binPurpose']> = {
        'GoodCondition': 'good-condition',
        'OnRevision': 'on-revision',
        'Scrap': 'scrap',
        'Hold': 'Hold',
        'Packing': 'Packing',
        'Reception': 'Reception',
        'NotApplicable': 'good-condition'
    };
    return purposeMap[purpose] || 'good-condition';
}


/**
 * Transforma la respuesta de la API (InventoryItemResponse) a nuestro modelo de aplicación (Article).
 */
export function transformInventoryItem(apiItem: InventoryItemResponse): Article {
    return {
        id: apiItem.itemId,
        imageUrl: apiItem.imageUrl || null,
        sku: apiItem.itemSku,
        name: apiItem.itemName,
        description: apiItem.description || '',
        category: mapCategory(apiItem.category),
        consumable: apiItem.consumable,
        minStock: apiItem.minStock || 0,

        // Mapear array de bins
        bins: apiItem.bins?.map(bin => ({
            binId: bin.binId,
            binCode: bin.binCode,
            binPurpose: mapBinPurpose(bin.binPurpose),
            quantity: bin.quantity
        })) || [],

        // Usar datos calculados del API
        quantityAvailable: apiItem.quantityAvailable ?? 0,
        quantityOnLoan: apiItem.quantityOnLoan ?? 0,
        quantityReserved: apiItem.quantityReserved ?? 0,
        totalPhysical: apiItem.totalPhysical ?? 0,

        // Valores por defecto
        unit: apiItem.unit || 'units',
        cost: apiItem.cost || 0,
        createdAt: new Date().toISOString().split('T')[0] // Debería venir de la API
    };
}

/**
 * Obtiene todos los artículos de inventario activos con sus bins.
 */
export async function fetchArticlesFromApi(): Promise<Article[]> {
    try {
        const response = await fetch(`${API_URL}/Inventory/items-with-bins?isActive=true`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
        }

        const data: InventoryItemResponse[] = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Invalid response format: expected an array');
        }

        return data.map(transformInventoryItem);
    } catch (error) {
        console.error('Error fetching all items with bins:', error);
        throw error;
    }
}

/**
 * Obtiene un único artículo por ID.
 */
export async function fetchArticleByIdApi(id: number): Promise<Article> {
    try {
        const response = await fetch(`${API_URL}/Items/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch item: ${response.status} ${response.statusText}`);
        }

        const data: InventoryItemResponse = await response.json();
        return transformInventoryItem(data);
    } catch (error) {
        console.error(`Error fetching article ${id}:`, error);
        throw error;
    }
}

/**
 * Crea un nuevo artículo/item con soporte para imagen usando multipart/form-data.
 */
export async function createArticleApi(
    articleData: {
        name: string;
        description: string;
        category: string;
        unit: string;
        minStock: number;
        consumable: boolean;
        binCode: string;
        imageFile?: File | null;
    }
): Promise<Article> {
    try {
        const formData = new FormData();

        formData.append('name', articleData.name);
        formData.append('description', articleData.description);
        formData.append('category', articleData.category);
        formData.append('unit', articleData.unit);
        formData.append('minStock', articleData.minStock.toString());
        formData.append('isActive', 'true');
        formData.append('consumable', articleData.consumable.toString());
        formData.append('binCode', articleData.binCode);

        if (articleData.imageFile) {
            formData.append('file', articleData.imageFile);
        }

        const response = await fetch(`${API_URL}/Items/with-image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create item: ${response.status} - ${errorText}`);
        }

        const createdItem = await response.json();
        return transformInventoryItem(createdItem);
    } catch (error) {
        console.error('Error creating article:', error);
        throw error;
    }
}

/**
 * Actualiza un artículo/item vía PUT request.
 */
export async function updateArticleApi(
    id: number,
    articleData: {
        sku: string;
        name: string;
        description: string;
        category: string;
        unit: string;
        minStock: number;
        consumable: boolean;
        imageUrl?: string | null;
    }
): Promise<Article> {
    try {
        const payload = {
            sku: articleData.sku,
            name: articleData.name,
            description: articleData.description,
            category: articleData.category,
            unit: articleData.unit,
            minStock: articleData.minStock,
            isActive: true,
            consumible: articleData.consumable,
            urlImage: articleData.imageUrl || ''
        };

        const response = await fetch(`${API_URL}/Items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update item: ${response.status} - ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        const hasContent = contentType?.includes('application/json');

        if (!hasContent || response.status === 204) {
            // Backend devolvió vacío - hacer GET del item actualizado
            console.log('API: Update successful (no content), fetching updated item...');
            return await fetchArticleByIdApi(id);
        }

        // Si devuelve JSON, parsearlo y transformarlo
        const updatedItem = await response.json();
        return transformInventoryItem(updatedItem);

    } catch (error) {
        console.error('Error updating article:', error);
        throw error;
    }
}

/**
 * Elimina un artículo/item de la API.
 */
export async function deleteArticleApi(id: number): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/Items/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete item: ${response.status} - ${errorText}`);
        }

        console.log('API: Article deleted successfully', { id });
    } catch (error) {
        console.error('Error deleting article:', error);
        throw error;
    }
}
