import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Plus, Boxes, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../../ui/alert';
import { useAppSelector, useAppDispatch } from '../../../../../store/hooks';
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
  onEditKit,
  onUseAsTemplate,
  onDeleteKit,
}: KitsTabProps) {
  const dispatch = useAppDispatch();
  const { kits, loading, error } = useAppSelector((state) => state.inventory);

  const [kitCategories, setKitCategories] = useState<KitCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [stockFilter, setStockFilter] = useState<'all' | 'with-stock' | 'empty'>('all');

  useEffect(() => {
    dispatch(fetchKits());

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

  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    expandedKits,
    filteredKits,
    handleToggleExpandKit,
  } = UseKitFilters(kits, stockFilter);

  const handleDeleteKit = (id: number) => {
    dispatch(deleteKit(id));
    onDeleteKit(id);
  };

  const handleRefreshKits = () => {
    dispatch(fetchKits());
  };

  const kitsCount = {
    all: kits.length,
    withStock: kits.filter(k => k.quantity > 0).length,
    empty: kits.filter(k => k.quantity === 0).length,
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
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          kitsCount={kitsCount}
        />

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
      </CardContent>
    </Card>
  );
}