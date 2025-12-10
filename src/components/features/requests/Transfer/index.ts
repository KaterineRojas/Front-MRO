/**
 * Transfer Module
 * 
 * Este módulo maneja todas las funcionalidades relacionadas con transferencias
 * de equipos entre ingenieros.
 */

// Main Components
export { TransferRequests } from './TransferRequests';
export { TransferForm } from './TransferForm';

// Custom Hooks
export { useTransfers } from './useTransfers';

// Services
export {
  getTransfersIncoming,
  getTransfersOutgoing,
  getTransferId,
  getInventoryTransfer,
  createTransfer,
  acceptTransfer,
  rejectTransfer,
  deleteTransfer
} from './transferService';

// Types
export type {
  Transfer,
  TransferItem,
  InventoryItem,
  User
} from './transferService';

// Utilities
export {
  formatDate,
  getStatusColor,
  getStatusText
} from './transferUtils';