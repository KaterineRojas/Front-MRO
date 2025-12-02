import { API_BASE_URL } from "./api";
import { withRetry, classifyFetchError, handleError } from "../../enginner/services/errorHandler";
// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
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
  id: string | number;
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

const mockStatuses: Status[] = [
  { id: 'pending', name: 'Pending', color: 'yellow' },
  { id: 'approved', name: 'Approved', color: 'blue' },
  { id: 'rejected', name: 'Rejected', color: 'red' },
  { id: 'completed', name: 'Completed', color: 'green' }
];

async function fetchDataWithRetry<T>(
  endpoint: string,
  dataMapper: (data: any) => T,
): Promise<T> {
  const apiFunction = async () => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw await classifyFetchError(response);
    }
    const data = await response.json();
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
  const endpoint = `/Warehouses`;
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
        const id = wh.id ? wh.id.toString() : '';
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
 * Get all statuses
 */
export async function getStatuses(): Promise<Status[]> {
  await delay(100);
  return [...mockStatuses];
}


/**
 * Get all departments from real API: /api/Department
 */
export async function getDepartments(): Promise<Department[]> {
  const endpoint = `/Department`;
  console.log("Fetching departments from endpoint:", endpoint);

  return fetchDataWithRetry(endpoint, (data: any) => {
    if (!Array.isArray(data)) {
      console.error("API /Department returned non-array:", data);
      return [];
    }
    return data.map((dept: any) => ({
      id: dept.idDepartament?.toString() ?? "0",
      name: dept.name ?? "Unnamed Department",
      code: dept.code || undefined,
      description: dept.description || undefined
    }));
  });
}

/**
 * Get catalog items by warehouse
 */
export async function getCatalogItemsByWarehouse(warehouseId: string): Promise<CatalogItem[]> {
  const endpoint = `/Inventory/by-warehouse/${warehouseId}`;
  //http://localhost:5048/api/Items/1
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
      sku: item.Sku || `SKU-${item.itemId || '000'}`,
      description: item.itemDescription || '',
      image: item.imageUrl || '',
      category: item.Category || 'General',
      availableQuantity: item.totalAvailable || 0,
      totalQuantity: item.totalQuantity || 0,
      warehouseId: warehouseId.toString(),
      warehouseName: `Warehouse ${warehouseId}`
    }));
  });
}


/**
 * Search catalog items by name or SKU
 */
export async function searchCatalogItems(query: string, warehouseId: string): Promise<CatalogItem[]> {
  const items = await getCatalogItemsByWarehouse(warehouseId);
  const q = query.toLowerCase();
  return items.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.sku.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q)
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

