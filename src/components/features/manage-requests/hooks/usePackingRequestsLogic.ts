import React, { useState, useCallback, useEffect } from 'react';
// 🚨 CORRECCIÓN: Definición local de la interfaz del DTO de Envío para evitar errores de importación.
import { LoanRequest, LoanItem, CreateLoanRequestDto } from '../types'; 
import { getPackingRequests, updateLoanRequestStatus, startPacking, sendLoanRequest } from '../services/requestManagementService';
import { handlePrintSinglePacking as utilPrintSingle } from '../utils/requestManagementUtils';
import { toast } from 'react-hot-toast';

// Interfaz para el DTO de envío (necesario solo para handleConfirmPackingDialog)
interface SendLoanRequestDto {
    items: Array<{
        loanRequestItemId: number;
        quantityFulfilled: number;
    }>;
}

export function usePackingRequestsLogic() {
  const [packingRequests, setPackingRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPackingRequests, setExpandedPackingRequests] = useState<Set<string>>(new Set());
  const [selectedPackingItems, setSelectedPackingItems] = useState<Set<string>>(new Set());
  const [packingItemQuantities, setPackingItemQuantities] = useState<Record<string, number>>({});
  const [printedRequests, setPrintedRequests] = useState<Set<string>>(new Set());
  const [packingConfirmDialogOpen, setPackingConfirmDialogOpen] = useState(false);
  const [currentPackingRequest, setCurrentPackingRequest] = useState<LoanRequest | null>(null);

  const MOCK_KEEPER_EMPLOYEE_ID = "amx0093";
  const MOCK_WAREHOUSE_ID = 1; 
  const MOCK_DEPARTMENT_ID = 1;
  const MOCK_REQUESTER_ID = 1;


  // Fetch packing requests from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPackingRequests();
        console.log('📦 Packing requests received:', data);
        if (data && data.length > 0) {
          console.log('📦 First request:', data[0]);
          console.log('📦 First request keys:', Object.keys(data[0]));
          console.log('📦 First request id field:', data[0].id);
        }
        setPackingRequests(data || []);
      } catch (err) {
        console.error('Failed to load packing requests', err);
        setError('Failed to load packing requests');
        setPackingRequests([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  const isKitOrder = useCallback((request: LoanRequest) => request.requestNumber.startsWith('KIT-'), []);

  const handleToggleExpandPacking = useCallback((requestNumber: string) => {
    console.log('Toggle expand for requestNumber:', requestNumber);
    setExpandedPackingRequests(prev => {
      const newExpanded = new Set(prev);
      console.log('Before toggle, expanded requestNumbers:', Array.from(prev));
      if (newExpanded.has(requestNumber)) {
        newExpanded.delete(requestNumber);
        console.log('Removed requestNumber:', requestNumber);
      } else {
        newExpanded.add(requestNumber);
        console.log('Added requestNumber:', requestNumber);
      }
      console.log('After toggle, expanded requestNumbers:', Array.from(newExpanded));
      return newExpanded;
    });
  }, []);  const handleSelectPackingItem = useCallback((requestId: number, itemId: number) => {
    const itemKey = `${requestId}-${itemId}`;
    setSelectedPackingItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(itemKey)) {
        newSelected.delete(itemKey);
        setPackingItemQuantities(q => { const { [itemKey]: _, ...rest } = q; return rest; });
      } else {
        newSelected.add(itemKey);
      }
      return newSelected;
    });
  }, []);

  const handlePackingQuantityChange = useCallback((requestId: number, itemId: number, quantity: number) => {
    const itemKey = `${requestId}-${itemId}`;
    setPackingItemQuantities(prev => ({ ...prev, [itemKey]: quantity }));
  }, []);

  const getPackingItemQuantity = useCallback((requestId: number, itemId: number) => {
    const itemKey = `${requestId}-${itemId}`;
    return packingItemQuantities[itemKey] || 0;
  }, [packingItemQuantities]);

  const handleConfirmPacking = useCallback((request: LoanRequest) => {
    setCurrentPackingRequest(request);
    setPackingConfirmDialogOpen(true);
  }, []);

  // 1. Función para recargar la lista de Packing (DEBE ir ANTES de handlePrintAllPacking)
  const reloadPackingRequests = useCallback(async () => {
    try {
      const data = await getPackingRequests();
      setPackingRequests(data || []);
    } catch (err) {
      console.error('Failed to reload packing requests', err);
    }
  }, []);

