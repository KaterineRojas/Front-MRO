import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  getPurchaseRequests,
  deletePurchaseRequest,
  confirmPurchaseBought,
  type PurchaseRequest
} from './purchaseService';
 
interface UsePurchaseRequestsReturn {
  purchaseRequests: PurchaseRequest[];
  filteredPurchaseRequests: PurchaseRequest[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  warehouseFilter: string;
  setWarehouseFilter: (warehouseId: string) => void;
  expandedRows: Set<string>;
  toggleRow: (id: string) => void;
  handleCancel: (requestId: string) => Promise<void>;
  handleConfirmBought: (requestId: string, quantities: { [key: string]: number }) => Promise<void>;
  canCancelRequest: (request: PurchaseRequest) => boolean;
  canConfirmBought: (request: PurchaseRequest) => boolean;
  getStatusCount: (status: string) => number;
  refreshRequests: () => Promise<void>;
}

export function usePurchaseRequests(): UsePurchaseRequestsReturn {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Load purchase requests
  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await getPurchaseRequests();
      setPurchaseRequests(data);
    } catch (error) {
      toast.error('Failed to load purchase requests');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter purchase requests
  const filteredPurchaseRequests = useMemo(() => {
    let filtered = purchaseRequests;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.requestId.toLowerCase().includes(searchLower) ||
        request.project.toLowerCase().includes(searchLower) ||
        request.department.toLowerCase().includes(searchLower) ||
        request.reason.toLowerCase().includes(searchLower) ||
        request.warehouseName.toLowerCase().includes(searchLower) ||
        request.items.some(item => 
          item.name.toLowerCase().includes(searchLower)
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (warehouseFilter !== 'all') {
      filtered = filtered.filter(request => request.warehouseId === warehouseFilter);
    }

    return filtered;
  }, [purchaseRequests, searchTerm, statusFilter, warehouseFilter]);

  // Toggle row expansion
  const toggleRow = (requestId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  // Cancel purchase request
  const handleCancel = async (requestId: string) => {
    try {
      const result = await deletePurchaseRequest(requestId);
      if (result.success) {
        setPurchaseRequests(prev => prev.filter(req => req.requestId !== requestId));
        toast.success('Request cancelled successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel request');
    }
  };

  // Confirm purchase as bought
  const handleConfirmBought = async (requestId: string, quantities: { [key: string]: number }) => {
    try {
      const result = await confirmPurchaseBought(requestId, quantities);
      if (result.success) {
        setPurchaseRequests(prev => prev.filter(req => req.requestId !== requestId));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm purchase');
    }
  };

  // Check if request can be cancelled
  const canCancelRequest = (request: PurchaseRequest): boolean => {
    return request.status === 'pending';
  };

  // Check if purchase can be confirmed as bought
  const canConfirmBought = (request: PurchaseRequest): boolean => {
    return request.status === 'approved' && request.selfPurchase;
  };

  // Get status count
  const getStatusCount = (status: string): number => {
    if (status === 'all') return purchaseRequests.length;
    return purchaseRequests.filter(req => req.status === status).length;
  };

  return {
    purchaseRequests,
    filteredPurchaseRequests,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    warehouseFilter,
    setWarehouseFilter,
    expandedRows,
    toggleRow,
    handleCancel,
    handleConfirmBought,
    canCancelRequest,
    canConfirmBought,
    getStatusCount,
    refreshRequests: loadRequests
  };
}