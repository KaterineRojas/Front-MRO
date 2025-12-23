import type { ArticleTypeUI, ItemFormData } from './types';
import type { Article } from '../../types';

/**
 * Obtiene el tipo UI basado en el artículo
 */
export function getUIType(article: Article | null): ArticleTypeUI {
  if (article?.consumable === false) return 'non-consumable';
  if (article?.consumable === true) return 'consumable';
  return 'consumable';
}

/**
 * Crea el formData inicial basado en el artículo editado
 */
export function getInitialFormData(
  editingArticle: Article | null,
  categories: { value: string; label: string }[]
): ItemFormData {
  if (editingArticle) {
    return {
      name: editingArticle.name,
      description: editingArticle.description,
      category: editingArticle.category,
      typeUI: getUIType(editingArticle),
      binCode: editingArticle.bins?.[0]?.binCode || '',
      unit: editingArticle.unit || '',
      minStock: (editingArticle.minStock ?? 0).toString(),
      imageUrl: editingArticle.imageUrl || ''
    };
  }

  const defaultCategory = categories.length > 0 ? categories[0].value : 'other';

  return {
    name: '',
    description: '',
    category: defaultCategory,
    typeUI: 'consumable',
    binCode: '',
    unit: '',
    minStock: '',
    imageUrl: ''
  };
}

/**
 * Calcula el stock total de los bins
 */
export function calculateTotalStock(bins: any[], availableQuantity: number): number {
  return bins.reduce((sum, bin) => sum + (bin.currentStock || 0), 0) + availableQuantity;
}

/**
 * Lee un archivo como Data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}