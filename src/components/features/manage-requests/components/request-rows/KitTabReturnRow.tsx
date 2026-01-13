import React from 'react';
import { Button } from '../../../../ui/button';
import { ImageWithFallback } from '../../../../figma/ImageWithFallback';
import { Badge } from '../../../../ui/badge';
import { ChevronDown, ChevronRight, Package, Camera, CheckCircle } from 'lucide-react';
import { LoanRequest, LoanItem } from '../../types'; 

interface Props {
  request: LoanRequest;
  kitItems: LoanItem[]; 
  expandedKitItems: Set<string>;
  onToggleExpandKitItem: (requestId: number, itemId: number) => void;
  selectedKitItems: Set<string>;
  hasSelectedKitItems: (requestId: number, itemId: number) => boolean;
  getKitItemQuantity: (requestId: number, itemId: number, kitItemId: number) => number;
  handleKitItemQuantityChange: (requestId: number, itemId: number, kitItemId: number, quantity: number) => void;
  handleSelectKitItem: (requestId: number, itemId: number, kitItemId: number) => void;
  getKitItemCondition: (requestId: number, itemId: number, kitItemId: number) => string;
  formatConditionText: (condition: string) => string;
  handleOpenConditionDialog: (requestId: number, itemId: number, isKit: boolean, kitItemId?: number) => void;
  handleTakeKitPhoto: (requestId: number, itemId: number) => void;
  handleSaveKitChecklist: (requestId: number, itemId: number) => void;
  kitPhotos: Record<string, string>;
  selectedReturnItems: Set<string>;
  getReturnQuantity: (requestId: number, itemId: number) => number;
  handleSelectReturnItem: (requestId: number, itemId: number) => void;
  handleReturnQuantityChange: (requestId: number, itemId: number, quantity: number) => void;
  getItemCondition: (requestId: number, itemId: number) => string;
}

export const KitsTabContent: React.FC<Props> = ({
  request,
  kitItems,
  expandedKitItems,
  onToggleExpandKitItem,
  selectedKitItems,
  hasSelectedKitItems,
  getKitItemQuantity,
  handleKitItemQuantityChange,
  handleSelectKitItem,
  getKitItemCondition,
  formatConditionText,
  handleOpenConditionDialog, 
  handleTakeKitPhoto,
  handleSaveKitChecklist,
  kitPhotos,
}) => {
  return (
    <div className="p-4">
      <div className="mt-6">
        {kitItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-4 opacity-50" /> <p>No kits to return</p></div>
        ) : (
          kitItems.map(kitItem => {
            const kitKey = `${request.id}-${kitItem.id}`;
            const isKitExpanded = expandedKitItems.has(kitKey);
            return (
              <div key={kitItem.id} className="border rounded-lg p-4 bg-card mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => onToggleExpandKitItem(request.id, kitItem.id)}>{isKitExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button>
                    <ImageWithFallback src={kitItem.imageUrl || ''} alt={kitItem.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">{kitItem.sku}</p>
                      <h5>{kitItem.name}</h5>
                      <p className="text-sm text-muted-foreground">{kitItem.articleDescription}</p>
                    </div>
                  </div>
                </div>

                {isKitExpanded && kitItem.kitItems && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h6 className="flex items-center"><Package className="h-4 w-4 mr-2" />Kit Items Checklist</h6>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id={`select-all-kit-${request.id}-${kitItem.id}`} 
                        checked={kitItem.kitItems.every(ki => selectedKitItems.has(`${request.id}-${kitItem.id}-${ki.id}`))} 
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          kitItem.kitItems?.forEach(item => {
                            const kitItemKey = `${request.id}-${kitItem.id}-${item.id}`;
                            const isCurrentlySelected = selectedKitItems.has(kitItemKey);
                            if (isChecked && !isCurrentlySelected) {
                              handleSelectKitItem(request.id, kitItem.id, item.id);
                            } else if (!isChecked && isCurrentlySelected) {
                              handleSelectKitItem(request.id, kitItem.id, item.id);
                            }
                          });
                        }} className="h-4 w-4 cursor-pointer" />
                        <label htmlFor={`select-all-kit-${request.id}-${kitItem.id}`} 
                        className="text-sm">Select All Kit Items</label>
                      </div>
                    </div>

                    <div className="rounded-md">
                      <table className="w-full border-collapse text-center">
                        <thead>
                          <tr>
                            <th>Select</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Quantity to Return</th>
                            <th>Condition</th>
                            <th>Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kitItem.kitItems.map(item => {
                            const kitItemKey = `${request.id}-${kitItem.id}-${item.id}`;
                            const isKitItemSelected = selectedKitItems.has(kitItemKey);
                            return (
                              <tr key={item.id}>
                                <td><input type="checkbox" checked={isKitItemSelected} onChange={() => handleSelectKitItem(request.id, kitItem.id, item.id)} className="h-4 w-4 cursor-pointer" /></td>
                                <td className="flex justify-center py-1"><ImageWithFallback src={item.imageUrl || ''} alt={item.name} className="w-12 h-12 object-cover rounded" /></td>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>
                                  <div className="flex items-center space-x-2 justify-center">
                                    <Button variant="outline" size="sm" 
                                    onClick={() => handleKitItemQuantityChange(request.id, kitItem.id, item.id, Math.max(1, getKitItemQuantity(request.id, kitItem.id, item.id) - 1))} 
                                    disabled={!isKitItemSelected || getKitItemQuantity(request.id, kitItem.id, item.id) <= 1}>-</Button>
                                    <input type="number" min={1} max={item.quantity} value={getKitItemQuantity(request.id, kitItem.id, item.id)} 
                                    onChange={(e) => handleKitItemQuantityChange(request.id, kitItem.id, item.id, parseInt(e.target.value) || 1)} className="w-20 text-center" disabled={!isKitItemSelected} />
                                    <Button variant="outline" size="sm" 
                                    onClick={() => handleKitItemQuantityChange(request.id, kitItem.id, item.id, Math.min(item.quantity, getKitItemQuantity(request.id, kitItem.id, item.id) + 1))} disabled={!isKitItemSelected || getKitItemQuantity(request.id, kitItem.id, item.id) >= item.quantity}>+</Button>
                                    <span className="text-sm text-muted-foreground">/ {item.quantity} {item.unit}</span>
                                  </div>
                                </td>
                                <td className="align-middle">
                                  <Button variant="outline" size="sm" onClick={() => handleOpenConditionDialog(request.id, kitItem.id, true, item.id)} disabled={!isKitItemSelected} className="w-[160px]">{formatConditionText(getKitItemCondition(request.id, kitItem.id, item.id)) || 'Select Condition'}</Button>
                                </td>
                                <td className="align-middle">
                                  <Badge variant={item.type === 'consumable' ? 'secondary' : 'outline'}>{item.type === 'consumable' ? 'Consumable' : 'Non-Consumable'}</Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {kitPhotos[kitKey] && (
                      <div className="mt-2 mb-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-2 rounded"><CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 inline mr-2" /> <span className="text-green-700 dark:text-green-300">Photo captured: {kitPhotos[kitKey]}</span></div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => handleTakeKitPhoto(request.id, kitItem.id)} className="cursor-pointer text-black"><Camera className="h-4 w-4 mr-2" />Take Photo</Button>
                      <Button variant="outline" onClick={() => handleSaveKitChecklist(request.id, kitItem.id)} className="cursor-pointer text-black" disabled={!hasSelectedKitItems(request.id, kitItem.id)}><CheckCircle className="h-4 w-4 mr-2" />Return</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
