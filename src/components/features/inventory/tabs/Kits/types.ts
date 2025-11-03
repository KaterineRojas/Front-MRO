import type {  Article2, KitItem } from '../../types';
import type { Kit } from '../../types';

import type { Category } from '../../services/kitService';
import type { KitCategory } from '../../services/kitService';

export interface KitsTabProps {
  articles?: Article2[];
  categories: Category[];
  onCreateKit: () => void;
  onEditKit: (kit: Kit) => void;
  onUseAsTemplate: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
}

export interface KitFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  kitCategories: KitCategory[];
  loadingCategories: boolean;
}

export interface KitTableProps {
  kits: Kit[];
  articles: Article2[];
  categories: Category[];
  expandedKits: Set<number>;
  onToggleExpand: (kitId: number) => void;
  onEditKit: (kit: Kit) => void;
  onUseAsTemplate: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
  onRefreshKits: () => void;
}

export interface KitRowProps {
  kit: Kit;
  articles: Article2[];
  categories: Category[];
  isExpanded: boolean;
  onToggleExpand: (kitId: number) => void;
  onEditKit: (kit: Kit) => void;
  onUseAsTemplate: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
  onRefreshKits: () => void;
}

export { Kit, Article2, KitItem };
