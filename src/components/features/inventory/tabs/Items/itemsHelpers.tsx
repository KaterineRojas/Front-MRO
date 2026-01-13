import type { StockStatus } from './types';
import type { Article } from '../../types';

/**
 * Formatea la categoría para mostrar
 */
export function formatCategory(
  category: string,
  categories: { value: string; label: string; apiValue?: string }[]
): string {
  if (!category) return 'Uncategorized';
  
  const found = categories.find(cat => {
    const normalizedCat = cat.value.toLowerCase().replace(/[-_]/g, '');
    const normalizedCategory = category.toLowerCase().replace(/[-_]/g, '');
    return normalizedCat === normalizedCategory;
  });

  if (found) {
    return found.label;
  }

  return category
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Verifica si un artículo tiene stock
 */
export function hasAnyStock(article: Article): boolean {
  return article.totalPhysical > 0 ||
    article.quantityAvailable > 0 ||
    article.quantityOnLoan > 0 ||
    article.quantityReserved > 0;
}

/**
 * Verifica si un artículo es nuevo (creado hoy)
 */
export function isNewItem(createdAt: string): boolean {
  const today = new Date();
  const itemDate = new Date(createdAt);

  return (
    itemDate.getDate() === today.getDate() &&
    itemDate.getMonth() === today.getMonth() &&
    itemDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Obtiene el estado del stock basado en cantidad actual y mínima
 */
export function getStockStatus(current: number, min: number): StockStatus {
  if (current === 0) {
    return { label: 'Out of Stock', variant: 'destructive' };
  }
  if (current <= min) {
    return { label: 'Low Stock', variant: 'outline' };
  }
  return { label: 'In Stock', variant: 'default' };
}

/**
 * Filtra artículos según criterios de búsqueda y filtros
 */
export function filterArticles(
  articles: Article[],
  searchTerm: string,
  categoryFilter: string,
  stockFilter: 'all' | 'with-stock' | 'empty'
): Article[] {
  const filtered = articles.filter(article => {
    const matchesSearch =
      article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.bins.some(bin => bin.binCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;

    const itemIsNew = isNewItem(article.createdAt);

    // Lógica especial para 'with-stock': incluir items con stock O items nuevos
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'with-stock' && (hasAnyStock(article) || itemIsNew)) ||
      (stockFilter === 'empty' && !hasAnyStock(article));

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Si el filtro es 'with-stock', ordenar para mostrar items nuevos primero
  if (stockFilter === 'with-stock') {
    return filtered.sort((a, b) => {
      const aIsNew = isNewItem(a.createdAt);
      const bIsNew = isNewItem(b.createdAt);

      // Items nuevos primero
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;

      // Si ambos son nuevos o ambos son viejos, mantener orden original
      return 0;
    });
  }

  return filtered;
}

/**
 * Calcula contadores de items por estado de stock
 */
export function calculateItemsCount(articles: Article[]) {
  return {
    all: articles.length,
    withStock: articles.filter(hasAnyStock).length,
    empty: articles.filter(a => !hasAnyStock(a)).length,
  };
}