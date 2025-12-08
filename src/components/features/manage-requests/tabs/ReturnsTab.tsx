import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Package } from 'lucide-react';
import { LoanRequest } from '../types';
import { KitsTabContent } from '../components/request-rows/KitTabReturnRow';

interface Props {
  filteredReturns: LoanRequest[];
  allReturns: LoanRequest[];
  getCurrentRequest: (requestId: number) => LoanRequest | undefined;
  selectedReturnBorrower: string;
  handleBorrowerSelect: (value: string) => void;
  borrowerSelectSearchTerm: string;
  setBorrowerSelectSearchTerm: (v: string) => void;
  filteredBorrowersForSelect: string[];
  expandedReturns: Set<number>;
  onToggleExpandReturns: (id: number) => void;
  expandedKitItems: Set<string>;
  onToggleExpandKitItem: (requestId: number, itemId: number) => void;
  selectedReturnItems: Set<string>;
  selectedKitItems: Set<string>;
  getReturnQuantity: (requestId: number, itemId: number) => number;
  handleSelectReturnItem: (requestId: number, itemId: number) => void;
  handleReturnQuantityChange: (requestId: number, itemId: number, quantity: number) => void;
  getItemCondition: (requestId: number, itemId: number) => string;
  handleOpenConditionDialog: (requestId: number, itemId: number, isKit: boolean, kitItemId?: number) => void;
  areAllRegularItemsSelected: (requestId: number, items: any[]) => boolean;
  handleSelectAllRegularItems: (request: LoanRequest, checked: boolean) => void;
  hasSelectedKitItems: (requestId: number, itemId: number) => boolean;
  handleTakePhotoItems: (request: LoanRequest) => void;
  handleConfirmReturnItems: (request: LoanRequest) => void;
  handleTakeKitPhoto: (requestId: number, itemId: number) => void;
  handleSaveKitChecklist: (requestId: number, itemId: number) => void;
  getKitItemQuantity: (requestId: number, itemId: number, kitItemId: number) => number;
  handleKitItemQuantityChange: (requestId: number, itemId: number, kitItemId: number, quantity: number) => void;
  handleSelectKitItem: (requestId: number, itemId: number, kitItemId: number) => void;
  getKitItemCondition: (requestId: number, itemId: number, kitItemId: number) => string;
  formatConditionText: (condition: string) => string;
  kitPhotos: Record<string, string>;
  capturedPhoto?: string | null;
}

