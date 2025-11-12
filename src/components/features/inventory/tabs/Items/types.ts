// src/components/features/inventory/tabs/Items/types.ts
import type { Article } from '../../types';
import type { ApiPayload } from '../../modals/CreateItemModal/CreateItemModal';

export type CreateArticleData = Pick<ApiPayload, 'name' | 'description' | 'category' | 'unit' | 'minStock' | 'consumable' | 'binCode' | 'imageFile'>;
export type UpdateArticleData = Pick<ApiPayload, 'name' | 'description' | 'category' | 'unit' | 'minStock' | 'consumable' | 'imageUrl' | 'imageFile' | 'sku'>;

export interface ItemsTabProps {
  articles: Article[];
  onCreateItem: (articleData: CreateArticleData) => void;
  onUpdateItem: (id: number, articleData: UpdateArticleData) => void;
  onDeleteItem: (id: number) => void;
}

export interface ItemsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  stockFilter: 'all' | 'with-stock' | 'empty';
  setStockFilter: (value: 'all' | 'with-stock' | 'empty') => void;
  categories: { value: string; label: string }[];
  categoriesLoading: boolean;
  itemsCount: {
    all: number;
    withStock: number;
    empty: number;
  };
}

export interface ItemsTableProps {
  articles: Article[];
  expandedItems: Set<number>;
  imageErrors: Set<number>;
  categories: { value: string; label: string }[];
  onToggleExpand: (id: number) => void;
  onEditItem: (article: Article) => void;
  onDeleteItem: (id: number) => void;
  onImageError: (id: number) => void;
}

export interface ItemRowProps {
  article: Article;
  isExpanded: boolean;
  imageErrors: Set<number>;
  categories: { value: string; label: string }[];
  onToggleExpand: (id: number) => void;
  onEditItem: (article: Article) => void;
  onDeleteItem: (id: number) => void;
  onImageError: (id: number) => void;
}

export interface ItemStockDistributionProps {
  article: Article;
}

export type StockStatus = {
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
};