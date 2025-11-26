import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '../../enginner/store/hooks';
import { clearCart } from '../../enginner/store/slices/cartSlice';
import { selectCartItems, selectCurrentUser } from '../../enginner/store/selectors';
import { useConfirmModal } from '../../../ui/confirm-modal';
import { handleError, setupConnectionListener } from '../../enginner/services/errorHandler';

import {
  getBorrowRequests,
  deleteBorrowRequest,
  type BorrowRequest
} from './borrowService';

import {
  getWarehouses,
  getStatuses,
  type Warehouse,
  type Status
} from '../services/sharedServices';

import {
  filterBorrowRequests,
  getStatusCount,
  canCancelBorrowRequest,
  canReturnAll
} from './borrowUtils';

/**
 * Custom Hook para manejar la lógica de Borrow Requests
 */
export function useBorrowRequests() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const currentUser = useAppSelector(selectCurrentUser);

  // Estados del componente
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [filteredBorrowRequests, setFilteredBorrowRequests] = useState<BorrowRequest[]>([]);
  const [borrowSearchTerm, setBorrowSearchTerm] = useState('');
  const [borrowStatusFilter, setBorrowStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [expandedBorrowRows, setExpandedBorrowRows] = useState<Set<string>>(new Set());
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [requestToReturn, setRequestToReturn] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();

  // Setup connection listener
  useEffect(() => {
    const cleanup = setupConnectionListener(
      () => {
        setIsOnline(true);
        toast.success('Internet connection restored');
      },
      () => {
        setIsOnline(false);
        showConfirm({
          title: 'No Internet Connection',
          description: 'Please check your network connection. The app will retry automatically when connection is restored.',
          type: 'network',
          confirmText: 'OK',
          showCancel: false
        });
      }
    );
    return cleanup;
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [whData, statusData, requestsData] = await Promise.all([
          getWarehouses(),
          getStatuses(),
          getBorrowRequests(currentUser?.id) // Pasar el ID del usuario
        ]);
        setWarehouses(whData);
        setStatuses(statusData);
        setBorrowRequests(requestsData);
      } catch (error: any) {
        const appError = handleError(error);
        showConfirm({
          title: appError.type === 'NETWORK_ERROR' ? 'Connection Error' : 'Error Loading Data',
          description: appError.message,
          type: appError.type === 'NETWORK_ERROR' ? 'network' : 'error',
          confirmText: 'Retry',
          cancelText: 'Cancel',
          retryable: appError.retryable,
          onConfirm: () => {
            hideModal();
            loadData();
          }
        });
      }
    };
    loadData();
  }, []);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter requests
  useEffect(() => {
    const filtered = filterBorrowRequests(
      borrowRequests,
      borrowSearchTerm,
      borrowStatusFilter,
      warehouseFilter
    );
    setFilteredBorrowRequests(filtered);
  }, [borrowRequests, borrowSearchTerm, borrowStatusFilter, warehouseFilter]);

  // Handlers
  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCancelBorrowRequest = (requestId: string) => {
    setRequestToDelete(requestId);
    showConfirm({
      title: 'Cancel Borrow Request',
      description: 'Are you sure you want to cancel this borrow request? This action cannot be undone.',
      type: 'warning',
      confirmText: 'Yes, Cancel Request',
      cancelText: 'Keep Request',
      onConfirm: async () => {
        try {
          const result = await deleteBorrowRequest(requestId);
          if (result.success) {
            setBorrowRequests(prev => prev.filter(req => req.requestNumber !== requestId));
            toast.success('Request cancelled successfully');
            hideModal();
          } else {
            showConfirm({
              title: 'Cannot Cancel Request',
              description: result.message,
              type: 'error',
              confirmText: 'OK',
              showCancel: false
            });
          }
        } catch (error: any) {
          const appError = handleError(error);
          showConfirm({
            title: 'Error Cancelling Request',
            description: appError.message,
            type: appError.type === 'NETWORK_ERROR' ? 'network' : 'error',
            confirmText: 'Retry',
            cancelText: 'Close',
            retryable: appError.retryable,
            onConfirm: () => {
              hideModal();
              handleCancelBorrowRequest(requestId);
            }
          });
        } finally {
          setRequestToDelete(null);
        }
      }
    });
  };

  const handleReturnAll = (requestId: string) => {
    setRequestToReturn(requestId);
    setReturnDialogOpen(true);
  };

  const confirmReturnAll = () => {
    const request = borrowRequests.find(r => r.requestNumber === requestToReturn);
    if (request) {
      setBorrowRequests(prev => prev.filter(r => r.requestNumber !== requestToReturn));
      toast.success('All items returned successfully');
    }
    setReturnDialogOpen(false);
    setRequestToReturn('');
  };

  const toggleBorrowRow = (requestId: string) => {
    setExpandedBorrowRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const getBorrowStatusCount = (status: string) => {
    return getStatusCount(borrowRequests, status);
  };

  return {
    // State
    showBorrowForm,
    borrowRequests,
    filteredBorrowRequests,
    borrowSearchTerm,
    borrowStatusFilter,
    warehouseFilter,
    expandedBorrowRows,
    returnDialogOpen,
    requestToReturn,
    isMobile,
    warehouses,
    statuses,
    isOnline,
    requestToDelete,
    modalState,
    cartItems,
    currentUser,

    // Setters
    setShowBorrowForm,
    setBorrowSearchTerm,
    setBorrowStatusFilter,
    setWarehouseFilter,
    setReturnDialogOpen,
    setModalOpen,

    // Handlers
    handleClearCart,
    handleCancelBorrowRequest,
    handleReturnAll,
    confirmReturnAll,
    toggleBorrowRow,
    getBorrowStatusCount,
    hideModal,

    // Utilities
    canCancelBorrowRequest,
    canReturnAll
  };
}