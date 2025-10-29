import type { Article, InventoryItemResponse, Kit, Template, Bin, BinResponse, Transaction } from '../types';
import { CATEGORIES } from '../constants';
import { strict } from 'assert';
const API_URL = 'http://localhost:5000/api';


const MOCK_KITS_DATA: Kit[] = [
  {
    id: 1,
    binCode: 'KIT-OFFICE-001',
    name: 'Basic Office Starter Kit',
    description: 'Complete office setup kit for new employees',
    category: 'office-supplies',
    items: [
      { articleId: 1, articleBinCode: 'BIN-OFF-001', articleName: 'Office Paper A4', quantity: 5 },
      { articleId: 2, articleBinCode: 'BIN-TECH-002', articleName: 'Laptop Dell Latitude', quantity: 1 },
      { articleId: 3, articleBinCode: 'BIN-USB-003', articleName: 'USB Cable Type-C', quantity: 2 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'good-condition',
    createdAt: '2025-01-15'
  }
];

const MOCK_TEMPLATES_DATA: Template[] = [
  {
    id: 1,
    name: 'Basic Office Setup',
    description: 'Standard office equipment for new employees',
    category: 'office-supplies',
    items: [
      {
        articleId: 1,
        articleBinCode: 'BIN-OFF-001',
        articleName: 'A4 Office Paper',
        quantity: 5
      },
      {
        articleId: 2,
        articleBinCode: 'BIN-TECH-002',
        articleName: 'Dell Latitude Laptop',
        quantity: 1
      },
      {
        articleId: 3,
        articleBinCode: 'BIN-USB-003',
        articleName: 'USB Type-C Cable',
        quantity: 2
      }
    ],
    createdAt: '2025-01-15'
  }
];



const MOCK_TRANSACTIONS_DATA: Transaction[] = [
  {
    id: 1,
    type: 'entry',
    subtype: 'purchase',
    articleCode: 'OFF-001',
    articleDescription: 'Office Paper A4 - 800gsm',
    quantity: 500,
    unit: 'sheets',
    reference: 'PO-2025-001',
    notes: 'Quarterly paper stock replenishment',
    user: 'Sarah Johnson',
    project: 'Office Supplies Replenishment',
    date: '2025-01-20',
    createdAt: '2025-01-20T10:30:00Z'
  }
];

/**
 * Mapea el propósito del bin (binPurpose o binPurposeDisplay)
 */
function mapStatusType(apiStatus: string): Article['status'] {
  switch (apiStatus) {
    case 'GoodCondition':
      return 'good-condition';
    case 'OnRevision':
      return 'on-revision';
    case 'Scrap':
      return 'scrap';
    case 'NotApplicable':
    default:
      return 'good-condition';
  }
}


export function transformInventoryItem(apiItem: InventoryItemResponse): Article {
  return {
    id: apiItem.itemId,
    imageUrl: apiItem.imageUrl || '',
    sku: apiItem.itemSku,
    name: apiItem.itemName,
    description: apiItem.description || '',
    category: mapCategory(apiItem.category),
    consumable: apiItem.consumable,
    minStock: apiItem.minStock || 0,

    // NUEVO: Mapear array de bins
    bins: apiItem.bins?.map(bin => ({
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
    console.log(response, 'get')
    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
    }

    const data: InventoryItemResponse[] = await response.json();
    console.log(response, 'get22')
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

/**
 * Simulates fetching kits from an API
 */
export async function fetchKitsFromApi(): Promise<Kit[]> {
  await delay(500); // Simulate network delay
  return [...MOCK_KITS_DATA];
}



/**
 * Simulates fetching templates from an API
 */
export async function fetchTemplatesFromApi(): Promise<Template[]> {
  await delay(500); // Simulate network delay
  return [...MOCK_TEMPLATES_DATA];
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
  return [...MOCK_TRANSACTIONS_DATA];
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

/**
 * Simulates creating a template in the API
 */
export async function createTemplateApi(templateData: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
  await delay(500); // Simulate network delay

  const newTemplate: Template = {
    id: Date.now(),
    ...templateData,
    createdAt: new Date().toISOString().split('T')[0]
  };

  console.log('API: Template created successfully', newTemplate);
  return newTemplate;
}

/**
 * Simulates updating a template in the API
 */
export async function updateTemplateApi(id: number, data: Partial<Template>): Promise<Template> {
  await delay(500); // Simulate network delay

  console.log('API: Template updated successfully', { id, data });
  return { id, ...data } as Template;
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

 // console.log('API: Movement recorded successfully', { movementData, transaction });

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