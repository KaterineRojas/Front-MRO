// src/features/inventory/modals/RecordMovement/types.ts

// New Transaction-based types
export interface TransactionFormData {
  transactionType: number;        // Type value (0=Entry, 1=Exit, 2=Transfer, 3=Adjustment, 4=Kit)
  transactionSubType: number;     // SubType value
  itemId: number;                 // Selected item ID
  quantity: number;               // Quantity (positive or negative based on type)
  fromBinId?: number;             // Source bin (required for Exit and Transfer)
  toBinId?: number;               // Destination bin (required for Entry and Transfer)
  notes: string;                  // Free text notes
  transactionDate?: string;       // Optional date/time (admin only)
  // Purchase-specific fields
  unitCost?: number;              // Unit cost for Purchase transactions
}

// Purchase request data for API
export interface PurchaseRequest {
  itemId: number;
  binId: number;
  quantity: number;
  unitCost: number;
  notes: string;
}

// Legacy types (keep for backward compatibility)
export type MovementType = 'entry' | 'exit' | 'relocation' | 'adjustment';
export type ItemType = 'item' | 'kit';
export type ItemStatus = 'good-condition' | 'on-revision' | 'scrap';

export interface MovementData {
  itemType: ItemType;
  movementType: MovementType;
  articleId: number;
  articleBinId: number;
  kitBinCode: string;
  quantity: string;
  status: ItemStatus;
  newLocationBinId: number;
  notes: string;
  adjustmentReason?: string;
}