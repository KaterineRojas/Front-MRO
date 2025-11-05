import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Info } from 'lucide-react';

interface Bin {
  id: number;
  binCode: string;
  type:
  | 'good-condition'
  | 'on-revision'
  | 'scrap'
  | 'hold'
  | 'packing'
  | 'reception';
  isActive: boolean;
  description: string;
}

interface CreateBinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBin: Bin | null;
  formData: {
    binCode: string;
    type:
    | 'good-condition'
    | 'on-revision'
    | 'scrap'
    | 'hold'
    | 'packing'
    | 'reception';
    isActive: boolean;
    description: string;
  };
  onFormDataChange: (data: {
    binCode: string;
    type:
    | 'good-condition'
    | 'on-revision'
    | 'scrap'
    | 'hold'
    | 'packing'
    | 'reception';
    isActive: boolean;
    description: string;
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  hasStock?: boolean; // Nueva prop para indicar si tiene stock
}

export function CreateBinModal({
  open,
  onOpenChange,
  editingBin,
  formData,
  onFormDataChange,
  onSubmit,
  hasStock = false,
}: CreateBinModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingBin ? 'Edit Bin' : 'Register New Bin'}</DialogTitle>
          <DialogDescription>
            {editingBin
              ? 'Update the bin information below.'
              : 'Fill in the details to create a new bin.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Alerta informativa cuando el bin tiene stock */}
          {editingBin && hasStock && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This bin contains items. Only BIN Code and Description can be edited.
              </AlertDescription>
            </Alert>
          )}

          {/* BIN Code */}
          <div>
            <Label htmlFor="binCode">BIN Code *</Label>
            <Input
              id="binCode"
              value={formData.binCode}
              onChange={(e) =>
                onFormDataChange({ ...formData, binCode: e.target.value })
              }
              placeholder="e.g., BIN-A-001"
              required
            />
          </div>

          {/* Type - Deshabilitado si tiene stock */}
          <div>
            <Label>Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: string) =>
                onFormDataChange({
                  ...formData,
                  type: value as
                    | 'good-condition'
                    | 'on-revision'
                    | 'scrap'
                    | 'hold'
                    | 'packing'
                    | 'reception',
                })
              }
              disabled={editingBin !== null && hasStock}
            >
              <SelectTrigger className={editingBin && hasStock ? 'opacity-60 cursor-not-allowed' : ''}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good-condition">Good Condition</SelectItem>
                <SelectItem value="on-revision">On Revision</SelectItem>
                <SelectItem value="scrap">Scrap</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="packing">Packing</SelectItem>
                <SelectItem value="reception">Reception</SelectItem>
              </SelectContent>
            </Select>
            {editingBin && hasStock && (
              <p className="text-xs text-muted-foreground mt-1">
                Type cannot be changed while bin contains items
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder="Description of this bin..."
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingBin ? 'Update Bin' : 'Create Bin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}