import { useState, useMemo, useCallback, Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { LoanRequest, LoanItem} from '../types';
import { getEngineerReturns, getWarehouseEngineers, uploadReturnPhoto, submitReturnLoan, ReturnItemPayload, ReturnLoanPayload} from '../services/requestManagementService';
import { formatConditionText as utilFormatConditionText } from '../utils/requestManagementUtils';
import { toast } from 'react-hot-toast';
import { handlePrintMissingKitItems } from '../utils/listKitRestock';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchReturns, refreshReturns } from '../../../../store/slices/requestsSlice';

export type ConditionCounts = { good: number, revision: number, lost: number };

interface UseReturnsLogicParams {
  engineerId?: string;
  warehouseId?: number;
}

export function useReturnsLogic({ engineerId = 'amx0142', warehouseId = 1 }: UseReturnsLogicParams = {}) {
  const dispatch = useAppDispatch();
  const { returns: reduxReturns, loadingReturns, errorReturns } = useAppSelector((state) => state.requests);
  
  // Usar datos de Redux pero mantener setAllReturns para actualizaciones locales
  const [allReturns, setAllReturns] = useState<LoanRequest[]>([]);
  const allReturnsRef = useRef<LoanRequest[]>([]);
  
  // Estado para la lista de ingenieros del warehouse
  const [warehouseEngineers, setWarehouseEngineers] = useState<{ employeeId: string; name: string; email: string }[]>([]);
  const [loadingEngineers, setLoadingEngineers] = useState(false);
  
  const [selectedReturnBorrower, setSelectedReturnBorrower] = useState<string>('');
  const [expandedReturns, setExpandedReturns] = useState<Set<number>>(new Set());
  const [expandedKitItems, setExpandedKitItems] = useState<Set<string>>(new Set());
  const [selectedReturnItems, setSelectedReturnItems] = useState<Set<string>>(new Set());
  const [selectedKitItems, setSelectedKitItems] = useState<Set<string>>(new Set());
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [kitItemQuantities, setKitItemQuantities] = useState<Record<string, number>>({});
  const [itemConditions, setItemConditions] = useState<Record<string, string>>({});
  const [kitItemConditions, setKitItemConditions] = useState<Record<string, string>>({});
  const [borrowerSelectSearchTerm, setBorrowerSelectSearchTerm] = useState<string>('');
  const [itemsPhotoDialogOpen, setItemsPhotoDialogOpen] = useState(false);
  const [kitPhotoDialogOpen, setKitPhotoDialogOpen] = useState(false);
  const [currentKitItem, setCurrentKitItem] = useState<{requestId: number, itemId: number} | null>(null);
  const [itemsPhotoUrl, setItemsPhotoUrl] = useState<string | null>(null);
  const [kitPhotos, setKitPhotos] = useState<Record<string, string>>({});
  const [kitReturnDialogOpen, setKitReturnDialogOpen] = useState(false);
  const [kitReturnOption, setKitReturnOption] = useState<'restock' | 'disassemble' | ''>('');
  const [pendingKitReturn, setPendingKitReturn] = useState<{requestId: number, itemId: number} | null>(null);
  const [kitConfirmationDialogOpen, setKitConfirmationDialogOpen] = useState(false);
  const [pendingKitConfirmation, setPendingKitConfirmation] = useState<{option: 'restock' | 'disassemble', selectedCount: number} | null>(null);
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [currentConditionItem, setCurrentConditionItem] = useState<{ requestId: number; itemId: number; kitItemId?: number; isKit: boolean; occurrences?: Array<{requestId: number; itemId: number}> } | null>(null);
  const [conditionCounts, setConditionCounts] = useState<ConditionCounts>({ good: 0, revision: 0, lost: 0 });
  const [missingKitItems, setMissingKitItems] = useState<Array<{id: number, name: string, category: string, missingQuantity: number, totalQuantity: number}>>([]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  // Sincronizar Redux con estado local
  useEffect(() => {
    console.log('🔄 [useReturnsLogic] Syncing Redux returns to local state');
    console.log('🔄 [useReturnsLogic] reduxReturns.length:', reduxReturns.length);
    console.log('🔄 [useReturnsLogic] selectedReturnBorrower:', selectedReturnBorrower);
    setAllReturns(reduxReturns);
  }, [reduxReturns, selectedReturnBorrower]);
  
  const isLoading = loadingReturns;
  const error = errorReturns;

  // Mantener la referencia actualizada de allReturns
  useEffect(() => {
    allReturnsRef.current = allReturns;
  }, [allReturns]);

  // Cargar lista de ingenieros del warehouse
  useEffect(() => {
    const loadWarehouseEngineers = async () => {
      setLoadingEngineers(true);
      try {
        const engineers = await getWarehouseEngineers(warehouseId);
        setWarehouseEngineers(engineers);
        console.log('✅ Loaded warehouse engineers:', engineers);
      } catch (error) {
        console.error('Error loading warehouse engineers:', error);
        setWarehouseEngineers([]);
      } finally {
        setLoadingEngineers(false);
      }
    };
    
    loadWarehouseEngineers();
  }, [warehouseId]);

  // Cargar returns solo cuando se selecciona un ingeniero
  useEffect(() => {
    console.log('🔍 [useReturnsLogic] Effect triggered - selectedReturnBorrower:', selectedReturnBorrower);
    console.log('🔍 [useReturnsLogic] warehouseEngineers:', warehouseEngineers);
    
    if (selectedReturnBorrower) {
      // Buscar el employeeId del ingeniero seleccionado
      const selectedEngineer = warehouseEngineers.find(e => e.name === selectedReturnBorrower);
      console.log('🔍 [useReturnsLogic] selectedEngineer found:', selectedEngineer);
      
      if (selectedEngineer) {
        console.log('🔄 [useReturnsLogic] Dispatching fetchReturns for:', selectedEngineer.employeeId, 'warehouse:', warehouseId);
        dispatch(fetchReturns({ engineerId: selectedEngineer.employeeId, warehouseId }));
      } else {
        console.warn('⚠️ [useReturnsLogic] Engineer not found in warehouseEngineers list');
      }
    }
  }, [dispatch, selectedReturnBorrower, warehouseId, warehouseEngineers]);
  
  // Lista de ingenieros desde el API del warehouse (en lugar de extraerlos de returns)
  const uniqueReturnBorrowers = useMemo(() => {
    return warehouseEngineers.map(e => e.name).sort();
  }, [warehouseEngineers]);

  const filteredReturns = useMemo(() => {
    console.log('🔍 [filteredReturns] Computing...');
    console.log('🔍 [filteredReturns] selectedReturnBorrower:', selectedReturnBorrower);
    console.log('🔍 [filteredReturns] allReturns.length:', allReturns.length);
    
    if (!selectedReturnBorrower) {
      console.log('⚠️ [filteredReturns] No borrower selected, returning empty array');
      return [];
    }
    
    const filtered = allReturns.filter(req => {
      const matches = req.requesterName === selectedReturnBorrower;
      console.log(`🔍 [filteredReturns] Request ${req.requestNumber}: requesterName="${req.requesterName}" matches="${matches}"`);
      return matches;
    });
    
    console.log('✅ [filteredReturns] Filtered results:', filtered.length);
    return filtered;
  }, [allReturns, selectedReturnBorrower]);
  const filteredBorrowersForSelect = useMemo(() => {
    if (!borrowerSelectSearchTerm.trim()) return uniqueReturnBorrowers;
    return uniqueReturnBorrowers.filter(b => b.toLowerCase().includes(borrowerSelectSearchTerm.toLowerCase()));
  }, [uniqueReturnBorrowers, borrowerSelectSearchTerm]);
  
  // Getters 
  const getReturnQuantity = useCallback((requestId: number, itemId: number) => {
    const itemKey = `${requestId}-${itemId}`;
    
    console.log('🔍 [getReturnQuantity] requestId:', requestId, 'itemId:', itemId);
    console.log('🔍 [getReturnQuantity] returnQuantities[itemKey]:', returnQuantities[itemKey]);
    console.log('🔍 [getReturnQuantity] allReturns.length:', allReturns.length);
    
    if (returnQuantities[itemKey] !== undefined) {
        console.log('✅ [getReturnQuantity] Returning from returnQuantities:', returnQuantities[itemKey]);
        return returnQuantities[itemKey];
    }

    const request = allReturns.find(r => r.id === requestId);
    const item = request?.items.find(i => i.id === itemId);
    
    const result = item?.quantityRequested ?? 1;
    console.log('⚠️ [getReturnQuantity] Returning from allReturns:', result, 'item found:', !!item);
    
    return result;
  }, [returnQuantities, allReturns]); 

  const getKitItemQuantity = useCallback((requestId: number, itemId: number, kitItemId: number) => {
    const itemKey = `${requestId}-${itemId}-${kitItemId}`;
    if (kitItemQuantities[itemKey] !== undefined) {
        return kitItemQuantities[itemKey];
    }

    const request = allReturns.find(r => r.id === requestId);
    const kit = request?.items.find(i => i.id === itemId);
    const kitSubItem = kit?.kitItems?.find(i => i.id === kitItemId);
    return kitSubItem?.quantity ?? 1;
  }, [kitItemQuantities, allReturns]); 
  
  const getItemCondition = useCallback((requestId: number, itemId: number) => itemConditions[`${requestId}-${itemId}`], [itemConditions]);
  const getKitItemCondition = useCallback((requestId: number, itemId: number, kitItemId: number) => kitItemConditions[`${requestId}-${itemId}-${kitItemId}`], [kitItemConditions]);

  // Función para obtener el request actualizado desde el ref (para procesamiento secuencial)
  const getCurrentRequest = useCallback((requestId: number): LoanRequest | undefined => {
    return allReturnsRef.current.find(r => r.id === requestId);
  }, []);

  // Handlers
  const handleBorrowerSelect = useCallback((value: string) => { 
    console.log('🎯 [handleBorrowerSelect] Selected borrower:', value);
    setSelectedReturnBorrower(value); 
    setBorrowerSelectSearchTerm(''); 
  }, []);
  const handleToggleExpandReturns = useCallback((id: number) => { setExpandedReturns(prev => { const newExpanded = new Set(prev); if (newExpanded.has(id)) newExpanded.delete(id); else newExpanded.add(id); return newExpanded; }); }, []);
  const handleToggleExpandKitItem = useCallback((requestId: number, itemId: number) => { const kitKey = `${requestId}-${itemId}`; setExpandedKitItems(prev => { const newExpanded = new Set(prev); if (newExpanded.has(kitKey)) newExpanded.delete(kitKey); else newExpanded.add(kitKey); return newExpanded; }); }, []);

  // 🛑 MODIFICACIÓN: Límite de cantidad a devolver (regular item)
  const handleReturnQuantityChange = useCallback((requestId: number, itemId: number, quantity: number) => { 
      const itemKey = `${requestId}-${itemId}`; 
      
      const request = allReturns.find(r => r.id === requestId);
      const item = request?.items.find(i => i.id === itemId);
      const maxQty = item?.quantityFulfilled ?? item?.quantityRequested ?? 1;

      // La cantidad debe ser mayor o igual a 0 y menor o igual a la cantidad disponible
      if (quantity < 0) {
          toast.error('Quantity to Return cannot be negative.');
          setReturnQuantities(prev => ({ ...prev, [itemKey]: 0 }));
          return;
      }
      
      if (quantity > maxQty) {
          toast.error(`Quantity to Return (${quantity}) cannot exceed available quantity (${maxQty}).`);
          setReturnQuantities(prev => ({ ...prev, [itemKey]: maxQty })); 
          return;
      }
      
      setReturnQuantities(prev => ({ ...prev, [itemKey]: quantity })); 
  }, [allReturns]);  // 🛑 MODIFICACIÓN: Inicialización de returnQuantities (regular item)
  const handleSelectReturnItem = useCallback((requestId: number, itemId: number) => {
    const itemKey = `${requestId}-${itemId}`;
    
    setSelectedReturnItems(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(itemKey)) { 
            newSelected.delete(itemKey); 
            setReturnQuantities(q => { const { [itemKey]: _, ...rest } = q; return rest; }); 
            setItemConditions(c => { const { [itemKey]: _, ...rest } = c; return rest; }); 
        } 
        else { 
            newSelected.add(itemKey); 
            // Inicializar con 0 para que el usuario ingrese la cantidad
            setReturnQuantities(q => ({ ...q, [itemKey]: 0 })); 
            // Condition will be set when user saves condition modal or defaults to "Good: X" on submit
        }
        return newSelected;
    });
  }, [allReturns]);  // 🛑 MODIFICACIÓN: Límite de cantidad a devolver (kit sub-item)
  const handleKitItemQuantityChange = useCallback((requestId: number, itemId: number, kitItemId: number, quantity: number) => { 
      const itemKey = `${requestId}-${itemId}-${kitItemId}`;
      
      const request = allReturns.find(r => r.id === requestId);
      const kit = request?.items.find(i => i.id === itemId);
      const kitSubItem = kit?.kitItems?.find(i => i.id === kitItemId);
      const maxQty = kitSubItem?.quantity ?? 1; 

      if (quantity >= 1) {
          if (quantity > maxQty) {
              toast.error(`Return quantity (${quantity}) cannot exceed the item's original quantity (${maxQty}). Quantity set to ${maxQty}.`);
              setKitItemQuantities(prev => ({ ...prev, [itemKey]: maxQty }));
              return;
          }
          setKitItemQuantities(prev => ({ ...prev, [itemKey]: quantity })); 
      }
  }, [allReturns]); 
	
  // 🛑 MODIFICACIÓN: Inicialización de kitItemQuantities (kit sub-item)
  const handleSelectKitItem = useCallback((requestId: number, itemId: number, kitItemId: number) => {
    const kitItemKey = `${requestId}-${itemId}-${kitItemId}`; 

    const request = allReturns.find(r => r.id === requestId);
    const kit = request?.items.find(i => i.id === itemId);
    const kitSubItem = kit?.kitItems?.find(i => i.id === kitItemId);
    const quantityRequested = kitSubItem?.quantity ?? 1;
  	
    setSelectedKitItems(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(kitItemKey)) { 
            newSelected.delete(kitItemKey); 
            setKitItemQuantities(q => { const { [kitItemKey]: _, ...rest } = q; return rest; }); 
            setKitItemConditions(c => { const { [kitItemKey]: _, ...rest } = c; return rest; }); 
        } 
        else { 
            newSelected.add(kitItemKey); 
            setKitItemQuantities(q => ({ ...q, [kitItemKey]: quantityRequested })); 
            setKitItemConditions(c => ({ ...c, [kitItemKey]: 'good-condition' })); 
        }
        return newSelected;
    });
  }, [allReturns]);


  const handleOpenConditionDialog = useCallback((requestId: number, itemId: number, isKit: boolean, kitItemId?: number, occurrences?: Array<{requestId: number; itemId: number}>) => {
    setCurrentConditionItem({ requestId, itemId, kitItemId, isKit, occurrences });
    const itemKey = isKit && kitItemId ? `${requestId}-${itemId}-${kitItemId}` : `${requestId}-${itemId}`;
    const existingCondition = isKit ? kitItemConditions[itemKey] : itemConditions[itemKey];    // Restaurar conditionCounts
    if (existingCondition) {
      const goodMatch = existingCondition.match(/Good: (\d+)/);
      const revisionMatch = existingCondition.match(/Revision: (\d+)/);
      const lostMatch = existingCondition.match(/Lost: (\d+)/);
      setConditionCounts({ 
        good: goodMatch ? parseInt(goodMatch[1]) : 0, 
        revision: revisionMatch ? parseInt(revisionMatch[1]) : 0, 
        lost: lostMatch ? parseInt(lostMatch[1]) : 0 
      });
    } else {
      setConditionCounts({ good: 0, revision: 0, lost: 0 }); 
    }
    
    setConditionDialogOpen(true);
  }, [kitItemConditions, itemConditions]);

  // 🛑 MODIFICACIÓN: Validar total de condiciones EXACTAMENTE IGUAL a la cantidad a devolver
  const handleSaveCondition = useCallback(async () => {
    if (!currentConditionItem) return;
    const { requestId, itemId, kitItemId, isKit, occurrences } = currentConditionItem;
    const itemKey = isKit && kitItemId ? `${requestId}-${itemId}-${kitItemId}` : `${requestId}-${itemId}`;
    const total = conditionCounts.good + conditionCounts.revision + conditionCounts.lost;

    console.log('🔍 [handleSaveCondition] currentConditionItem:', currentConditionItem);
    console.log('🔍 [handleSaveCondition] conditionCounts:', conditionCounts);
    console.log('🔍 [handleSaveCondition] total:', total);

    if (total === 0) { 
      toast.error('Please specify at least one item condition.'); 
      return; 
    }

    // Si hay múltiples occurrences (item agregado), sumar todas las returnQuantities
    let returnQty: number;
    if (occurrences && occurrences.length > 0) {
      returnQty = occurrences.reduce((sum, occ) => sum + getReturnQuantity(occ.requestId, occ.itemId), 0);
      console.log('🔍 [handleSaveCondition] returnQty from occurrences:', returnQty);
    } else if (isKit && kitItemId) {
      returnQty = getKitItemQuantity(requestId, itemId, kitItemId);
      console.log('🔍 [handleSaveCondition] returnQty from kit:', returnQty);
    } else {
      returnQty = getReturnQuantity(requestId, itemId);
      console.log('🔍 [handleSaveCondition] returnQty from regular item:', returnQty);
    }

    console.log('🔍 [handleSaveCondition] Final returnQty:', returnQty, 'total:', total);

    // Validación EXACTA: la suma debe ser igual a Quantity to Return
    if (total !== returnQty) {
      console.error('❌ [handleSaveCondition] Validation failed - total:', total, 'returnQty:', returnQty);
      toast.error(`Total condition count (${total}) must equal the Quantity to Return (${returnQty}).`);
      return;
    }

    let conditionString = '';
    if (conditionCounts.good > 0) conditionString += `Good: ${conditionCounts.good}`;
    if (conditionCounts.revision > 0) conditionString += (conditionString ? ', ' : '') + `Revision: ${conditionCounts.revision}`;
    if (conditionCounts.lost > 0) conditionString += (conditionString ? ', ' : '') + `Lost: ${conditionCounts.lost}`;
    
    if (isKit) {
      setKitItemConditions(prev => ({ ...prev, [itemKey]: conditionString }));
      setKitItemQuantities(prev => ({ ...prev, [itemKey]: total }));
    } else {
      // Si hay múltiples occurrences, guardar la condición para TODAS
      if (occurrences && occurrences.length > 0) {
        setItemConditions(prev => {
          const updated = { ...prev };
          occurrences.forEach(occ => {
            const key = `${occ.requestId}-${occ.itemId}`;
            updated[key] = conditionString;
          });
          return updated;
        });
      } else {
        setItemConditions(prev => ({ ...prev, [itemKey]: conditionString }));
      }
      // NO sobrescribir returnQuantities - el usuario ya lo configuró en el input
    }

    setConditionDialogOpen(false); 
    setCurrentConditionItem(null);
    toast.success('Condition saved.');
  }, [currentConditionItem, conditionCounts, getKitItemQuantity, getReturnQuantity, setKitItemConditions, setItemConditions]);
  const areAllRegularItemsSelected = useCallback((requestId: number, items: LoanItem[]) => { 
    const regularItems = items.filter(i => !i.isKit); 
    if (regularItems.length === 0) return false; 
    return regularItems.every(item => selectedReturnItems.has(`${requestId}-${item.id}`)); 
  }, [selectedReturnItems]);
  
  const handleSelectAllRegularItems = useCallback((request: LoanRequest, checked: boolean) => {
    const newSelected = new Set(selectedReturnItems); const newQuantities = { ...returnQuantities };
    const regularItems = request.items.filter(i => !i.isKit);
    regularItems.forEach(item => { const itemKey = `${request.id}-${item.id}`; if (checked) { newSelected.add(itemKey); newQuantities[itemKey] = item.quantityRequested; } else { newSelected.delete(itemKey); delete newQuantities[itemKey]; } });
    setSelectedReturnItems(newSelected); setReturnQuantities(newQuantities);
  }, [selectedReturnItems, returnQuantities]);

  const handleSelectAllReturnItems = useCallback((request: LoanRequest, checked: boolean) => {
    const newSelected = new Set(selectedReturnItems);
    const newQuantities = { ...returnQuantities };
    // Iterate over all LoanItems (both regular and Kits) using their id as the selection key
    request.items.forEach(item => {
      const itemKey = `${request.id}-${item.id}`;
      if (checked) {
        newSelected.add(itemKey);
        newQuantities[itemKey] = item.quantityRequested;
      } else {
        newSelected.delete(itemKey);
        delete newQuantities[itemKey];
      }
    });
    setSelectedReturnItems(newSelected);
    setReturnQuantities(newQuantities);
  }, [selectedReturnItems, returnQuantities]);

  const hasSelectedKitItems = useCallback((requestId: number, itemId: number) => Array.from(selectedKitItems).some(k => k.startsWith(`${requestId}-${itemId}`)), [selectedKitItems]);

