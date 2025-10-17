import type { Article, Kit, Template, Bin, Transaction } from '../types';

// Mock data that was previously in constants.ts
const MOCK_ARTICLES_DATA: Article[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300',
    sku: 'SKU-001',
    name: 'A4ga Office Paper',
    description: 'Office Paper A4 - 80gsm',
    category: 'office-supplies',
    type: 'consumable',
    currentStock: 2500,
    cost: 0.02,
    binCode: 'BIN-OFF-001',
    unit: 'sheets',
    supplier: 'Office Supplies Inc.',
    minStock: 500,
    location: 'Storage Room A',
    status: 'good-condition',
    createdAt: '2025-01-15'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
    sku: 'SKU-002',
    name: 'Dell Latitude Laptop',
    description: 'Laptop Dell Latitude 5520',
    category: 'technology',
    type: 'non-consumable',
    currentStock: 15,
    cost: 1200,
    binCode: 'BIN-TECH-002',
    unit: 'units',
    supplier: 'Tech Solutions Ltd.',
    minStock: 5,
    location: 'IT Storage',
    status: 'good-condition',
    createdAt: '2025-01-14'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300',
    sku: 'SKU-003',
    name: 'USB Type-C Cable',
    description: 'USB Cable Type-C 2m',
    category: 'technology',
    type: 'consumable',
    currentStock: 50,
    cost: 15,
    binCode: 'BIN-USB-003',
    unit: 'units',
    supplier: 'Cable Corp.',
    minStock: 20,
    location: 'IT Storage',
    status: 'good-condition',
    createdAt: '2025-01-13'
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300',
    sku: 'SKU-004',
    name: 'Electric Drill',
    description: 'Electric Drill with Battery',
    category: 'tools',
    type: 'non-consumable',
    currentStock: 8,
    cost: 250,
    binCode: 'BIN-TOOL-004',
    unit: 'units',
    supplier: 'Tool Masters',
    minStock: 3,
    location: 'Workshop',
    status: 'good-condition',
    createdAt: '2025-01-12'
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
    sku: 'SKU-005',
    name: 'Safety Helmet',
    description: 'Safety Helmet with Chin Strap',
    category: 'safety-equipment',
    type: 'non-consumable',
    currentStock: 25,
    cost: 45,
    binCode: 'BIN-SAFE-005',
    unit: 'units',
    supplier: 'SafetyFirst Co.',
    minStock: 10,
    location: 'Safety Storage',
    status: 'good-condition',
    createdAt: '2025-01-11'
  },
  {
    id: 6,
    imageUrl: 'https://images.unsplash.com/photo-1584949091598-c31daaaa4aa9?w=300',
    sku: 'SKU-006',
    name: 'Wireless Mouse',
    description: 'Ergonomic Wireless Mouse',
    category: 'technology',
    type: 'consumable',
    currentStock: 0,
    cost: 25,
    binCode: 'BIN-TECH-006',
    unit: 'units',
    supplier: 'Tech Accessories Co.',
    minStock: 10,
    location: 'IT Storage',
    status: 'good-condition',
    createdAt: '2025-01-10'
  },
  {
    id: 7,
    imageUrl: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300',
    sku: 'SKU-007',
    name: 'Office Chair',
    description: 'Ergonomic Office Chair with Lumbar Support',
    category: 'furniture',
    type: 'non-consumable',
    currentStock: 0,
    cost: 350,
    binCode: 'BIN-FURN-001',
    unit: 'units',
    supplier: 'Furniture Solutions Ltd.',
    minStock: 2,
    location: 'Warehouse',
    status: 'good-condition',
    createdAt: '2025-01-09'
  },
  {
    id: 8,
    imageUrl: 'https://images.unsplash.com/photo-1611532736570-dea5c63f0dfc?w=300',
    sku: 'SKU-008',
    name: 'Hand Sanitizer',
    description: 'Antibacterial Hand Sanitizer 500ml',
    category: 'cleaning-supplies',
    type: 'consumable',
    currentStock: 0,
    cost: 5.50,
    binCode: 'BIN-CLEAN-001',
    unit: 'bottles',
    supplier: 'Hygiene Supplies Inc.',
    minStock: 50,
    location: 'Storage Room B',
    status: 'good-condition',
    createdAt: '2025-01-08'
  }
];

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

const MOCK_BINS_DATA: Bin[] = [
  {
    id: 1,
    binCode: 'BIN-OFF-001',
    type: 'good-condition',
    description: 'Storage for office paper and writing supplies'
  },
  {
    id: 2,
    binCode: 'BIN-TECH-002',
    type: 'good-condition',
    description: 'IT equipment and electronics storage'
  },
  {
    id: 3,
    binCode: 'BIN-USB-003',
    type: 'good-condition',
    description: 'Cables and accessories bin'
  },
  {
    id: 4,
    binCode: 'BIN-TOOL-004',
    type: 'on-revision',
    description: 'Power tools and equipment storage'
  },
  {
    id: 5,
    binCode: 'BIN-SAFE-005',
    type: 'good-condition',
    description: 'PPE and safety gear storage'
  },
  {
    id: 6,
    binCode: 'BIN-STORAGE-001',
    type: 'good-condition',
    description: 'Main storage area'
  },
  {
    id: 7,
    binCode: 'BIN-BACKUP-002',
    type: 'good-condition',
    description: 'Backup storage'
  },
  {
    id: 8,
    binCode: 'BIN-SCRAP-001',
    type: 'scrap',
    description: 'Items for disposal'
  }
];

const MOCK_TRANSACTIONS_DATA: Transaction[] = [
  {
    id: 1,
    type: 'entry',
    subtype: 'purchase',
    articleCode: 'OFF-001',
    articleDescription: 'Office Paper A4 - 80gsm',
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
    articleDescription: 'Office Paper A4 - 80gsm',
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
 * Simulates an API delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulates fetching articles from an API
 */
export async function fetchArticlesFromApi(): Promise<Article[]> {
  await delay(500); // Simulate network delay
  return [...MOCK_ARTICLES_DATA];
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

/**
 * Simulates fetching bins from an API
 */
export async function fetchBinsFromApi(): Promise<Bin[]> {
  await delay(500); // Simulate network delay
  return [...MOCK_BINS_DATA];
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
export async function createArticleApi(articleData: Omit<Article, 'id' | 'createdAt' | 'currentStock' | 'location' | 'status'>): Promise<Article> {
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
