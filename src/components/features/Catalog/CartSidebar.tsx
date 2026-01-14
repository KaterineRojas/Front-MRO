
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../ui/sheet';
import { ScrollArea } from '../../ui/scroll-area';
import { Input } from '../../ui/input';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import type { CartItem } from '../requests/types';

type RequestType = 'borrow' | 'purchase';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onClearCart: () => void;
  onProceed: () => void;
  requestType: RequestType;
}

export function CartSidebar({
  open,
  onClose,
  cartItems,
  onUpdateQuantity,
  onClearCart,
  onProceed,
  requestType
}: CartSidebarProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleIncrement = (item: CartItem) => {
    const availableQuantity = item.item.availableQuantity || 0;
    if (item.quantity < availableQuantity) {
      onUpdateQuantity(item.item.id, item.quantity + 1);
    }
  }; 

  const handleDecrement = (item: CartItem) => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.item.id, item.quantity - 1);
    }
  };

  const handleQuantityEdit = (itemId: string, currentQuantity: number) => {
    setEditingItemId(itemId);
    setEditValue(currentQuantity.toString());
  };

  const handleQuantityInputChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setEditValue(numValue.toString());
  };

  const handleQuantityInputBlur = (item: CartItem) => {
    const newQuantity = Math.max(1, Math.min(parseInt(editValue) || 1, item.item.availableQuantity || 0));
    onUpdateQuantity(item.item.id, newQuantity);
    setEditingItemId(null);
    setEditValue('');
  };

  const handleQuantityInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, item: CartItem) => {
    if (e.key === 'Enter') {
      handleQuantityInputBlur(item);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditValue('');
    }
  };


  const handleRemove = (itemId: string) => {
    onUpdateQuantity(itemId, 0);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const proceedLabel = requestType === 'purchase' ? 'Proceed to Purchase' : 'Proceed to Borrow';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Shopping Cart</SheetTitle>
              <SheetDescription>
                {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
              </SheetDescription>
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                className="text-destructive"
              >
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-muted-foreground">
              <p>Your cart is empty</p>
              <p className="text-sm mt-1">Add items from the catalog</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 max-h-[calc(100vh-280px)]">
              <div className="space-y-4 py-4">
                {cartItems.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="flex gap-4 p-3 rounded-lg border bg-card"
                  >
                    <ImageWithFallback
                      src={cartItem.item.image}
                      alt={cartItem.item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{cartItem.item.name}</h4>
                          <p className="text-xs text-muted-foreground">{cartItem.item.sku}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleRemove(cartItem.item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDecrement(cartItem)}
                            disabled={cartItem.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          {editingItemId === cartItem.item.id ? (
                            <Input
                              type="number"
                              min="1"
                              max={cartItem.item.availableQuantity || 999}
                              value={editValue}
                              onChange={(e) => handleQuantityInputChange(e.target.value)}
                              onBlur={() => handleQuantityInputBlur(cartItem)}
                              onKeyDown={(e) => handleQuantityInputKeyDown(e, cartItem)}
                              autoFocus
                              className="text-sm font-medium w-8 text-center h-7 p-1"
                            />
                          ) : (
                            <span 
                              className="text-sm font-medium w-8 text-center cursor-pointer hover:bg-accent rounded px-1 py-0.5"
                              onClick={() => handleQuantityEdit(cartItem.item.id, cartItem.quantity)}
                            >
                              {cartItem.quantity}
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleIncrement(cartItem)}
                            disabled={cartItem.quantity >= (cartItem.item.availableQuantity || 0)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Max: {cartItem.item.availableQuantity || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Items:</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <Button onClick={onProceed} className="w-full">
                {proceedLabel}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
