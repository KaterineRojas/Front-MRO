import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../ui/card';
import { Button } from '../../../../../ui/button';
import { Input } from '../../../../../ui/input';
import { Label } from '../../../../../ui/label';
import { Badge } from '../../../../../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../ui/select';
import { Package, Plus, Minus, X } from 'lucide-react';
import { ImageWithFallback } from '../../../../../figma/ImageWithFallback';
import type {
  LoanFormData,
  Warehouse,
  CatalogItem,
  ItemSearches,
  FilteredItems,
  DropdownState,
} from '../types';
import type { CartItem } from '../../../types';

interface ItemRowProps {
  item: { itemId: string; itemName: string; quantity: number };
  index: number;
  isFromCart: boolean;
  cartItem?: CartItem;
  catalogItems: CatalogItem[];
  itemSearches: ItemSearches;
  filteredItems: FilteredItems;
  dropdownOpen: DropdownState;
  dropdownRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  onItemSearch: (index: number, value: string) => void;
  onSelectItem: (index: number, item: CatalogItem) => void;
  onToggleDropdown: (index: number) => void;
  onUpdateItem: (index: number, field: string, value: any) => void;
  onRemoveItem: (index: number) => void;
  validateStock: (itemId: string, quantity: number) => boolean;
}

/**
 * Individual item row in the items list
 */
