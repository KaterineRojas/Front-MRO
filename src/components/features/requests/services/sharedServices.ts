
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

export interface Department {
  id: string | number;
  name: string;
  code?: string;
  description?: string;
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
    id: 'item-6', //
    name: 'Webcam HD',//
    sku: 'WEB-001',
    description: 'Full HD webcam',//
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',//
    category: 'Peripherals',//
    availableQuantity: 20,//
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

async function fetchDataWithRetry<T>(
  endpoint: string,
  dataMapper: (data: any) => T,
): Promise<T> {
  const apiFunction = async () => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
      // Si hay un error HTTP, lanzamos un AppError clasificado
      throw await classifyFetchError(response);
    }

    const data = await response.json();

    // Mapeamos los datos con la función proporcionada
    return dataMapper(data);
  };

  try {
    // Intentamos la llamada con retries
    return await withRetry(apiFunction);
  } catch (error) {
    // Si withRetry falla (después de todos los reintentos), manejamos y lanzamos el AppError final.
    const appError = handleError(error);
    // Puedes dejar el console.error aquí o quitarlo si lo manejas completamente en la UI
    console.error(`Final Error fetching from ${endpoint}:`, appError);
    throw appError;
  }
}





// ============================================
// API FUNCTIONS - Shared Resources
// ============================================



/**
 * Get all warehouses
 */
export async function getWarehouses(): Promise<Warehouse[]> {
  const endpoint = `/Warehouse`;
  return fetchDataWithRetry(endpoint, (data: any) => {
    // 1. Verificar si 'data' es un array. Si no, devuelve un array vacío
    if (!Array.isArray(data)) {
      console.error("API /Warehouse did not return an array:", data);
      return []; // Retorna un array vacío que sí coincide con Warehouse[]
    }

    // 2. Mapear y filtrar en un solo paso (o en pasos que manejen el tipo)
    // Utilizamos una variable intermedia para el resultado filtrado.
    const mappedWarehouses: Warehouse[] = data
      .map((wh: any) => {
        // Paso 2a: Mapear el ID
        const id = wh.idWh ? wh.idWh.toString() : '';

        // Paso 2b: Si no hay un ID válido, retornamos un valor que será descartado
        // En lugar de devolver 'null', podemos devolver 'undefined' o simplemente 
        // dejar que el filtro se encargue de los objetos sin ID.
        if (!id) {
          console.warn("Warehouse object missing idWh:", wh);
          return undefined; // Usamos undefined para el filtro
        }

        // Paso 2c: Retornar el objeto Warehouse válido
        return {
          id: id,
          name: wh.name || 'Unnamed Warehouse',
          code: wh.code || 'N/A',
          location: wh.location || undefined,
        } as Warehouse; // Aseguramos que el objeto retornado es Warehouse
      })
      // 3. Filtrar cualquier elemento que haya devuelto 'undefined' (o 'null')
      // La clave es el type guard 'Boolean' para eliminar falsy values (undefined, null, etc.)
      .filter((wh): wh is Warehouse => Boolean(wh));

    return mappedWarehouses;
  });
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
 * Get all departments from real API: /api/Department
 */
export async function getDepartments(): Promise<Department[]> {
  const endpoint = `/Department`;
  return fetchDataWithRetry(endpoint, (data: any) => {
    return data.map((dept: any) => ({
      id: dept.id.toString(),
      name: dept.name,
      code: dept.code || undefined,
      description: dept.description || undefined
    }));
  });
}


/**
 * Get catalog items by warehouse
 */
/**
 * Get catalog items by warehouse
 */
export async function getCatalogItemsByWarehouse(warehouseId: string): Promise<CatalogItem[]> {
  const endpoint = `/Items/${warehouseId}`;
  
  return fetchDataWithRetry(endpoint, (data: any) => {
    // Verificar si data es un array
    if (!Array.isArray(data)) {
      console.error("API /Items did not return an array:", data);
      return [];
    }

    // Mapeo correcto según tu API real
    return data.map((item: any) => ({
      id: item.itemId ? item.itemId.toString() : '0',             
      name: item.itemName || 'Unknown Item',                       
      sku: item.sku || `SKU-${item.itemId || '000'}`,             
      description: item.description || '',
      image: item.imageUrl || '',  
      category: item.category || 'General',
      availableQuantity: item.quantityAvailable || 0,             
      totalQuantity: item.quantityAvailable || 0,                  
      warehouseId: warehouseId.toString(),
      warehouseName: `Warehouse ${warehouseId}`                   
    }));
  });
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
  return fetchDataWithRetry(`/Companies`, (data: any) => {
    // Normalizar los IDs y establecer defaults
    return data.map((company: any) => ({
      ...company,
      id: company.id.toString(),
      active: company.active !== undefined ? company.active : true,
      code: company.code || '',
      description: company.description || ''
    }));
  });
}


/**
 * Get customers by company ID
 */
export async function getCustomersByCompany(companyId: string | number): Promise<Customer[]> {
  const endpoint = `/Companies/${companyId}/customers`;

  return fetchDataWithRetry(endpoint, (data: Array<{ id: number; name: string; code?: string }>) => {
    return data.map((customerApi) => ({
      id: customerApi.id.toString(),
      companyId: companyId.toString(),
      name: customerApi.name,
      code: customerApi.code || undefined,
    }));
  });
}

/**
 * Get projects by customer ID
 */
export async function getProjectsByCustomer(customerId: string | number): Promise<Project[]> {
  const endpoint = `/Customers/${customerId}/projects`;

  return fetchDataWithRetry(endpoint, (data: Array<{ id: number; name: string; code?: string; description?: string }>) => {
    return data.map((projectApi) => ({
      id: projectApi.id.toString(),
      customerId: customerId.toString(),
      name: projectApi.name,
      code: projectApi.code ? projectApi.code.toString() : projectApi.id.toString(),
      description: projectApi.description || undefined,
    }));
  });
}

/**
 * Get work orders by project ID
 */

export async function getWorkOrdersByProject(projectId: string | number): Promise<WorkOrder[]> {
  const endpoint = `/Projects/${projectId}/workorders`;

  return fetchDataWithRetry(endpoint, (data: Array<{ id: number; name: string }>) => {
    return data.map((woApi) => ({
      id: woApi.id.toString(),
      projectId: projectId.toString(),
      orderNumber: woApi.id.toString(),
      description: woApi.name,
      // Manteniendo las aserciones de tipo para la seguridad
      status: 'pending' as const,
      priority: 'medium' as const,
    }));
  });
}

