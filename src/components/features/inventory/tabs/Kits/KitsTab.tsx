import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Plus, Boxes, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../../ui/alert';
import { useAppSelector, useAppDispatch } from '../../../../../store/hooks';
import { deleteKit, fetchKits } from '../../../../../store/slices/inventorySlice';
import { getKitCategories, type KitCategory } from '../../services/kitService';
import { KitFilters } from './KitFilters';
import { KitTable } from './KitTable';
import { UseKitFilters } from './UseKitFilters';
import type { KitsTabProps } from './types';
// Importamos los componentes de Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';


export function KitsTab({
  articles = [],
  categories,
  onCreateKit,
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

  // ✅ NUEVO: Estado para el filtro de Stock
  const [stockFilter, setStockFilter] = useState<'all' | 'with-stock' | 'empty'>('all');

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
  } = UseKitFilters(kits, stockFilter); // ✅ CAMBIO: Pasar stockFilter a UseKitFilters

  const handleDeleteKit = (id: number) => {
    dispatch(deleteKit(id));
    onDeleteKit(id);
  };

  const handleRefreshKits = () => {
    dispatch(fetchKits());
  };

  // ✅ NUEVO: Contadores de kits
  const kitsWithStock = kits.filter(k => k.quantity > 0).length;
  const emptyKits = kits.filter(k => k.quantity === 0).length;

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

        {/* Componente de filtros (barra de búsqueda y categoría) */}
        <KitFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          kitCategories={kitCategories}
          loadingCategories={loadingCategories}
        />

        {/* ✅ NUEVO: Pestañas de filtrado por Stock */}
        <Tabs
          value={stockFilter}
          onValueChange={(value:any) => setStockFilter(value as 'all' | 'with-stock' | 'empty')}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Kits ({kits.length})
            </TabsTrigger>
            <TabsTrigger value="with-stock">
              With Stock ({kitsWithStock})
            </TabsTrigger>
            <TabsTrigger value="empty">
              Empty ({emptyKits})
            </TabsTrigger>
          </TabsList>

          {/* Usamos TabsContent para envolver la tabla y el error */}
          <TabsContent value={stockFilter} className="mt-4 p-0 border-none">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}