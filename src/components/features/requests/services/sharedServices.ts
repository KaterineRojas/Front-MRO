import { API_BASE_URL } from "./api";
import { withRetry, classifyFetchError, handleError } from "../../enginner/services/errorHandler";

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
  id?: string | number;
  unitCode: string | number;
  unitName: string;
  company: string;
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

export interface Company {
  name: string;
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

export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  businessCode: string;
  departmentName: string;
  company: string;
  active: boolean;
}

export interface WorkOrder {
  id: string | number;
  wo: string;
  projectId: string | number;
  orderNumber: string;
  serviceDesc: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
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
    return await withRetry(apiFunction);
  } catch (error) {
    const appError = handleError(error);
    console.error(`Final Error fetching from ${endpoint}:`, appError);
    throw appError;
  }
}

export async function getWarehouses(): Promise<Warehouse[]> {
  const endpoint = `/Warehouses`;
  return fetchDataWithRetry(endpoint, (data: any) => {
    if (!Array.isArray(data)) {
      console.error("API /Warehouse did not return an array:", data);
      return [];
    }

    const mappedWarehouses: Warehouse[] = data
      .map((wh: any) => {
        const id = wh.id ? wh.id.toString() : '';
        if (!id) {
          console.warn("Warehouse object missing idWh:", wh);
          return undefined;
        }
        return {
          id: id,
          name: wh.name || 'Unnamed Warehouse',
          code: wh.code || 'N/A',
          location: wh.location || undefined,
        } as Warehouse;
      })
      .filter((wh): wh is Warehouse => Boolean(wh));
    return mappedWarehouses;
  });
}

export async function getStatuses(): Promise<Status[]> {
  await delay(100);
  return [...mockStatuses];
}

export async function getDepartments(companyName: string): Promise<Department[]> {
  const endpoint = `/amx/departments/${encodeURIComponent(companyName)}`;
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log("Fetching departments from URL:", fullUrl);

  return fetchDataWithRetry(endpoint, (data: any) => {
    // Data ahora viene como array de objetos con unitCode, unitName, company
    if (!Array.isArray(data)) {
      console.error("API /departments did not return an array:", data);
      return [];
    }

    return data.map((dept: any) => ({
      id: dept.unitCode,
      unitCode: dept.unitCode,
      unitName: dept.unitName || 'Unnamed Department',
      company: dept.company,
      code: dept.unitCode,
      description: dept.unitName
    }));
  });
}

export async function getCatalogItemsByWarehouse(warehouseId: string): Promise<CatalogItem[]> {
  const endpoint = `/Inventory/by-warehouse/${warehouseId}`;
  return fetchDataWithRetry(endpoint, (data: any) => {
    if (!Array.isArray(data)) {
      console.error("API /Items did not return an array:", data);
      return [];
    }

    console.log("Raw API response for catalog items:", data);

    const mappedItems = data.map((item: any) => ({
      id: item.itemId ? item.itemId.toString() : '0',
      name: item.itemName || 'Unknown Item',
      sku: item.itemSku || `SKU-${item.itemId || '000'}`,
      description: item.itemDescription || '',
      image: item.imageUrl || '',
      category: item.itemCategory || 'General',
      availableQuantity: item.totalAvailable || 0,
      totalQuantity: item.totalQuantity || 0,
      warehouseId: warehouseId.toString(),
      warehouseName: `Warehouse ${warehouseId}`
    }));

    console.log("Mapped catalog items:", mappedItems);
    return mappedItems;
  });
}

export async function searchCatalogItems(query: string, warehouseId: string): Promise<CatalogItem[]> {
  const items = await getCatalogItemsByWarehouse(warehouseId);
  const q = query.toLowerCase();
  return items.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.sku.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q)
  );
}

export async function getCompanies(): Promise<Company[]> {
  const endpoint = `/amx/companies`;
  return fetchDataWithRetry(endpoint, (data: any) =>
    (data as string[]).map((companyName) => ({ name: companyName }))
  );
}

export async function getCustomersByCompany(companyName: string): Promise<Customer[]> {
  const endpoint = `/amx/customers/${encodeURIComponent(companyName)}`;
  return fetchDataWithRetry(endpoint, (data: any) => {
    return (data as string[]).map((customerName) => ({
      id: customerName,
      companyId: companyName,
      name: customerName,
      code: undefined,
    }));
  });
}

export async function getProjectsByCustomer(companyName: string, customerName: string): Promise<Project[]> {
  const endpoint = `/amx/projects/${encodeURIComponent(companyName)}/${encodeURIComponent(customerName)}`;
  return fetchDataWithRetry(endpoint, (data: any) => {
    return (data as string[]).map((projectName) => ({
      id: projectName,
      customerId: customerName,
      name: projectName,
      code: projectName,
      description: undefined,
    }));
  });
}

export async function getWorkOrdersByProject(companyName: string, customerName: string, projectName: string): Promise<WorkOrder[]> {
  const endpoint = `/amx/workorders/${encodeURIComponent(companyName)}/${encodeURIComponent(customerName)}/${encodeURIComponent(projectName)}`;
  return fetchDataWithRetry(endpoint, (data: any) => {
    if (!Array.isArray(data)) {
      console.error("API /workorders did not return an array:", data);
      return [];
    }

    return data.map((wo: any) => ({
      id: wo.wo,
      wo: wo.wo,
      projectId: projectName,
      orderNumber: wo.wo,
      serviceDesc: wo.serviceDesc || 'Unknown Service',
      description: wo.serviceDesc || 'Unknown Service',
      startDate: wo.startDate || '',
      endDate: wo.endDate || '',
      status: wo.status || 'OPEN',
      priority: 'medium' as const,
    }));
  });
}

export async function getUsers(status: string = 'OPEN'): Promise<Employee[]> {
  const endpoint = `/amx/employees?status=${encodeURIComponent(status)}`;
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('Fetching users from URL:', fullUrl);

  return fetchDataWithRetry(endpoint, (data: any) => {
    if (!Array.isArray(data)) {
      console.error('API /amx/employees did not return an array:', data);
      return [];
    }

    console.log('Raw API response for employees:', data);

    const mappedUsers = data.map((employee: any) => ({
      employeeId: employee.employeeId || '',
      name: employee.name || 'Unknown User',
      email: employee.email || '',
      businessCode: employee.businessCode || '',
      departmentName: employee.departmentName || '',
      company: employee.company || '',
      active: employee.active || false
    }));

    console.log('Mapped users:', mappedUsers);
    return mappedUsers;
  });
}

/**
 * Envía una imagen al backend usando multipart/form-data
 */
export async function sendImage(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file); // el backend espera el campo "file"

  const url = `${API_BASE_URL}/Items/upload-image`;
  console.log('Uploading image to URL:', url);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error al subir imagen: ${response.statusText}`);
  }

  return await response.json();
}
