import React from 'react';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Search } from 'lucide-react';

interface BinsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  stockFilter: 'all' | 'empty' | 'with-stock';
  setStockFilter: (value: 'all' | 'empty' | 'with-stock') => void;
  uniqueTypes: string[];
  binsCount: {
    all: number;
    empty: number;
    withStock: number;
  };
}

export function BinsFilters({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  stockFilter,
  setStockFilter,
  uniqueTypes,
  binsCount,
}: BinsFiltersProps) {
  return (
    <div className="flex items-center space-x-4 mb-4">
      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bins by code or description..."
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
              All Bins ({binsCount.all})
            </SelectItem>
            <SelectItem value="with-stock">
              With Stock ({binsCount.withStock})
            </SelectItem>
            <SelectItem value="empty">
              Empty ({binsCount.empty})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      <div className="w-48">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}