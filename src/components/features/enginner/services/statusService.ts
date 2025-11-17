// Simula las llamadas al backend para estados/statuses
import { apiCall } from './errorHandler';

export interface Status {
  id: string;
  value: string;
  label: string;
  color: string;
}

// Datos mock de estados
const mockStatuses: Status[] = [
  {
    id: 'status-1',
    value: 'pending',
    label: 'Pending',
    color: 'orange'
  },
  {
    id: 'status-2',
    value: 'approved',
    label: 'Approved',
    color: 'green'
  },
  {
    id: 'status-3',
    value: 'rejected',
    label: 'Rejected',
    color: 'red'
  },
  {
    id: 'status-4',
    value: 'completed',
    label: 'Completed',
    color: 'blue'
  },
  {
    id: 'status-5',
    value: 'transferred',
    label: 'Transferred',
    color: 'purple'
  }
];

// Simula delay de red
const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * GET - Obtiene todos los estados disponibles
 */
export const getStatuses = async (): Promise<Status[]> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    return [...mockStatuses];
  });
};

/**
 * GET - Obtiene un estado por su valor
 */
export const getStatusByValue = async (value: string): Promise<Status | null> => {
  return apiCall(async () => {
    await simulateNetworkDelay();
    const status = mockStatuses.find(s => s.value === value);
    return status || null;
  });
};
