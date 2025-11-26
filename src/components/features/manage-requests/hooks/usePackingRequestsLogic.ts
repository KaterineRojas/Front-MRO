// src/hooks/usePackingRequestsLogic.tsx (o el path correspondiente)

import React, { useState, useCallback, useEffect } from 'react';
import { LoanRequest, LoanItem } from '../types';
import { getPackingRequests, createReturn, updatePackingRequestStatus } from '../services/requestManagementService';
import { handlePrintSinglePacking as utilPrintSingle } from '../utils/requestManagementUtils';
import { toast } from 'react-hot-toast';

export function usePackingRequestsLogic() {
  const [packingRequests, setPackingRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPackingRequests, setExpandedPackingRequests] = useState<Set<number>>(new Set());
  const [selectedPackingItems, setSelectedPackingItems] = useState<Set<string>>(new Set());
  const [packingItemQuantities, setPackingItemQuantities] = useState<Record<string, number>>({});
  const [printedRequests, setPrintedRequests] = useState<Set<number>>(new Set());
  const [packingConfirmDialogOpen, setPackingConfirmDialogOpen] = useState(false);
  const [currentPackingRequest, setCurrentPackingRequest] = useState<LoanRequest | null>(null);

  // Fetch packing requests from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPackingRequests();
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

  const handleToggleExpandPacking = useCallback((id: number) => {
    setExpandedPackingRequests(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) newExpanded.delete(id);
      else newExpanded.add(id);
      return newExpanded;
    });
  }, []);

  const handleSelectPackingItem = useCallback((requestId: number, itemId: number) => {
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

  const handlePrintAllPacking = useCallback(() => {
    if (packingRequests.length === 0) return;
    const printContent = `<!DOCTYPE html><html><head><title>All Packing Requests</title></head><body><h1>ALL PACKING REQUESTS</h1></body></html>`;
    const printWindow = window.open('', '_blank');
    if (printWindow) { printWindow.document.write(printContent); printWindow.document.close(); printWindow.print(); }
  }, [packingRequests]);

  const handlePrintSinglePacking = useCallback((request: LoanRequest) => {
    const printed = utilPrintSingle(request, packingItemQuantities);
    if (printed) setPrintedRequests(prev => new Set(prev).add(request.id));
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
      const itemsToMove = currentPackingRequest.items.filter(item => {
        const itemKey = `${currentPackingRequest.id}-${item.id}`;
        return isKitOrder(currentPackingRequest) || selectedPackingItems.has(itemKey);
      }).map(item => {
        const itemKey = `${currentPackingRequest.id}-${item.id}`;
        const qty = packingItemQuantities[itemKey] !== undefined ? packingItemQuantities[itemKey] : item.quantity;
        return { ...item, quantity: qty, status: 'active' as const };
      });

      const newReturnRequest: LoanRequest = { ...currentPackingRequest, status: 'pending-to-return', loanDate: new Date().toISOString().split('T')[0], items: itemsToMove };

      // First persist the new return on the server
      try {
        const created = await createReturn(newReturnRequest);
        if (created) {
          setAllReturns(prev => [...prev, created]);
        } else {
          // fallback to local update if server fails
          setAllReturns(prev => [...prev, newReturnRequest]);
        }

        // Update packing request status on server
        const updated = await updatePackingRequestStatus(currentPackingRequest.id, 'moved-to-returns');
        if (!updated) console.warn('Failed to update packing request status on server');

        // Update local state
        setPackingRequests(prev => prev.filter(req => req.id !== currentPackingRequest.id));

        // Limpiar estado local
        const newSelectedItems = new Set(selectedPackingItems);
        currentPackingRequest.items.forEach(item => { const itemKey = `${currentPackingRequest.id}-${item.id}`; newSelectedItems.delete(itemKey); });
        setSelectedPackingItems(newSelectedItems);
        setPackingItemQuantities({});
        setPackingConfirmDialogOpen(false);
        setCurrentPackingRequest(null);
        toast.success('Packing confirmed and moved to Returns!');
      } catch (err) {
        console.error('Error confirming packing and moving to returns', err);
        toast.error('Error confirming packing. Please try again.');
      }
    })();
  }, [currentPackingRequest, isKitOrder, packingItemQuantities, selectedPackingItems]);


  return {
    packingRequests, isLoading, error, expandedPackingRequests, selectedPackingItems, packingItemQuantities, printedRequests,
    packingConfirmDialogOpen, currentPackingRequest, setPackingConfirmDialogOpen,
    isKitOrder, handleToggleExpandPacking, handleSelectPackingItem, handlePackingQuantityChange,
    getPackingItemQuantity, handleConfirmPacking, handleConfirmPackingDialog,
    handlePrintAllPacking, handlePrintSinglePacking, areAllItemsSelected, handleSelectAllPackingItems,
  };
}