export interface KitItem {
  id: number;
  name: string;
  description: string;
  category: string;
  type: 'consumable' | 'non-consumable';
  quantity: number;
  unit: string;
  imageUrl?: string;
}

export interface LoanItem {
  id: number;
  articleBinCode: string;
  articleName: string;
  articleDescription: string;
  articleType: 'consumable' | 'non-consumable';
  quantity: number;
  unit: string;
  status: 'pending' | 'active' | 'returned' | 'partial' | 'lost' | 'damaged';
  imageUrl?: string;
  isKit?: boolean;
  kitItems?: KitItem[];
}

export interface LoanRequest {
  id: number;
  requestNumber: string;
  borrower: string;
  borrowerEmail: string;
  department: string;
  project: string;
  requestedLoanDate: string;
  expectedReturnDate: string;
  loanDate?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  requestedBy: string;
  approvedBy?: string;
  processedBy?: string;
  createdAt: string;
  items: LoanItem[];
}
