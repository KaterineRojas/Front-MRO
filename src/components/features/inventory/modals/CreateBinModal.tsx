import React, { useState, useEffect } from 'react';
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
import { Info, Loader2 } from 'lucide-react';
//import { getBinTypes } from '../services/inventoryApi';
import { getBinTypes } from '../services/binsService';

interface Bin {
  id: number;
  binCode: string;
  type: string;
  isActive: boolean;
  description: string;
}

interface CreateBinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBin: Bin | null;
  formData: {
    binCode: string;
    type: string;
    description: string;
  };
  onFormDataChange: (data: {
    binCode: string;
    type: string;
    description: string;
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  hasStock?: boolean;
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
  const [binTypes, setBinTypes] = useState<{ value: string; label: string }[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState<string | null>(null);

  // ✅ Cargar tipos de bins desde el backend cuando se abre el modal
  useEffect(() => {
    async function loadBinTypes() {
      if (!open) return;

      try {
        setLoadingTypes(true);
        setErrorTypes(null);
        const types = await getBinTypes();
        setBinTypes(types);
        console.log('✅ Bin types loaded:', types);
      } catch (error) {
        console.error('❌ Error loading bin types:', error);
        setErrorTypes(error instanceof Error ? error.message : 'Failed to load bin types');
      } finally {
        setLoadingTypes(false);
      }
    }

    loadBinTypes();
  }, [open]);

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

          {/* ✅ Type - Selector dinámico desde el backend */}
          <div>
            <Label htmlFor="type">Type *</Label>
            {loadingTypes ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Loading types...</span>
              </div>
            ) : errorTypes ? (
              <div className="p-3 border border-destructive rounded-md bg-destructive/10">
                <p className="text-destructive text-sm">{errorTypes}</p>
              </div>
            ) : (
              <>
                <Select
                  value={formData.type}
                  onValueChange={(value: string) =>
                    onFormDataChange({ ...formData, type: value })
                  }
                  disabled={(editingBin !== null && hasStock) || binTypes.length === 0}
                  required
                >
                  <SelectTrigger 
                    id="type"
                    className={editingBin && hasStock ? 'opacity-60 cursor-not-allowed' : ''}
                  >
                    <SelectValue placeholder="Select bin type" />
                  </SelectTrigger>
                  <SelectContent>
                    {binTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingBin && hasStock && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Type cannot be changed while bin contains items
                  </p>
                )}
              </>
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
            <Button type="submit" disabled={loadingTypes || !!errorTypes}>
              {editingBin ? 'Update Bin' : 'Create Bin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}