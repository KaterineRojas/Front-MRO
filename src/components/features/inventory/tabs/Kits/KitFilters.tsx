import React from 'react';
import { Input } from '../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Search, Loader2 } from 'lucide-react';
import type { KitFiltersProps } from './types';

export function KitFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  kitCategories,
  loadingCategories,
  stockFilter,
  setStockFilter,
  kitsCount,
}: KitFiltersProps) {
  return (
    <div className="flex items-center space-x-4 mb-4">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search kits by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/*  Stock Filter */}
      <div className="w-48">
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Kits ({kitsCount.all})
            </SelectItem>
            <SelectItem value="with-stock">
              With Stock ({kitsCount.withStock})
            </SelectItem>
            <SelectItem value="empty">
              Empty ({kitsCount.empty})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="w-48">
        <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={loadingCategories}>
          <SelectTrigger>
            <SelectValue>
              {loadingCategories ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              ) : (
                categoryFilter === 'all' ? 'All Categories' : kitCategories.find(cat => cat.name === categoryFilter)?.name || 'All Categories'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {kitCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}