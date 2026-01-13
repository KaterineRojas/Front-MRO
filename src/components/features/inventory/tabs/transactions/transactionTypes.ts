// Transaction types matching .NET 8 backend API

export type TransactionType =
  | 'Entry'
  | 'Exit'
  | 'Loan'
  | 'Return'
  | 'Relocation'
  | 'Adjustment'
  | 'Kit'
  | 'KitCreated';

export interface Transaction {
  id: number;
  transactionType: TransactionType;
  subType: string;
  quantityChange: number;
  itemName: string;
  itemSku: string;
  fromBin: string | null;
  toBin: string | null;
  notes: string | null;
  createdAt: string;
}

export interface TransactionsTableProps {
  transactions: Transaction[];
  loading?: boolean;
  showItemColumn?: boolean;
  title?: string;
  onItemClick?: (itemSku: string) => void;
  onBinClick?: (binCode: string) => void;
}

export interface TransactionFilters {
  types: TransactionType[];
  dateFrom: string | null;
  dateTo: string | null;
  searchQuery: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}
