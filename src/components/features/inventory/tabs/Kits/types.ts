import type { Article2, KitItem } from '../../types';
//import type { Kit } from '../../types';

import type { Category } from '../../services/kitService';
import type { KitCategory } from '../../services/kitService';

export interface Kit {
  id: number;
  sku: string;
  binCode: string;
  name: string;
  description: string;
  binId: number;
  category: string;
  quantity: number;
  quantityAvailable: number;
  quantityLoan: number;
  quantityReserved: number;
  imageUrl?: string;
  items: {
    id?: number;
    articleId: number;
    articleSku: string;
    articleName: string;
    articleDescription?: string;
    imageUrl?: string;
    quantity: number;
  }[];
  status: string;
  createdAt: string;
  updatedAt?: string;
}

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
  stockFilter: 'all' | 'with-stock' | 'empty';
  setStockFilter: (value: 'all' | 'with-stock' | 'empty') => void;
  kitsCount: {
    all: number;
    withStock: number;
    empty: number;
  };
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

export { Article2, KitItem };
