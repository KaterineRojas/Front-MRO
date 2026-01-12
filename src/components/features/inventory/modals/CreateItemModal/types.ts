// src/components/features/inventory/modals/CreateItemModal/types.ts
import type { Article } from '../../types';

export interface ApiPayload {
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  consumable: boolean;
  binCode?: string;
  idBinCode?: number;
  imageUrl?: string | null;
  imageFile?: File | null;
  sku?: string;
}

export interface CreateItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingArticle: Article | null;
  onSubmit: (articleData: ApiPayload) => void;
  categories: { value: string; label: string; apiValue?: string }[];
  categoriesLoading: boolean;
}

export type ArticleTypeUI = 'consumable' | 'non-consumable' | 'pending-purchase';

export interface ItemFormData {
  name: string;
  description: string;
  category: string;
  typeUI: ArticleTypeUI;
  binCode: string;
  unit: string;
  minStock: string;
  imageUrl: string;
}

export interface ItemBasicInfoProps {
  formData: ItemFormData;
  onFormDataChange: (data: Partial<ItemFormData>) => void;
}

export interface ItemClassificationProps {
  formData: ItemFormData;
  categories: { value: string; label: string; apiValue?: string }[];
  categoriesLoading: boolean;
  onFormDataChange: (data: Partial<ItemFormData>) => void;
}

export interface ItemStockSettingsProps {
  formData: ItemFormData;
  onFormDataChange: (data: Partial<ItemFormData>) => void;
}

export interface ItemImageSectionProps {
  imageUrl: string;
  imageFile: File | null;
  editingArticle: Article | null;
  onImageChange: (file: File) => void;
  onImageRemove: () => void;
}

export interface ItemBinDistributionProps {
  article: Article;
  bins: any[];
}
