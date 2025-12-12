/**
 * borrowUtils.ts
 * Funciones utilitarias puras para el módulo Borrow
 * Siguiendo principios SOLID: Single Responsibility
 */

import type { LoanRequest } from './borrowService';

/**
 * Obtiene el color del badge según el estado
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Sent':
      return '!bg-green-500 !text-white border-green-500';
    case 'Pending':
      return '!bg-yellow-500 !text-white border-yellow-500';
    case 'Packing':
      return '!bg-blue-500 !text-white border-blue-500';
    case 'Approved':
      return '!bg-purple-500 !text-white border-purple-500';
    case 'Rejected':
      return '!bg-red-500 !text-white border-red-500';
    default:
      return '!bg-gray-500 !text-white border-gray-500';
  }
}

/**
 * Obtiene estilos inline como backup si Tailwind no funciona
 */
export function getStatusStyle(status: string): React.CSSProperties {
  switch (status) {
    case 'Sent':
      return { backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' };
    case 'Pending':
      return { backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' };
    case 'Packing':
      return { backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' };
    case 'Approved':
      return { backgroundColor: '#8b5cf6', color: 'white', borderColor: '#8b5cf6' };
    case 'Rejected':
      return { backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' };
    default:
      return { backgroundColor: '#6b7280', color: 'white', borderColor: '#6b7280' };
  }
}

/**
 * Obtiene el texto legible del estado
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'Sent':
      return 'Sent';
    case 'Pending':
      return 'Pending';
    case 'Packing':
      return 'Packing';
    case 'Approved':
      return 'Approved';
    case 'Rejected':
      return 'Rejected';
    default:
      return status; // Devuelve el estado original si no se reconoce
  }
}

/**
 * Formatea una fecha en formato legible
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Determina si una solicitud puede ser cancelada
 */
export function canCancelBorrowRequest(request: LoanRequest): boolean {
  return request.status === 'Pending';
}

/**
 * Determina si se pueden devolver todos los items
 */
export function canReturnAll(request: LoanRequest): boolean {
  // Return actions are currently disabled for all statuses
  return false;
}

/**
 * Filtra solicitudes de préstamo según criterios de búsqueda
 */
export function filterBorrowRequests(
  requests: LoanRequest[],
  searchTerm: string,
  statusFilter: string,
  warehouseFilter: string
): LoanRequest[] {
  let filtered = requests;

  // Filtrar por término de búsqueda
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(request =>
      request.requestNumber.toLowerCase().includes(searchLower) ||
      request.projectId.toLowerCase().includes(searchLower) ||
      request.departmentId.toLowerCase().includes(searchLower) ||
      request.warehouseName.toLowerCase().includes(searchLower) ||
      request.items.some(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.sku && item.sku.toLowerCase().includes(searchLower))
      )
    );
  }

  // Filtrar por estado
  if (statusFilter !== 'all') {
    filtered = filtered.filter(request => request.status === statusFilter);
  }

  // Filtrar por almacén
  if (warehouseFilter !== 'all') {
    filtered = filtered.filter(request => request.warehouseName === warehouseFilter);
  }

  return filtered;
}

/**
 * Cuenta solicitudes por estado
 */
export function getStatusCount(
  requests: LoanRequest[],
  status: string
): number {
  if (status === 'all') return requests.length;
  return requests.filter(req => req.status === status).length;
}

/**
 * Valida si hay algún filtro activo
 */
export function hasActiveFilters(
  searchTerm: string,
  statusFilter: string,
  warehouseFilter: string
): boolean {
  return (
    searchTerm.length > 0 ||
    statusFilter !== 'all' ||
    warehouseFilter !== 'all'
  );
}