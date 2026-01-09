import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  getPurchaseRequests,
  deletePurchaseRequest,
  confirmPurchaseBought,
  type PurchaseRequest
} from './purchaseService';
import { useConfirmModal } from '../../../ui/confirm-modal';

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
  modalState: ReturnType<typeof useConfirmModal>['modalState'];
  setModalOpen: ReturnType<typeof useConfirmModal>['setModalOpen'];
}

const STATUS_CODE_MAP: Record<number, 'pending' | 'approved' | 'rejected' | 'ordered' | 'completed'> = {
  0: 'pending',
  1: 'approved',
  2: 'rejected',
  3: 'ordered'
};

// Estados visibles en la vista (excluye rejected = 2)
const VISIBLE_STATUS_CODES = new Set([0, 1, 3]);
const VISIBLE_STATUS_KEYS = new Set(['pending', 'approved', 'ordered', 'completed']);

function resolveStatusKey(request: PurchaseRequest): string {
  if (request.statusName) {
    const normalized = request.statusName.toLowerCase();
    if (normalized.includes('pend')) return 'pending';
    if (normalized.includes('aprob') || normalized.includes('approv')) return 'approved';
    if (normalized.includes('rech') || normalized.includes('reject')) return 'rejected';
    if (normalized.includes('order')) return 'ordered';
    if (normalized.includes('complet') || normalized.includes('entreg')) return 'completed';
    return normalized;
  }

  const statusValue = request.status;
  if (typeof statusValue === 'number') {
    return STATUS_CODE_MAP[statusValue] ?? statusValue.toString();
  }

  if (typeof statusValue === 'string') {
    return statusValue.toLowerCase();
  }

  return 'unknown';
}

export function usePurchaseRequests(): UsePurchaseRequestsReturn {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();

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
    // Primero filtramos por estados visibles (0, 1, 3)
    let filtered = purchaseRequests.filter(request => {
      const statusValue = request.status;
      if (typeof statusValue === 'number') {
        return VISIBLE_STATUS_CODES.has(statusValue);
      }
      const statusKey = resolveStatusKey(request);
      return VISIBLE_STATUS_KEYS.has(statusKey);
    });

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request => {
        const identifier = (request.requestNumber ?? request.requestId ?? '').toString().toLowerCase();
        const project = (request.projectName ?? request.projectId ?? '').toString().toLowerCase();
        const department = (request.departmentName ?? request.departmentId ?? '').toString().toLowerCase();
        const reason = (request.reasonName ?? (typeof request.reasonId === 'string' ? request.reasonId : '')).toString().toLowerCase();
        const warehouse = (request.warehouseName ?? '').toString().toLowerCase();
        const company = (request.companyName ?? request.companyId ?? '').toString().toLowerCase();
        const customer = (request.customerName ?? request.customerId ?? '').toString().toLowerCase();
        const notes = (request.notes ?? '').toString().toLowerCase();

        const inItems = request.items?.some(item => (item.name ?? '').toLowerCase().includes(searchLower));

        return (
          identifier.includes(searchLower) ||
          project.includes(searchLower) ||
          department.includes(searchLower) ||
          reason.includes(searchLower) ||
          warehouse.includes(searchLower) ||
          company.includes(searchLower) ||
          customer.includes(searchLower) ||
          notes.includes(searchLower) ||
          inItems
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => resolveStatusKey(request) === statusFilter);
    }

    if (warehouseFilter !== 'all') {
      filtered = filtered.filter(request => {
        const warehouseValue = request.warehouseId ?? request.warehouseName;
        return warehouseValue?.toString() === warehouseFilter;
      });
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
    const normalizedId = requestId.toString();
    showConfirm({
      title: 'Cancel purchase request',
      description: 'Are you sure you want to cancel this purchase request? This action cannot be undone.',
      type: 'warning',
      confirmText: 'Yes, cancel request',
      cancelText: 'Keep request',
      onConfirm: async () => {
        try {
          const result = await deletePurchaseRequest(normalizedId);
          if (result.success) {
            setPurchaseRequests(prev => prev.filter(req => {
              const reqKey = (req.requestId ?? req.requestNumber)?.toString();
              return reqKey !== normalizedId;
            }));
            toast.success('Request cancelled successfully');
          } else {
            toast.error(result.message);
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to cancel request');
        } finally {
          hideModal();
        }
      }
    });
  };

  // Confirm purchase as bought
  const handleConfirmBought = async (requestId: string, quantities: { [key: string]: number }) => {
    const normalizedId = requestId.toString();
    try {
      const result = await confirmPurchaseBought(normalizedId, quantities);
      if (result.success) {
        setPurchaseRequests(prev => prev.filter(req => {
          const reqKey = (req.requestId ?? req.requestNumber)?.toString();
          return reqKey !== normalizedId;
        }));
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
    const statusKey = resolveStatusKey(request);
    return statusKey === 'pending';
  };

  // Check if purchase can be confirmed as bought
  const canConfirmBought = (request: PurchaseRequest): boolean => {
    const statusKey = resolveStatusKey(request);
    // Cambiar de 'approved' (1) a 'ordered' (3)
    const isOrdered = statusKey === 'ordered' || statusKey === 'completed';
    // selfPurchase puede venir como boolean o string
    const isSelfPurchase = request.selfPurchase === true || 
                           request.selfPurchase === 'true' || 
                           (request as any).isSelfPurchase === true ||
                           (request as any).isSelfPurchase === 'true';
    return isOrdered && isSelfPurchase;
  };

  // Get status count (solo cuenta estados visibles)
  const getStatusCount = (status: string): number => {
    // Filtramos primero por estados visibles
    const visibleRequests = purchaseRequests.filter(req => {
      const statusValue = req.status;
      if (typeof statusValue === 'number') {
        return VISIBLE_STATUS_CODES.has(statusValue);
      }
      const statusKey = resolveStatusKey(req);
      return VISIBLE_STATUS_KEYS.has(statusKey);
    });

    if (status === 'all') return visibleRequests.length;
    return visibleRequests.filter(req => resolveStatusKey(req) === status).length;
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
    refreshRequests: loadRequests,
    modalState,
    setModalOpen
  };
}