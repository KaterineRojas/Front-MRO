import type { Article, InventoryItemResponse, Kit, Bin, BinResponse, Transaction } from '../types';
import type { PurchaseRequest, DamagedRequest, StockCorrectionRequest, WarehouseTransferRequest } from '../modals/RecordMovement/types';
import { CATEGORIES } from '../constants';
import { API_URL } from "../../../../url";

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
 * Mapea el BinPurpose del backend al tipo de la UI
 */
function mapBinType(apiType: BinResponse['binPurposeDisplay']): Bin['type'] {
  switch (apiType) {
    case 'GoodCondition': return 'good-condition';
    case 'OnRevision': return 'on-revision';
    case 'Scrap': return 'scrap';
    case 'Hold': return 'Hold';
    case 'Packing': return 'Packing';
    case 'Reception': return 'Reception';
    case 'NotApplicable':
    default: return 'good-condition';
  }
}

/**
 * Transforma InventoryItemResponse a Article
 */
export function transformInventoryItem(apiItem: InventoryItemResponse): Article {
  return {
    id: apiItem.itemId,
    imageUrl: getFullImageUrl(apiItem.imageUrl),
    sku: apiItem.itemSku,
    name: apiItem.itemName,
    description: apiItem.description || '',
    category: mapCategory(apiItem.category),
    consumable: apiItem.consumable,
    minStock: apiItem.minStock || 0,
    bins: apiItem.bins?.map(bin => ({
      inventoryId: bin.inventoryId,
      binId: bin.binId,
      binCode: bin.binCode,
      binPurpose: bin.binPurpose as 'good-condition' | 'on-revision' | 'scrap' | 'Hold' | 'Packing' | 'Reception',
      quantity: bin.quantity
    })) || [],
    quantityAvailable: apiItem.quantityAvailable ?? 0,
    quantityOnLoan: apiItem.quantityOnLoan ?? 0,
    quantityReserved: apiItem.quantityReserved ?? 0,
    totalPhysical: apiItem.totalPhysical ?? 0,
    unit: 'units',
    cost: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };
}

/**
 * Transforma BinResponse a Bin
 */
function transformBin(apiBin: BinResponse): Bin {
  return {
    id: apiBin.id,
    binCode: apiBin.binCode,
    description: apiBin.description,
    type: mapBinType(apiBin.binPurposeDisplay),
    totalQuantity: apiBin.totalQuantity
  };
}

/**
 * Simula delay de API (para funciones mock)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// ITEMS / ARTICLES API
// ============================================================================

/**
 * Obtiene todos los items con bins
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
 * Obtiene un item por ID
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
    const response = await fetch(`${API_URL}/Items/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_URL}/Items/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_URL}/Inventory/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create purchase: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
}

// ============================================================================
// BINS API
// ============================================================================

/**
 * Mapeo de tipos de bin a binPurpose (número)
 */
const BIN_PURPOSE_MAP: Record<string, number> = {
  'GoodCondition': 0,
  'OnRevision': 1,
  'Scrap': 2,
  'Hold': 3,
  'Packing': 4,
  'Reception': 5,
  'good-condition': 0,
  'on-revision': 1,
  'scrap': 2,
  'hold': 3,
  'packing': 4,
  'reception': 5
};

/**
 * Obtiene todos los bins con cantidad
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
export async function fetchBinsFromApi(): Promise<Bin[]> {
  console.warn('⚠️ fetchBinsFromApi temporalmente desactivado - pendiente migración a nueva lógica');
  return [];
  
  // CÓDIGO ORIGINAL COMENTADO (PENDIENTE MIGRACIÓN)
  // try {
  //   const response = await fetch(`${API_URL}/Bins/with-quantity?isActive=true`, {
  //     method: 'GET',
  //     headers: { 'Content-Type': 'application/json' },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch bins: ${response.status} ${response.statusText}`);
  //   }

  //   const data: BinResponse[] = await response.json();
  //   return data.map(transformBin);
  // } catch (error) {
  //   console.error('Error fetching all bins:', error);
  //   throw error;
  // }
}

/**
 * Obtiene bins disponibles para crear items (GoodCondition)
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
export async function getNewBins(): Promise<Bin[]> {
  console.warn('⚠️ getNewBins temporalmente desactivado - pendiente migración a nueva lógica');
  return [];
  
  // CÓDIGO ORIGINAL COMENTADO (PENDIENTE MIGRACIÓN)
  // try {
  //   const response = await fetch(`${API_URL}/Bins?isActive=true`, {
  //     method: 'GET',
  //     headers: { 'Content-Type': 'application/json' },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch new bins: ${response.status} ${response.statusText}`);
  //   }

  //   const data: BinResponse[] = await response.json();

  //   return data
  //     .filter(bin => bin.binPurposeDisplay === 'GoodCondition')
  //     .map(transformBin);
  // } catch (error) {
  //   console.error('Error fetching new bins:', error);
  //   throw error;
  // }
}

/**
 * Obtiene un bin por ID
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
async function fetchBinByIdApi(_id: number): Promise<Bin> {
  console.warn('⚠️ fetchBinByIdApi temporalmente desactivado - pendiente migración a nueva lógica');
  throw new Error('Function temporarily disabled');
  
  // CÓDIGO ORIGINAL COMENTADO (PENDIENTE MIGRACIÓN)
  // try {
  //   const response = await fetch(`${API_URL}/Bins/${id}`, {
  //     method: 'GET',
  //     headers: { 'Content-Type': 'application/json' },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch bin: ${response.status}`);
  //   }

  //   const bin = await response.json();
  //   return transformBin(bin);
  // } catch (error) {
  //   console.error('Error fetching bin by ID:', error);
  //   throw error;
  // }
}

/**
 * Crea un nuevo bin
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
export async function createBinApi(_binData: {
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
export async function deleteBinApi(_id: number): Promise<void> {
  console.warn('⚠️ deleteBinApi temporalmente desactivado - pendiente migración a nueva lógica');
  throw new Error('Function temporarily disabled');
  
  // CÓDIGO ORIGINAL COMENTADO (PENDIENTE MIGRACIÓN)
  // try {
  //   const response = await fetch(`${API_URL}/Bins/${id}`, {
  //     method: 'DELETE',
  //     headers: { 'Content-Type': 'application/json' },
  //   });

  //   if (!response.ok) {
  //     const errorText = await response.text();
  //     throw new Error(`Failed to delete bin: ${response.status} - ${errorText}`);
  //   }
  // } catch (error) {
  //   console.error('Error deleting bin:', error);
  //   throw error;
  // }
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
    const response = await fetch(`${API_URL}/Inventory/damaged`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(damagedData),
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
    const response = await fetch(`${API_URL}/Inventory/stock-correction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(correctionData),
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
export async function getValidDestinationBins(itemId: number, fromBinId: number): Promise<{
  binId: number;
  binCode: string;
  binPurpose: string;
  description: string;
}[]> {
  try {
    const response = await fetch(`${API_URL}/Inventory/valid-destinations?itemId=${itemId}&fromBinId=${fromBinId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_URL}/Inventory/relocate-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferData),
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