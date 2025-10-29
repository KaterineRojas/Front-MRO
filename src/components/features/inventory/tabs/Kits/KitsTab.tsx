import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Plus, Boxes, Package, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../../ui/alert';
import { useAppSelector } from '../../../../../store/hooks';
import { useAppDispatch } from '../../../../../store/hooks';
import { deleteKit, fetchKits } from '../../../../../store/slices/inventorySlice';
import { getKitCategories, type KitCategory } from '../../services/kitService';
import { KitFilters } from './KitFilters';
import { KitTable } from './KitTable';
import { UseKitFilters } from './UseKitFilters';
import type { KitsTabProps } from './types';

export function KitsTab({
  articles = [],
  categories,
  onCreateKit,
  onCreateFromTemplate,
  onEditKit,
  onUseAsTemplate,
  onDeleteKit,
}: KitsTabProps) {
  // Redux
  const dispatch = useAppDispatch();
  const { kits, loading, error } = useAppSelector((state) => state.inventory);

  // Local state for kit categories
  const [kitCategories, setKitCategories] = useState<KitCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch kits and categories on component mount
  useEffect(() => {
    dispatch(fetchKits());

    // Load kit categories
    async function loadKitCategories() {
      try {
        setLoadingCategories(true);
        const cats = await getKitCategories();
        setKitCategories(cats);
      } catch (err) {
        console.error('Error loading kit categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadKitCategories();
  }, [dispatch]);

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

  const handleRefreshKits = () => {
    dispatch(fetchKits());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-2xl font-bold">
              <Boxes className="h-6 w-6 mr-2" />
              Kits
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage bundles of multiple items
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCreateFromTemplate}>
              <Package className="h-4 w-4 mr-2" />
              From Template
            </Button>
            <Button onClick={onCreateKit}>
              <Plus className="h-4 w-4 mr-2" />
              Register Kit
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
          kitCategories={kitCategories}
          loadingCategories={loadingCategories}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading kits...</span>
          </div>
        ) : (
          <KitTable
            kits={filteredKits}
            articles={articles}
            categories={categories}
            expandedKits={expandedKits}
            onToggleExpand={handleToggleExpandKit}
            onEditKit={onEditKit}
            onUseAsTemplate={onUseAsTemplate}
            onDeleteKit={handleDeleteKit}
            onRefreshKits={handleRefreshKits}
          />
        )}
      </CardContent>
    </Card>
  );
}