const handleConfirmReturnItems = useCallback((request: LoanRequest): Promise<void> => {
    return (async (): Promise<void> => {
        // Obtener la versión más actualizada del request desde allReturnsRef
        const currentRequest = allReturnsRef.current.find(r => r.id === request.id);
        
        if (!currentRequest) {
            toast.error('Request not found. It may have been already processed.');
            return;
        }
        
        // Asegurar a TypeScript que currentRequest no es undefined después de la validación
        const validatedRequest = currentRequest;
        
        const regularItems = validatedRequest.items.filter(i => !i.isKit);
        const selectedCount = regularItems.filter(item => selectedReturnItems.has(`${validatedRequest.id}-${item.id}`)).length;
        
        // 1. VALIDACIÓN INICIAL DE SELECCIÓN
        if (selectedCount === 0) { 
            toast.error('Please select at least one item to return'); 
            return; 
        }

        // --- 2. VALIDACIÓN DETALLADA DE CONDICIÓN (CÓDIGO EXISTENTE) ---
        const itemsWithoutCondition = regularItems.filter(item => { 
            const itemKey = `${validatedRequest.id}-${item.id}`; 
            if (!selectedReturnItems.has(itemKey)) return false; 
            const condition = itemConditions[itemKey]; 
            const returnQty = getReturnQuantity(validatedRequest.id, item.id);
            
            // Si la cantidad es 0, no necesita validación de condición
            if (returnQty === 0) return false;
            
            // Si returnQty es > 0 pero no hay condición guardada, falla
            if (!condition) {
                return true; // Requiere condición
            }
            
            // Si hay condición guardada, confiar en que handleSaveCondition ya validó correctamente
            // (Esto es especialmente importante para items con múltiples occurrences donde la
            // condición total puede no coincidir con la qty de una occurrence individual)
            return false;
        });
        
        if (itemsWithoutCondition.length > 0) { 
            toast.error('Please set the condition for all selected items, ensuring the total count matches the return quantity.'); 
            return; 
        }

        // --- 3. CONSTRUIR EL PAYLOAD PARA EL ENDPOINT DE INVENTARIO ---
        const itemsPayload: ReturnItemPayload[] = [];
        const itemsWithZeroQuantity: string[] = [];
        let hasAnyItemToReturn = false;

        regularItems.forEach(item => {
            const itemKey = `${validatedRequest.id}-${item.id}`; 
            if (selectedReturnItems.has(itemKey)) { 
                
                const returnQty = getReturnQuantity(validatedRequest.id, item.id);
                
                console.log(`=== PROCESSING ITEM ===`);
                console.log(`Item ID: ${item.id}, Name: ${item.name}`);
                console.log(`Item Key: ${itemKey}`);
                console.log(`returnQuantities[${itemKey}]:`, returnQuantities[itemKey]);
                console.log(`getReturnQuantity result:`, returnQty);
                console.log(`itemConditions[${itemKey}]:`, itemConditions[itemKey]);
                
                // Verificar si la cantidad es 0 y mostrar error descriptivo
                if (returnQty === 0) {
                    console.log(`⚠️ Item ${item.name} has quantity 0`);
                    itemsWithZeroQuantity.push(item.name || item.sku || `Item ${item.id}`);
                    return; // Saltar este item
                }
                
                // Usar condición guardada para determinar la PROPORCIÓN de cada tipo
                const conditionText = itemConditions[itemKey] || `Good: ${returnQty}`;
                
                // Extraer cantidades de la condición (valores totales agregados)
                const goodMatch = conditionText.match(/Good: (\d+)/);
                const revisionMatch = conditionText.match(/Revision: (\d+)/);
                const lostMatch = conditionText.match(/Lost: (\d+)/);

                const condGood = goodMatch ? parseInt(goodMatch[1]) : 0;
                const condRevision = revisionMatch ? parseInt(revisionMatch[1]) : 0;
                const condLost = lostMatch ? parseInt(lostMatch[1]) : 0;
                const condTotal = condGood + condRevision + condLost;

                // Calcular cantidades proporcionalmente según returnQty de esta occurrence
                let quantityReturned = 0;
                let quantityDamaged = 0;
                let quantityLost = 0;

                if (condTotal > 0) {
                    // Distribuir proporcionalmente
                    quantityReturned = Math.round((condGood / condTotal) * returnQty);
                    quantityDamaged = Math.round((condRevision / condTotal) * returnQty);
                    quantityLost = Math.round((condLost / condTotal) * returnQty);
                    
                    // Ajustar por redondeo para que sume exactamente returnQty
                    const total = quantityReturned + quantityDamaged + quantityLost;
                    if (total !== returnQty) {
                        quantityReturned += (returnQty - total);
                    }
                } else {
                    // Si no hay condición, asumir todo Good
                    quantityReturned = returnQty;
                }
                
                // Asegurar que solo agregamos si hay algo que devolver
                if (quantityReturned + quantityDamaged + quantityLost > 0) {
                    itemsPayload.push({
                        itemId: item.id,
                        quantityReturned: quantityReturned,
                        quantityDamaged: quantityDamaged,
                        quantityLost: quantityLost,
                        notes: '' // Enviar vacío para evitar error de "Data too long for column 'Code'"
                    });
                    hasAnyItemToReturn = true;
                }
            }
        });

        // Validar que se ingresaron cantidades
        if (itemsWithZeroQuantity.length > 0) {
            toast.error(`Please enter a quantity greater than 0 for the selected items: ${itemsWithZeroQuantity.join(', ')}`);
            return;
        }

        // Validar que haya al menos un item para devolver
        if (itemsPayload.length === 0) {
            toast.error('No items to return. Please select items and enter quantities.');
            return;
        }


        // --- 4. LLAMAR AL ENDPOINT DE DEVOLUCIÓN DE INVENTARIO (API) ---
        const loadingToastId = toast.loading('Submitting return items to API...');

        try {
            const payload: ReturnLoanPayload = {
                engineerId: validatedRequest.requesterId || engineerId, // Usar el engineerId del request (ingeniero que tiene los items)
                warehouseId: warehouseId,   
                items: itemsPayload,
                generalNotes: `Req ${validatedRequest.requestNumber || validatedRequest.id}`, // Usar requestNumber en lugar de id
                photoUrl: itemsPhotoUrl || '', // URL de SharePoint guardada en el estado
            };
            
            console.log('=== PAYLOAD BEING SENT TO API ===');
            console.log('Request Number:', validatedRequest.requestNumber);
            console.log('Request ID:', validatedRequest.id);
            console.log('Engineer ID (from request):', validatedRequest.requesterId);
            console.log('Items:', itemsPayload);
            console.log('Full Payload:', payload);
            console.log('JSON Stringified:', JSON.stringify(payload, null, 2));
            
            await submitReturnLoan(payload);

            toast.success('Items successfully submitted to Inventory API!', { id: loadingToastId });

        } catch (err) {
            // Si la llamada API falla, mostramos el error y detenemos la ejecución.
            console.error('=== API ERROR ===');
            console.error('Error details:', err);
            toast.error('Failed to submit return to Inventory API. Check console for details.', { id: loadingToastId });
            return; 
        }

        // --- 5. RECARGAR DATOS DESDE REDUX (EN LUGAR DE ACTUALIZAR MANUALMENTE) ---
        
        try {
            // Recargar los holdings actualizados desde el backend usando Redux
            // Usar el engineerId del ingeniero seleccionado, no el global
            const selectedEngineerId = validatedRequest.requesterId || engineerId;
            console.log('🔄 Reloading returns for selected engineer:', selectedEngineerId);
            console.log('🔄 Before refresh - allReturns.length:', allReturns.length);
            console.log('🔄 Before refresh - selectedReturnBorrower:', selectedReturnBorrower);
            
            const result = await dispatch(refreshReturns({ engineerId: selectedEngineerId, warehouseId })).unwrap();
            
            console.log('✅ Returns reloaded from server - received:', result.length, 'returns');
            console.log('✅ After refresh - reduxReturns should update now');
            
            if (result.length > 0) {
                console.log('✅ First return:', result[0]);
                console.log('✅ First return requesterName:', result[0].requesterName);
            }
        } catch (err) {
            console.error('❌ Error reloading returns after successful submission:', err);
            // Aunque falle la recarga, el return fue exitoso, así que no mostramos error crítico
        }

        // Limpiar SOLO los estados de selección, NO el ingeniero seleccionado
        console.log('🧹 Cleaning selection states...');
        console.log('🧹 Keeping selectedReturnBorrower:', selectedReturnBorrower);
        setSelectedReturnItems(new Set());
        setReturnQuantities({});
        setItemConditions({});
        // ¡LIMPIAR LA URL DE LA FOTO DESPUÉS DE USARLA!
        setItemsPhotoUrl(null); 
        
        // NO resetear selectedReturnBorrower para mantener la selección del ingeniero
        console.log('✅ Return complete - selectedReturnBorrower still set to:', selectedReturnBorrower);
        
        toast.success('Items successfully returned!'); // Toast de confirmación final
    })();
// Dependencias actualizadas
}, [selectedReturnItems, getReturnQuantity, returnQuantities, itemConditions, itemsPhotoUrl, engineerId, warehouseId, dispatch]);

  // 🛑 MODIFICACIÓN: Validar condición vs. cantidad devuelta antes de guardar el checklist
  const handleSaveKitChecklist = useCallback((requestId: number, itemId: number) => {
    return (async () => {
    const request = filteredReturns.find(r => r.id === requestId); 
    const kitItem = request?.items.find(i => i.id === itemId);
    
    if (kitItem && kitItem.kitItems) {
      const itemsWithoutCondition = kitItem.kitItems.filter(item => { 
        const kitItemKey = `${requestId}-${itemId}-${item.id}`; 
        if (!selectedKitItems.has(kitItemKey)) return false; 
        const condition = kitItemConditions[kitItemKey]; 
        const returnQty = getKitItemQuantity(requestId, itemId, item.id);

        // Si la cantidad es 0, no necesita validación de condición
        if (returnQty === 0) return false;

        // 1. Si no hay condición o solo dice 'good-condition'
        if (!condition || condition === 'good-condition') {
          return returnQty > 1;
        }        // 2. Si hay condición, verificar que la suma sea igual a returnQty
        const goodMatch = condition.match(/Good: (\d+)/);
        const revisionMatch = condition.match(/Revision: (\d+)/);
        const lostMatch = condition.match(/Lost: (\d+)/);
        const totalConditioned = (goodMatch ? parseInt(goodMatch[1]) : 0) + (revisionMatch ? parseInt(revisionMatch[1]) : 0) + (lostMatch ? parseInt(lostMatch[1]) : 0);
        
        return totalConditioned !== returnQty;
      });
      
      if (itemsWithoutCondition.length > 0) { 
        toast.error('Please set the condition for all selected kit items, ensuring the total count matches the return quantity.'); 
        return; 
      }
    }
    
    if (kitItem && kitItem.kitItems) {
      const missing: Array<{id: number, name: string, category: string, missingQuantity: number, totalQuantity: number}> = [];
      kitItem.kitItems.forEach(item => {
        const kitItemKey = `${requestId}-${itemId}-${item.id}`;
        const isSelected = selectedKitItems.has(kitItemKey);
        
        // Usar getKitItemQuantity para obtener la cantidad devuelta
        const returnedQuantity = getKitItemQuantity(requestId, itemId, item.id);
        let conditionRevision = 0;
        let conditionLost = 0;
        const condition = kitItemConditions[kitItemKey];

        if (condition) {
          const revisionMatch = condition.match(/Revision: (\d+)/);
          const lostMatch = condition.match(/Lost: (\d+)/);
          if (revisionMatch) conditionRevision = parseInt(revisionMatch[1]);
          if (lostMatch) conditionLost = parseInt(lostMatch[1]);
        }

        // item.quantity es la cantidad original solicitada del sub-item
        const missingQuantity = item.quantity - returnedQuantity + conditionRevision + conditionLost;
        
        if (missingQuantity > 0)
          missing.push({ id: item.id, name: item.name, category: item.category, missingQuantity, totalQuantity: item.quantity });
      });
      setMissingKitItems(missing);
    }

    // Persist removal of the kit item from the return on the server
   /* try {
      // compute new items for that request (remove the kit item)
      const request = filteredReturns.find(r => r.id === requestId);
      if (request) {
        const remainingItems = request.items.filter(i => i.id !== itemId);
        const ok = await updateReturnItems(requestId, remainingItems);
        if (!ok) console.warn('Failed to persist kit checklist changes to server');
        // update local state as well
        setAllReturns(prev => prev.map(req => req.id === requestId ? { ...req, items: remainingItems } : req).filter(r => r.items.length > 0));
      }
    } catch (err) {
      console.error('Error persisting kit checklist changes:', err);
    }*/

    setPendingKitReturn({ requestId, itemId });
    setKitReturnOption('');
    setKitReturnDialogOpen(true);
  })();
  }, [filteredReturns, selectedKitItems, kitItemQuantities, kitItemConditions, setAllReturns, getKitItemQuantity]);

