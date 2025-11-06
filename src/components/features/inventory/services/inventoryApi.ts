import type { Article, InventoryItemResponse, Kit, Bin, BinResponse, Transaction } from '../types';
import type { PurchaseRequest, DamagedRequest, StockCorrectionRequest, WarehouseTransferRequest } from '../modals/RecordMovement/types';
import { CATEGORIES } from '../constants';
import { strict } from 'assert';
import { API_URL } from "../../../../url";
//const API_URL = 'http://localhost:5000/api';



export function transformInventoryItem(apiItem: InventoryItemResponse): Article {
  // Helper para construir URL completa de imagen
  const getFullImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return '';

    // Si ya es una URL completa (http/https), retornarla tal cual
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      //console.log('📷 Image URL from API:', imageUrl);
      return imageUrl;
    }

    // Si es una ruta relativa, construir URL completa
    // Remover '/api' del API_URL y agregar la ruta de la imagen
    const baseUrl = API_URL.replace('/api', '');

    // Si la imageUrl empieza con '/', no agregar otro '/'
    const separator = imageUrl.startsWith('/') ? '' : '/';

    return `${baseUrl}${separator}${imageUrl}`;
  };

  return {
    id: apiItem.itemId,
    imageUrl: getFullImageUrl(apiItem.imageUrl),
    sku: apiItem.itemSku,
    name: apiItem.itemName,
    description: apiItem.description || '',
    category: mapCategory(apiItem.category),
    consumable: apiItem.consumable,
    minStock: apiItem.minStock || 0,

    // NUEVO: Mapear array de bins
    bins: apiItem.bins?.map(bin => ({
      inventoryId: bin.inventoryId,
      binId: bin.binId,
      binCode: bin.binCode,
      binPurpose: bin.binPurpose as 'good-condition' | 'on-revision' | 'scrap' | 'Hold' | 'Packing' | 'Reception',
      quantity: bin.quantity
    })) || [],

    // NUEVO: Usar datos calculados del API
    quantityAvailable: apiItem.quantityAvailable ?? 0,
    quantityOnLoan: apiItem.quantityOnLoan ?? 0,
    quantityReserved: apiItem.quantityReserved ?? 0,
    totalPhysical: apiItem.totalPhysical ?? 0,

    unit: 'units',
    cost: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };
}

// Función helper para mapear el status del bin
function getBinPurposeDisplay(purpose: string): string {
  switch (purpose) {
    case 'GoodCondition':
      return 'Good Condition';
    case 'OnRevision':
      return 'On Revision';
    case 'Scrap':
      return 'Scrap';
    case 'Hold':
      return 'Hold';
    case 'Packing':
      return 'Packing';
    case 'Reception':
      return 'Reception';

    default:
      return 'Good Condition';

  }
}

function mapBinType(apiType: BinResponse['binPurposeDisplay']): Bin['type'] {
  switch (apiType) {
    case 'GoodCondition':
      return 'good-condition';
    case 'OnRevision':
      return 'on-revision';
    case 'Scrap':
      return 'scrap';
    case 'Hold':
      return 'Hold';
    case 'Packing':
      return 'Packing';
    case 'Reception':
      return 'Reception';
    case 'NotApplicable':
    default:
      return 'good-condition';
  }
}


function mapCategory(apiCategory?: string): Article['category'] {
  if (!apiCategory) {
    //console.log(' mapCategory: No category provided, using "other"');
    return 'other';
  }

  //console.log(' mapCategory input:', apiCategory);

  // Normalizar la categoría del backend a kebab-case
  // "AutomotiveTools" → "automotive-tools"
  const normalizedCategory = apiCategory
    .replace(/([a-z])([A-Z])/g, '$1-$2') // CamelCase → kebab-case
    .toLowerCase();

  //console.log(' mapCategory normalized:', normalizedCategory);

  // Verificar si existe en las categorías válidas del tipo Article
  const validCategories = CATEGORIES.map(c => c.value) as Article['category'][];
  
  if (validCategories.includes(normalizedCategory as Article['category'])) {
    //console.log('✅ mapCategory found match:', normalizedCategory);
    return normalizedCategory as Article['category'];
  }
  return normalizedCategory as Article['category'];
}

/**
 * Transforma la respuesta de la API (BinResponse) a nuestro modelo de aplicación (Bin)
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
 * Simulates an API delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



/** ALL ITEMS *************************************************************************
 * ***********************************************************************************
 */
