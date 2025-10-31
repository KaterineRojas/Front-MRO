import React from 'react';
import { Label } from '../../../../../ui/label';
import { Input } from '../../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../ui/select';
import type { Article } from '../../../types';
import type { MovementData, ItemStatus } from '../types';

interface ExitFieldsProps {
  movementData: MovementData;
  setMovementData: React.Dispatch<React.SetStateAction<MovementData>>;
  selectedArticle: Article;
}

export function ExitFields({ movementData, setMovementData, selectedArticle }: ExitFieldsProps) {
  //  Buscar el bin seleccionado por ID
  const selectedBin = selectedArticle?.bins?.find(bin => bin.binId === movementData.articleBinId);
  const maxStock = selectedBin?.quantity || 0;

  return (
    <>
      {/* Quantity */}
      <div>
        <Label>Quantity *</Label>
        <Input
          type="number"
          min="1"
          max={maxStock}
          value={movementData.quantity}
          onChange={(e) => setMovementData(prev => ({ ...prev, quantity: e.target.value }))}
          placeholder="Enter quantity to exit"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Available in {selectedBin?.binCode || 'selected BIN'}: {maxStock} {selectedArticle?.unit || 'units'}
        </p>
      </div>
      
      {/* Status */}
      <div>
        <Label>Status of Item Exiting</Label>
        <Select 
          value={movementData.status} 
          onValueChange={(value: ItemStatus) => setMovementData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="good-condition">Good Condition</SelectItem>
            <SelectItem value="scrap">Scrap / Waste</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}