export const ReturnsTab: React.FC<Props> = (props) => {
  const {
    filteredReturns,
    selectedReturnBorrower,
    handleBorrowerSelect,
    borrowerSelectSearchTerm,
    setBorrowerSelectSearchTerm,
    filteredBorrowersForSelect,
    expandedReturns,
    onToggleExpandReturns
  } = props;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center"><Package className="h-5 w-5 mr-2" /> <span className="font-bold text-2xl">Returns ({filteredReturns.length})</span></CardTitle>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="flex-1 max-w-xs">
            <Label htmlFor="return-borrower-select" className="text-sm mb-2 block">Select Borrower</Label>
            <Select  onValueChange={handleBorrowerSelect}>
              <SelectTrigger id="return-borrower-select"><SelectValue placeholder="Select a borrower" className="cursor-pointer"/></SelectTrigger>
              <SelectContent className="cursor-pointer">
                <div className="p-2 sticky top-0 bg-background z-10">
                  <Input placeholder="Search borrower..." 
                  value={borrowerSelectSearchTerm} 
                  onChange={(e) => setBorrowerSelectSearchTerm(e.target.value)} 
                  onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} 
                  className="mb-2" />
                </div>
                <div className="max-h-[300px]">
                  {filteredBorrowersForSelect.length > 0 ? (
                    filteredBorrowersForSelect.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">No borrowers found</div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedReturnBorrower ? (
          <div className="text-center py-8 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Please select a borrower to view their return items</p></div>
        ) : filteredReturns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No return items found for this borrower</p></div>
        ) : (
          <div className="rounded-md border p-4">
            {/* Show borrower summary once */}
            {filteredReturns.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Borrower: </div>
                    <div className="font-medium">{filteredReturns[0].requesterName}</div>
                    <div className="text-sm text-muted-foreground">{filteredReturns[0].requesterEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email: </div>
                    <div className="font-medium">{filteredReturns[0].requesterEmail}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs for Items and Kits */}
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="items" className="cursor-pointer">Items</TabsTrigger>
                <TabsTrigger value="kits" className="cursor-pointer">Kits</TabsTrigger>
              </TabsList>

              {/* Items Tab - Aggregated Table */}
              <TabsContent value="items">
                {(() => {
                  type AggItem = {
                    key: string;
                    sku?: string;
                    name: string;
                    imageUrl?: string;
                    unit?: string;
                    articleType?: string;
                    quantityFulfilled: number;
                    occurrences: { requestId: number; itemId: number }[];
                  };

                  const aggMap = new Map<string, AggItem>();

                  filteredReturns.forEach(req => {
                    req.items.filter(i => !i.isKit).forEach(it => {
                      const key = it.sku || it.sku || it.name;
                      const existing = aggMap.get(key);
                      const qty = (it.quantityFulfilled ?? it.quantityFulfilled ?? it.quantityRequested) || 0;
                      
                      if (existing) {
                        existing.quantityFulfilled += qty;
                        existing.occurrences.push({ requestId: req.id, itemId: it.id });
                      } else {
                        aggMap.set(key, {
                          key,
                          sku: it.sku,
                          name: it.name || it.name || key,
                          imageUrl: it.imageUrl,
                          unit: it.unit,
                          articleType: it.articleType,
                          quantityFulfilled: qty,
                          occurrences: [{ requestId: req.id, itemId: it.id }]
                        });
                      }
                    });
                  });

                  const aggregated = Array.from(aggMap.values());

                  return (
                    <div className="mt-4">
                      {/* Action buttons */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="select-all-returns"
                            checked={aggregated.length > 0 && aggregated.every(item => 
                              item.occurrences.every(o => props.selectedReturnItems.has(`${o.requestId}-${o.itemId}`))
                            )}
                            onChange={(e) => {
                              aggregated.forEach(item => {
                                item.occurrences.forEach(o => {
                                  const itemKey = `${o.requestId}-${o.itemId}`;
                                  const isSelected = props.selectedReturnItems.has(itemKey);
                                  if (e.target.checked && !isSelected) {
                                    props.handleSelectReturnItem(o.requestId, o.itemId);
                                  } else if (!e.target.checked && isSelected) {
                                    props.handleSelectReturnItem(o.requestId, o.itemId);
                                  }
                                });
                                
                                // Después de seleccionar, inicializar cantidades si no están definidas
                                if (e.target.checked) {
                                  setTimeout(() => {
                                    // Siempre inicializar en 0 para que el usuario ingrese la cantidad
                                    item.occurrences.forEach((o) => {
                                      props.handleReturnQuantityChange(o.requestId, o.itemId, 0);
                                    });
                                  }, 0);
                                }
                              });
                            }}
                            className="h-4 w-4 cursor-pointer"
                          />
                          <label htmlFor="select-all-returns" className="text-sm cursor-pointer">Select All Items</label>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              const firstRequest = filteredReturns[0];
                              if (firstRequest) props.handleTakePhotoItems(firstRequest);
                            }}
                            className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-300 rounded text-sm hover:bg-blue-100"
                          >
                            📷 Take Photo
                          </button>
                          <button 
                            onClick={async () => {
                              // Recopilar los IDs de requests que tienen items seleccionados
                              const requestIdsToProcess = filteredReturns
                                .filter(request => 
                                  request.items.some(item => 
                                    props.selectedReturnItems.has(`${request.id}-${item.id}`)
                                  )
                                )
                                .map(request => request.id);
                              
                              // Procesar cada request por ID (buscando el request actualizado cada vez)
                              for (const requestId of requestIdsToProcess) {
                                // Buscar el request actualizado usando getCurrentRequest
                                const currentRequest = props.getCurrentRequest(requestId);
                                if (currentRequest) {
                                  await props.handleConfirmReturnItems(currentRequest);
                                }
                              }
                            }}
                            className="px-3 py-2 bg-green-50 text-green-700 border border-green-300 rounded text-sm hover:bg-green-100"
                          >
                            ✓ Return
                          </button>
                        </div>
                      </div>

                      {/* Items aggregated table */}
                      <div className="rounded-md border overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="text-center">
                              <th className="px-4 py-2">Select</th>
                              <th className="px-4 py-2">Image</th>
                              <th className="px-4 py-2">SKU</th>
                              <th className="px-4 py-2">Name</th>
                              <th className="px-4 py-2">Quantity</th>
                              <th className="px-4 py-2">Quantity to Return</th>
                              <th className="px-4 py-2">Condition</th>
                              <th className="px-4 py-2">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aggregated.length === 0 ? (
                              <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No items found</td></tr>
                            ) : (
                              aggregated.map((item) => {
                                const occs = item.occurrences;
                                const allSelected = occs.every(o => props.selectedReturnItems.has(`${o.requestId}-${o.itemId}`));

                                return (
                                  <tr key={item.key} className="border-t">
                                    <td className="text-center px-4 py-2">
                                      <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={(e) => {
                                          occs.forEach(o => {
                                            const key = `${o.requestId}-${o.itemId}`;
                                            const isSelected = props.selectedReturnItems.has(key);
                                            if (e.target.checked && !isSelected) {
                                              props.handleSelectReturnItem(o.requestId, o.itemId);
                                            } else if (!e.target.checked && isSelected) {
                                              props.handleSelectReturnItem(o.requestId, o.itemId);
                                            }
                                          });
                                          
                                          // Después de seleccionar, inicializar cantidades si no están definidas
                                          if (e.target.checked) {
                                            setTimeout(() => {
                                              // Siempre inicializar en 0 para que el usuario ingrese la cantidad
                                              occs.forEach((o) => {
                                                props.handleReturnQuantityChange(o.requestId, o.itemId, 0);
                                              });
                                            }, 0);
                                          }
                                        }}
                                        className="h-4 w-4"
                                      />
                                    </td>
                                    <td className="flex justify-center py-2 px-4">
                                      {item.imageUrl && item.imageUrl.trim() ? (() => {
                                        // Convert SharePoint preview URL to downloadable URL
                                        let imgUrl = item.imageUrl;
                                        if (imgUrl.includes('sharepoint.com') && !imgUrl.includes('download=1')) {
                                          imgUrl = imgUrl + (imgUrl.includes('?') ? '&' : '?') + 'download=1';
                                        }
                                        return (
                                          <img 
                                            src={imgUrl} 
                                            alt={item.name} 
                                            className="w-12 h-12 object-cover rounded" 
                                            onError={(e) => { 
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.parentElement?.appendChild(
                                                Object.assign(document.createElement('div'), {
                                                  className: 'w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground',
                                                  textContent: 'No image'
                                                })
                                              );
                                            }} 
                                          />
                                        );
                                      })() : (
                                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No image</div>
                                      )}
                                    </td>
                                    <td className="font-mono text-sm text-center px-4 py-2">{item.sku || item.key}</td>
                                    <td className="text-center px-4 py-2">{item.name}</td>
                                    <td className="text-sm text-muted-foreground text-center px-4 py-2">{item.quantityFulfilled}</td>
                                    <td className="text-center px-4 py-2">
                                      <input
                                        type="number"
                                        min={0}
                                        max={item.quantityFulfilled}
                                        defaultValue={0}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                          const raw = parseInt(e.target.value || '0', 10) || 0;
                                          const clamped = Math.max(0, Math.min(raw, item.quantityFulfilled));
                                          const sumCurrent = occs.reduce((a, o) => a + (props.getReturnQuantity(o.requestId, o.itemId) || 0), 0) || item.quantityFulfilled;
                                          const distributed: number[] = [];
                                          let remainder = clamped;
                                          occs.forEach((o) => {
                                            const proportion = (props.getReturnQuantity(o.requestId, o.itemId) || 0) / sumCurrent;
                                            const qty = Math.max(0, Math.floor(proportion * clamped));
                                            distributed.push(qty);
                                            remainder -= qty;
                                          });
                                          let idx = 0;
                                          while (remainder > 0) {
                                            distributed[idx % distributed.length] += 1;
                                            remainder -= 1;
                                            idx++;
                                          }
                                          occs.forEach((o, i) => props.handleReturnQuantityChange(o.requestId, o.itemId, distributed[i]));
                                        }}
                                        className="w-20 text-center border rounded px-2 py-1"
                                      />
                                    </td>
                                    <td className="text-center px-4 py-2">
                                      <button
                                        onClick={() => {
                                          const first = occs[0];
                                          if (first) props.handleOpenConditionDialog(first.requestId, first.itemId, false);
                                        }}
                                        className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200"
                                      >
                                        Select Condition
                                      </button>
                                    </td>
                                    <td className="text-center px-4 py-2">
                                      <div className="inline-block px-2 py-1 bg-gray-100 rounded text-sm">
                                        {item.articleType === 'consumable' ? 'Consumable' : 'Non-Consumable'}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </TabsContent>

              {/* Kits Tab */}
              <TabsContent value="kits">
                {filteredReturns.map(request => {
                  const kitItems = request.items.filter(i => i.isKit);
                  return (
                    <KitsTabContent
                      key={request.id}
                      request={request}
                      kitItems={kitItems}
                      expandedKitItems={props.expandedKitItems}
                      onToggleExpandKitItem={props.onToggleExpandKitItem}
                      selectedKitItems={props.selectedKitItems}
                      hasSelectedKitItems={props.hasSelectedKitItems}
                      getKitItemQuantity={props.getKitItemQuantity}
                      handleKitItemQuantityChange={props.handleKitItemQuantityChange}
                      handleSelectKitItem={props.handleSelectKitItem}
                      getKitItemCondition={props.getKitItemCondition}
                      formatConditionText={props.formatConditionText}
                      handleOpenConditionDialog={props.handleOpenConditionDialog}
                      handleTakeKitPhoto={props.handleTakeKitPhoto}
                      handleSaveKitChecklist={props.handleSaveKitChecklist}
                      kitPhotos={props.kitPhotos}
                      selectedReturnItems={props.selectedReturnItems}
                      getReturnQuantity={props.getReturnQuantity}
                      handleSelectReturnItem={props.handleSelectReturnItem}
                      handleReturnQuantityChange={props.handleReturnQuantityChange}
                      getItemCondition={props.getItemCondition}
                    />
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReturnsTab;
