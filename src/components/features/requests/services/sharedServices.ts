// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// SHARED TYPES (Usados por múltiples módulos)
// ============================================

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Status {
  id: string;
  name: string;
  color?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  image: string;
  category: string;
  availableQuantity: number;
  totalQuantity: number;
  warehouseId: string;
  warehouseName: string;
}

// ============================================
// MOCK DATA - Shared Resources
// ============================================

const mockWarehouses: Warehouse[] = [
  { id: 'wh-1', name: 'Amax', code: 'AMX', location: 'Building A' },
  { id: 'wh-2', name: 'Best', code: 'BST', location: 'Building B' },
  { id: 'wh-3', name: 'Central', code: 'CTR', location: 'Main Building' }
];

const mockProjects: Project[] = [
  { id: 'proj-1', name: 'Proyecto Amazonas', code: 'AMZ', description: 'Amazon region project' },
  { id: 'proj-2', name: 'Proyecto Web', code: 'WEB', description: 'Web development project' },
  { id: 'proj-3', name: 'Proyecto Innova', code: 'INN', description: 'Innovation project' },
  { id: 'proj-4', name: 'Proyecto Construcción', code: 'CON', description: 'Construction project' },
  { id: 'proj-5', name: 'Campaign 2024', code: 'CMP', description: 'Marketing campaign' }
];

const mockStatuses: Status[] = [
  { id: 'pending', name: 'Pending', color: 'yellow' },
  { id: 'approved', name: 'Approved', color: 'blue' },
  { id: 'rejected', name: 'Rejected', color: 'red' },
  { id: 'completed', name: 'Completed', color: 'green' }
];

const mockCatalogItems: CatalogItem[] = [
  {
    id: 'item-1',
    name: 'Mechanical Keyboard RGB',
    sku: 'MECH-KB-001',
    description: 'Gaming keyboard with RGB lighting',
    image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400',
    category: 'Peripherals',
    availableQuantity: 15,
    totalQuantity: 20,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 'item-2',
    name: 'Samsung 27" Monitor',
    sku: 'SAM-003',
    description: 'Full HD display',
    image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400',
    category: 'Monitors',
    availableQuantity: 8,
    totalQuantity: 10,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 'item-3',
    name: 'Proyector Epson PowerLite',
    sku: 'PROJ-EP-001',
    description: 'HD projector for presentations',
    image: 'https://images.unsplash.com/photo-1625961332600-f6eac385c6ba?w=400',
    category: 'Presentation',
    availableQuantity: 5,
    totalQuantity: 6,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    id: 'item-4',
    name: 'Cable HDMI 2.0',
    sku: 'HDMI-001',
    description: '4K HDMI cable 2m',
    image: 'https://images.unsplash.com/photo-1625738323142-01e6d7906e0a?w=400',
    category: 'Cables',
    availableQuantity: 50,
    totalQuantity: 100,
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    id: 'item-5',
    name: 'Power Drill',
    sku: 'DRL-001',
    description: 'Cordless drill with battery',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
    category: 'Tools',
    availableQuantity: 12,
    totalQuantity: 15,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    id: 'item-6',
    name: 'Webcam HD',
    sku: 'WEB-001',
    description: 'Full HD webcam',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    category: 'Peripherals',
    availableQuantity: 20,
    totalQuantity: 25,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 'item-7',
    name: 'Mouse Inalámbrico',
    sku: 'MOU-001',
    description: 'Wireless optical mouse',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    category: 'Peripherals',
    availableQuantity: 30,
    totalQuantity: 40,
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    id: 'item-8',
    name: 'Auriculares con Micrófono',
    sku: 'AUD-001',
    description: 'Professional headset with mic',
    image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400',
    category: 'Audio',
    availableQuantity: 18,
    totalQuantity: 20,
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  }
];

// ============================================
// API FUNCTIONS - Shared Resources
// ============================================

/**
 * Get all warehouses
 */
export async function getWarehouses(): Promise<Warehouse[]> {
  await delay(200);
  return [...mockWarehouses];
}

/**
 * Get warehouse by ID
 */
export async function getWarehouseById(warehouseId: string): Promise<Warehouse | null> {
  await delay(150);
  const warehouse = mockWarehouses.find(w => w.id === warehouseId);
  return warehouse ? { ...warehouse } : null;
}

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
  await delay(200);
  return [...mockProjects];
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  await delay(150);
  const project = mockProjects.find(p => p.id === projectId);
  return project ? { ...project } : null;
}

/**
 * Get all statuses
 */
export async function getStatuses(): Promise<Status[]> {
  await delay(100);
  return [...mockStatuses];
}

/**
 * Get all catalog items
 */
export async function getCatalogItems(): Promise<CatalogItem[]> {
  await delay(300);
  return [...mockCatalogItems];
}

/**
 * Get catalog items by warehouse
 */
export async function getCatalogItemsByWarehouse(warehouseId: string): Promise<CatalogItem[]> {
  await delay(300);
  return mockCatalogItems.filter(item => item.warehouseId === warehouseId);
}

/**
 * Get catalog item by ID
 */
export async function getCatalogItemById(itemId: string): Promise<CatalogItem | null> {
  await delay(200);
  const item = mockCatalogItems.find(i => i.id === itemId);
  return item ? { ...item } : null;
}

/**
 * Search catalog items by name or SKU
 */
export async function searchCatalogItems(query: string): Promise<CatalogItem[]> {
  await delay(250);
  const queryLower = query.toLowerCase();
  return mockCatalogItems.filter(
    item =>
      item.name.toLowerCase().includes(queryLower) ||
      item.sku.toLowerCase().includes(queryLower) ||
      item.description.toLowerCase().includes(queryLower)
  );
}