// Función auxiliar para convertir Data URL a Blob y subir
const uploadImageFromDataUrl = useCallback(async (dataUrl: string): Promise<string | null> => {
    const loadingToast = toast.loading('Uploading photo to server...');
    try {
        // 1. Convertir Data URL a Blob
        const res = await fetch(dataUrl);
        const photoBlob = await res.blob();
        
        // 2. Subir el Blob
        const url = await uploadReturnPhoto(photoBlob); // Llama a tu servicio
        
        if (url) {
            toast.success('Photo uploaded successfully!', { id: loadingToast });
            return url;
        } else {
            throw new Error('Upload failed: No URL returned from server.');
        }
    } catch (error) {
        console.error('Error during photo upload:', error);
        toast.error('Failed to upload photo.', { id: loadingToast });
        return null;
    }
}, []);

    const handleTakePhotoItems = useCallback(() => setItemsPhotoDialogOpen(true), []);
  //const handleCapturePhotoItems = useCallback(() => { setCapturedPhoto(`photo-items-${Date.now()}.jpg`); toast.success('Photo captured successfully!'); setItemsPhotoDialogOpen(false); }, []);
     const handleCapturePhotoItems = useCallback(async (dataUrl: string) => {
        setItemsPhotoDialogOpen(false); // Cerrar el modal inmediatamente

        const url = await uploadImageFromDataUrl(dataUrl);
        
        // Almacenar la URL final del servidor
        if (url) {
            setItemsPhotoUrl(url); // Usando el nuevo nombre de estado
        }
    }, [uploadImageFromDataUrl]); 

    const handleTakeKitPhoto = useCallback((requestId: number, itemId: number) => { setCurrentKitItem({ requestId, itemId }); setKitPhotoDialogOpen(true); }, []);
  //const handleCaptureKitPhoto = useCallback(() => { if (currentKitItem) { const kitKey = `${currentKitItem.requestId}-${currentKitItem.itemId}`; setKitPhotos(prev => ({ ...prev, [kitKey]: `kit-photo-${Date.now()}.jpg` })); toast.success('Kit photo captured successfully!'); } setKitPhotoDialogOpen(false); setCurrentKitItem(null); }, [currentKitItem]);
      const handleCaptureKitPhoto = useCallback(async (dataUrl: string) => { 
        setKitPhotoDialogOpen(false); // Cerrar el modal inmediatamente

        if (!currentKitItem) return;

        const url = await uploadImageFromDataUrl(dataUrl);

        // Almacenar la URL final del servidor
        if (url) {
            const kitKey = `${currentKitItem.requestId}-${currentKitItem.itemId}`;
            setKitPhotos(prev => ({ ...prev, [kitKey]: url }));
        }

        setCurrentKitItem(null); 
    }, [currentKitItem, uploadImageFromDataUrl]);
  const handleConfirmKitReturn = useCallback(() => { if (!pendingKitReturn || !kitReturnOption) return; const { requestId, itemId } = pendingKitReturn; const kitKey = `${requestId}-${itemId}`; const selectedCount = Array.from(selectedKitItems).filter(k => k.startsWith(kitKey)).length; setAllReturns(prev => prev.map(request => { if (request.id === requestId) return { ...request, items: request.items.filter(i => i.id !== itemId) }; return request; }).filter(r => r.items.length > 0)); setPendingKitConfirmation({ option: kitReturnOption, selectedCount }); setKitConfirmationDialogOpen(true); setKitReturnDialogOpen(false); }, [pendingKitReturn, kitReturnOption, selectedKitItems, setAllReturns]);
  const handleFinalConfirmKitReturn = useCallback(() => { setKitConfirmationDialogOpen(false); setPendingKitConfirmation(null); setPendingKitReturn(null); setKitReturnOption(''); setMissingKitItems([]); toast.success('Kit returned and processed!'); }, []);
  const handlePrintMissingItems = useCallback(() => { // Se llama a la función utilitaria, pasando las dependencias como argumentos
    handlePrintMissingKitItems(
      pendingKitReturn,
      filteredReturns,
      missingKitItems
    );
  }, [pendingKitReturn, filteredReturns, missingKitItems]);


