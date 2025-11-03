import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/features/ui/card';
import { Button } from '@/components/features/ui/button';
import { Input } from '@/components/features/ui/input';
import { Trash2, Package } from 'lucide-react';
import type { SelectedItemsPanelProps } from './types';

/**
 * Reusable component for displaying and managing selected items with quantity controls
 */
export function SelectedItemsPanel({
  selectedItems,
  articles,
  onUpdateQuantity,
  onRemoveItem,
  title = "Selected Items"
}: SelectedItemsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} ({selectedItems.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items selected yet. Add items from the available items list.
            </p>
          ) : (
            selectedItems.map((item) => {
              const article = articles.find((a) => a.id === item.articleId);
              return (
                <div
                  key={item.articleId}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {article?.imageUrl ? (
                      <img src={article.imageUrl} alt={article.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{article?.sku}</p>
                    <p className="text-sm text-muted-foreground truncate">{article?.name}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.articleId, Number(e.target.value))}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemoveItem(item.articleId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
