import type { Article, InventoryItemResponse, Kit, Bin, Transaction } from '../types';
import type { PurchaseRequest, DamagedRequest, StockCorrectionRequest, WarehouseTransferRequest } from '../modals/RecordMovement/types';
import type { WarehouseV2 } from '../types/warehouse-v2';
import { API_URL } from "../../../../url";
import { fetchWithAuth } from '../../../../utils/fetchWithAuth';
import { store } from '../../../../store/store';

// ============================================================================
// TRANSFORMERS & UTILITIES
// ============================================================================

/**
 * Helper para construir URL completa de imagen
 */
const getFullImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  const baseUrl = API_URL.replace('/api', '');
  const separator = imageUrl.startsWith('/') ? '' : '/';
  return `${baseUrl}${separator}${imageUrl}`;
};

/**
 * Mapea la categoría del backend a kebab-case
 */
function mapCategory(apiCategory?: string): Article['category'] {
  if (!apiCategory) return 'other';

  const normalizedCategory = apiCategory
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

  return normalizedCategory as Article['category'];
}

/**
 * Transforma InventoryItemResponse a Article
 */
export function transformInventoryItem(apiItem: InventoryItemResponse): Article {
  const bins = (apiItem.bins ?? []).map(bin => {
    const inferredPurpose = bin.binPurpose ?? bin.binPurposeDisplay ?? (bin.default ? 'GoodCondition' : null);

    return {
      inventoryId: bin.inventoryId,
      binId: bin.binId,
      binCode: bin.binCode,
      quantity: bin.quantity ?? 0,
      binPurpose: inferredPurpose,
      binPurposeDisplay: bin.binPurposeDisplay ?? inferredPurpose,
      isDefault: bin.default ?? false,
    };
  });

  return {
    id: apiItem.itemId,
    imageUrl: getFullImageUrl(apiItem.imageUrl),
    sku: apiItem.itemSku,
    name: apiItem.itemName,
    description: apiItem.description || '',
    category: mapCategory(apiItem.category),
    consumable: Boolean(apiItem.consumable),
    minStock: apiItem.minStock ?? 0,
    status: apiItem.isActive ?? true,
    bins,
    quantityAvailable: apiItem.quantityAvailable ?? 0,
    quantityOnLoan: apiItem.quantityOnLoan ?? 0,
    quantityReserved: apiItem.quantityReserved ?? 0,
    totalPhysical: apiItem.totalPhysical ?? 0,
    currentStock: apiItem.totalPhysical ?? 0,
    unit: apiItem.unit?.trim() || 'units',
    cost: apiItem.cost ?? 0,
    createdAt: apiItem.createdAt ?? new Date().toISOString().split('T')[0]
  };
}

/**
 * Simula delay de API (para funciones mock)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const resolveWarehouseId = (override?: number | string | null): number | undefined => {
  const state = store.getState();
  const fallback = state.auth.user?.warehouseId ?? state.auth.user?.warehouse ?? null;
  const value = override ?? fallback;

  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
  return Number.isNaN(parsed) ? undefined : parsed;
};

// ============================================================================
// ITEMS / ARTICLES API
// ============================================================================

/**
 * Obtiene todos los items con bins
 */
export async function fetchArticlesFromApi({
  isActive = true,
  warehouseId,
}: {
  isActive?: boolean;
  warehouseId?: number | string;
} = {}): Promise<Article[]> {
  try {
    const state = store.getState();
    const token = state.auth.accessToken as string;
    const userWarehouseId = state.auth.user?.warehouseId ?? state.auth.user?.warehouse;

    const searchParams = new URLSearchParams();
    searchParams.append('isActive', String(isActive));

    const resolvedWarehouseId = warehouseId ?? userWarehouseId;
    if (resolvedWarehouseId !== undefined && resolvedWarehouseId !== null) {
      searchParams.append('warehouseId', String(resolvedWarehouseId));
    }

    const url = `${API_URL}/inventory/items-with-bins${searchParams.size ? `?${searchParams.toString()}` : ''}`;
    console.log('[fetchArticlesFromApi] GET', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
    }

    const data: InventoryItemResponse[] = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array');
    }
    console.log(`📦 Fetched ${data.length} items from API`,  data.map(transformInventoryItem)) ;
    return data.map(transformInventoryItem);
  } catch (error) {
    console.error('Error fetching all items with bins:', error);
    throw error;
  }
}

