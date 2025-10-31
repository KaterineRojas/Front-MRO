import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../ui/dialog';
import { Label } from '../../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import type { Article, Kit } from '../../types';
import type { MovementData, MovementType, ItemType } from '../RecordMovement/types';
import { ItemMovementForm } from './ItemMovementForm';
import { KitMovementForm } from './KitMovementForm';

interface RecordMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articles: Article[];
  kits: Kit[];
  onRecordMovement: (movementData: MovementData) => void;
}

const initialMovementData: MovementData = {
  itemType: 'item',
  movementType: 'entry',
  articleId: 0,
  articleBinId: 0,
  kitBinCode: '',
  quantity: '',
  //unitPrice: '',
  status: 'good-condition',
  newLocationBinId: 0,
  notes: '',
  adjustmentReason: ''
};

export function RecordMovementModal({
  open,
  onOpenChange,
  articles,
  kits,
  onRecordMovement
}: RecordMovementModalProps) {
  const [movementData, setMovementData] = useState<MovementData>(initialMovementData);
  //const [priceOption, setPriceOption] = useState('');

  const resetMovementForm = () => {
    setMovementData(initialMovementData);
    //setPriceOption('');
  };

  const handleRecordMovement = (movementData: MovementData) => {
    console.log('📤 Final Movement Data:', movementData);
    onRecordMovement(movementData);
    resetMovementForm();
    onOpenChange(false);
  };

  const handleItemTypeChange = (value: ItemType) => {
    const newMovementType: MovementType = value === 'kit' ? 'relocation' : 'entry';
    setMovementData({
      ...initialMovementData,
      itemType: value,
      movementType: newMovementType,
    });
  };

  const handleMovementTypeChange = (value: MovementType) => {
    setMovementData(prev => ({
      ...prev,
      movementType: value,
      articleId: 0,
      articleBinId: 0,
      newLocationBinId: 0,
      quantity: '',
      //unitPrice: '',
    }));
    //setPriceOption('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Inventory Movement</DialogTitle>
          <DialogDescription>
            Record stock movements for items or kits in your inventory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Item Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Select Type *</Label>
              <Select
                value={movementData.itemType}
                onValueChange={handleItemTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="item">Item</SelectItem>
                  <SelectItem value="kit">Kit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Movement Type */}
            <div>
              <Label>Movement Type *</Label>
              <Select
                value={movementData.movementType}
                onValueChange={handleMovementTypeChange as (value: string) => void}
                disabled={movementData.itemType === 'kit'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Stock Entry</SelectItem>
                  <SelectItem value="exit">Stock Exit</SelectItem>
                  <SelectItem value="relocation">Relocation</SelectItem>
                  {movementData.itemType === 'item' && <SelectItem value="adjustment">Adjustment (Count/Loss)</SelectItem>}
                </SelectContent>
              </Select>
              {movementData.itemType === 'kit' && (
                <p className="text-xs text-muted-foreground mt-1">Kits can only be relocated</p>
              )}
            </div>
          </div>

          {/* Conditional Forms */}
          {movementData.itemType === 'item' ? (
            <ItemMovementForm
              movementData={movementData}
              setMovementData={setMovementData}
              articles={articles}
              onRecordMovement={handleRecordMovement}
            //priceOption={priceOption}
            //setPriceOption={setPriceOption}
            
            />
          ) : (
            <KitMovementForm
              movementData={movementData}
              setMovementData={setMovementData}
              kits={kits}
              articles={articles}
              onRecordMovement={handleRecordMovement}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}