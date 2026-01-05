export interface CountedArticle {
  code: string;
  entryId: number;
  description: string;
  zone: string;
  totalRegistered: number;
  physicalCount: number;
  status: 'match' | 'discrepancy';
  observations?: string;
  adjustment?: number;
  adjustmentReason?: string;
  imageUrl?: string;
}

export interface DiscrepancyAdjustment {
  code: string;
  adjustedQuantity: number;
  reason: string;
}

export interface CycleCountDetailData {
  id: number;
  date: string;
  completedDate?: string;
  zone: string;
  status: 'pending' | 'in-progress' | 'completed';
  countType: 'Annual' | 'Biannual' | 'Spot Check';
  auditor: string;
  articles: CountedArticle[];
  totalItems: number;
  counted: number;
  discrepancies: number;
  adjustmentsApplied?: boolean;
  countedByUserId: number;
}

export interface CycleCountDetailViewProps {
  countData: CycleCountDetailData;
  onBack: () => void;
  onAdjustmentsApplied?: (updatedData: CycleCountDetailData) => void;
}

// CycleCountView types
export interface Article {
  id: string;
  code: string;
  description: string;
  type: 'consumable' | 'non-consumable';
  zone: 'Good Condition' | 'Damaged' | 'Quarantine';
  totalRegistered: number;
  entryId?: number;
  physicalCount?: number;
  status?: 'match' | 'discrepancy';
  observations?: string;
  imageUrl?: string;
}

export interface CycleCountViewProps {
  onBack: () => void;
  onComplete?: (completedData: {
    date: string;
    completedDate: string;
    zone: string;
    status: 'completed';
    countType: 'Annual' | 'Biannual' | 'Spot Check';
    auditor: string;
    totalItems: number;
    counted: number;
    discrepancies: number;
    articles: Article[];
  }) => void;
  onSaveProgress?: (progressData: {
    date: string;
    zone: string;
    status: 'in-progress';
    countType: 'Annual' | 'Biannual' | 'Spot Check';
    auditor: string;
    totalItems: number;
    counted: number;
    discrepancies: number;
    articles: Article[];
  }) => void;
  existingCountData?: {
    id?: number;
    articles: Article[];
    countType: 'Annual' | 'Biannual' | 'Spot Check';
    auditor: string;
    zone: string;
  };
  initialConfig?: {
    zone: string;
    countType: 'Annual' | 'Biannual' | 'Spot Check';
    auditor: string;
  };
}