/**
 * Obtiene un item por ID
 */
export async function fetchArticleByIdApi(id: number): Promise<Article> {
  try {
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Items/${id}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
 * Crea un nuevo item con imagen
 */
export async function createArticleApi(articleData: {
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  consumable: boolean;
  binCode: string;
  imageFile?: File | null;
}): Promise<Article> {
  try {
    const token = store.getState().auth.accessToken as string;
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
      headers: {
        'Authorization': `Bearer ${token}`
      },
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
 * Actualiza un item existente (sin imagen)
 */
export async function updateArticleApi(id: number, articleData: {
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  consumable: boolean;
  imageUrl?: string | null;
}): Promise<Article> {
  try {
    const token = store.getState().auth.accessToken as string;
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
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update item: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    const hasContent = contentType?.includes('application/json');

    if (!hasContent || response.status === 204) {
      return await fetchArticleByIdApi(id);
    }

    const updatedItem = await response.json();
    return transformInventoryItem(updatedItem);
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}

/**
 * Actualiza un item con imagen
 */
export async function updateArticleWithImageApi(id: number, articleData: {
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  consumable: boolean;
  imageFile?: File | null;
  imageUrl?: string | null;
}): Promise<Article> {
  try {
    const token = store.getState().auth.accessToken as string;
    const formData = new FormData();
    formData.append('sku', articleData.sku);
    formData.append('name', articleData.name);
    formData.append('description', articleData.description);
    formData.append('category', articleData.category);
    formData.append('unit', articleData.unit);
    formData.append('minStock', articleData.minStock.toString());
    formData.append('isActive', 'true');
    formData.append('consumable', articleData.consumable.toString());

    if (articleData.imageFile) {
      formData.append('file', articleData.imageFile);
    } else if (articleData.imageUrl) {
      formData.append('urlImage', articleData.imageUrl);
    }

    const response = await fetch(`${API_URL}/Items/${id}/update-with-image`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update item: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    const hasContent = contentType?.includes('application/json');

    if (!hasContent || response.status === 204) {
      return await fetchArticleByIdApi(id);
    }

    const updatedItem = await response.json();
    return transformInventoryItem(updatedItem);
  } catch (error) {
    console.error('Error updating article with image:', error);
    throw error;
  }
}

/**
 * Elimina un item
 */
export async function deleteArticleApi(id: number): Promise<void> {
  try {
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Items/${id}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete item: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
}

/** 
 * Obtiene categorías disponibles
 */
export async function getCategories(): Promise<{ value: string; label: string }[]> {
  try {
    const token = store.getState().auth.accessToken as string;
    const response = await fetch(`${API_URL}/Items/categories`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data: string[] = await response.json();

    return data.map((category: string) => ({
      value: category.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      label: category.replace(/([a-z])([A-Z])/g, '$1 $2')
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [
      { value: 'other', label: 'Other' },
      { value: 'tools', label: 'Tools' },
    ];
  }
}

/**
 * Crea una compra de inventario
 */
export async function createPurchaseApi(purchaseData: PurchaseRequest): Promise<void> {
  try {
    const resolvedWarehouseId = resolveWarehouseId(purchaseData.warehouseId ?? null);
    const payload: PurchaseRequest = {
      ...purchaseData,
      ...(resolvedWarehouseId !== undefined ? { warehouseId: resolvedWarehouseId } : {}),
    };

    const response = await fetchWithAuth(`${API_URL}/inventory/purchase`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log('✅ Purchase created successfully', response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create purchase: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
}



/**
 * Obtiene bins disponibles para crear items (GoodCondition)
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
export async function getNewBins(): Promise<Bin[]> {
  console.warn('⚠️ getNewBins temporalmente desactivado - pendiente migración a nueva lógica');
  return [];
}

/**
 * Obtiene todos los bins desde el API
 * @deprecated Usar fetchWarehousesFromApi() en su lugar para obtener la estructura completa
 */
export async function fetchBinsFromApi({
  warehouseId,
  isActive = true,
}: {
  warehouseId?: number | string;
  isActive?: boolean;
} = {}): Promise<Bin[]> {
  try {
    const resolvedWarehouseId = resolveWarehouseId(warehouseId);

    const params = new URLSearchParams();
    if (resolvedWarehouseId !== undefined) {
      params.append('warehouseId', String(resolvedWarehouseId));
    }
    params.append('isActive', String(isActive));

    const url = `${API_URL}/bins/with-quantity${params.size ? `?${params.toString()}` : ''}`;

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });
    console.log('[fetchBinsFromApiforWH] GET', url);//*************** */
    if (!response.ok) {
      throw new Error(`Failed to fetch bins: ${response.status} ${response.statusText}`);
    }

    interface ApiBinFlat {
      id: number;
      code: string;
      name: string;
      fullCode: string;
      allowDifferentItems: boolean;
    }

    const data: ApiBinFlat[] = await response.json();
    
    return data.map(bin => ({
      id: bin.id,
      binCode: bin.code,
      description: bin.name,
      type: null,
      totalQuantity: 0
    }));
  } catch (error) {
    console.error('Error fetching bins:', error);
    throw error;
  }
}

/**
 * Obtiene la estructura completa de warehouses con zones, racks, levels y bins
 * Filtrada por el warehouse del usuario autenticado
 */
export async function fetchWarehousesFromApi(): Promise<WarehouseV2[]> {
  try {
    const warehouseId = resolveWarehouseId();
    
    if (warehouseId === undefined) {
      console.warn('⚠️ fetchWarehousesFromApi: warehouseId is not available; returning empty list');
      return [];
    }

    const url = `${API_URL}/bins/with-quantity?warehouseId=${warehouseId}`;
    console.log('🔄 Fetching warehouses from API:', url);
    
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch warehouses: ${response.status} ${response.statusText}`);
    }

    interface ApiWarehouse {
      id: number;
      code: string;
      name: string;
      zones: Array<{
        id: number;
        code: string;
        name: string;
        racks: Array<{
          id: number;
          code: string;
          name: string;
          levels: Array<{
            id: number;
            code: string;
            name: string;
            bins: Array<{
              id: number;
              code: string;
              name: string;
              quantity: number;
              allowDifferentItems: boolean;
              createdAt: string;
              itemName: string | null;
            }>;
          }>;
        }>;
      }>;
    }

    const apiWarehouses: ApiWarehouse[] = await response.json();
    
    console.log('📊 Warehouses recibidos:', {
      total: apiWarehouses.length,
      firstWarehouse: apiWarehouses[0]?.code,
      sampleBin: apiWarehouses[0]?.zones[0]?.racks[0]?.levels[0]?.bins[0]
    });
   
    // Transformar a WarehouseV2 (convertir IDs a strings)
    console.log('🔄 Iniciando transformación...');
    const warehouses: WarehouseV2[] = apiWarehouses.map(warehouse => ({
      id: warehouse.id.toString(),
      code: warehouse.code,
      name: warehouse.name,
      zones: warehouse.zones.map(zone => ({
        id: zone.id.toString(),
        code: zone.code,
        name: zone.name,
        racks: zone.racks.map(rack => ({
          id: rack.id.toString(),
          code: rack.code,
          name: rack.name,
          levels: rack.levels.map(level => ({
            id: level.id.toString(),
            code: level.code,
            name: level.name,
            bins: level.bins.map(bin => ({
              id: bin.id.toString(),
              code: bin.code,
              name: bin.name,
              allowDifferentItems: bin.allowDifferentItems,
              itemName: bin.itemName,
              quantity: bin.quantity,
              createdAt: new Date(bin.createdAt)
            }))
          }))
        }))
      }))
    }));
    
    console.log('✅ Warehouses transformados:', warehouses.length);
    return warehouses;
  } catch (error) {
    console.error('❌ Error fetching warehouses:', error);
    throw error;
  }
}

/**
 * Crea una nueva zona
 */
export async function createZoneApi(data: {
  warehouseId: number;
  code: string;
  name: string;
}) {
  try {
    const response = await fetchWithAuth(`${API_URL}/Zones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create zone: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Si no es JSON, intentar leer como texto
        const errorText = await response.text().catch(() => '');
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Crea un nuevo rack
 */
export async function createRackApi(data: {
  zoneId: number;
  code: string;
  name: string;
}) {
  try {
    const response = await fetchWithAuth(`${API_URL}/Racks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create rack: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Si no es JSON, intentar leer como texto
        const errorText = await response.text().catch(() => '');
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Crea un nuevo nivel
 */
export async function createLevelApi(data: {
  rackId: number;
  code: string;
  name: string;
}) {
  try {
    const response = await fetchWithAuth(`${API_URL}/Levels`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create level: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Si no es JSON, intentar leer como texto
        const errorText = await response.text().catch(() => '');
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Crea un nuevo bin
 */
export async function createBinApi(data: {
  levelId: number;
  code: string;
  name: string;
  allowDifferentItems: boolean;
}) {
  try {
    const response = await fetchWithAuth(`${API_URL}/bins`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create bin: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Si no es JSON, intentar leer como texto
        const errorText = await response.text().catch(() => '');
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Crea un nuevo bin usando códigos jerárquicos individuales
 */
export async function createBinByHierarchyApi(data: {
  warehouseCode: string;
  zoneCode: string;
  rackCode: string;
  levelCode: string;
  binCode: string;
  name: string;
}) {
  try {
    const response = await fetchWithAuth(`${API_URL}/bins/create-by-hierarchy`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = '';

      try {
        const errorData = await response.json();

        // Extraer el mensaje de error del backend
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.title) {
          // Formato de error de validación de ASP.NET
          errorMessage = errorData.title;
          if (errorData.errors) {
            // Agregar detalles de errores de validación
            const validationErrors = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
              .join('; ');
            errorMessage += ` - ${validationErrors}`;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch {
        // Si no es JSON, intentar leer como texto
        try {
          const errorText = await response.text();
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }

      // Si no se pudo extraer ningún mensaje, usar uno genérico
      if (!errorMessage) {
        errorMessage = `Failed to create bin (HTTP ${response.status})`;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // Re-lanzar el error si ya tiene mensaje, o crear uno nuevo
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create bin: Network error');
  }
}

/**
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
export async function createBinApiOld(_binData: {
  binCode: string;
  type: string;
  description: string;
}): Promise<Bin> {
  console.warn('⚠️ createBinApi temporalmente desactivado - pendiente migración a nueva lógica');
  throw new Error('Function temporarily disabled');
  
  // CÓDIGO ORIGINAL COMENTADO (PENDIENTE MIGRACIÓN)
  // try {
  //   const normalizedType = binData.type.toLowerCase();
  //   const binPurpose = BIN_PURPOSE_MAP[normalizedType] ?? BIN_PURPOSE_MAP[binData.type] ?? 0;

  //   const payload = {
  //     binCode: binData.binCode,
  //     description: binData.description || '',
  //     binPurpose: binPurpose
  //   };

  //   console.log('CREATE BIN PAYLOAD:', payload);

  //   const response = await fetch(`${API_URL}/Bins`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload),
  //   });

  //   if (!response.ok) {
  //     const errorText = await response.text();
  //     throw new Error(`Failed to create bin: ${response.status} - ${errorText}`);
  //   }

  //   const createdBin = await response.json();
  //   return transformBin(createdBin);
  // } catch (error) {
  //   console.error('Error creating bin:', error);
  //   throw error;
  // }
}

/**
 * Actualiza un bin existente
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
export async function updateBinApi(_id: number, _binData: {
  binCode: string;
  type: string;
  description: string;
}): Promise<Bin> {
  console.warn('⚠️ updateBinApi temporalmente desactivado - pendiente migración a nueva lógica');
  throw new Error('Function temporarily disabled');
  
  // CÓDIGO ORIGINAL COMENTADO (PENDIENTE MIGRACIÓN)
  // try {
  //   const binPurpose = BIN_PURPOSE_MAP[binData.type] ?? 0;

  //   const payload = {
  //     binCode: binData.binCode,
  //     description: binData.description || '',
  //     binPurpose: binPurpose
  //   };

  //   console.log('UPDATE BIN PAYLOAD:', payload);

  //   const response = await fetch(`${API_URL}/Bins/${id}`, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload),
  //   });

  //   if (!response.ok) {
  //     const errorText = await response.text();
  //     throw new Error(`Failed to update bin: ${response.status} - ${errorText}`);
  //   }

  //   const contentType = response.headers.get('content-type');
  //   const hasContent = contentType?.includes('application/json');

  //   if (!hasContent || response.status === 204) {
  //     return await fetchBinByIdApi(id);
  //   }

  //   const updatedBin = await response.json();
  //   return transformBin(updatedBin);
  // } catch (error) {
  //   console.error('Error updating bin:', error);
  //   throw error;
  // }
}

/**
 * Elimina un bin
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
export async function deleteBinApi(id: number | string): Promise<void> {
  console.log('deleteBinApi invoked with id:', id);

  const resolvedId = typeof id === 'string' ? parseInt(id, 10) : id;

  if (Number.isNaN(resolvedId)) {
    throw new Error('Invalid bin identifier');
  }

  try {
    const response = await fetchWithAuth(`${API_URL}/bins/${resolvedId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to delete bin: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting bin:', error);
    throw error;
  }
}

/**
 * Obtiene tipos de bins disponibles
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
export async function getBinTypes(): Promise<{ value: string; label: string }[]> {
  console.warn('⚠️ getBinTypes temporalmente desactivado - pendiente migración a nueva lógica');
  return [];
  
  // CÓDIGO ORIGINAL COMENTADO (PENDIENTE MIGRACIÓN)
  // try {
  //   const response = await fetch(`${API_URL}/Bins/types`, {
  //     method: 'GET',
  //     headers: { 'Content-Type': 'application/json' },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch bin types: ${response.status}`);
  //   }

  //   const data: string[] = await response.json();

  //   return data.map(binType => ({
  //     value: binType,
  //     label: binType,
  //   }));
  // } catch (error) {
  //   console.error('Error fetching bin types:', error);
  //   throw error;
  // }
}

// ============================================================================
// KITS API (SIMULATED - TO BE IMPLEMENTED)
// ============================================================================

/**
 * Crea un kit (simulado)
 */
export async function createKitApi(kitData: Omit<Kit, 'id' | 'createdAt'>): Promise<Kit> {
  await delay(500);

  const newKit: Kit = {
    id: Date.now(),
    ...kitData,
    createdAt: new Date().toISOString().split('T')[0]
  };

  console.log('API: Kit created successfully', newKit);
  return newKit;
}

/**
 * Actualiza un kit (simulado)
 */
export async function updateKitApi(id: number, data: Partial<Kit>): Promise<Kit> {
  await delay(500);
  console.log('API: Kit updated successfully', { id, data });
  return { id, ...data } as Kit;
}

// ============================================================================
// TRANSACTIONS API (SIMULATED - TO BE IMPLEMENTED)
// ============================================================================

/**
 * Obtiene transacciones (simulado)
 */
export async function fetchTransactionsFromApi(): Promise<Transaction[]> {
  await delay(500);
  return [];
}

/**
 * Registra un movimiento (simulado)
 */
export async function recordMovementApi(movementData: any): Promise<{ transaction: Transaction; updatedArticle?: Article }> {
  await delay(500);

  const transaction: Transaction = {
    id: Date.now(),
    type: movementData.movementType,
    subtype: movementData.movementType === 'entry' ? 'purchase' :
      movementData.movementType === 'exit' ? 'consumption' : 'relocation',
    articleCode: movementData.articleSKU || movementData.kitBinCode || 'UNKNOWN',
    articleDescription: movementData.articleName || 'Movement',
    quantity: parseInt(movementData.quantity || '1'),
    unit: movementData.unit || 'units',
    reference: `REF-${Date.now()}`,
    notes: movementData.notes || '',
    user: 'Current User',
    project: 'Inventory Management',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  console.log('API: Movement recorded successfully', { movementData, transaction });
  return { transaction };
} 
/**
 * Creates a damaged transaction for inventory items
 * POST /api/Inventory/damaged
 */
export async function createDamagedApi(damagedData: DamagedRequest): Promise<void> {
  try {
    const resolvedWarehouseId = resolveWarehouseId(damagedData.warehouseId ?? null);
    const payload: DamagedRequest = {
      ...damagedData,
      ...(resolvedWarehouseId !== undefined ? { warehouseId: resolvedWarehouseId } : {}),
    };

    const response = await fetchWithAuth(`${API_URL}/inventory/damaged`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create damaged transaction: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Damaged transaction created successfully');
  } catch (error) {
    // Re-throw the error without logging to avoid duplicate console messages
    throw error;
  }
}

/**
 * Creates a stock correction transaction for inventory items
 * POST /api/Inventory/stock-correction
 */
export async function createStockCorrectionApi(correctionData: StockCorrectionRequest): Promise<void> {
  try {
    const resolvedWarehouseId = resolveWarehouseId(correctionData.warehouseId ?? null);
    const payload: StockCorrectionRequest = {
      ...correctionData,
      ...(resolvedWarehouseId !== undefined ? { warehouseId: resolvedWarehouseId } : {}),
    };

    const response = await fetchWithAuth(`${API_URL}/inventory/stock-correction`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create stock correction: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Stock correction created successfully');
  } catch (error) {
    // Re-throw the error without logging to avoid duplicate console messages
    throw error;
  }
}

/**
 * Gets valid destination bins for relocating an item
 * GET /api/Inventory/valid-destinations?itemId=1&fromBinId=1
 */
export async function getValidDestinationBins(
  itemId: number,
  fromBinId: number,
  warehouseId?: number | string
): Promise<{
  binId: number;
  binCode: string;
  description: string;
}[]> {
  try {
    const resolvedWarehouseId = resolveWarehouseId(warehouseId);

    const params = new URLSearchParams({
      itemId: String(itemId),
      fromBinId: String(fromBinId),
    });

    if (resolvedWarehouseId !== undefined) {
      params.append('warehouseId', String(resolvedWarehouseId));
    }

    const url = `${API_URL}/inventory/valid-destinations?${params.toString()}`;
    console.log('[getValidDestinationBins] GET', url);
    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch valid destinations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('⚠️ Could not fetch valid destination bins:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Creates a warehouse transfer transaction for inventory items
 * POST /api/Inventory/relocate-item
 */
export async function createWarehouseTransferApi(transferData: WarehouseTransferRequest): Promise<void> {
  try {
    const resolvedWarehouseId = resolveWarehouseId(transferData.warehouseId ?? null);
    const payload: WarehouseTransferRequest = {
      ...transferData,
      ...(resolvedWarehouseId !== undefined ? { warehouseId: resolvedWarehouseId } : {}),
    };

    const response = await fetchWithAuth(`${API_URL}/inventory/relocate-item`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create warehouse transfer: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Warehouse transfer created successfully');
  } catch (error) {
    // Re-throw the error without logging to avoid duplicate console messages
    throw error;
  }
}