function ItemRow({
  item,
  index,
  isFromCart,
  cartItem,
  catalogItems,
  itemSearches,
  filteredItems,
  dropdownOpen,
  dropdownRefs,
  onItemSearch,
  onSelectItem,
  onToggleDropdown,
  onUpdateItem,
  onRemoveItem,
  validateStock,
}: ItemRowProps) {
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [quantityValue, setQuantityValue] = useState('');

  const selectedItemData = item.itemId
    ? catalogItems.find((i) => i.id === item.itemId)
    : null;
  const itemImage = isFromCart && cartItem
    ? cartItem.item.image
    : selectedItemData?.image;
  const maxQuantity = selectedItemData?.availableQuantity ?? 999;

  const handleQuantityEdit = () => {
    setEditingQuantity(true);
    setQuantityValue(item.quantity.toString());
  };

  const handleQuantityBlur = () => {
    const newQuantity = Math.max(
      1,
      Math.min(parseInt(quantityValue) || 1, maxQuantity)
    );
    onUpdateItem(index, 'quantity', newQuantity);
    setEditingQuantity(false);
    setQuantityValue('');
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuantityBlur();
    } else if (e.key === 'Escape') {
      setEditingQuantity(false);
      setQuantityValue('');
    }
  };

  return (
    <div className="flex gap-4 p-3 rounded-lg border bg-card">
      {itemImage && (
        <ImageWithFallback
          src={itemImage}
          alt={item.itemName}
          className="w-20 h-20 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{item.itemName}</h4>
            {isFromCart ? (
              <p className="text-xs text-muted-foreground">
                {cartItem?.item.sku || 'N/A'}
              </p>
            ) : (
              <div
                className="space-y-2"
                ref={(el) => {
                  if (el) dropdownRefs.current[index] = el;
                }}
              >
                <Input
                  placeholder={
                    item.itemId
                      ? 'Click to change selection...'
                      : 'Type to search items...'
                  }
                  value={itemSearches[index] || ''}
                  onChange={(e) => onItemSearch(index, e.target.value)}
                  onClick={() => onToggleDropdown(index)}
                  readOnly={!!item.itemId}
                  className={`text-xs ${item.itemId ? 'cursor-pointer' : ''}`}
                />
                {dropdownOpen[index] && (
                  <div
                    className="fixed z-50 border rounded-md bg-background shadow-xl max-h-80 overflow-y-auto"
                    style={{
                      width: dropdownRefs.current[index]?.offsetWidth || '100%',
                      top:
                        (dropdownRefs.current[index]?.getBoundingClientRect()
                          .top ?? 0) - 10,
                      left: dropdownRefs.current[
                        index
                      ]?.getBoundingClientRect().left,
                      transform: 'translateY(-100%)',
                    }}
                  >
                    {(filteredItems[index] || catalogItems).length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No items available
                      </div>
                    ) : (
                      (filteredItems[index] || catalogItems).map((catItem) => (
                        <button
                          key={catItem.id}
                          type="button"
                          className={`w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center gap-2 ${
                            item.itemId === catItem.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => onSelectItem(index, catItem)}
                        >
                          <ImageWithFallback
                            src={catItem.image}
                            alt={catItem.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span>
                            {catItem.name} (Available: {catItem.availableQuantity})
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={() => onRemoveItem(index)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                onUpdateItem(index, 'quantity', Math.max(1, item.quantity - 1))
              }
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            {editingQuantity ? (
              <Input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
                onBlur={handleQuantityBlur}
                onKeyDown={handleQuantityKeyDown}
                autoFocus
                className="text-sm font-medium w-8 text-center h-7 p-1"
              />
            ) : (
              <span
                className="text-sm font-medium w-8 text-center cursor-pointer hover:bg-accent rounded px-1 py-0.5"
                onClick={handleQuantityEdit}
              >
                {item.quantity}
              </span>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                onUpdateItem(
                  index,
                  'quantity',
                  Math.min(item.quantity + 1, maxQuantity)
                )
              }
              disabled={item.quantity >= maxQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {item.itemId && !validateStock(item.itemId, item.quantity) && (
              <Badge variant="destructive" className="text-xs">
                Insufficient stock
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              Max: {maxQuantity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ItemsCardProps {
  formData: LoanFormData;
  warehouses: Warehouse[];
  catalogItems: CatalogItem[];
  cartItems: CartItem[];
  cartItemsCount: number;
  itemSearches: ItemSearches;
  filteredItems: FilteredItems;
  dropdownOpen: DropdownState;
  dropdownRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  itemsContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  onWarehouseChange: (warehouseId: string) => void;
  onItemSearch: (index: number, value: string) => void;
  onSelectItem: (index: number, item: CatalogItem) => void;
  onToggleDropdown: (index: number) => void;
  onUpdateItem: (index: number, field: string, value: any) => void;
  onRemoveItem: (index: number) => void;
  onAddNewItem: () => void;
  validateStock: (itemId: string, quantity: number) => boolean;
}

/**
 * Left panel card for items selection
 */
export function ItemsCard({
  formData,
  warehouses,
  catalogItems,
  cartItems,
  cartItemsCount,
  itemSearches,
  filteredItems,
  dropdownOpen,
  dropdownRefs,
  itemsContainerRef,
  onWarehouseChange,
  onItemSearch,
  onSelectItem,
  onToggleDropdown,
  onUpdateItem,
  onRemoveItem,
  onAddNewItem,
  validateStock,
}: ItemsCardProps) {
  return (
    <Card className="flex flex-col h-[calc(100vh-16rem)]">
      <CardHeader>
        <CardTitle>Items to Request</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div>
          <Label htmlFor="warehouse">
            <div className="flex items-center gap-2 mb-1.5">
              <Package className="h-4 w-4" />
              Warehouse
            </div>
          </Label>
          <Select value={formData.warehouseId} onValueChange={onWarehouseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items List */}
        <div
          className="flex-1 overflow-y-auto space-y-3 -mx-6 px-6"
          ref={itemsContainerRef}
        >
          {formData.items.map((item, index) => (
            <ItemRow
              key={index}
              item={item}
              index={index}
              isFromCart={index < cartItemsCount}
              cartItem={cartItems[index]}
              catalogItems={catalogItems}
              itemSearches={itemSearches}
              filteredItems={filteredItems}
              dropdownOpen={dropdownOpen}
              dropdownRefs={dropdownRefs}
              onItemSearch={onItemSearch}
              onSelectItem={onSelectItem}
              onToggleDropdown={onToggleDropdown}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
              validateStock={validateStock}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onAddNewItem}
          disabled={!formData.warehouseId}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
        {!formData.warehouseId && (
          <p className="text-sm text-muted-foreground">
            Select a Warehouse to add items.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
