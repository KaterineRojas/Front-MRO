/**
 * borrowUtils.ts
 * Funciones utilitarias puras para el módulo Borrow
 * Siguiendo principios SOLID: Single Responsibility
 */

import type { BorrowRequest } from './borrowService';

/**
 * Obtiene el color del badge según el estado
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'approved':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Obtiene el texto legible del estado
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'Active';
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
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
export function canCancelBorrowRequest(request: BorrowRequest): boolean {
  return request.status === 'pending';
}

/**
 * Determina si se pueden devolver todos los items
 */
export function canReturnAll(request: BorrowRequest): boolean {
  return request.status === 'completed' || request.status === 'approved';
}

/**
 * Filtra solicitudes de préstamo según criterios de búsqueda
 */
export function filterBorrowRequests(
  requests: BorrowRequest[],
  searchTerm: string,
  statusFilter: string,
  warehouseFilter: string
): BorrowRequest[] {
  let filtered = requests;

  // Filtrar por término de búsqueda
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(request =>
      request.requestNumber.toLowerCase().includes(searchLower) ||
      request.projectName.toLowerCase().includes(searchLower) ||
      request.departmentName.toLowerCase().includes(searchLower) ||
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
    filtered = filtered.filter(request => request.warehouseId === warehouseFilter);
  }

  return filtered;
}

/**
 * Cuenta solicitudes por estado
 */
export function getStatusCount(
  requests: BorrowRequest[],
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