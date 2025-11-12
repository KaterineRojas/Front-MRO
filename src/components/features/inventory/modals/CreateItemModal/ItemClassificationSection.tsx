import { Label } from '../../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Layers, Tag, TrendingDown, RotateCcw } from 'lucide-react';
import type { ItemClassificationProps, ArticleTypeUI } from './types';

export function ItemClassificationSection({
  formData,
  categories,
  categoriesLoading,
  onFormDataChange,
}: ItemClassificationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Layers className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Classification</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category" className="flex items-center gap-2">
            <Tag className="h-3 w-3" />
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value: string) => onFormDataChange({ category: value })}
            disabled={categoriesLoading}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="typeUI" className="flex items-center gap-2">
            {formData.typeUI === 'consumable' ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <RotateCcw className="h-3 w-3" />
            )}
            Item Type *
          </Label>
          <Select
            value={formData.typeUI}
            onValueChange={(value: ArticleTypeUI) => onFormDataChange({ typeUI: value })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consumable">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3" />
                  Consumable
                </div>
              </SelectItem>
              <SelectItem value="non-consumable">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-3 w-3" />
                  Non-Consumable
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}