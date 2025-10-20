import type { ItemType, StatusType, CategoryType } from '../../types/inventory';

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

export interface TemplateItem {
  articleId: number;
  quantity: number;
}

export interface TemplateFormData {
  name: string;
  description?: string;
  items: TemplateItem[];
}

export interface Template extends TemplateFormData {
  id: number;
  createdAt: string;
}

export interface EditTemplatePageProps {
  editingTemplate?: Template | null;
  onBack: () => void;
  onSave: (data: TemplateFormData) => void;
}

export interface TemplateFormProps {
  formData: TemplateFormData;
  setFormData: React.Dispatch<React.SetStateAction<TemplateFormData>>;
  handleSubmit: (e: React.FormEvent) => void;
  editing: boolean;
}

export interface ArticlesListProps {
  articles: Article[];
  formData: TemplateFormData;
  addItemToTemplate: (article: Article) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
}

export interface SelectedItemsListProps {
  formData: TemplateFormData;
  articles: Article[];
  updateItemQuantity: (articleId: number, quantity: number) => void;
  removeItemFromTemplate: (articleId: number) => void;
}
