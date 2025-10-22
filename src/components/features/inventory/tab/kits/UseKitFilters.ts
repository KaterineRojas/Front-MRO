import { useState, useMemo } from 'react';
import type { Kit } from './types';

export function UseKitFilters(kits: Kit[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedKits, setExpandedKits] = useState<Set<number>>(new Set());

  const filteredKits = useMemo(() => {
    // Normalize category for comparison (matches API format transformation)
    const normalizeCategory = (cat: string | undefined) =>
      cat ? cat.toLowerCase().replace(/\s+/g, '-') : '';

    return kits.filter((kit) => {
      const matchesSearch =
        kit.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kit.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' ||
        normalizeCategory(kit.category) === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [kits, searchTerm, categoryFilter]);

  const handleToggleExpandKit = (kitId: number) => {
    setExpandedKits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(kitId)) {
        newSet.delete(kitId);
      } else {
        newSet.add(kitId);
      }
      return newSet;
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    expandedKits,
    filteredKits,
    handleToggleExpandKit,
  };
}
