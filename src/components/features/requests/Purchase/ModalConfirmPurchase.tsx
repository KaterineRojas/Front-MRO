import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { Package } from 'lucide-react';
import type { PurchaseRequest } from './purchaseService';

interface ModalConfirmPurchaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PurchaseRequest | null;
  onConfirm: (quantities: Record<string, number>) => Promise<void>;
}

export function ModalConfirmPurchase({
  open,
  onOpenChange,
  request,
  onConfirm,
}: ModalConfirmPurchaseProps) {
  const [purchasedQuantities, setPurchasedQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar cantidades cuando se abre el modal
  useEffect(() => {
    if (open && request) {
      const initialQuantities: Record<string, number> = {};
      request.items.forEach((item, index) => {
        initialQuantities[index.toString()] = item.quantity;
      });
      setPurchasedQuantities(initialQuantities);
    }
  }, [open, request]);

  const handleClose = () => {
    onOpenChange(false);
    setPurchasedQuantities({});
  };

  const handleQuantityChange = (key: string, value: number, maxQuantity: number) => {
    const validValue = Math.min(Math.max(0, value), maxQuantity);
    setPurchasedQuantities(prev => ({
      ...prev,
      [key]: validValue
    }));
  };

  const handleConfirm = async () => {
    if (!request) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(purchasedQuantities);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Confirm Purchase - Items Bought</DialogTitle>
          <DialogDescription>
            Review the items you purchased. You can adjust quantities if you bought fewer items than requested.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Purchased</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.items.map((item, index) => {
                  const key = index.toString();
                  return (
                    <TableRow key={key}>
                      <TableCell>
                        {item.imageUrl ? (
                          <ImageWithFallback
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center rounded bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.sku && <p className="font-mono text-sm">{item.sku}</p>}
                        <p className="text-sm">{item.name}</p>
                      </TableCell>
                      <TableCell>
                        <p>{item.quantity}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={purchasedQuantities[key] ?? item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              handleQuantityChange(key, value, item.quantity);
                            }}
                            className="w-20 text-foreground bg-background"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Purchase'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ModalConfirmPurchase;