export async function fetchArticlesFromApi(): Promise<Article[]> {
  try {
    const response = await fetch(`${API_URL}/Inventory/items-with-bins?isActive=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    //console.log(response, 'get')
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
    }

    const data: InventoryItemResponse[] = await response.json();
    //console.log(response, 'get22')
    // Validar y transformar
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array');
    }

    // Mapear cada elemento al modelo Article
    return data.map(transformInventoryItem);
  } catch (error) {
    console.error('Error fetching all items with bins:', error, Response);
    throw error;
  }
}



/** *************************************************************************************************************************************
 * Fetches a single article by ID from the API
 */
export async function fetchArticleByIdApi(id: number): Promise<Article> {
  try {
    const response = await fetch(`${API_URL}/Items/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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



/*FUNCIONAL.................................................................................
..........................................................................................*/
export async function fetchBinsFromApi(): Promise<Bin[]> {
  try {
    const response = await fetch(`${API_URL}/Bins/with-quantity?isActive=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Manejo de errores HTTP
      throw new Error(`Failed to fetch bins: ${response.status} ${response.statusText}`);
    }

    // Casteamos la respuesta como un array de BinResponse
    const data: BinResponse[] = await response.json();

    // Mapeamos y transformamos cada objeto BinResponse a nuestro modelo Bin
    return data.map(transformBin);
  } catch (error) {
    console.error('Error fetching all bins:', error);
    // Vuelve a lanzar el error para que el componente (o Redux thunk) lo maneje
    throw error;
  }
}

// inventoryApi.ts - Agregar esta función

/**
 * Fetches available bins for creating new items (bins with BinPurpose = 0 - GoodCondition)
 */
export async function getNewBins(): Promise<Bin[]> {
  try {
    const response = await fetch(`${API_URL}/Bins?isActive=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch new bins: ${response.status} ${response.statusText}`);
    }

    const data: BinResponse[] = await response.json();

    // Solo retornar bins en good condition (BinPurpose = 0)
    return data
      .filter(bin => bin.binPurposeDisplay === 'GoodCondition')
      .map(transformBin);
  } catch (error) {
    console.error('Error fetching new bins:', error);
    throw error;
  }
}
/**
 * Simulates fetching transactions from an API
 */
export async function fetchTransactionsFromApi(): Promise<Transaction[]> {
  await delay(500); // Simulate network delay
  return [];
}

/**
 * Simulates creating an article in the API
 */
export async function createArticleApi2(articleData: Omit<Article, 'id' | 'createdAt' | 'currentStock' | 'location' | 'status'>): Promise<Article> {
  await delay(500); // Simulate network delay

  // Simulate successful creation
  const newArticle: Article = {
    id: Date.now(), // Generate a unique ID
    ...articleData,
    currentStock: 0, // New items start with 0 stock
    location: 'Warehouse', // Default location
    status: 'good-condition', // Default status
    createdAt: new Date().toISOString().split('T')[0]
  };

  console.log('API: Article created successfully', newArticle);
  return newArticle;
}

/**
 * Creates a new article/item with image support using multipart/form-data
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
    console.log('API_DATA_RECEIVED:', articleData);
    // ✅ Crear FormData para enviar multipart/form-data
    const formData = new FormData();

    formData.append('name', articleData.name);
    formData.append('description', articleData.description);
    formData.append('category', articleData.category);
    formData.append('unit', articleData.unit);
    formData.append('minStock', articleData.minStock.toString());
    formData.append('isActive', 'true');
    formData.append('consumable', articleData.consumable.toString());
    formData.append('binCode', articleData.binCode);

    // ✅ Añadir imagen si existe
    if (articleData.imageFile) {
      formData.append('file', articleData.imageFile);
    }
    console.log('DATOS EN API', formData);
    const response = await fetch(`${API_URL}/Items/with-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create item: ${response.status} - ${errorText}`);
    }

    const createdItem = await response.json();

    // Transformar respuesta a nuestro modelo
    return transformInventoryItem(createdItem);
  } catch (error) {
    console.log('Error creating article:', error);
    console.error('Error creating article:', error);
    throw error;
  }
}


/** *********************************************************************************************************************************
 * Updates an article/item via PUT request
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
    console.log('UPDATE API_DATA_RECEIVED:', articleData);

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

    console.log('UPDATE API_PAYLOAD:', payload);

    const response = await fetch(`${API_URL}/Items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update item: ${response.status} - ${errorText}`);
    }

    // Verificar si hay contenido en la respuesta
    const contentType = response.headers.get('content-type');
    const hasContent = contentType?.includes('application/json');

    if (!hasContent || response.status === 204) {
      //  Backend devolvió vacío - hacer GET del item actualizado
      console.log('API: Update successful (no content), fetching updated item...');
      return await fetchArticleByIdApi(id);
    }

    // Si devuelve JSON, parsearlo
    const updatedItem = await response.json();
    return transformInventoryItem(updatedItem);

  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}


/**
 * Updates an article/item with image support using multipart/form-data
 */
export async function updateArticleWithImageApi(
  id: number,
  articleData: {
    sku: string;
    name: string;
    description: string;
    category: string;
    unit: string;
    minStock: number;
    consumable: boolean;
    imageFile?: File | null;
    imageUrl?: string | null;
  }
): Promise<Article> {
  try {
    console.log('UPDATE API_DATA_RECEIVED (multipart):', articleData);
    const formData = new FormData();

    formData.append('sku', articleData.sku);
    formData.append('name', articleData.name);
    formData.append('description', articleData.description);
    formData.append('category', articleData.category);
    formData.append('unit', articleData.unit);
    formData.append('minStock', articleData.minStock.toString());
    formData.append('isActive', 'true');
    formData.append('consumable', articleData.consumable.toString());

    // ✅ Añadir imagen si existe (nueva imagen)
    if (articleData.imageFile) {
      formData.append('file', articleData.imageFile);
      console.log('📎 Nueva imagen adjunta al FormData');
    } else if (articleData.imageUrl) {
      // Si no hay nueva imagen pero hay URL existente, mantenerla
      formData.append('urlImage', articleData.imageUrl);
      console.log(' Manteniendo URL de imagen existente:', articleData.imageUrl);
    }

    console.log('UPDATE FORMDATA preparado');

    const response = await fetch(`${API_URL}/Items/${id}/update-with-image`, {
      method: 'PUT',
      body: formData, 
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update item: ${response.status} - ${errorText}`);
    }

    // Verificar si hay contenido en la respuesta
    const contentType = response.headers.get('content-type');
    const hasContent = contentType?.includes('application/json');

    if (!hasContent || response.status === 204) {
      // Backend devolvió vacío - hacer GET del item actualizado
      console.log('API: Update successful (no content), fetching updated item...');
      return await fetchArticleByIdApi(id);
    }

    // Si devuelve JSON, parsearlo y transformarlo
    const updatedItem = await response.json();
    console.log('✅ Item actualizado exitosamente:', updatedItem);
    return transformInventoryItem(updatedItem);

  } catch (error) {
    console.error('❌ Error updating article with image:', error);
    throw error;
  }
}

/**
 * ***************************************************************************************************
 * Deletes an article/item from the API
 */
export async function deleteArticleApi(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/Items/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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


/**
 * Simulates creating a kit in the API
 */
export async function createKitApi(kitData: Omit<Kit, 'id' | 'createdAt'>): Promise<Kit> {
  await delay(500); // Simulate network delay

  const newKit: Kit = {
    id: Date.now(),
    ...kitData,
    createdAt: new Date().toISOString().split('T')[0]
  };

  console.log('API: Kit created successfully', newKit);
  return newKit;
}

/**
 * Simulates updating a kit in the API
 */
export async function updateKitApi(id: number, data: Partial<Kit>): Promise<Kit> {
  await delay(500); // Simulate network delay

  console.log('API: Kit updated successfully', { id, data });
  return { id, ...data } as Kit;
}




/** **************************************************************************************************
 * Creates a new bin via POST request
 */
export async function createBinApi(binData: {
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap' | 'hold' | 'packing' | 'reception';
  description: string;
}): Promise<Bin> {
  try {
    console.log('purpose: ', binData);
    // Mapear el tipo de la UI al enum del backend
    const binPurposeMap = {
      'good-condition': 0,
      'on-revision': 1,
      'scrap': 2,
      'hold': 3,
      'packing': 4,
      'reception': 5

    };


    const normalizedType = binData.type.toLowerCase() as keyof typeof binPurposeMap;
    const binPurposeValue = binPurposeMap[normalizedType];

    if (binPurposeValue === undefined) {
      console.error(`Invalid bin type provided after normalization: ${binData.type}`);
    }


    const payload = {
      binCode: binData.binCode,
      description: binData.description || '',

      binPurpose: binPurposeValue // Usamos el valor mapeado
    };

    console.log('CREATE BIN PAYLOAD:', payload);

    const response = await fetch(`${API_URL}/Bins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create bin: ${response.status} - ${errorText}`);
    }

    const createdBin = await response.json();

    // Transformar respuesta a nuestro modelo
    return transformBin(createdBin);
  } catch (error) {
    console.error('Error creating bin:', error);
    throw error;
  }
}

/** ************************************************************************************************************************
 * Elimina un Bin por su ID a través de una solicitud DELETE.
 */
// api.ts

export async function deleteBinApi(id: number): Promise<void> {
  try {
    //console.log('🗑️ Attempting to delete bin with ID:', id);

    const response = await fetch(`${API_URL}/Bins/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    //console.log('🗑️ Delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🗑️ Delete failed:', errorText);
      throw new Error(`Failed to delete bin: ${response.status} - ${errorText}`);
    }

    console.log('✅ Bin deleted successfully');
  } catch (error) {
    console.error('❌ Error in deleteBinApi:', error);
    throw error;
  }
}



/** ********************************************************************************
 * Actualiza un bin existente vía PUT request
 */
export async function updateBinApi(
  id: number,
  binData: {
    binCode: string;
    type: 'good-condition' | 'on-revision' | 'scrap'  | 'hold'  | 'packing'  | 'reception';
    description: string;
  }
): Promise<Bin> {
  try {
    // Mapear el tipo de la UI al enum del backend
    const binPurposeMap = {
      'good-condition': 0,
      'on-revision': 1,
      'scrap': 2,
      'hold': 3,
      'packing': 4,
      'reception': 5
    };

    const payload = {
      binCode: binData.binCode,
      //name: binData.description || '', // Usar description como name
      description:  binData.description || '',
      binPurpose: binPurposeMap[binData.type]
    };

    console.log('UPDATE BIN PAYLOAD:', payload);

    const response = await fetch(`${API_URL}/Bins/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update bin: ${response.status} - ${errorText}`);
    }

    // Verificar si hay contenido en la respuesta
    const contentType = response.headers.get('content-type');
    const hasContent = contentType?.includes('application/json');

    if (!hasContent || response.status === 204) {
      // Backend devolvió vacío - hacer GET del bin actualizado
     // console.log('API: Update successful (no content), fetching updated bin...');
      return await fetchBinByIdApi(id);
    }

    // Si devuelve JSON, parsearlo y transformarlo
    const updatedBin = await response.json();
    return transformBin(updatedBin);

  } catch (error) {
    console.error('Error updating bin:', error);
    throw error;
  }
}

/**
 * Obtiene un bin por su ID (helper para cuando PUT devuelve 204)
 */
async function fetchBinByIdApi(id: number): Promise<Bin> {
  try {
    const response = await fetch(`${API_URL}/Bins/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bin: ${response.status}`);
    }

    const bin = await response.json();
    return transformBin(bin);
  } catch (error) {
    console.error('Error fetching bin by ID:', error);
    throw error;
  }
}




/**
 * Simulates recording a movement in the API
 */
export async function recordMovementApi(movementData: any): Promise<{ transaction: Transaction; updatedArticle?: Article }> {
  await delay(500); // Simulate network delay
  console.log('API: Movement recorded successfully', { movementData, transaction });
  // Create a transaction record
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


// Función para obtener categorías del backend
export const getCategories = async (): Promise<{ value: string; label: string }[]> => {
  try {
    //console.log('Llamando a /categories...');
    const response = await fetch(`${API_URL}/Items/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
    //console.log('🌐 Respuesta raw del backend:', data);

    // ✅ TRANSFORMAR: El backend devuelve ["HandTools", "PowerTools", ...]
    // Necesitamos convertir a [{ value: 'hand-tools', label: 'Hand Tools' }, ...]
    const transformedCategories = data.map((category: string) => ({
      value: category.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), // HandTools -> hand-tools
      label: category.replace(/([a-z])([A-Z])/g, '$1 $2') // HandTools -> Hand Tools
    }));

    //console.log('✅ Categorías transformadas:', transformedCategories);
    return transformedCategories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    // Fallback
    return [
      { value: 'other', label: 'Other' },
      { value: 'tools', label: 'Tools' },
    ];
  }
};


// Función para obtener bins del backend
export const getBinTypes = async (): Promise<{ value: string; label: string }[]> => {
  
    // console.log('Llamando a /Bins/types...');
    const response = await fetch(`${API_URL}/Bins/types`, {
      method: 'GET',
      headers: {
        // Nota: 'Content-Type' no suele ser necesario en un GET
        // Pero si tu API lo requiere, mantenlo.
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bins: ${response.status}`);
    }

    // 1. Obtener los datos (tu array de strings)
    const data: string[] = await response.json();
    
    // 2. Transformar el array de strings a un array de objetos
    //    usando .map() para que coincida con el tipo de retorno
    const formattedData = data.map(binType => ({
      value: binType,
      label: binType, // Usamos el mismo valor para 'label' y 'value'
    }));

    // 3. Retornar los datos transformados
    return formattedData;
  
};

/**
 * Creates a purchase transaction for inventory items
 * POST /api/Inventory/purchase
 */
export async function createPurchaseApi(purchaseData: PurchaseRequest): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/Inventory/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create purchase: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Purchase transaction created successfully');
  } catch (error) {
    // Re-throw the error without logging to avoid duplicate console messages
    throw error;
  }
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