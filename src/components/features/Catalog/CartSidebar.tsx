
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../ui/sheet';
import { ScrollArea } from '../../ui/scroll-area';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import type { CartItem } from '../enginner/types';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onClearCart: () => void;
  onProceed: () => void;
}

export function CartSidebar({
  open,
  onClose,
  cartItems,
  onUpdateQuantity,
  onClearCart,
  onProceed
}: CartSidebarProps) {
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

  const handleRemove = (itemId: string) => {
    onUpdateQuantity(itemId, 0);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
            <ScrollArea className="flex-1 px-6">
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
                          <span className="text-sm font-medium w-8 text-center">
                            {cartItem.quantity}
                          </span>
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
                Proceed to Request
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
