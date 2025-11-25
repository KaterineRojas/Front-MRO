import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui2/dialog';
import { Button } from '../../ui2/button';
import { Input } from '../../ui2/input';
import { Label } from '../../ui2/label';
import { Textarea } from '../../ui2/textarea';
import { Loader2, PackageMinus } from 'lucide-react';

interface DismantleKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kitName: string;
  maxQuantity: number;
  quantity: number;
  notes: string;
  onQuantityChange: (value: number) => void;
  onNotesChange: (value: string) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DismantleKitModal({
  open,
  onOpenChange,
  kitName,
  maxQuantity,
  quantity,
  notes,
  onQuantityChange,
  onNotesChange,
  onConfirm,
  isSubmitting,
}: DismantleKitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PackageMinus className="h-5 w-5 mr-2" />
            Dismantle Kit
          </DialogTitle>
          <DialogDescription>
            Disassemble "{kitName}" to return its items back to inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="dismantle-quantity">
              Quantity to Dismantle * 
              <span className="text-xs text-muted-foreground ml-2">
                (Available: {maxQuantity})
              </span>
            </Label>
            <Input
              id="dismantle-quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => onQuantityChange(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
              placeholder="Enter quantity"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Enter how many kits you want to dismantle (max: {maxQuantity})
            </p>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="dismantle-notes">Notes (Optional)</Label>
            <Textarea
              id="dismantle-notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add any notes about this dismantle operation..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              This will disassemble {quantity} kit(s) and return all component items back to inventory.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isSubmitting || quantity < 1 || quantity > maxQuantity}
            type="submit" className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Dismantling...
              </>
            ) : (
              <>
                <PackageMinus className="h-4 w-4 mr-2" />
                Dismantle {quantity} Kit{quantity > 1 ? 's' : ''}
              </>
            )}
                  
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}