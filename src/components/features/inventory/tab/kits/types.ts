import type { Kit, Article, KitItem } from '../../types/inventory';

export interface KitsTabProps {
  articles?: Article[];
  categories: { value: string; label: string }[];
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
  categories: { value: string; label: string }[];
}

export interface KitTableProps {
  kits: Kit[];
  articles: Article[];
  categories: { value: string; label: string }[];
  expandedKits: Set<number>;
  onToggleExpand: (kitId: number) => void;
  onEditKit: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
}

export interface KitRowProps {
  kit: Kit;
  articles: Article[];
  categories: { value: string; label: string }[];
  isExpanded: boolean;
  onToggleExpand: (kitId: number) => void;
  onEditKit: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
}

export { Kit, Article, KitItem };