// =================================================================
// Función Auxiliar para la Generación de HTML (Reutilizable)
// =================================================================
function generatePackingHtml(request: LoanRequest, quantities: Record<string, number>): string {
    const isKit = request.items.some(item => item.isKit);
    
    // Contenido del <body>
    return `
      <div class="request-card">
        <div class="request-header">
          <h2>${request.requestNumber} ${isKit ? ' (KIT ORDER)' : ''}</h2>
          <p><strong>Borrower:</strong> ${request.requesterName} (${request.requesterEmail ?? 'N/A'})</p>
          <p><strong>Department:</strong> ${request.departmentName ?? 'N/A'} | <strong>Project:</strong> ${request.project ?? 'N/A'}</p>
          <p><strong>Priority:</strong> <span class="priority-${request.priority ?? 'low'}">${(request.priority ?? 'low').toUpperCase()}</span></p>
          <p><strong>Loan Date:</strong> ${new Date(request.requestedLoanDate ?? '').toLocaleDateString()} | <strong>Expected Return:</strong> ${new Date(request.expectedReturnDate ?? '').toLocaleDateString()}</p>
        </div>
        
        <h3>Items Checklist:</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 30px;">✓</th>
              <th>SKU / BIN Code</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Verified By</th>
            </tr>
          </thead>
          <tbody>
            ${request.items.map(item => {
              const itemKey = `${request.id}-${item.id}`;
              const qty = quantities[itemKey] !== undefined ? quantities[itemKey] : item.quantityRequested;
              return `
                <tr>
                  <td><span class="checkbox"></span></td>
                  <td>${item.sku}</td>
                  <td>${item.articleDescription || item.name}</td>
                  <td>${qty}${qty !== item.quantityRequested ? ` (Original: ${item.quantityRequested})` : ''}</td>
                  <td>${item.unit ?? 'Pcs'}</td>
                  <td>________________</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
          <p><strong>Checked by:</strong> _________________________ <strong>Date:</strong> _____________</p>
          <p><strong>Signature:</strong> _________________________</p>
        </div>
      </div>
    `;
}

// 2. Lógica handlePrintAllPacking (CORREGIDA: Solo cambia a estado 'Packed')
const handlePrintAllPacking = useCallback(async () => { // Ya no necesita setAllReturns
    if (packingRequests.length === 0) return;

    // --- PARTE 1: GENERACIÓN E IMPRESIÓN DEL DOCUMENTO ---
    const allRequestsHtml = packingRequests.map(request => 
        generatePackingHtml(request, packingItemQuantities)
    ).join('<div style="page-break-after: always;"></div>'); // Separador de página

    const printContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>MASTER PACKING CHECKLIST (${new Date().toLocaleDateString()})</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .request-card { border: 1px solid #ccc; margin-bottom: 20px; padding: 15px; page-break-inside: avoid; }
                    .request-header { background-color: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .items-table th { background-color: #f9f9f9; }
                    .checkbox { width: 20px; height: 20px; border: 2px solid #333; display: inline-block; margin-right: 10px; }
                    .priority-high { color: #ff6b35; font-weight: bold; }
                    .priority-medium { color: #f7931e; font-weight: bold; }
                    .priority-urgent { color: #dc3545; font-weight: bold; }
                    .notes { background-color: #f8f9fa; padding: 10px; margin-top: 10px; border-left: 4px solid #007bff; }
                    @media print { body { margin: 0; } .request-card { page-break-inside: avoid; } }
                    .page-break-after { page-break-after: always; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>MASTER PACKING CHECKLIST</h1>
                    <p>Total Requests: ${packingRequests.length} | Generated on: ${new Date().toLocaleDateString()}</p>
                </div>
                ${allRequestsHtml}
            </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    } else {
         toast.error('Could not open print window. Check pop-up blockers.');
         return; 
    }

    // --- PARTE 2: ACTUALIZACIÓN MASIVA DEL ESTADO A 'PACKED' (usando startPacking) ---
    let successfulUpdates = 0;
    
    const updatePromises = packingRequests.map(async (request) => {
        // Solo llamar a startPacking si la solicitud está en estado 'Approved'
        if (request.status === 'Approved') {
            try {
                const updatedRequest = await startPacking(request.requestNumber, MOCK_KEEPER_EMPLOYEE_ID);
                if (updatedRequest) {
                    successfulUpdates++;
                    setPrintedRequests(prev => new Set(prev).add(request.requestNumber));
                    return true;
                }
            } catch (error) {
                console.error(`Error starting packing for request ${request.requestNumber}:`, error);
            }
        } else {
            // Si ya está en Packing, solo marcar como impresa
            setPrintedRequests(prev => new Set(prev).add(request.requestNumber));
        }
        return false;
    });

    await Promise.all(updatePromises);
    
    // --- PARTE 3: LIMPIEZA FINAL DE LA UI ---
    
    // Recargar la lista de Packing para que refleje el nuevo estado 'Packed'
    await reloadPackingRequests(); 
    
    toast.success(`Printed all requests. Status updated to 'Packed' for ${successfulUpdates} requests.`);

}, [
    packingRequests, 
    packingItemQuantities, 
    reloadPackingRequests,
    setPrintedRequests
]);

  const handlePrintSinglePacking = useCallback(async (request: LoanRequest) => { 
    const printed = utilPrintSingle(request, packingItemQuantities);   
    if (printed) {
      setPrintedRequests(prev => new Set(prev).add(request.requestNumber));
      if (request.status === 'Approved') {
        try {
          const updatedRequest = await startPacking(request.requestNumber, MOCK_KEEPER_EMPLOYEE_ID);          
          if (updatedRequest) {
            toast.success(`Request ${request.requestNumber} status updated to Packing.`);
          } else {
            toast.error('Failed to update status to Packing after printing.');
          }
        } catch (error) {
          console.error('Error starting packing:', error);
          toast.error('Error updating status after printing.');
        }
      } else {
        toast.success(`Packing list for ${request.requestNumber} printed.`);
      }
    }
  }, [packingItemQuantities]);
  const areAllItemsSelected = useCallback((requestId: number, items: LoanItem[]) => 
    items.every(item => selectedPackingItems.has(`${requestId}-${item.id}`)), [selectedPackingItems]);

  const handleSelectAllPackingItems = useCallback((request: LoanRequest, checked: boolean) => {
    const newSelected = new Set(selectedPackingItems);
    // Iterate over all main LoanItems (both regular and Kits) using their id as the selection key
    request.items.forEach(item => {
      const itemKey = `${request.id}-${item.id}`;
      if (checked) {
        newSelected.add(itemKey);
      } else {
        newSelected.delete(itemKey);
      }
    });
    setSelectedPackingItems(newSelected);
  }, [selectedPackingItems]);
  

  // Manejador de confirmación con dependencia cruzada (necesita el setter de Returns)
const handleConfirmPackingDialog = useCallback((setAllReturns: React.Dispatch<React.SetStateAction<LoanRequest[]>>) => {
    return (async () => {
      if (!currentPackingRequest) return;
      
      // 1. Preparar los ítems para el DTO de envío
      const itemsToMove = currentPackingRequest.items.filter(item => {
        const itemKey = `${currentPackingRequest.id}-${item.id}`;
        if (item.id <= 0) {
            console.warn(`Skipping item with invalid ID: ${item.id}`);
            return false;
        }
        // Filtra solo si es un Kit (se asume que se empaca todo) o si el ítem fue seleccionado
        return isKitOrder(currentPackingRequest) || selectedPackingItems.has(itemKey);
      }).map(item => {
        const itemKey = `${currentPackingRequest.id}-${item.id}`;
        const qty = packingItemQuantities[itemKey] !== undefined ? packingItemQuantities[itemKey] : item.quantityRequested;
        // Mapear al formato temporal para 'itemsToMove'
        return { ...item, quantity: qty, status: 'active' as const }; 
      });

      const sendItemsForApi = itemsToMove.map(item => ({
            // Usamos 'loanRequestItemId' (minúscula)
            loanRequestItemId: item.id, 
            // 🚨 CORRECCIÓN CLAVE: Usamos 'quantityFulfilled' que espera el API
            quantityFulfilled: item.quantity, 
        })) as unknown as SendLoanRequestDto['items']; // Uso de la interfaz definida localmente
      
      try {

        const sendDto = { items: sendItemsForApi };
        console.log('DTO being sent to /send:', sendDto);
        // 2. Llamada al API (PUT /send -> estado 'Sent')
        const sentRequest = await sendLoanRequest(currentPackingRequest.requestNumber, MOCK_KEEPER_EMPLOYEE_ID, sendDto);

        if (!sentRequest) {
              toast.error(`Error: Failed to change status of ${currentPackingRequest.requestNumber} to Sent.`);
              return; // Detener la limpieza si el paso crítico falla
          }
        
        // 3. Limpieza de la UI
        await reloadPackingRequests();
        
        const newSelectedItems = new Set(selectedPackingItems);
        currentPackingRequest.items.forEach(item => { const itemKey = `${currentPackingRequest.id}-${item.id}`; newSelectedItems.delete(itemKey); });
        setSelectedPackingItems(newSelectedItems);
        setPackingItemQuantities({});
        setPackingConfirmDialogOpen(false);
        setCurrentPackingRequest(null);
        
        // 4. Actualización del estado de Returns
        setAllReturns(prev => {
                const exists = prev.some(req => req.requestNumber === sentRequest.requestNumber);
                if (!exists) {
                    // Agregamos la solicitud actualizada (en estado 'Sent')
                    return [...prev, sentRequest];
                }
                return prev;
            });
        toast.success(`Packing confirmed! Request ${currentPackingRequest.requestNumber} sent.`);
      } catch (err) {
        console.error('Error confirming packing and moving to returns', err);
        toast.error('Error confirming packing. Please try again.');
      }
    })();
  }, [currentPackingRequest, isKitOrder, packingItemQuantities, selectedPackingItems, reloadPackingRequests]);


  return {
    packingRequests, isLoading, error, expandedPackingRequests, selectedPackingItems, packingItemQuantities, printedRequests,
    packingConfirmDialogOpen, currentPackingRequest, setPackingConfirmDialogOpen,
    isKitOrder, handleToggleExpandPacking, handleSelectPackingItem, handlePackingQuantityChange,
    getPackingItemQuantity, handleConfirmPacking, handleConfirmPackingDialog,
    handlePrintAllPacking, handlePrintSinglePacking, areAllItemsSelected, handleSelectAllPackingItems,
  };
}
