import type { ItemType, StatusType, CategoryType } from '../../types/inventory';
import type { Category } from '@/services/inventarioService';

export interface Article {
  id: number;
  sku: string;
  name: string;
  description?: string;
  binCode?: string;
  imageUrl?: string;
  category?: string | CategoryType;
  type?: ItemType;
  currentStock?: number;
  cost?: number;
  unit?: string;
  supplier?: string;
  minStock?: number;
  location?: string;
  status?: string | StatusType;
  createdAt?: string;
}

export interface SelectedItem {
  articleId: number;
  quantity: number;
}

export interface ItemSelectorProps {
  articles: Article[];
  selectedItems: SelectedItem[];
  onAddItem: (article: Article) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  title?: string;
}

export interface SelectedItemsPanelProps {
  selectedItems: SelectedItem[];
  articles: Article[];
  onUpdateQuantity: (articleId: number, quantity: number) => void;
  onRemoveItem: (articleId: number) => void;
  title?: string;
}
