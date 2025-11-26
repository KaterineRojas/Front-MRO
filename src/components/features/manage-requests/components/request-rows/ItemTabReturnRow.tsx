import React from 'react';
// Importaciones de UI
import { Button } from '../../../../ui/button';
import { ImageWithFallback } from '../../../../figma/ImageWithFallback';
import { Badge } from '../../../../ui/badge';
import { Package, Camera, CheckCircle } from 'lucide-react';

import { LoanRequest, LoanItem } from '../../types'; 

interface Props {
  request: LoanRequest;
  regularItems: LoanItem[];
  selectedReturnItems: Set<string>;
  getReturnQuantity: (requestId: number, itemId: number) => number;
  handleSelectReturnItem: (requestId: number, itemId: number) => void;
  handleReturnQuantityChange: (requestId: number, itemId: number, quantity: number) => void;
  getItemCondition: (requestId: number, itemId: number) => string;
  handleOpenConditionDialog: (requestId: number, itemId: number, isKit: boolean, kitItemId?: number) => void;
  formatConditionText: (condition: string) => string;
  handleTakePhotoItems: (request: LoanRequest) => void;
  handleConfirmReturnItems: (request: LoanRequest) => void;
  capturedPhoto?: string | null;
}

export const RegularItemsTabContent: React.FC<Props> = ({
  request,
  regularItems,
  selectedReturnItems,
  getReturnQuantity,
  handleSelectReturnItem,
  handleReturnQuantityChange,
  getItemCondition,
  handleOpenConditionDialog,
  formatConditionText,
  handleTakePhotoItems,
  handleConfirmReturnItems,
  capturedPhoto
}) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="flex items-center"><Package className="h-4 w-4 mr-2" />Items to return</h4>
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={regularItems.length > 0 && regularItems.every(item => selectedReturnItems.has(`${request.id}-${item.id}`))}
            onChange={(e) => {
              const isChecked = e.target.checked;
              regularItems.forEach(item => {
                const itemKey = `${request.id}-${item.id}`;
                const isCurrentlySelected = selectedReturnItems.has(itemKey);
                if (isChecked && !isCurrentlySelected) {
                  handleSelectReturnItem(request.id, item.id);
                } else if (!isChecked && isCurrentlySelected) {
                  handleSelectReturnItem(request.id, item.id);
                }
              });
            }}
            className="h-4 w-4 cursor-pointer"
          />
          <span className="text-sm">Select All</span>
        </div>
      </div>
      <div className="rounded-md border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-center">
              <th>Select</th>
              <th>Image</th>
              <th>BIN Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Quantity to Return</th>
              <th>Condition</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {regularItems.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No regular items to return</td></tr>
            ) : (
              regularItems.map(item => {
                const itemKey = `${request.id}-${item.id}`;
                const isSelected = selectedReturnItems.has(itemKey);
                return (
                  <tr key={item.id}>
                    <td className="text-center">
                      <input type="checkbox" checked={isSelected}  onChange={() => handleSelectReturnItem(request.id, item.id)} className="h-4 w-4" />
                    </td>
                    <td className="flex justify-center py-1">
                      <ImageWithFallback src={item.imageUrl || ''} alt={item.articleName} className="w-12 h-12 object-cover rounded" />
                    </td>
                    <td className="font-mono text-sm text-center">{item.articleBinCode}</td>
                    <td className="text-center">{item.articleName}</td>
                    <td className="text-sm text-muted-foreground text-center">{item.articleDescription}</td>
                    <td className="text-center">
                      <div className="text-center space-x-2">
                        <Button variant="outline" size="sm" 
                        onClick={() => handleReturnQuantityChange(request.id, item.id, Math.max(1, getReturnQuantity(request.id, item.id) - 1))} 
                        disabled={!isSelected || getReturnQuantity(request.id, item.id) <= 1}>-</Button>
                        <input type="number" min={1} max={item.quantity} 
                        value={getReturnQuantity(request.id, item.id)} 
                        onChange={(e) => handleReturnQuantityChange(request.id, item.id, parseInt(e.target.value) || 1)} 
                        className="w-20 text-center" disabled={!isSelected} />
                        <Button variant="outline" size="sm" 
                        onClick={() => handleReturnQuantityChange(request.id, item.id, Math.min(item.quantity, getReturnQuantity(request.id, item.id) + 1))} 
                        disabled={!isSelected || getReturnQuantity(request.id, item.id) >= item.quantity}>+</Button>
                        <span className="text-sm text-muted-foreground">/ {item.quantity} {item.unit}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleOpenConditionDialog(request.id, item.id, false)} disabled={!isSelected} className="w-[160px]">
                        {formatConditionText(getItemCondition(request.id, item.id)) || 'Select Condition'}
                      </Button>
                    </td>
                    <td className="text-center">
                      <Badge variant={item.articleType === 'consumable' ? 'secondary' : 'outline'}>{item.articleType === 'consumable' ? 'Consumable' : 'Non-Consumable'}</Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {regularItems.length > 0 && (
        <div className="mt-4">
          {capturedPhoto && (
            <div className="mb-2 bg-green-50 border-green-200 p-2 rounded">
              <CheckCircle className="h-4 w-4 text-green-600 inline mr-2" /> Photo captured: {capturedPhoto}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleTakePhotoItems(request)} className="cursor-pointer text-black"><Camera className="h-4 w-4 mr-2" />Take Photo</Button>
            <Button variant="outline" onClick={() => handleConfirmReturnItems(request)} className="cursor-pointer text-black" disabled={!request.items.filter(item => !item.isKit).some(item => selectedReturnItems.has(`${request.id}-${item.id}`))}>
                <CheckCircle className="h-4 w-4 mr-2" />Return
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};