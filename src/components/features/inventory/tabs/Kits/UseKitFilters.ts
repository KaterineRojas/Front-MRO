// src/components/features/inventory/tabs/kits/UseKitFilters.ts (CORREGIDO)

import { useState, useMemo } from 'react';
import type { Kit } from './types'; // Asumiendo que Kit está importado correctamente

export function UseKitFilters(kits: Kit[], stockFilter: 'all' | 'with-stock' | 'empty') {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedKits, setExpandedKits] = useState<Set<number>>(new Set());

  // ✅ ÚNICA DECLARACIÓN: Contiene toda la lógica combinada
  const filteredKits = useMemo(() => {
    return kits.filter(kit => {
      // 1. Filtrado por término de búsqueda (binCode, name, description)
      const matchesSearch =
        kit.binCode?.toLowerCase().includes(searchTerm.toLowerCase()) || // Uso el binCode, como en tu primer bloque
        kit.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || // Agrego sku por seguridad si el campo está disponible
        kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kit.description.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Filtrado por categoría
      const matchesCategory = categoryFilter === 'all' || kit.category === categoryFilter;

      // 3. Filtrado por stock (NUEVO)
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'with-stock' && kit.quantity > 0) ||
        (stockFilter === 'empty' && kit.quantity === 0);

      // Combinar todos los filtros
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [kits, searchTerm, categoryFilter, stockFilter]); // Dependencias correctas

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
