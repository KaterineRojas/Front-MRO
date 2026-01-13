import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../ui/card';
import { Button } from '../../../../../ui/button';
import { Input } from '../../../../../ui/input';
import { Label } from '../../../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../ui/select';
import { Switch } from '../../../../../ui/switch';
import { Plus, X } from 'lucide-react';
import { ImageWithFallback } from '../../../../../figma/ImageWithFallback';
import type { PurchaseItem, PurchaseFormData, ItemSearches, DropdownState, FilteredItems } from '../types';
import type { CatalogItem, Warehouse } from '../../../services/sharedServices';
import { validateUrl } from '../utils';

interface ItemsCardProps {
  formData: PurchaseFormData;
  warehouses: Warehouse[];
  catalogItems: CatalogItem[];
  itemSearches: ItemSearches;
  filteredItems: FilteredItems;
  dropdownOpen: DropdownState;
  dropdownRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
  onWarehouseChange: (value: string) => void;
  onItemSearch: (index: number, value: string) => void;
  onSelectExistingItem: (index: number, item: CatalogItem) => void;
  onToggleDropdown: (index: number) => void;
  onUpdateItem: (index: number, field: keyof PurchaseItem, value: any) => void;
  onRemoveItem: (index: number) => void;
  onAddNewItem: () => void;
  onItemTypeToggle: (index: number, isExisting: boolean) => void;
  getTotalCost: () => number;
}

export function ItemsCard({
  formData,
  warehouses,
  catalogItems,
  itemSearches,
  filteredItems,
  dropdownOpen,
  dropdownRefs,
  onWarehouseChange,
  onItemSearch,
  onSelectExistingItem,
  onToggleDropdown,
  onUpdateItem,
  onRemoveItem,
  onAddNewItem,
  onItemTypeToggle,
  getTotalCost
}: ItemsCardProps) {
  return (
    <Card className="flex flex-col h-[calc(100vh-16rem)]">
      <CardHeader>
        <CardTitle>Items to Purchase</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div>
          <Label>Warehouse</Label>
          <Select value={formData.warehouseId} onValueChange={onWarehouseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.code ? `${warehouse.name} (${warehouse.code})` : warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {formData.items.map((item, index) => (
            <ItemRow
              key={index}
              index={index}
              item={item}
              itemSearch={itemSearches[index] || ''}
              isDropdownOpen={dropdownOpen[index] || false}
              filteredOptions={filteredItems[index] || catalogItems}
              catalogItems={catalogItems}
              dropdownRef={(el) => { if (el) dropdownRefs.current[index] = el; }}
              canRemove={formData.items.length > 1}
              onSearch={(value) => onItemSearch(index, value)}
              onSelectItem={(catalogItem) => onSelectExistingItem(index, catalogItem)}
              onToggleDropdown={() => onToggleDropdown(index)}
              onUpdateField={(field, value) => onUpdateItem(index, field, value)}
              onRemove={() => onRemoveItem(index)}
              onTypeToggle={(isExisting) => onItemTypeToggle(index, isExisting)}
            />
          ))}
        </div>

        <Button type="button" variant="outline" onClick={onAddNewItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Another Item
        </Button>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Estimated Total Cost:</span>
            <span className="text-xl font-bold">${getTotalCost().toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ItemRowProps {
  index: number;
  item: PurchaseItem;
  itemSearch: string;
  isDropdownOpen: boolean;
  filteredOptions: CatalogItem[];
  catalogItems: CatalogItem[];
  dropdownRef: (el: HTMLDivElement | null) => void;
  canRemove: boolean;
  onSearch: (value: string) => void;
  onSelectItem: (item: CatalogItem) => void;
  onToggleDropdown: () => void;
  onUpdateField: (field: keyof PurchaseItem, value: any) => void;
  onRemove: () => void;
  onTypeToggle: (isExisting: boolean) => void;
}

function ItemRow({
  index,
  item,
  itemSearch,
  isDropdownOpen,
  filteredOptions,
  catalogItems,
  dropdownRef,
  canRemove,
  onSearch,
  onSelectItem,
  onToggleDropdown,
  onUpdateField,
  onRemove,
  onTypeToggle
}: ItemRowProps) {
  const selectedExistingItem = item.isExisting 
    ? catalogItems.find(ci => ci.name === item.name) 
    : null;

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold">Item {index + 1}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-muted-foreground">New</span>
            <Switch
              checked={item.isExisting}
              onCheckedChange={(checked: boolean) => onTypeToggle(checked)}
              aria-label="Toggle item type"
            />
            <span className="text-xs uppercase text-muted-foreground">Existing</span>
          </div>
        </div>
        {canRemove && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            {selectedExistingItem && (
              <ImageWithFallback
                src={selectedExistingItem.image}
                alt={selectedExistingItem.name}
                className="h-16 w-16 rounded object-cover border"
              />
            )}
            <div className="flex-1">
              <Label>Item Name</Label>
              {item.isExisting ? (
                <div className="space-y-2 relative" ref={dropdownRef}>
                  <Input
                    placeholder={item.name ? "Click to change selection..." : "Type to search existing items..."}
                    value={itemSearch}
                    onChange={(e) => onSearch(e.target.value)}
                    onClick={onToggleDropdown}
                    readOnly={!!item.name}
                    className={item.name ? "cursor-pointer" : ""}
                  />
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full border rounded-md bg-background shadow-lg max-h-40 overflow-y-auto">
                      {filteredOptions.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No items found matching "{itemSearch}"
                        </div>
                      ) : (
                        filteredOptions.map((catalogItem) => (
                          <button
                            key={catalogItem.id}
                            type="button"
                            className={`w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center gap-2 ${
                              item.name === catalogItem.name ? 'bg-accent' : ''
                            }`}
                            onClick={() => onSelectItem(catalogItem)}
                          >
                            <ImageWithFallback
                              src={catalogItem.image}
                              alt={catalogItem.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <span>{catalogItem.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  placeholder="Enter new item name..."
                  value={item.name}
                  onChange={(e) => onUpdateField('name', e.target.value)}
                  required
                />
              )}
            </div>
          </div>

          <div className="rounded-lg bg-card/60 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity === 0 ? '' : item.quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      onUpdateField('quantity', 0);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue) && numValue >= 1) {
                        onUpdateField('quantity', numValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || item.quantity === 0) {
                      onUpdateField('quantity', 1);
                    }
                  }}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Estimated Cost (per unit)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.estimatedCost === 0 ? '' : item.estimatedCost}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      onUpdateField('estimatedCost', 0);
                    } else {
                      onUpdateField('estimatedCost', parseFloat(value) || 0);
                    }
                  }}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Total Cost</Label>
                <div className="flex h-10 items-center justify-center rounded-md border bg-muted px-3 text-sm font-semibold">
                  {`$${(item.estimatedCost * item.quantity).toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Label>Reference Link (optional)</Label>
          <Input
            type="url"
            placeholder="https://example.com/product"
            value={item.link}
            onChange={(e) => onUpdateField('link', e.target.value)}
          />
          {item.link && !validateUrl(item.link) && (
            <p className="text-sm text-destructive mt-1">
              Invalid URL format
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
