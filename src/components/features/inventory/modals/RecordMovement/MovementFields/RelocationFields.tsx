import React from 'react';
import { Label } from '../../../../../ui/label';
import { Input } from '../../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../ui/select';
import { BinSelector } from '../../../components/BinSelector';
import type { Article } from '../../../types';
import type { MovementData } from '../types';

interface RelocationFieldsProps {
  movementData: MovementData;
  setMovementData: React.Dispatch<React.SetStateAction<MovementData>>;
  selectedItem: Article | null;
}

export function RelocationFields({ movementData, setMovementData, selectedItem }: RelocationFieldsProps) {
  // ✅ Buscar el bin seleccionado por ID
  const selectedBin = selectedItem?.bins?.find(bin => bin.binId === movementData.articleBinId);
  const maxStock = selectedBin?.quantity || 0;

  // Get all bins for the selected item
  const articleBins = selectedItem?.bins || [];

  return (
    <>
      {movementData.itemType === 'item' && (
        <div>
          <Label>Quantity *</Label>
          <Input
            type="number"
            min="1"
            max={maxStock}
            value={movementData.quantity}
            onChange={(e) => setMovementData(prev => ({ ...prev, quantity: e.target.value }))}
            placeholder="Enter quantity to relocate"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Available in BIN {selectedBin?.binCode || 'N/A'}: {maxStock} {selectedItem?.unit || 'units'}
          </p>
        </div>
      )}

      {/* New Location */}
      <div>
        <Label>New Location *</Label>
        {articleBins.length > 0 ? (
          <>
            <Select
              value={movementData.newLocationBinId > 0 ? movementData.newLocationBinId.toString() : ''}
              onValueChange={(value:any) => {
                const binId = parseInt(value);
                console.log('🔵 NEW LOCATION BIN Selected (Relocation):', binId);
                setMovementData(prev => ({ ...prev, newLocationBinId: binId }));
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new location" />
              </SelectTrigger>
              <SelectContent>
                {articleBins.map((bin) => (
                  <SelectItem key={bin.binId} value={bin.binId.toString()}>
                    <div className="flex items-center justify-between space-x-4 py-1">
                      <span className="font-mono">{bin.binCode}</span>
                      <span className="text-sm text-muted-foreground">
                        {bin.quantity} {selectedItem?.unit}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Showing bins associated with this item ({articleBins.length} bins)
            </p>
          </>
        ) : (
          <>
            <BinSelector
              value={movementData.newLocationBinId > 0 ? movementData.newLocationBinId.toString() : ''}
              onValueChange={(value) => {
                const binId = parseInt(value);
                console.log('🔵 NEW LOCATION BIN Selected (Relocation):', binId);
                setMovementData(prev => ({ ...prev, newLocationBinId: binId }));
              }}
              placeholder="Select new location"
              currentBin={selectedBin?.binCode}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Showing all available Good Condition bins
            </p>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Current location: <strong>{selectedBin?.binCode || 'N/A'}</strong>
        </p>
      </div>
    </>
  );
}