const handleSelectAllKitItems = useCallback((requestId: number, kitItem: LoanItem, checked: boolean) => {
  setSelectedKitItems(prev => {
    const newSelected = new Set(prev);
    const kitItemKeys = (kitItem.kitItems || []).map(ki => `${requestId}-${kitItem.id}-${ki.id}`);
	
  	const itemQuantities: Record<string, number> = {};
  	kitItem.kitItems?.forEach(ki => {
      itemQuantities[`${requestId}-${kitItem.id}-${ki.id}`] = ki.quantity;
  	});
  	
    if (checked) {
      kitItemKeys.forEach(k => newSelected.add(k));
      const newQuantities = { ...kitItemQuantities };
      const newConditions = { ...kitItemConditions };
      kitItemKeys.forEach(k => {
        if (!newQuantities[k]) newQuantities[k] = itemQuantities[k] || 1; 
        if (!newConditions[k]) newConditions[k] = 'good-condition';
      });
      setKitItemQuantities(newQuantities);
      setKitItemConditions(newConditions);
    } else {
      kitItemKeys.forEach(k => {
        newSelected.delete(k);
      });
      setKitItemQuantities(prevQ => {
        const copy = { ...prevQ };
        kitItemKeys.forEach(k => delete copy[k]);
        return copy;
      });
      setKitItemConditions(prevC => {
        const copy = { ...prevC };
        kitItemKeys.forEach(k => delete copy[k]);
        return copy;
      });
    }

    return newSelected;
  });
}, [kitItemQuantities, kitItemConditions]);


  return {
    // Estado y Datos Derivados
    allReturns, isLoading, error, setAllReturns: setAllReturns as Dispatch<SetStateAction<LoanRequest[]>>, 
    filteredReturns, selectedReturnBorrower, borrowerSelectSearchTerm, filteredBorrowersForSelect,
    warehouseEngineers, loadingEngineers,
    expandedReturns, expandedKitItems, selectedReturnItems, selectedKitItems,
    itemsPhotoDialogOpen, kitPhotoDialogOpen, itemsPhotoUrl, kitPhotos, capturedPhoto,
    kitReturnDialogOpen, kitReturnOption, pendingKitReturn, missingKitItems,
    kitConfirmationDialogOpen, pendingKitConfirmation,
    conditionDialogOpen, setConditionDialogOpen, 
    conditionCounts, setConditionCounts, 
    returnQuantities, kitItemQuantities, itemConditions, kitItemConditions,

    // Getters
    getReturnQuantity, getItemCondition, getKitItemQuantity, getKitItemCondition, getCurrentRequest,
    // Handlers
    handleBorrowerSelect, setBorrowerSelectSearchTerm,
    onToggleExpandReturns: handleToggleExpandReturns, onToggleExpandKitItem: handleToggleExpandKitItem,
    handleReturnQuantityChange, handleSelectReturnItem,
    handleOpenConditionDialog, handleSaveCondition, 
    areAllRegularItemsSelected, handleSelectAllRegularItems, handleSelectAllReturnItems,
    hasSelectedKitItems, handleTakePhotoItems, handleConfirmReturnItems, 
    handleTakeKitPhoto, handleSaveKitChecklist, 
    handleKitItemQuantityChange, handleSelectKitItem,
    formatConditionText: utilFormatConditionText,
    setItemsPhotoDialogOpen, setKitPhotoDialogOpen, setKitReturnDialogOpen, setKitReturnOption, setKitConfirmationDialogOpen,
    handleCapturePhotoItems, handleCaptureKitPhoto, handleConfirmKitReturn, handleFinalConfirmKitReturn,
    handlePrintMissingItems,handleSelectAllKitItems,
  };
}