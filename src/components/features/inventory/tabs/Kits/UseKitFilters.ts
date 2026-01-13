
import { useState, useMemo } from 'react';
import type { Kit } from './types';

export function UseKitFilters(kits: Kit[], stockFilter: 'all' | 'with-stock' | 'empty') {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedKits, setExpandedKits] = useState<Set<number>>(new Set());

  const filteredKits = useMemo(() => {
    return kits.filter(kit => {
      //  Filtrado por término de búsqueda (binCode, name, description)
      const matchesSearch =
        kit.binCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        kit.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kit.description.toLowerCase().includes(searchTerm.toLowerCase());

      //  Filtrado por categoría
      const matchesCategory = categoryFilter === 'all' || kit.category === categoryFilter;

      // Filtrado por stock 
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'with-stock' && kit.quantity > 0) ||
        (stockFilter === 'empty' && kit.quantity === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [kits, searchTerm, categoryFilter, stockFilter]); 

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
