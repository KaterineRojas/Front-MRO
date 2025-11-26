// src/hooks/useReturnsLogic.tsx (o el path correspondiente)

import { useState, useMemo, useCallback, Dispatch, SetStateAction, useEffect } from 'react';
import { LoanRequest, LoanItem } from '../types';
import { getReturns, updateReturnItems } from '../services/requestManagementService';
import { formatConditionText as utilFormatConditionText } from '../utils/requestManagementUtils';
import { toast } from 'react-hot-toast';
import { handlePrintMissingKitItems } from '../utils/listKitRestock';

export type ConditionCounts = { good: number, revision: number, lost: number };

export function useReturnsLogic() {
  const [allReturns, setAllReturns] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [kitPhotos, setKitPhotos] = useState<Record<string, string>>({});
  const [kitReturnDialogOpen, setKitReturnDialogOpen] = useState(false);
  const [kitReturnOption, setKitReturnOption] = useState<'restock' | 'disassemble' | ''>('');
  const [pendingKitReturn, setPendingKitReturn] = useState<{requestId: number, itemId: number} | null>(null);
  const [kitConfirmationDialogOpen, setKitConfirmationDialogOpen] = useState(false);
  const [pendingKitConfirmation, setPendingKitConfirmation] = useState<{option: 'restock' | 'disassemble', selectedCount: number} | null>(null);
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [currentConditionItem, setCurrentConditionItem] = useState<{requestId: number, itemId: number, kitItemId?: number, isKit: boolean} | null>(null);
  const [conditionCounts, setConditionCounts] = useState<ConditionCounts>({ good: 0, revision: 0, lost: 0 });
  const [missingKitItems, setMissingKitItems] = useState<Array<{id: number, name: string, category: string, missingQuantity: number, totalQuantity: number}>>([]);

  // Fetch returns from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getReturns();
        setAllReturns(data || []);
      } catch (err) {
        console.error('Failed to load returns', err);
        setError('Failed to load returns');
        setAllReturns([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);


  // Derived helpers
  const uniqueReturnBorrowers = useMemo(() => {
    const borrowers = allReturns.map(req => req.borrower);
    return Array.from(new Set(borrowers)).sort();
  }, [allReturns]);

  const filteredReturns = useMemo(() => {
    if (!selectedReturnBorrower) return [];
    return allReturns.filter(req => req.borrower === selectedReturnBorrower);
  }, [allReturns, selectedReturnBorrower]);

  const filteredBorrowersForSelect = useMemo(() => {
    if (!borrowerSelectSearchTerm.trim()) return uniqueReturnBorrowers;
    return uniqueReturnBorrowers.filter(b => b.toLowerCase().includes(borrowerSelectSearchTerm.toLowerCase()));
  }, [uniqueReturnBorrowers, borrowerSelectSearchTerm]);
  
  // Getters 
  const getReturnQuantity = useCallback((requestId: number, itemId: number) => returnQuantities[`${requestId}-${itemId}`] || 1, [returnQuantities]);
  const getKitItemQuantity = useCallback((requestId: number, itemId: number, kitItemId: number) => kitItemQuantities[`${requestId}-${itemId}-${kitItemId}`] || 1, [kitItemQuantities]);
  const getItemCondition = useCallback((requestId: number, itemId: number) => itemConditions[`${requestId}-${itemId}`] || 'good-condition', [itemConditions]);
  const getKitItemCondition = useCallback((requestId: number, itemId: number, kitItemId: number) => kitItemConditions[`${requestId}-${itemId}-${kitItemId}`] || 'good-condition', [kitItemConditions]);


  // Handlers
  const handleBorrowerSelect = useCallback((value: string) => { setSelectedReturnBorrower(value); setBorrowerSelectSearchTerm(''); }, []);
  const handleToggleExpandReturns = useCallback((id: number) => { setExpandedReturns(prev => { const newExpanded = new Set(prev); if (newExpanded.has(id)) newExpanded.delete(id); else newExpanded.add(id); return newExpanded; }); }, []);
  const handleToggleExpandKitItem = useCallback((requestId: number, itemId: number) => { const kitKey = `${requestId}-${itemId}`; setExpandedKitItems(prev => { const newExpanded = new Set(prev); if (newExpanded.has(kitKey)) newExpanded.delete(kitKey); else newExpanded.add(kitKey); return newExpanded; }); }, []);

  const handleReturnQuantityChange = useCallback((requestId: number, itemId: number, quantity: number) => { 
      const itemKey = `${requestId}-${itemId}`; 
      if (quantity >= 1) setReturnQuantities(prev => ({ ...prev, [itemKey]: quantity })); 
  }, []);

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
            setReturnQuantities(q => ({ ...q, [itemKey]: 1 })); 
            setItemConditions(c => ({ ...c, [itemKey]: 'good-condition' })); 
        }
        return newSelected;
    });
  }, []);
  
  const handleKitItemQuantityChange = useCallback((requestId: number, itemId: number, kitItemId: number, quantity: number) => { 
      if (quantity >= 1) setKitItemQuantities(prev => ({ ...prev, [`${requestId}-${itemId}-${kitItemId}`]: quantity })); 
  }, []);
  
  const handleSelectKitItem = useCallback((requestId: number, itemId: number, kitItemId: number) => {
    const kitItemKey = `${requestId}-${itemId}-${kitItemId}`; 
    setSelectedKitItems(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(kitItemKey)) { 
            newSelected.delete(kitItemKey); 
            setKitItemQuantities(q => { const { [kitItemKey]: _, ...rest } = q; return rest; }); 
            setKitItemConditions(c => { const { [kitItemKey]: _, ...rest } = c; return rest; }); 
        } 
        else { 
            newSelected.add(kitItemKey); 
            setKitItemQuantities(q => ({ ...q, [kitItemKey]: 1 })); 
            setKitItemConditions(c => ({ ...c, [kitItemKey]: 'good-condition' })); 
        }
        return newSelected;
    });
  }, []);


  const handleOpenConditionDialog = useCallback((requestId: number, itemId: number, isKit: boolean, kitItemId?: number) => {
    setCurrentConditionItem({ requestId, itemId, kitItemId, isKit });
    const itemKey = isKit && kitItemId ? `${requestId}-${itemId}-${kitItemId}` : `${requestId}-${itemId}`;
    const existingCondition = isKit ? kitItemConditions[itemKey] : itemConditions[itemKey];
    
    // Restaurar conditionCounts
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

  const handleSaveCondition = useCallback(() => {
    if (!currentConditionItem) return;
    const { requestId, itemId, kitItemId, isKit } = currentConditionItem;
    const itemKey = isKit && kitItemId ? `${requestId}-${itemId}-${kitItemId}` : `${requestId}-${itemId}`;
    const total = conditionCounts.good + conditionCounts.revision + conditionCounts.lost;

    // TOAST 1: Validar si se especificó al menos una condición
    if (total === 0) { 
      toast.error('Please specify at least one item condition.'); 
      return; 
    }

    // Obtener cantidad de devolución (Return Qty)
    const returnQty = isKit && kitItemId 
      ? getKitItemQuantity(requestId, itemId, kitItemId) 
      : getReturnQuantity(requestId, itemId);

    // TOAST 2: Validar que el total no exceda la cantidad devuelta
    if (total > returnQty) { 
      toast.error(`Total condition count (${total}) cannot exceed the return quantity (${returnQty}).`); 
      return; 
    }

    // Formatear el string de condición (lógica restaurada)
    let conditionString = '';
    if (conditionCounts.good > 0) conditionString += `Good: ${conditionCounts.good}`;
    if (conditionCounts.revision > 0) conditionString += (conditionString ? ', ' : '') + `Revision: ${conditionCounts.revision}`;
    if (conditionCounts.lost > 0) conditionString += (conditionString ? ', ' : '') + `Lost: ${conditionCounts.lost}`;
    
    // Guardar condición
    if (isKit) setKitItemConditions(prev => ({ ...prev, [itemKey]: conditionString })); 
    else setItemConditions(prev => ({ ...prev, [itemKey]: conditionString }));

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
    regularItems.forEach(item => { const itemKey = `${request.id}-${item.id}`; if (checked) { newSelected.add(itemKey); newQuantities[itemKey] = item.quantity; } else { newSelected.delete(itemKey); delete newQuantities[itemKey]; } });
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
        newQuantities[itemKey] = item.quantity;
      } else {
        newSelected.delete(itemKey);
        delete newQuantities[itemKey];
      }
    });
    setSelectedReturnItems(newSelected);
    setReturnQuantities(newQuantities);
  }, [selectedReturnItems, returnQuantities]);

  const hasSelectedKitItems = useCallback((requestId: number, itemId: number) => Array.from(selectedKitItems).some(k => k.startsWith(`${requestId}-${itemId}`)), [selectedKitItems]);

  const handleConfirmReturnItems = useCallback((request: LoanRequest) => {
    return (async () => {
    const regularItems = request.items.filter(i => !i.isKit);
    const selectedCount = regularItems.filter(item => selectedReturnItems.has(`${request.id}-${item.id}`)).length;
    
    if (selectedCount === 0) { 
      toast.error('Please select at least one item to return'); 
      return; 
    }
    
    const itemsWithoutCondition = regularItems.filter(item => { 
      const itemKey = `${request.id}-${item.id}`; 
      if (!selectedReturnItems.has(itemKey)) return false; 
      const condition = itemConditions[itemKey]; 

      return !condition || condition === 'good-condition'; 
    });
    
    if (itemsWithoutCondition.length > 0) { 
      toast.error('Please set the condition for all selected items before confirming return.'); 
      return; 
    }
    
    const returnedItemIds = regularItems
      .filter(item => selectedReturnItems.has(`${request.id}-${item.id}`) && getReturnQuantity(request.id, item.id) > 0)
      .map(i => i.id);
      
    // compute remaining items
    const newAllReturns = allReturns.map(req => {
      if (req.id === request.id) {
        const remaining = req.items.filter(i => !returnedItemIds.includes(i.id));
        return { ...req, items: remaining };
      }
      return req;
    }).filter(r => r.items.length > 0);

    // Persist change to server: update the return's items
    try {
      const remainingItems = request.items.filter(i => !returnedItemIds.includes(i.id));
      const ok = await updateReturnItems(request.id, remainingItems);
      if (!ok) console.warn('Failed to persist returned items to server');
    } catch (err) {
      console.error('Error persisting returned items:', err);
    }

    // Update local state
    setAllReturns(newAllReturns);

    const newSelectedItems = new Set(selectedReturnItems);
    const newQuantities = { ...returnQuantities };
    const newConditions = { ...itemConditions };

    returnedItemIds.forEach(itemId => {
      const itemKey = `${request.id}-${itemId}`;
      newSelectedItems.delete(itemKey);
      delete newQuantities[itemKey];
      delete newConditions[itemKey];
    });

    setSelectedReturnItems(newSelectedItems);
    setReturnQuantities(newQuantities);
    setItemConditions(newConditions);
    setCapturedPhoto(null);
    toast.success('Items returned successfully!');
  })();
  }, [selectedReturnItems, getReturnQuantity, returnQuantities, itemConditions, setAllReturns, allReturns]);

  const handleSaveKitChecklist = useCallback((requestId: number, itemId: number) => {
    return (async () => {
    const request = filteredReturns.find(r => r.id === requestId); 
    const kitItem = request?.items.find(i => i.id === itemId);
    
    if (kitItem && kitItem.kitItems) {
      const itemsWithoutCondition = kitItem.kitItems.filter(item => { 
        const kitItemKey = `${requestId}-${itemId}-${item.id}`; 
        if (!selectedKitItems.has(kitItemKey)) return false; 
        const condition = kitItemConditions[kitItemKey]; 
        return !condition || condition === 'good-condition'; 
      });
      
      if (itemsWithoutCondition.length > 0) { 
        toast.error('Please set the condition for all selected kit items before confirming return.'); 
        return; 
      }
    }
    
    if (kitItem && kitItem.kitItems) {
      const missing: Array<{id: number, name: string, category: string, missingQuantity: number, totalQuantity: number}> = [];
      kitItem.kitItems.forEach(item => {
        const kitItemKey = `${requestId}-${itemId}-${item.id}`;
        const isSelected = selectedKitItems.has(kitItemKey);
        const returnedQuantity = isSelected ? (kitItemQuantities[kitItemKey] || item.quantity) : 0;
        let conditionRevision = 0;
        let conditionLost = 0;
        const condition = kitItemConditions[kitItemKey];

        if (condition) {
          const revisionMatch = condition.match(/Revision: (\d+)/);
          const lostMatch = condition.match(/Lost: (\d+)/);
          if (revisionMatch) conditionRevision = parseInt(revisionMatch[1]);
          if (lostMatch) conditionLost = parseInt(lostMatch[1]);
        }

        const missingQuantity = item.quantity - returnedQuantity + conditionRevision + conditionLost;

        if (missingQuantity > 0)
          missing.push({ id: item.id, name: item.name, category: item.category, missingQuantity, totalQuantity: item.quantity });
      });
      setMissingKitItems(missing);
    }

    // Persist removal of the kit item from the return on the server
    try {
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
    }

    setPendingKitReturn({ requestId, itemId });
    setKitReturnOption('');
    setKitReturnDialogOpen(true);
  })();
  }, [filteredReturns, selectedKitItems, kitItemQuantities, kitItemConditions, setAllReturns]);


  const handleTakePhotoItems = useCallback(() => setItemsPhotoDialogOpen(true), []);
  const handleCapturePhotoItems = useCallback(() => { setCapturedPhoto(`photo-items-${Date.now()}.jpg`); toast.success('Photo captured successfully!'); setItemsPhotoDialogOpen(false); }, []);
  const handleTakeKitPhoto = useCallback((requestId: number, itemId: number) => { setCurrentKitItem({ requestId, itemId }); setKitPhotoDialogOpen(true); }, []);
  const handleCaptureKitPhoto = useCallback(() => { if (currentKitItem) { const kitKey = `${currentKitItem.requestId}-${currentKitItem.itemId}`; setKitPhotos(prev => ({ ...prev, [kitKey]: `kit-photo-${Date.now()}.jpg` })); toast.success('Kit photo captured successfully!'); } setKitPhotoDialogOpen(false); setCurrentKitItem(null); }, [currentKitItem]);
  const handleConfirmKitReturn = useCallback(() => { if (!pendingKitReturn || !kitReturnOption) return; const { requestId, itemId } = pendingKitReturn; const kitKey = `${requestId}-${itemId}`; const selectedCount = Array.from(selectedKitItems).filter(k => k.startsWith(kitKey)).length; setAllReturns(prev => prev.map(request => { if (request.id === requestId) return { ...request, items: request.items.filter(i => i.id !== itemId) }; return request; }).filter(r => r.items.length > 0)); setPendingKitConfirmation({ option: kitReturnOption, selectedCount }); setKitConfirmationDialogOpen(true); setKitReturnDialogOpen(false); }, [pendingKitReturn, kitReturnOption, selectedKitItems, setAllReturns]);
  const handleFinalConfirmKitReturn = useCallback(() => { setKitConfirmationDialogOpen(false); setPendingKitConfirmation(null); setPendingKitReturn(null); setKitReturnOption(''); setMissingKitItems([]); toast.success('Kit returned and processed!'); }, []);
  const handlePrintMissingItems = useCallback(() => { // Se llama a la función utilitaria, pasando las dependencias como argumentos
    handlePrintMissingKitItems(
      pendingKitReturn,
      filteredReturns,
      missingKitItems
    );
  }, [pendingKitReturn, filteredReturns, missingKitItems]);

  // Añadir dentro de useReturnsLogic (junto a los otros handlers)
