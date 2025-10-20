import type { Article } from '../../types/inventory';

export interface ItemsTabProps {
  articles: Article[];
  categories: { value: string; label: string }[];
  onArticleUpdate: (articles: Article[]) => void;
  onArticleDelete: (id: number) => void;
  getStockStatus: (current: number, min: number) => { label: string; variant: any };
  getStatusBadge: (status: string) => JSX.Element;
  getTypeIcon: (type: string) => JSX.Element;
}

export interface ItemFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: { value: string; label: string }[];
}

export interface ItemTableProps {
  articles: Article[];
  categories: { value: string; label: string }[];
  expandedItems: Set<number>;
  onToggleExpand: (itemId: number) => void;
  onEditArticle: (article: Article) => void;
  onDeleteArticle: (id: number) => void;
  getStockStatus: (current: number, min: number) => { label: string; variant: any };
  getStatusBadge: (status: string) => JSX.Element;
  getTypeIcon: (type: string) => JSX.Element;
}

export interface ItemRowProps {
  article: Article;
  categories: { value: string; label: string }[];
  isExpanded: boolean;
  onToggleExpand: (itemId: number) => void;
  onEditArticle: (article: Article) => void;
  onDeleteArticle: (id: number) => void;
  getStockStatus: (current: number, min: number) => { label: string; variant: any };
  getStatusBadge: (status: string) => JSX.Element;
  getTypeIcon: (type: string) => JSX.Element;
}

export { Article };
