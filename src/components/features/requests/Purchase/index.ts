/**
 * Purchase Module
 * 
 * Este módulo maneja todas las funcionalidades relacionadas con solicitudes
 * de compra de equipos y materiales.
 */

// Main Components
export { PurchaseRequests } from './PurchaseRequests';
export { PurchaseRequests as default } from './PurchaseRequests';

// Custom Hooks
export { usePurchaseRequests } from './usePurchaseRequests';

// Services
export {
  getPurchaseRequests,
  getPurchaseRequestById,
  createPurchaseRequest,
  updatePurchaseRequestStatus,
  deletePurchaseRequest,
  updatePurchaseRequestReason,
  confirmPurchaseBought
} from './purchaseService';

// Types
export type {
  PurchaseRequest,
  PurchaseItem
} from './purchaseService';

// Utilities
export {
  formatDate,
  getStatusColor,
  getStatusText,
  getReasonColor,
  getReasonText,
  formatCurrency
} from './purchaseUtils';