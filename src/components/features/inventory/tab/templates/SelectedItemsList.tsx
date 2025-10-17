import React from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Package } from 'lucide-react';
import type { SelectedItemsListProps } from './types';

export function SelectedItemsList({
  formData,
  articles,
  updateItemQuantity,
  removeItemFromTemplate,
}: SelectedItemsListProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Selected Items ({formData.items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {formData.items.map((item) => {
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
                    onChange={(e) => updateItemQuantity(item.articleId, Number(e.target.value))}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeItemFromTemplate(item.articleId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </>
  );
}
