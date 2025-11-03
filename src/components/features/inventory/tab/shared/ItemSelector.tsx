import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/features/ui/card';
import { Input } from '@/components/features/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/features/ui/select';
import { Button } from '@/components/features/ui/button';
import { Badge } from '@/components/features/ui/badge';
import { Search, Plus, Package } from 'lucide-react';
import type { ItemSelectorProps } from './types';

/**
 * Reusable component for selecting items from a list with search and filter capabilities
 */
export function ItemSelector({
  articles,
  selectedItems,
  onAddItem,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  title = "Available Items"
}: ItemSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="space-y-4 mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU, name, description or BIN code..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
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

        {/* Items List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {articles.map((article) => {
            const isSelected = selectedItems.some((item) => item.articleId === article.id);
            return (
              <div
                key={article.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt={article.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{article.sku}</p>
                  <p className="text-sm text-muted-foreground truncate">{article.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{article.description}</p>
                </div>
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Added
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => onAddItem(article)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
