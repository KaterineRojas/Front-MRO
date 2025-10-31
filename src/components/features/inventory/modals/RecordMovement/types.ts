// src/features/inventory/modals/RecordMovement/types.ts
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
  //unitPrice: string;
  status: ItemStatus;
  newLocationBinId: number;      
  notes: string;
  adjustmentReason?: string;
}