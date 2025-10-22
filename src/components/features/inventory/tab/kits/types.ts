import type { Kit, Article, KitItem } from '../../types/inventory';
import type { Category } from '@/services/inventarioService';

export interface KitsTabProps {
  articles?: Article[];
  categories: Category[];
  onCreateKit: () => void;
  onCreateFromTemplate: () => void;
  onEditKit: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
}

export interface KitFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: Category[];
}

export interface KitTableProps {
  kits: Kit[];
  articles: Article[];
  categories: Category[];
  expandedKits: Set<number>;
  onToggleExpand: (kitId: number) => void;
  onEditKit: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
}

export interface KitRowProps {
  kit: Kit;
  articles: Article[];
  categories: Category[];
  isExpanded: boolean;
  onToggleExpand: (kitId: number) => void;
  onEditKit: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
}

export { Kit, Article, KitItem };
