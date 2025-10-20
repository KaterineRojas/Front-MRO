import { useState, useMemo } from 'react';
import type { Article } from './types';

export function UseItemFilters(articles: Article[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.binCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, categoryFilter]);

  const handleToggleExpandItem = (itemId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    expandedItems,
    filteredArticles,
    handleToggleExpandItem,
  };
}
