export interface Article {
  id: number;
  imageUrl?: string;
  sku: string;
  name: string;
  description: string;
  category: 'office-supplies' | 'technology' | 'tools' | 'clothing' | 'electronics' | 'furniture' | 'vehicles' | 'safety-equipment' | 'medical-supplies' | 'cleaning-supplies' | 'construction-materials' | 'laboratory-equipment';
  type: 'consumable' | 'non-consumable' | 'pending-purchase';
  currentStock: number;
  cost: number;
  binCode: string;
  unit: string;
  supplier: string;
  minStock: number;
  location: string;
  status: 'good-condition' | 'on-revision' | 'scrap' | 'repaired';
  createdAt: string;
}

export interface KitItem {
  articleId: number;
  articleBinCode: string;
  articleName: string;
  quantity: number;
}

export interface Kit {
  id: number;
  binCode: string;
  name: string;
  description: string;
  category: 'office-supplies' | 'technology' | 'tools' | 'clothing' | 'electronics' | 'furniture' | 'vehicles' | 'safety-equipment' | 'medical-supplies' | 'cleaning-supplies' | 'construction-materials' | 'laboratory-equipment';
  items: KitItem[];
  imageUrl?: string;
  status: 'good-condition' | 'on-revision' | 'scrap' | 'repaired';
  createdAt: string;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  createdAt: string;
}

export interface Bin {
  id: number;
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}

export interface MovementData {
  itemType: 'item' | 'kit';
  movementType: 'entry' | 'exit' | 'relocation';
  articleSKU: string;
  articleBinCode: string;
  kitBinCode: string;
  quantity: string;
  unitPrice: string;
  status: Article['status'];
  newLocation: string;
  notes: string;
}

export interface Transaction {
  id: number;
  type: 'entry' | 'exit' | 'adjustment';
  subtype: 'purchase' | 'return' | 'audit' | 'consumption' | 'loan' | 'sale';
  articleCode: string;
  articleDescription: string;
  quantity: number;
  unit: string;
  reference: string;
  notes: string;
  user: string;
  project: string;
  date: string;
  createdAt: string;
}
