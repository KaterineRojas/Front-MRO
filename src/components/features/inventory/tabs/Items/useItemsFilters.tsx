// src/components/features/inventory/tabs/Items/useItemsFilters.ts
import { useState, useMemo } from 'react';
import type { Article } from '../../types';
import { filterArticles } from './itemsHelpers';

export function useItemsFilters(articles: Article[], stockFilter: 'all' | 'with-stock' | 'empty') {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const filteredArticles = useMemo(() => {
    return filterArticles(articles, searchTerm, categoryFilter, stockFilter);
  }, [articles, searchTerm, categoryFilter, stockFilter]);

  const handleToggleExpandItem = (itemId: number) => {
    setExpandedItems(prev => {
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