import React from 'react';
import { TableCell, TableRow } from '../../../../ui/table';
import { Button } from '../../../../ui/button';
import { ImageWithFallback } from '../../../../figma/ImageWithFallback';
import { Badge } from '../../../../ui/badge';
import { ChevronDown, ChevronRight, Printer, Eye, Package } from 'lucide-react';
import { LoanRequest, LoanItem } from '../../types';
import { toast } from 'react-hot-toast';

interface Props {
  request: LoanRequest;
  expanded: boolean;
  onToggleExpand: (id: number) => void;
  isKitOrder: (req: LoanRequest) => boolean;
  getPriorityBadge: (priority: string) => React.ReactNode;
  selectedPackingItems: Set<string>;
  packingItemQuantities: Record<string, number>;
  handleSelectPackingItem: (requestId: number, itemId: number) => void;
  handlePackingQuantityChange: (requestId: number, itemId: number, quantity: number) => void;
  getPackingItemQuantity: (requestId: number, itemId: number) => number;
  areAllItemsSelected: (requestId: number, items: LoanItem[]) => boolean;
  handleSelectAllPackingItems: (request: LoanRequest, checked: boolean) => void;
  printedRequests: Set<number>;
  handlePrintSinglePacking: (request: LoanRequest) => void;
  handleConfirmPacking: (request: LoanRequest) => void;
}

export const PackingRequestRow: React.FC<Props> = ({
  request,
  expanded,
  onToggleExpand,
  isKitOrder,
  getPriorityBadge,
  selectedPackingItems,
  packingItemQuantities,
  handleSelectPackingItem,
  handlePackingQuantityChange,
  getPackingItemQuantity,
  areAllItemsSelected,
  handleSelectAllPackingItems,
  printedRequests,
  handlePrintSinglePacking,
  handleConfirmPacking
}) => {
// 1. Lógica para determinar si el botón debe estar deshabilitado
    const isPrinted = printedRequests.has(request.id);
    const isKit = isKitOrder(request);
    const areItemsSelected = selectedPackingItems.size > 0;

    const isValidForPacking = isPrinted && (isKit || areItemsSelected);

   const showDisabledToast = (e: React.MouseEvent) => {
        // Solo proceder si la acción es inválida
        if (!isValidForPacking) {
            e.stopPropagation(); 
            
            let disabledMessage = '';
            
            // Lógica para determinar el mensaje exacto
            if (!isPrinted) {
                disabledMessage = 'To confirm, you must first print the packing list.';
            } else if (!isKit && !areItemsSelected) {
                disabledMessage = 'Please select the items and specify the quantities to pack.';
            } else {
                // Mensaje genérico de fallback (aunque la lógica anterior cubre todos los casos)
                disabledMessage = 'Action blocked due to pending validations.';
            }           
            toast.error(disabledMessage);
        }
    };

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <Button variant="ghost" size="sm" onClick={() => onToggleExpand(request.id)}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-mono">{request.requestNumber}</TableCell>
        <TableCell>
          <div>
            <div>{request.borrower}</div>
            <div className="text-sm text-muted-foreground">{request.borrowerEmail}</div>
          </div>
        </TableCell>
        <TableCell>{request.department}</TableCell>
        <TableCell>{request.project}</TableCell>
        <TableCell>{request.requestedLoanDate}</TableCell>
        <TableCell>{getPriorityBadge(request.priority)}</TableCell>
        <TableCell>
          <Badge variant={isKitOrder(request) ? 'default' : 'outline'}>{isKitOrder(request) ? 'Yes' : 'No'}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline">
            {isKitOrder(request) ? `${request.items.length}` : `${Array.from(selectedPackingItems).filter(k => k.startsWith(`${request.id}-`)).length} / ${request.items.length}`}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button 
            variant="outline" 
            size="sm" onClick={() => handlePrintSinglePacking(request)}>
              <Printer className="h-4 w-4" />
            </Button>
            <div style={{ display: 'inline-block', cursor: isValidForPacking ? 'default' : 'not-allowed' }}
              onClick={!isValidForPacking ? showDisabledToast : undefined}>
                  <Button
                      variant="default"
                      onClick={() => handleConfirmPacking(request)} 
                      disabled={!isValidForPacking}
                      style={{ pointerEvents: isValidForPacking ? 'auto' : 'none' }}>
                      <Package className="mr-2 h-4 w-4" /> Confirm Packing
                  </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={10} className="bg-muted/30 p-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Items in this request
                </h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`select-all-packing-${request.id}`}
                    checked={areAllItemsSelected(request.id, request.items)}
                    onChange={(e) => handleSelectAllPackingItems(request, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`select-all-packing-${request.id}`} className="text-sm cursor-pointer">Select All Items</label>
                </div>
              </div>

              <div className="rounded-md border bg-card overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className='text-center'>
                      <th>Select</th>
                      <th>Image</th>
                      <th>BIN Code</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.items.map(item => {
                      const itemKey = `${request.id}-${item.id}`;
                      return (
                        <tr key={item.id}>
                          <td className="text-center">
                            {!isKitOrder(request) ? (
                              <input type="checkbox" checked={selectedPackingItems.has(itemKey)} onChange={() => handleSelectPackingItem(request.id, item.id)} className="h-4 w-4" />
                            ) : null}
                          </td>
                          <td className="flex justify-center">
                            <ImageWithFallback src={item.imageUrl || ''} alt={item.articleName} className="w-12 h-12 object-cover rounded" />
                          </td>
                          <td className="font-mono text-sm text-center">{item.articleBinCode}</td>
                          <td className="text-center">{item.articleName}</td>
                          <td className="text-sm text-muted-foreground text-center">{item.articleDescription}</td>
                          <td>
                            {!isKitOrder(request) ? (
                              <div className="text-center space-x-2">
                                <input type="number" min={0} max={item.quantity} value={getPackingItemQuantity(request.id, item.id)} onChange={(e) => handlePackingQuantityChange(request.id, item.id, parseInt(e.target.value) || 0)} className="w-20" />
                                <span className="text-sm text-muted-foreground">/ {item.quantity} {item.unit}</span>
                              </div>
                            ) : (
                              <span>{item.quantity} {item.unit}</span>
                            )}
                          </td>
                          <td className="text-center">
                            <Badge variant={item.articleType === 'consumable' ? 'secondary' : 'outline'}>
                              {item.articleType === 'consumable' ? 'Consumable' : 'Non-Consumable'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default PackingRequestRow;
