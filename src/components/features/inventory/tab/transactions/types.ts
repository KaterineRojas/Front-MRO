export interface Movement {
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

export interface CycleCountItem {
  id: number;
  code: string;
  description: string;
  systemStock: number;
  physicalStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  variance: number;
}

export interface MovementFiltersProps {
  filterType: string;
  setFilterType: (value: string) => void;
  filterSubtype: string;
  setFilterSubtype: (value: string) => void;
  filterUser: string;
  setFilterUser: (value: string) => void;
  filterProject: string;
  setFilterProject: (value: string) => void;
  uniqueUsers: string[];
  uniqueProjects: string[];
}

export interface MovementTableProps {
  movements: Movement[];
  getMovementIcon: (type: Movement['type']) => JSX.Element;
  getMovementBadge: (type: Movement['type'], subtype: Movement['subtype']) => JSX.Element;
}

export interface CycleCountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleCountItems: CycleCountItem[];
  updatePhysicalStock: (id: number, newStock: number) => void;
  saveCycleCount: () => void;
  printCycleCount: () => void;
}
