// Simula las llamadas al backend para Warehouses
import { apiCall } from './errorHandler';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  isActive: boolean;
}

// Datos mock de warehouses
const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Amax',
    code: 'AMX',
    location: 'La Paz, Bolivia',
    isActive: true
  },
  {
    id: 'wh-2',
    name: 'Best',
    code: 'BST',
    location: 'Santa Cruz, Bolivia',
    isActive: true
  },
  {
    id: 'wh-3',
    name: 'Central',
    code: 'CTR',
    location: 'Cochabamba, Bolivia',
    isActive: true
  }
];

// Simula delay de red
const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * GET - Obtiene todos los warehouses activos
 */
export const getWarehouses = async (): Promise<Warehouse[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return mockWarehouses.filter(wh => wh.isActive);
  });
};

/**
 * GET - Obtiene un warehouse por ID
 */
export const getWarehouseById = async (id: string): Promise<Warehouse | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const warehouse = mockWarehouses.find(wh => wh.id === id);
    return warehouse || null;
  });
};

/**
 * GET - Obtiene un warehouse por código
 */
export const getWarehouseByCode = async (code: string): Promise<Warehouse | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const warehouse = mockWarehouses.find(wh => wh.code === code);
    return warehouse || null;
  });
};
