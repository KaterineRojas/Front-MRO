import React from 'react';
import { Label } from '../../../../../ui/label';
import { Input } from '../../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../ui/select';
import { Badge } from '../../../../../ui/badge';
import { BinSelector } from '../../../components/BinSelector';
import type { Article } from '../../../types';
import type { MovementData } from '../types';

interface EntryFieldsProps {
  movementData: MovementData;
  setMovementData: React.Dispatch<React.SetStateAction<MovementData>>;
  selectedArticle: Article; // ✅ AGREGADO
}

const getBinPurposeBadgeClass = (purpose: string) => {
  switch (purpose) {
    case 'GoodCondition': return 'bg-green-600';
    case 'Reception': return 'bg-gray-600';
    default: return 'bg-gray-400';
  }
};

const getBinPurposeLabel = (purpose: string) => {
  switch (purpose) {
    case 'GoodCondition': return 'Good Condition';
    case 'Reception': return 'Reception';
    default: return purpose;
  }
};

export function EntryFields({ 
  movementData, 
  setMovementData, 
  selectedArticle // ✅ AGREGADO
}: EntryFieldsProps) {
  
  // ✅ Filtrar bins de Good Condition o Reception
  const articleGoodOrReceptionBins = selectedArticle?.bins?.filter(
    bin => bin.binPurpose === 'GoodCondition' || bin.binPurpose === 'Reception'
  ) || [];

  return (
    <>
      {/* Quantity */}
      <div>
        <Label>Quantity *</Label>
        <Input
          type="number"
          min="1"
          value={movementData.quantity}
          onChange={(e) => setMovementData(prev => ({ ...prev, quantity: e.target.value }))}
          placeholder="Enter quantity"
          required
        />
      </div>
      
      {/* New Location */}
      <div>
        <Label>New Location *</Label>
        {articleGoodOrReceptionBins.length > 0 ? (
          <>
            <Select
              value={movementData.newLocationBinId > 0 ? movementData.newLocationBinId.toString() : ''}
              onValueChange={(value: any) => {
                const binId = parseInt(value);
                console.log('🔵 NEW LOCATION BIN Selected (Entry):', binId);
                setMovementData(prev => ({ ...prev, newLocationBinId: binId }));
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new location" />
              </SelectTrigger>
              <SelectContent>
                {articleGoodOrReceptionBins.map((bin) => (
                  <SelectItem key={bin.binId} value={bin.binId.toString()}>
                    <div className="flex items-center justify-between space-x-4 py-1">
                      <span className="font-mono">{bin.binCode}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {bin.quantity} {selectedArticle.unit}
                        </span>
                        <Badge className={getBinPurposeBadgeClass(bin.binPurpose)}>
                          {getBinPurposeLabel(bin.binPurpose)}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Showing bins associated with this item ({articleGoodOrReceptionBins.length} bins)
            </p>
          </>
        ) : (
          <>
            <BinSelector
              value={movementData.newLocationBinId > 0 ? movementData.newLocationBinId.toString() : ''}
              onValueChange={(value) => {
                const binId = parseInt(value);
                console.log('📍 BINSELECTOR - Selected ID (Entry):', binId);
                setMovementData(prev => ({ ...prev, newLocationBinId: binId }));
              }}
              placeholder="Select new location"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Showing all available Good Condition bins
            </p>
          </>
        )}
      </div>
    </>
  );
}