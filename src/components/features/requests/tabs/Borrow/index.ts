/**
 * Borrow Module
 * 
 * Este módulo maneja todas las funcionalidades relacionadas con solicitudes
 * de préstamo de equipos y materiales.
 */

// Main Components
export { BorrowRequests } from './BorrowRequests';
export { BorrowRequests as default } from './BorrowRequests';

// Forms
export { LoanForm } from '../../forms/LoanForm';

// Services
export {
  getBorrowRequests,
  getBorrowRequestById,
  createBorrowRequest,
  updateBorrowRequestStatus,
  deleteBorrowRequest,
  returnBorrowedItems
} from './borrowService';

// Types
export type {
  BorrowRequest,
  BorrowItem
} from './borrowService';
