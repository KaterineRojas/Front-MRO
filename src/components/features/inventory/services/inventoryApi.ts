import type { Article, InventoryItemResponse, Kit, Template, Bin, BinResponse,  Transaction } from '../types';
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
  },
  {
    id: 2,
    binCode: 'KIT-SAFETY-001',
    name: 'Personal Safety Kit',
    description: 'Complete personal protective equipment kit',
    category: 'safety-equipment',
    items: [
      { articleId: 5, articleBinCode: 'BIN-SAFE-005', articleName: 'Safety Helmet', quantity: 1 },
      { articleId: 4, articleBinCode: 'BIN-PROJ-004', articleName: 'Projector Epson', quantity: 1 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'good-condition',
    createdAt: '2025-01-16'
  },
  {
    id: 3,
    binCode: 'KIT-TECH-001',
    name: 'Presentation Equipment Kit',
    description: 'Complete setup for presentations and meetings',
    category: 'technology',
    items: [
      { articleId: 4, articleBinCode: 'BIN-PROJ-004', articleName: 'Projector Epson', quantity: 1 },
      { articleId: 2, articleBinCode: 'BIN-TECH-002', articleName: 'Laptop Dell Latitude', quantity: 1 },
      { articleId: 3, articleBinCode: 'BIN-USB-003', articleName: 'USB Cable Type-C', quantity: 3 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'good-condition',
    createdAt: '2025-01-17'
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
  },
  {
    id: 2,
    name: 'Safety Equipment Standard',
    description: 'Basic personal protective equipment',
    category: 'safety-equipment',
    items: [
      {
        articleId: 5,
        articleBinCode: 'BIN-SAFE-005',
        articleName: 'Safety Helmet',
        quantity: 1
      },
      {
        articleId: 4,
        articleBinCode: 'BIN-TOOL-004',
        articleName: 'Electric Drill',
        quantity: 1
      }
    ],
    createdAt: '2025-01-16'
  },
  {
    id: 3,
    name: 'Presentation Kit Pro',
    description: 'Complete presentation and meeting setup',
    category: 'technology',
    items: [
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
        quantity: 3
      }
    ],
    createdAt: '2025-01-17'
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
  },
  {
    id: 2,
    type: 'exit',
    subtype: 'loan',
    articleCode: 'TECH-002',
    articleDescription: 'Laptop Dell Latitude 5520',
    quantity: 1,
    unit: 'units',
    reference: 'LOAN-001',
    notes: 'Loan to Marketing team for presentation',
    user: 'Mike Chen',
    project: 'Product Launch Campaign',
    date: '2025-01-20',
    createdAt: '2025-01-20T14:15:00Z'
  },
  {
    id: 3,
    type: 'exit',
    subtype: 'consumption',
    articleCode: 'USB-003',
    articleDescription: 'USB Cable Type-C 2m',
    quantity: 2,
    unit: 'units',
    reference: 'CONS-001',
    notes: 'IT department setup new workstations',
    user: 'Anna Rodriguez',
    project: 'Workstation Setup Project',
    date: '2025-01-19',
    createdAt: '2025-01-19T09:45:00Z'
  },
  {
    id: 4,
    type: 'entry',
    subtype: 'return',
    articleCode: 'TECH-002',
    articleDescription: 'Laptop Dell Latitude 5520',
    quantity: 1,
    unit: 'units',
    reference: 'LOAN-001',
    notes: 'Returned from Marketing team',
    user: 'David Wilson',
    project: 'Product Launch Campaign',
    date: '2025-01-19',
    createdAt: '2025-01-19T16:20:00Z'
  },
  {
    id: 5,
    type: 'adjustment',
    subtype: 'audit',
    articleCode: 'OFF-001',
    articleDescription: 'Office Paper AA4 - 80gsm',
    quantity: -50,
    unit: 'sheets',
    reference: 'AUD-2025-001',
    notes: 'Physical count adjustment - damaged paper found',
    user: 'Sarah Johnson',
    project: 'Monthly Audit Process',
    date: '2025-01-18',
    createdAt: '2025-01-18T11:00:00Z'
  }
];

/**
 * Devuelve la imagen por defecto (ya que no llega desde el backend)
 */
function getDefaultImage(): string {
  return 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300';
}

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
    imageUrl: apiItem.imageUrl || null,
    sku: apiItem.itemSku,
    name: apiItem.itemName,
    description: apiItem.description || '',
    category: mapCategory(apiItem.category),
    consumable: apiItem.consumable,
    minStock: apiItem.minStock || 0,
    
    // ✅ NUEVO: Mapear array de bins
    bins: apiItem.bins?.map(bin => ({
      binId: bin.binId,
      binCode: bin.binCode,
      binPurpose: bin.binPurpose as 'GoodCondition' | 'OnRevision' | 'Scrap',
      quantity: bin.quantity
    })) || [],
    
    // ✅ NUEVO: Usar datos calculados del API
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
    case 'NotApplicable': // Los kits y otros bins especiales se mapean a good-condition por defecto
    default:
      return 'good-condition';
  }
}


function mapCategory(apiCategory?: string): Article['category'] {
  const validCategories = CATEGORIES.map(c => c.value) as Article['category'][];

  if (apiCategory && validCategories.includes(apiCategory as Article['category'])) {
    return apiCategory as Article['category'];
  }

  // Valor por defecto si no coincide o viene vacío
  return 'tools';
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
    const response = await fetch(`${API_URL}/Inventory/items-with-bins`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch items: ${response.status} ${response.statusText}`);
    }

    const data: InventoryItemResponse[] = await response.json();

    // Validar y transformar
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array');
    }

    // Mapear cada elemento al modelo Article
    return data.map(transformInventoryItem);
  } catch (error) {
    console.error('Error fetching all items with bins:', error);
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
    const response = await fetch(`${API_URL}/Bins`, {
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

/**NUEVO **********************************************************************************************************
 * *****************************************************************************************************************
 */


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
    console.log('DATOS EN API',formData);
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

/**
 * Simulates updating an article in the API
 */
export async function updateArticleApi(id: number, data: Partial<Article>): Promise<Article> {
  await delay(500); // Simulate network delay
  
  // In a real API, this would update the article in the database
  console.log('API: Article updated successfully', { id, data });
  
  // Return the updated article (in reality, the backend would return the full updated object)
  return { id, ...data } as Article;
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

/**
 * Simulates creating a bin in the API
 */
export async function createBinApi(binData: Omit<Bin, 'id'>): Promise<Bin> {
  await delay(500); // Simulate network delay
  
  const newBin: Bin = {
    id: Date.now(),
    ...binData
  };
  
  console.log('API: Bin created successfully', newBin);
  return newBin;
}

/**
 * Simulates updating a bin in the API
 */
export async function updateBinApi(id: number, data: Partial<Bin>): Promise<Bin> {
  await delay(500); // Simulate network delay
  
  console.log('API: Bin updated successfully', { id, data });
  return { id, ...data } as Bin;
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
  
  console.log('API: Movement recorded successfully', { movementData, transaction });
  
  return { transaction };
}
