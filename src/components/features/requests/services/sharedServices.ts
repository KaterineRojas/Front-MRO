
import { API_BASE_URL } from "./api";
import { withRetry, classifyFetchError, handleError } from "../../enginner/services/errorHandler";
// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location?: string;
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

// Project Details Types
export interface Company {
  id: string | number; // Acepta ambos tipos para compatibilidad con tu API
  name: string;
  code?: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string | number;
  companyId: string | number;
  name: string;
  code?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  customerId?: string;
  name: string;
  code: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'pending' | 'completed' | 'cancelled';
  budget?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkOrder {
  id: string | number;
  projectId: string | number;
  orderNumber: string;
  description: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedDate?: string;
  dueDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}


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
 * Get all projects (simple projects without customer relation)
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

// ============================================
// PROJECT DETAILS - REAL API FUNCTIONS
// ============================================

/**
 * Get all companies from real API
 */
export async function getCompanies(): Promise<Company[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/Companies`);
   
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Normalizar los IDs a string para consistencia con el resto del código
    return data.map((company: any) => ({
      ...company,
      id: company.id.toString(), // Convertir ID numérico a string
      active: company.active !== undefined ? company.active : true,
      code: company.code || '',
      description: company.description || ''
    }));
  } catch (error) {
    console.error('Error fetching companies from API, falling back to mock:', error);
    // Si falla la API real, usar datos MOCK como fallback
    return getCompanies_MOCK();
  }
}


/**
 * Get customers by company ID
 */
export async function getCustomersByCompany(companyId: string | number): Promise<Customer[]> {
    const apiFunction = async () => {
        const endpoint = `${API_BASE_URL}/Companies/${companyId}/customers`;
        const response = await fetch(endpoint);

        if (!response.ok) {
            // Si hay un error HTTP (4xx o 5xx), lanzamos un AppError clasificado
            throw await classifyFetchError(response);
        }
        const data: Array<{ id: number; name: string; code?: string }> = await response.json();
        
        // Mapeo de datos...
        return data.map((customerApi) => ({
            id: customerApi.id.toString(),
            companyId: companyId.toString(),
            name: customerApi.name,
            code: customerApi.code || undefined,
        }));
    };

    try {
        return await withRetry(apiFunction);
    } catch (error) {
        // Si withRetry falla
        const appError = handleError(error);
        throw appError; 
    }
}

/**
 * Get projects by customer ID
 */
export async function getProjectsByCustomer(customerId: string | number): Promise<Project[]> {
  const endpoint = `${API_BASE_URL}/Customers/${customerId}/projects`;
 
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Array<{ id: number; name: string; code?: string; description?: string }> = await response.json();
    return data.map((projectApi) => ({
      id: projectApi.id.toString(),
      customerId: customerId.toString(), 
      name: projectApi.name,
      code: projectApi.code ? projectApi.code.toString() : projectApi.id.toString(),
      description: projectApi.description || undefined,
    }));
  } catch (error) {
    console.error(`Error fetching projects from API for Customer ${customerId}, falling back to mock:`, error);
    return getProjectsByCustomer_MOCK(customerId.toString());
  }
}

/**
 * Get work orders by project ID
 */
export async function getWorkOrdersByProject(projectId: string | number): Promise<WorkOrder[]> {
  const endpoint = `${API_BASE_URL}/Projects/${projectId}/workorders`;
 
  try {
    const response = await fetch(endpoint);   
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Array<{ id: number; name: string }> = await response.json(); 
    return data.map((woApi) => ({
      id: woApi.id.toString(),
      projectId: projectId.toString(), 
      orderNumber: woApi.id.toString(), 
      description: woApi.name,         
      status: 'pending', 
      priority: 'medium',
    }));
  } catch (error) {
    console.error(`Error fetching work orders from API for Project ${projectId}, falling back to mock:`, error);
    return getWorkOrdersByProject_MOCK(projectId.toString());
  }
}

// ============================================
// MOCK FUNCTIONS FOR TESTING
// ============================================

export async function getCompanies_MOCK(): Promise<Company[]> {
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    {
      id: '1',
      name: 'Tech Solutions Inc',
      code: 'TSI',
      description: 'Technology services company',
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Global Manufacturing Co',
      code: 'GMC',
      description: 'Manufacturing and distribution',
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Innovation Labs',
      code: 'IL',
      description: 'Research and development',
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];
}



export async function getProjectsByCustomer_MOCK(customerId: string): Promise<Project[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const projectsByCustomer: Record<string, Project[]> = {
    'cust-1': [
      {
        id: 'proj-1',
        customerId: 'cust-1',
        name: 'Website Redesign',
        code: 'WEB-2024-001',
        description: 'Complete redesign of corporate website',
        status: 'active',
        budget: 50000,
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'proj-2',
        customerId: 'cust-1',
        name: 'Mobile App Development',
        code: 'MOB-2024-002',
        description: 'Native iOS and Android apps',
        status: 'active',
        budget: 120000,
        startDate: '2024-02-15',
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z'
      }
    ],
    'cust-2': [
      {
        id: 'proj-3',
        customerId: 'cust-2',
        name: 'Cloud Migration',
        code: 'CLO-2024-001',
        description: 'AWS cloud infrastructure setup',
        status: 'pending',
        budget: 80000,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z'
      }
    ],
    'cust-3': [
      {
        id: 'proj-4',
        customerId: 'cust-3',
        name: 'Factory Automation',
        code: 'FAC-2024-001',
        description: 'Automated production line',
        status: 'active',
        budget: 250000,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
    ]
  };

  return projectsByCustomer[customerId] || [];
}

export async function getWorkOrdersByProject_MOCK(projectId: string): Promise<WorkOrder[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const workOrdersByProject: Record<string, WorkOrder[]> = {
    'proj-1': [
      {
        id: 'wo-1',
        projectId: 'proj-1',
        orderNumber: 'WO-2024-0001',
        description: 'Initial design mockups',
        status: 'completed',
        priority: 'high',
        assignedDate: '2024-01-05',
        dueDate: '2024-01-20',
        completedDate: '2024-01-18',
        estimatedHours: 40,
        actualHours: 38,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-18T00:00:00Z'
      },
      {
        id: 'wo-2',
        projectId: 'proj-1',
        orderNumber: 'WO-2024-0002',
        description: 'Frontend development',
        status: 'in_progress',
        priority: 'high',
        assignedDate: '2024-01-21',
        dueDate: '2024-03-15',
        estimatedHours: 200,
        actualHours: 120,
        createdAt: '2024-01-21T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z'
      }
    ],
    'proj-2': [
      {
        id: 'wo-4',
        projectId: 'proj-2',
        orderNumber: 'WO-2024-0004',
        description: 'iOS app development',
        status: 'pending',
        priority: 'high',
        dueDate: '2024-06-30',
        estimatedHours: 320,
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z'
      }
    ],
    'proj-3': [
      {
        id: 'wo-6',
        projectId: 'proj-3',
        orderNumber: 'WO-2024-0006',
        description: 'Infrastructure assessment',
        status: 'pending',
        priority: 'medium',
        estimatedHours: 80,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z'
      }
    ],
    'proj-4': [
      {
        id: 'wo-7',
        projectId: 'proj-4',
        orderNumber: 'WO-2024-0007',
        description: 'Equipment procurement',
        status: 'in_progress',
        priority: 'urgent',
        assignedDate: '2024-01-20',
        dueDate: '2024-02-28',
        estimatedHours: 40,
        actualHours: 35,
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-02-15T00:00:00Z'
      }
    ]
  };

  return workOrdersByProject[projectId] || [];
}