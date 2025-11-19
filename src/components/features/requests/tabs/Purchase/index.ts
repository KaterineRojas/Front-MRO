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
  updatePurchaseRequestPriority,
  confirmPurchaseBought
} from '../../services/purchaseService';

// Types
export type {
  PurchaseRequest,
  PurchaseItem
} from '../../services/purchaseService';

// Utilities
export {
  formatDate,
  getStatusColor,
  getStatusText,
  getPriorityColor,
  getPriorityText,
  formatCurrency
} from './purchaseUtils';