import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';
import { Box, Package } from 'lucide-react';
import type { ItemStockSettingsProps } from './types';

export function ItemStockSettingsSection({ formData, onFormDataChange }: ItemStockSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b dark:border-gray-700">
        <Box className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Stock Settings</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unit" className="flex items-center gap-2">
            <Box className="h-3 w-3" />
            Unit of Measure *
          </Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => onFormDataChange({ unit: e.target.value })}
            placeholder="e.g., pieces, sheets, kg, liters"
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="minStock" className="flex items-center gap-2">
            <Package className="h-3 w-3" />
            Minimum Stock Level *
          </Label>
          <Input
            id="minStock"
            type="number"
            min="0"
            value={formData.minStock}
            onChange={(e) => onFormDataChange({ minStock: e.target.value })}
            placeholder="0"
            required
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Alert when stock falls below this level
          </p>
        </div>
      </div>
    </div>
  );
}