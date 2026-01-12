import type { CartItem, User } from '../../../enginner/types';
import type {
  Warehouse,
  CatalogItem,
  Company,
  Customer,
  Project,
  WorkOrder,
} from '../../services/sharedServices';

// Re-export shared types for convenience
export type { Warehouse, CatalogItem, Company, Customer, Project, WorkOrder };

/**
 * Props for the LoanForm component
 */
export interface LoanFormProps {
  cartItems: CartItem[];
  clearCart: () => void;
  currentUser: User;
  onBack: (() => void) | null;
  onBorrowCreated?: () => Promise<void>;
}

/**
 * Individual loan item within the form
 */
export interface LoanItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

/**
 * Main form data structure for loan requests
 */
export interface LoanFormData {
  items: LoanItem[];
  department: string;
  returnDate: string;
  notes: string;
  warehouseId: string;
  company: string;
  customer: string;
  project: string;
  workOrder: string;
  address: string;
  googleMapsUrl: string;
  zipCode: string;
}

/**
 * State for tracking which dropdowns are open
 */
export type DropdownState = Record<number, boolean>;

/**
 * State for item search inputs
 */
export type ItemSearches = Record<number, string>;

/**
 * State for filtered catalog items per index
 */
export type FilteredItems = Record<number, CatalogItem[]>;

/**
 * Company hierarchy data state
 */
export interface CompanyDataState {
  companies: Company[];
  customers: Customer[];
  projects: Project[];
  workOrders: WorkOrder[];
  loadingCompanies: boolean;
  loadingCustomers: boolean;
  loadingProjects: boolean;
  loadingWorkOrders: boolean;
  companiesLoaded: boolean;
}

/**
 * Quantity editing state
 */
export interface QuantityEditState {
  editingIndex: number | null;
  editingValue: string;
}

/**
 * Payload for creating a borrow request
 */
export interface CreateBorrowPayload {
  requesterId: string;
  warehouseId: number;
  companyId: string;
  customerId: string;
  departmentId: string;
  projectId: string;
  workOrderId: string;
  expectedReturnDate: string;
  notes: string;
  address: string;
  googleMapsUrl: string;
  zipCode: string;
  items: {
    itemId: number;
    quantityRequested: number;
  }[];
}
