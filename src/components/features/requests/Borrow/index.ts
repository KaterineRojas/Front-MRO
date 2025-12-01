/**
 * Borrow Module - SOLID Architecture
 * 
 * Este módulo sigue principios SOLID:
 * - Single Responsibility: Cada archivo tiene una responsabilidad única
 * - Open/Closed: Extensible sin modificar código existente
 * - Liskov Substitution: Funciones puras intercambiables
 * - Interface Segregation: Exports específicos según necesidad
 * - Dependency Inversion: Dependencias mediante interfaces
 */

// ============================================
// Components
// ============================================
export { BorrowRequests } from './BorrowRequests';
export { BorrowRequests as default } from './BorrowRequests';

// ============================================
// Forms
// ============================================
export { LoanForm } from './LoanForm';

// ============================================
// Hooks (Custom Logic)
// ============================================
export { useBorrowRequests } from './useBorrowRequests';

// ============================================
// Utilities (Pure Functions)
// ============================================
export {
  getStatusColor,
  getStatusText,
  formatDate,
  canCancelBorrowRequest,
  canReturnAll,
  filterBorrowRequests,
  getStatusCount,
  hasActiveFilters
} from './borrowUtils';

// ============================================
// Services (API Layer)
// ============================================
export {
  getBorrowRequests,
  getBorrowRequestById,
  createBorrowRequest,
  updateBorrowRequestStatus,
  deleteBorrow,
  returnBorrowedItems
} from './borrowService';

// ============================================
// Types
// ============================================
export type {
  BorrowRequest,
  BorrowItem
} from './borrowService';