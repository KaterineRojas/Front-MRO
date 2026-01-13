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
  onToggleExpand: (requestNumber: string) => void;
  isKitOrder: (req: LoanRequest) => boolean;
  getPriorityBadge: (priority: string) => React.ReactNode;
  selectedPackingItems: Set<string>;
  packingItemQuantities: Record<string, number>;
  handleSelectPackingItem: (requestId: number, itemId: number, defaultQuantity?: number) => void;
  handlePackingQuantityChange: (requestId: number, itemId: number, quantity: number) => void;
  getPackingItemQuantity: (requestId: number, itemId: number) => number;
  areAllItemsSelected: (requestId: number, items: LoanItem[]) => boolean;
  handleSelectAllPackingItems: (request: LoanRequest, checked: boolean) => void;
  printedRequests: Set<string>;
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
  // Debug logging
  console.log(`🔄 Rendering PackingRequestRow - RequestNumber: ${request.requestNumber}, Expanded: ${expanded}`);
  
// 1. Lógica para determinar si el botón debe estar deshabilitado
    const isPrinted = printedRequests.has(request.requestNumber);
    const isKit = isKitOrder(request);
    const areItemsSelected = request.items.some(item => selectedPackingItems.has(`${request.id}-${item.id}`));

    const isPacking = request.status === 'Packing';
    const isApproved = request.status === 'Approved';
    const isSent = request.status === 'Sent';

    const hasZeroQuantities = !isKit && request.items.some(item => {
      const itemKey = `${request.id}-${item.id}`;
      return selectedPackingItems.has(itemKey) && ((packingItemQuantities[itemKey] ?? 0) <= 0);
    });

    // El botón solo está habilitado si el status es "Packing", está impreso, tiene items seleccionados y ninguna cantidad es 0
    const isValidForPacking = isPacking && isPrinted && (isKit || areItemsSelected) && !hasZeroQuantities;

   const showDisabledToast = (e: React.MouseEvent) => {
        // Solo proceder si la acción es inválida
        if (!isValidForPacking) {
            e.stopPropagation(); 
            
            let disabledMessage = '';
            
            // Lógica para determinar el mensaje exacto
            if (!isPacking) {
                disabledMessage = 'Request must be in Packing status. Please print the packing list first.';
            } else if (!isPrinted) {
                disabledMessage = 'To confirm, you must first print the packing list.';
            } else if (!isKit && !areItemsSelected) {
              disabledMessage = 'Please select the items and specify the quantities to pack.';
            } else if (hasZeroQuantities) {
              disabledMessage = 'Packaged quantity must be greater than 0 for all selected items.';
            } else {
                disabledMessage = 'Action blocked due to pending validations.';
            }           
            toast.error(disabledMessage);
        }
    };

