import { Input } from '../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Search, Loader2 } from 'lucide-react';

interface ItemsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  stockFilter: 'all' | 'with-stock' | 'empty';
  setStockFilter: (value: 'all' | 'with-stock' | 'empty') => void;
  categories: { value: string; label: string }[];
  categoriesLoading: boolean;
  itemsCount: {
    all: number;
    withStock: number;
    empty: number;
  };
}

export function ItemsFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  categories,
  categoriesLoading,
  itemsCount,
}: ItemsFiltersProps) {
  return (
    <div className="flex items-center space-x-4 mb-4">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by BIN code, name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stock Filter */}
      <div className="w-48">
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Items ({itemsCount.all})
            </SelectItem>
            <SelectItem value="with-stock">
              With Stock ({itemsCount.withStock})
            </SelectItem>
            <SelectItem value="empty">
              Empty ({itemsCount.empty})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="w-48">
        <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={categoriesLoading}>
          <SelectTrigger>
            <SelectValue>
              {categoriesLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              ) : (
                categoryFilter === 'all' ? 'All Categories' : categories.find(cat => cat.value === categoryFilter)?.label || 'All Categories'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}