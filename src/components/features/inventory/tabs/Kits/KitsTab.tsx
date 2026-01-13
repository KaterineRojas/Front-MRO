import { useEffect, useState } from 'react';
import { Plus, Boxes, AlertCircle, Filter, Layers } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../../../store/hooks';
import { deleteKit, fetchKits } from '../../../../../store/slices/inventorySlice';
import { getKitCategories, type KitCategory } from '../../services/kitService';
import { KitTable } from './KitTable';
import { UseKitFilters } from './UseKitFilters';
import type { KitsTabProps } from './types';
import { Button } from '../../components/Button'
import { SearchBar } from '../../components/SearchBar'
import { FilterSelect } from '../../components/FilterSelect'
import { fetchArticlesFromApi } from '../../services/inventoryApi'

export function KitsTab({
  articles = [],
  categories,
  onCreateKit,
  onEditKit,
  onUseAsTemplate,
  onDeleteKit,
}: KitsTabProps) {
  const dispatch = useAppDispatch();
  const { kits, error } = useAppSelector((state) => state.inventory);

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

  const stockOptions = [
    { value: 'all', label: `All Status (${kitsCount.all})` },
    { value: 'with-stock', label: `Available (${kitsCount.withStock})` },
    { value: 'empty', label: `Out of Stock (${kitsCount.empty})` },
  ];

  const categoryOptions = kitCategories.map((cat) => ({
    value: String(cat.id),
    label: cat.name,
  }));

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">

      <div className="p-6 border-b dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Boxes className="h-6 w-6 mr-2 text-gray-700 dark:text-gray-300" />
            Kits
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage bundles of multiple items
          </p>
        </div>

        <Button
          variant="success"
          onClick={onCreateKit}
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Kit
        </Button>
      </div>

      <div className="p-6 space-y-6">

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white dark:bg-[#0A0A0A] p-4 rounded-xl shadow-sm border dark:border-gray-800">

          <div className="w-full">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search kits by name, SKU or description..."
              className="w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">

            {/* <FilterSelect
              value={String(categoryFilter || '')}
              onChange={(val) => setCategoryFilter(val)}
              options={categoryOptions}
              placeholder="All Categories"
              isLoading={loadingCategories}
              icon={<Layers className="h-4 w-4" />}
              allOptionIncluded={true}
            /> */}

            <FilterSelect
              value={stockFilter}
              onChange={(val) => setStockFilter(val as any)}
              options={stockOptions}
              placeholder="Filter by Stock"
              icon={<Filter className="h-4 w-4" />}
            />

          </div>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-800 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
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
      </div>
    </div>
  );
}