// 3. Lógica para el botón de IMPRESORA
    const printerTitle = isApproved 
        ? 'Start Packing and Print List' 
        : isPacking 
            ? 'Print Packing List' 
            : 'Request already sent or completed';
    const printerDisabled = isSent; 
    const printerVariant = isApproved ? 'default' : 'outline';
  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              console.log('=== CLICK EN FLECHA ===');
              console.log('Request Number:', request.requestNumber);
              console.log('Expanded antes:', expanded);
              onToggleExpand(request.requestNumber);
            }}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-mono">{request.requestNumber}</TableCell>
        <TableCell>
          <div>
            <div>{request.requesterName}</div>
            <div className="text-sm text-muted-foreground">{request.requesterEmail}</div>
          </div>
        </TableCell>
        <TableCell>{request.departmentId}</TableCell>
        <TableCell>{request.projectId}</TableCell>
        <TableCell>
          {new Date(request.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-')}
        </TableCell>
        <TableCell>
          <Badge variant={isKitOrder(request) ? 'default' : 'outline'}>{isKitOrder(request) ? 'Yes' : 'No'}</Badge>
        </TableCell>

        <TableCell>
          <div className="flex space-x-2">
            <Button 
                variant={printerVariant} 
                size="sm" 
                onClick={() => handlePrintSinglePacking(request)}
                disabled={printerDisabled}
                title={printerTitle}
                >
                <Printer className="h-4 w-4" />
                </Button>
            <div style={{ display: 'inline-block', cursor: isValidForPacking ? 'default' : 'not-allowed' }}
                onClick={!isValidForPacking ? showDisabledToast : undefined}>
                    <Button
                        variant="default"
                        onClick={() => handleConfirmPacking(request)} 
                        // 🚨 MODIFICACIÓN: Deshabilitar el botón de Confirmar si ya se envió (isSent)
                        disabled={!isValidForPacking || isSent }
                        title={isSent ? 'Request already sent' : 'Confirm Packing'}
                        style={{ pointerEvents: isValidForPacking && !isSent ? 'auto' : 'none' }}>
                        <Package className="mr-2 h-4 w-4" /> Confirm Packing
                    </Button>
                </div>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={10} className="bg-muted/30 p-0">
            <div className="p-4 max-w-full overflow-hidden">
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

              <div 
                className="rounded-md border bg-card overflow-x-auto" 
                onScroll={(e) => e.stopPropagation()}
                style={{ isolation: 'isolate', maxWidth: '100%' }}
              >
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className='text-center'>
                      <th>Select</th>
                      <th>Image</th>
                      <th>Sku</th>
                      <th>Name</th>
                      <th>Requeted quantity</th>
                      <th>Packaged quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.items.map(item => {
                      const itemKey = `${request.id}-${item.id}`;
                      return (
                        <tr key={item.id}>
                          <td className="text-center">
                            {!isKitOrder(request) ? (
                              <input
                                type="checkbox"
                                checked={selectedPackingItems.has(itemKey)}
                                onChange={() => handleSelectPackingItem(request.id, item.id, item.quantityRequested)}
                                className="h-4 w-4"
                              />
                            ) : null}
                          </td>
                          <td className="flex justify-center">
                            <ImageWithFallback src={item.imageUrl || ''} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          </td>
                          <td className="font-mono text-sm text-center">{item.sku}</td>
                          <td className="text-center">{item.name}</td>
                          <td className="text-center">{item.quantityRequested}</td>
                          <td>
                            {!isKitOrder(request) ? (
                              <div className="text-center space-x-2">
                                <input 
                                  type="number" 
                                  min={1} 
                                  max={item.quantityRequested} 
                                  value={getPackingItemQuantity(request.id, item.id)} 
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    const numValue = parseInt(inputValue, 10);
                                    if (Number.isNaN(numValue)) {
                                      return;
                                    }
                                    if (numValue < 1) {
                                      handlePackingQuantityChange(request.id, item.id, 1);
                                      toast.error('Packaged quantity must be at least 1');
                                      return;
                                    }
                                    if (numValue > item.quantityRequested) {
                                      handlePackingQuantityChange(request.id, item.id, item.quantityRequested);
                                      toast.error(`Cannot exceed requested quantity of ${item.quantityRequested}`);
                                      return;
                                    }
                                    handlePackingQuantityChange(request.id, item.id, numValue);
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className={`w-20 ${getPackingItemQuantity(request.id, item.id) === 0 ? 'border-2 text-center border rounded px-2 py-1 border-black-400 bg-green-50 dark:bg-green-900/30' : 'border border-gray-300 dark:border-gray-600'}`}
                                />
                                <span className="text-sm text-muted-foreground">/ {item.quantityRequested} {item.unit}</span>
                              </div>
                            ) : (
                              <span>{item.quantityRequested} {item.unit}</span>
                            )}
                          </td>
                          <td className="text-center">
                            <Badge 
                              variant={
                                request.status === 'Approved' ? 'default' : 
                                request.status === 'Packing' ? 'secondary' : 
                                'outline'
                              }
                              className={
                                request.status === 'Approved' ? 'bg-blue-500 text-white' :
                                request.status === 'Packing' ? 'bg-yellow-500 text-white' :
                                request.status === 'Sent' ? 'bg-green-500 text-white' :
                                ''
                              }
                            >
                              {request.status}
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