const handleSelectAllKitItems = useCallback((requestId: number, kitItem: LoanItem, checked: boolean) => {
  setSelectedKitItems(prev => {
    const newSelected = new Set(prev);
    const kitItemKeys = (kitItem.kitItems || []).map(ki => `${requestId}-${kitItem.id}-${ki.id}`);

    if (checked) {
      kitItemKeys.forEach(k => newSelected.add(k));
      // también inicializar cantidades/condiciones si lo deseas:
      const newQuantities = { ...kitItemQuantities };
      const newConditions = { ...kitItemConditions };
      kitItemKeys.forEach(k => {
        if (!newQuantities[k]) newQuantities[k] = 1;
        if (!newConditions[k]) newConditions[k] = 'good-condition';
      });
      setKitItemQuantities(newQuantities);
      setKitItemConditions(newConditions);
    } else {
      kitItemKeys.forEach(k => {
        newSelected.delete(k);
        // opcional: limpiar cantidades/condiciones
      });
      // limpiar cantidades/condiciones relacionadas
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
    expandedReturns, expandedKitItems, selectedReturnItems, selectedKitItems,
    itemsPhotoDialogOpen, kitPhotoDialogOpen, capturedPhoto, kitPhotos,
    kitReturnDialogOpen, kitReturnOption, pendingKitReturn, missingKitItems,
    kitConfirmationDialogOpen, pendingKitConfirmation,
    conditionDialogOpen, setConditionDialogOpen, // Exportado
    conditionCounts, setConditionCounts, 
    returnQuantities, kitItemQuantities, itemConditions, kitItemConditions,

    // Getters
    getReturnQuantity, getItemCondition, getKitItemQuantity, getKitItemCondition,

    // Handlers
    handleBorrowerSelect, setBorrowerSelectSearchTerm,
    onToggleExpandReturns: handleToggleExpandReturns, onToggleExpandKitItem: handleToggleExpandKitItem,
    handleReturnQuantityChange, handleSelectReturnItem,
    handleOpenConditionDialog, handleSaveCondition, // Corregido
    areAllRegularItemsSelected, handleSelectAllRegularItems, handleSelectAllReturnItems,
    hasSelectedKitItems, handleTakePhotoItems, handleConfirmReturnItems, // Corregido
    handleTakeKitPhoto, handleSaveKitChecklist, // Corregido
    handleKitItemQuantityChange, handleSelectKitItem,
    formatConditionText: utilFormatConditionText,
    setItemsPhotoDialogOpen, setKitPhotoDialogOpen, setKitReturnDialogOpen, setKitReturnOption, setKitConfirmationDialogOpen,
    handleCapturePhotoItems, handleCaptureKitPhoto, handleConfirmKitReturn, handleFinalConfirmKitReturn,
    handlePrintMissingItems,handleSelectAllKitItems,
  };
}