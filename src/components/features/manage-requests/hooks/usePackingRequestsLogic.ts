import React, { useState, useCallback, useEffect } from 'react';
// 🚨 CORRECCIÓN: Definición local de la interfaz del DTO de Envío para evitar errores de importación.
import { LoanRequest, LoanItem, CreateLoanRequestDto } from '../types'; 
import { getPackingRequests, updateLoanRequestStatus, startPacking, sendLoanRequest, getEngineerReturns } from '../services/requestManagementService';
import { handlePrintSinglePacking as utilPrintSingle } from '../utils/requestManagementUtils';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchPackingRequests, refreshPackingRequests } from '../../../../store/slices/requestsSlice';

// Interfaz para el DTO de envío (necesario solo para handleConfirmPackingDialog)
interface SendLoanRequestDto {
    items: Array<{
        loanRequestItemId: number;
        quantityFulfilled: number;
    }>;
}

const PRINTED_REQUESTS_KEY = 'packing_printed_requests';

interface UsePackingRequestsLogicProps {
  keeperEmployeeId: string;
}

export function usePackingRequestsLogic({ keeperEmployeeId }: UsePackingRequestsLogicProps) {
  const dispatch = useAppDispatch();
  const { packingRequests: reduxPackingRequests, loadingPacking, errorPacking } = useAppSelector((state) => state.requests);
  
  // Usar datos de Redux
  const packingRequests = reduxPackingRequests;
  const isLoading = loadingPacking;
  const error = errorPacking;
  
  const [expandedPackingRequests, setExpandedPackingRequests] = useState<Set<string>>(new Set());
  const [selectedPackingItems, setSelectedPackingItems] = useState<Set<string>>(new Set());
  const [packingItemQuantities, setPackingItemQuantities] = useState<Record<string, number>>({});
  
  // Inicializar printedRequests desde localStorage
  const [printedRequests, setPrintedRequests] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(PRINTED_REQUESTS_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  
  const [packingConfirmDialogOpen, setPackingConfirmDialogOpen] = useState(false);
  const [currentPackingRequest, setCurrentPackingRequest] = useState<LoanRequest | null>(null);
  
  const MOCK_WAREHOUSE_ID = 1; 
  const MOCK_DEPARTMENT_ID = 1;
  const MOCK_REQUESTER_ID = 1;


  // Fetch packing requests from Redux on mount
  useEffect(() => {
    dispatch(fetchPackingRequests()).then((result) => {
      if (fetchPackingRequests.fulfilled.match(result)) {
        const data = result.payload;
        console.log('📦 Packing requests received from Redux:', data);
        if (data && data.length > 0) {
          console.log('📦 First request:', data[0]);
          console.log('📦 First request keys:', Object.keys(data[0]));
          console.log('📦 First request id field:', data[0].id);
        }
        
        // Marcar automáticamente requests en estado 'Packing' como impresos
        const packingStatusRequests = data.filter(req => req.status === 'Packing').map(req => req.requestNumber);
        if (packingStatusRequests.length > 0) {
          setPrintedRequests(prev => {
            const updated = new Set(prev);
            packingStatusRequests.forEach(reqNum => updated.add(reqNum));
            return updated;
          });
        }
        
        // Limpiar del localStorage requests que ya no existen (fueron confirmados)
        const currentRequestNumbers = new Set(data.map(req => req.requestNumber));
        setPrintedRequests(prev => {
          const cleaned = new Set(Array.from(prev).filter(reqNum => currentRequestNumbers.has(reqNum)));
          return cleaned;
        });
      }
    });
  }, [dispatch]);
  
  // Persistir printedRequests en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PRINTED_REQUESTS_KEY, JSON.stringify(Array.from(printedRequests)));
    } catch (err) {
      console.error('Error saving printed requests to localStorage:', err);
    }
  }, [printedRequests]);
  
  const isKitOrder = useCallback((request: LoanRequest) => request.requestNumber.startsWith('KIT-'), []);  const handleToggleExpandPacking = useCallback((requestNumber: string) => {
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

// 1. Función para recargar la lista de Packing desde Redux
  const reloadPackingRequests = useCallback(async () => {
    try {
      await dispatch(refreshPackingRequests()).unwrap();
      console.log('✅ Packing requests reloaded from server');
    } catch (err) {
      console.error('Failed to reload packing requests', err);
    }
  }, [dispatch]);

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
                const updatedRequest = await startPacking(request.requestNumber, keeperEmployeeId);
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
          const updatedRequest = await startPacking(request.requestNumber, keeperEmployeeId);          
          if (updatedRequest) {
            // Recargar la lista para reflejar el cambio de estado
            await reloadPackingRequests();
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
  }, [packingItemQuantities, reloadPackingRequests]);
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
const handleConfirmPackingDialog = useCallback((
    setAllReturns: React.Dispatch<React.SetStateAction<LoanRequest[]>>,
    engineerId?: string,
    warehouseId?: number
) => {
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
        
        // 1.5. Asegurar que el keeper actual sea el "owner" del packing
        // Solo llamar a startPacking si el request está en estado "Approved"
        // Si ya está en "Packing", significa que otro keeper ya lo empacó
        if (currentPackingRequest.status === 'Approved') {
            console.log(`Calling startPacking for ${currentPackingRequest.requestNumber} with keeper ${keeperEmployeeId}`);
            const packingResult = await startPacking(currentPackingRequest.requestNumber, keeperEmployeeId);
            if (!packingResult) {
                toast.error(`Failed to update packing status for ${currentPackingRequest.requestNumber}`);
                return;
            }
        }
        // Si ya está en Packing, no llamamos a startPacking (el backend no lo permite)
        // Solo intentamos send, y si falla por validación de keeper, mostraremos el error
        
        console.log(`📦 Confirming packing for request: ${currentPackingRequest.requestNumber}`);
        console.log(`👤 Request is for engineer: ${currentPackingRequest.requesterId} (${currentPackingRequest.requesterName})`);
        console.log(`📋 Items being sent:`, sendDto);
        
        // 2. Llamada al API (PUT /send -> estado 'Sent')
        const sentRequest = await sendLoanRequest(currentPackingRequest.requestNumber, keeperEmployeeId, sendDto);

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
        
        // 4. Recargar Returns desde el API
        // Usar el requesterId del request enviado (el ingeniero que recibirá los items)
        // Si no se especificó engineerId en parámetros, usar el del request enviado
        const targetEngineerId = engineerId || currentPackingRequest.requesterId || 'amx0142';
        console.log(`🔄 Reloading engineer holdings for: ${targetEngineerId}`);
        
        try {
            const freshData = await getEngineerReturns(targetEngineerId, warehouseId || 1);
            setAllReturns(freshData || []);
            console.log(`✅ Reloaded ${freshData?.length || 0} returns for engineer ${targetEngineerId}`);
        } catch (err) {
            console.error('Error reloading returns after packing confirmation:', err);
        }
        
        toast.success(`Packing confirmed! Request ${currentPackingRequest.requestNumber} sent.`);
      } catch (err) {
        console.error('Error confirming packing and moving to returns', err);
        
        // Mostrar mensaje de error más descriptivo
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        if (errorMessage.includes('not the keeper who packed')) {
            toast.error(`Only the keeper who packed this request can send it. Please contact the original packer.`);
        } else {
            toast.error('Error confirming packing. Please try again.');
        }
      }
    })();
  }, [currentPackingRequest, isKitOrder, packingItemQuantities, selectedPackingItems, reloadPackingRequests, keeperEmployeeId]);
  return {
    packingRequests, isLoading, error, expandedPackingRequests, selectedPackingItems, packingItemQuantities, printedRequests,
    packingConfirmDialogOpen, currentPackingRequest, setPackingConfirmDialogOpen,
    isKitOrder, handleToggleExpandPacking, handleSelectPackingItem, handlePackingQuantityChange,
    getPackingItemQuantity, handleConfirmPacking, handleConfirmPackingDialog,
    handlePrintAllPacking, handlePrintSinglePacking, areAllItemsSelected, handleSelectAllPackingItems,
  };
}
