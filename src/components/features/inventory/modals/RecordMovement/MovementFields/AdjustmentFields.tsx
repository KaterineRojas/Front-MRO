import React from 'react';
import { Label } from '../../../../../ui/label';
import { Input } from '../../../../../ui/input';
import { Textarea } from '../../../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../ui/select';
import type { Article } from '../../../types';
import type { MovementData, ItemStatus } from '../types';

interface AdjustmentFieldsProps {
  movementData: MovementData;
  setMovementData: React.Dispatch<React.SetStateAction<MovementData>>;
  selectedArticle: Article;
}

export function AdjustmentFields({ movementData, setMovementData, selectedArticle }: AdjustmentFieldsProps) {
  // ✅ Buscar el bin seleccionado por ID
  const selectedBin = selectedArticle?.bins?.find(bin => bin.binId === movementData.articleBinId);
  
  return (
    <>
      {/* Quantity Adjustment */}
      <div>
        <Label>Quantity Adjustment (+/-) *</Label>
        <Input
          type="number"
          value={movementData.quantity}
          onChange={(e) => setMovementData(prev => ({ ...prev, quantity: e.target.value }))}
          placeholder="Enter quantity (e.g., 5 for increase, -3 for decrease)"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Current Stock in {selectedBin?.binCode || 'selected BIN'}: <strong>{selectedBin?.quantity || 0} {selectedArticle.unit}</strong>
        </p>
      </div>
      
      {/* Status to Adjust */}
      <div>
        <Label>Status to Adjust *</Label>
        <Select 
          value={movementData.status} 
          onValueChange={(value: ItemStatus) => setMovementData(prev => ({ ...prev, status: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select item status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="good-condition">Good Condition</SelectItem>
            <SelectItem value="on-revision">On Revision</SelectItem>
            <SelectItem value="scrap">Scrap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Adjustment Reason */}
      <div>
        <Label>Adjustment Reason *</Label>
        <Textarea
          value={movementData.adjustmentReason || ''}
          onChange={(e) => setMovementData(prev => ({ ...prev, adjustmentReason: e.target.value }))}
          placeholder="Reason for stock discrepancy (e.g., inventory count, lost stock, damage)"
          required
          rows={2}
        />
      </div>
    </>
  );
}