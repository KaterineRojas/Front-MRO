import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Plus, Package } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { deleteKit } from '@/store/inventorySlice';
import { KitFilters } from './KitFilters';
import { KitTable } from './KitTable';
import { UseKitFilters } from './UseKitFilters';
import type { KitsTabProps } from './types';

export function KitsTab({
  kits,
  articles = [],
  categories,
  onCreateKit,
  onCreateFromTemplate,
  onEditKit,
  onDeleteKit,
}: KitsTabProps) {
  // Redux
  const dispatch = useAppDispatch();

  // Custom hook for filters and state
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    expandedKits,
    filteredKits,
    handleToggleExpandKit,
  } = UseKitFilters(kits);

  const handleDeleteKit = (id: number) => {
    dispatch(deleteKit(id));
    onDeleteKit(id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Kits</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCreateFromTemplate}>
              <Package className="h-4 w-4 mr-2" />
              From Template
            </Button>
            <Button onClick={onCreateKit}>
              <Plus className="h-4 w-4 mr-2" />
              Create Kit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <KitFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />

        <KitTable
          kits={filteredKits}
          articles={articles}
          categories={categories}
          expandedKits={expandedKits}
          onToggleExpand={handleToggleExpandKit}
          onEditKit={onEditKit}
          onDeleteKit={handleDeleteKit}
        />
      </CardContent>
    </Card>
  );
}
