/**
 * Transfer Module
 * 
 * Este módulo maneja todas las funcionalidades relacionadas con transferencias
 * de equipos entre ingenieros.
 */

// Main Components
export { TransferRequests } from './TransferRequests';
export { TransferForm } from '../../forms/TransferForm';

// Custom Hooks
export { useTransfers } from './useTransfers';

// Services
export {
  getTransfers,
  getAvailableUsers,
  getInventoryItems,
  createTransfer,
  acceptTransfer,
  rejectTransfer,
  cancelTransfer
} from '../../services/transferService';

// Types
export type {
  Transfer,
  TransferItem,
  InventoryItem,
  User
} from '../../services/transferService';

// Utilities
export {
  formatDate,
  getStatusColor,
  getStatusText
} from './transferUtils';