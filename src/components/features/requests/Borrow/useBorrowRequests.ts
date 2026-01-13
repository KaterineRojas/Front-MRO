import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';
import { selectCartItems } from '../store/selectors';
import { useConfirmModal } from '../../../ui/confirm-modal';
import { handleError, setupConnectionListener } from '../../enginner/services/errorHandler';
import { selectCurrentUser } from '../../../../store/selectors';
import { 
  fetchBorrowRequests, 
  refreshBorrowRequests, 
  removeBorrowRequest 
} from '../../../../store/slices/requestsSlice';
import type { RootState } from '../../../../store/store';

import {
  deleteBorrow,
} from './borrowService';

import {
  getWarehouses,
  getStatuses,
  type Warehouse,
  type Status
} from '../services/sharedServices';

import {
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
  
  // Obtener borrow requests desde Redux
  const borrowRequests = useAppSelector((state: RootState) => state.requests.borrowRequests);
  const isLoadingBorrow = useAppSelector((state: RootState) => state.requests.loadingBorrow);

  // Estados del componente (solo UI local)
  const [showBorrowForm, setShowBorrowForm] = useState(false);
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
  // Get currentUser from authSlice with employeeId
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!currentUser?.employeeId) {
        return;
      }
      try {
        // Cargar warehouses y statuses (estos no están en Redux)
        const [whData, statusData] = await Promise.all([
          getWarehouses(),
          getStatuses(),
        ]);
        
        if (isMounted) {
          setWarehouses(whData);
          setStatuses(statusData);
        }
        
        // Cargar borrow requests desde Redux (con caché)
        dispatch(fetchBorrowRequests(currentUser.employeeId));
      } catch (error: any) {
        if (isMounted) {
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
      }
    };
    
    loadData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, currentUser?.employeeId]);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if should open borrow form from catalog
  useEffect(() => {
    const shouldOpenBorrowForm = sessionStorage.getItem('openBorrowForm');
    if (shouldOpenBorrowForm === 'true') {
      setShowBorrowForm(true);
      sessionStorage.removeItem('openBorrowForm');
    }
  }, []);

  //  3. Reemplazar el useEffect de filtrado por useMemo
  // Esto recalcula filteredBorrowRequests SOLO cuando cambian sus dependencias.
  const filteredBorrowRequests = useMemo(() => {
    return borrowRequests.filter(request => {
      // 1. Filtro de búsqueda por texto
      const searchLower = borrowSearchTerm.toLowerCase().trim();
      if (searchLower) {
        const matchesSearch = 
          request.requestNumber?.toLowerCase().includes(searchLower) ||
          request.projectId?.toLowerCase().includes(searchLower) ||
          request.warehouseName?.toLowerCase().includes(searchLower) ||
          request.departmentId?.toLowerCase().includes(searchLower) ||
          request.notes?.toLowerCase().includes(searchLower) ||
          request.items?.some(item => 
            item.name?.toLowerCase().includes(searchLower) ||
            item.sku?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower)
          );
        
        if (!matchesSearch) return false;
      }

      // 1.5. Solo mostrar estados Pending, Approved y Packing
      const allowedStatuses = ['pending', 'approved', 'packing'];
      if (!allowedStatuses.includes(request.status?.toLowerCase())) {
        return false;
      }

      // 2. Filtro por Warehouse
      if (warehouseFilter && warehouseFilter !== 'all') {
        const matchesWarehouse = 
          request.warehouseName === warehouseFilter ||
          request.warehouseName === warehouseFilter ||
          // Comparación case-insensitive por si acaso
          request.warehouseName?.toLowerCase() === warehouseFilter.toLowerCase();
        
        if (!matchesWarehouse) {
          // console.log('Warehouse filter mismatch:', { filter: warehouseFilter, requestWarehouseId: request.warehouseId, requestWarehouseName: request.warehouseName });
          return false;
        }
      }

      // 3. Filtro por Status
      if (borrowStatusFilter && borrowStatusFilter !== 'all') {
        const normalizedRequestStatus = request.status?.toLowerCase();
        const normalizedFilterStatus = borrowStatusFilter.toLowerCase();
        
        // Mapeo para manejar estados inconsistentes (p. ej., "Active" como "Completed")
        const statusMap: Record<string, string> = {
          'active': 'completed',
          'completed': 'completed',
          'approved': 'approved',
          'Pending': 'Pending',
          'rejected': 'rejected'
        };
        
        const mappedRequestStatus = statusMap[normalizedRequestStatus as keyof typeof statusMap] || normalizedRequestStatus;
        const mappedFilterStatus = statusMap[normalizedFilterStatus as keyof typeof statusMap] || normalizedFilterStatus;
        
        const matchesStatus = mappedRequestStatus === mappedFilterStatus;
        
        if (!matchesStatus) {
          // console.log('Status filter mismatch:', { filter: borrowStatusFilter, requestStatus: request.status, normalized: normalizedRequestStatus, mapped: mappedRequestStatus });
          return false;
        }
      }

      return true;
    });
  }, [borrowRequests, borrowSearchTerm, borrowStatusFilter, warehouseFilter]);


  // ✅ 4. Reemplazar la función getBorrowStatusCount por useCallback
  const getBorrowStatusCount = useCallback((status: string) => {
    if (!borrowRequests || !Array.isArray(borrowRequests)) return 0;
    
    // Solo contar los estados permitidos (Pending, Approved, Packing)
    const allowedStatuses = ['pending', 'approved', 'packing'];
    const visibleRequests = borrowRequests.filter(req => 
      allowedStatuses.includes(req.status?.toLowerCase())
    );
    
    if (status === 'all') return visibleRequests.length;
    
    // Normalizar para la comparación
    return visibleRequests.filter(req => {
      const normalizedRequestStatus = req.status?.toLowerCase();
      const normalizedFilterStatus = status.toLowerCase();
      
      // Mapeo para manejar "active" como "completed"
      const statusMap: Record<string, string> = {
        'active': 'active',
        'completed': 'completed',
        'approved': 'approved',
        'Pending': 'Pending',
        'rejected': 'rejected'
      };
      
      const mappedRequestStatus = statusMap[normalizedRequestStatus as keyof typeof statusMap] || normalizedRequestStatus;
      const mappedFilterStatus = statusMap[normalizedFilterStatus as keyof typeof statusMap] || normalizedFilterStatus;
      
      return mappedRequestStatus === mappedFilterStatus;
    }).length;
  }, [borrowRequests]); // Se recalcula solo si cambia borrowRequests

  // Handlers
  // ... (el resto de los Handlers permanecen igual) ...

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
          const result = await deleteBorrow(requestId);
          if (result.success) {
            // Remover del store de Redux
            dispatch(removeBorrowRequest(requestId));
            toast.success('Request cancelled successfully');
            hideModal();
          } else {
            showConfirm({
              title: 'Cannot Cancel Request',
              description: result.message ?? "Unknown error",
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
      dispatch(removeBorrowRequest(requestToReturn));
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

  const reloadBorrowRequests = async () => {
    if (!currentUser?.employeeId) return;
    // Usar refreshBorrowRequests para forzar recarga (bypass cache)
    dispatch(refreshBorrowRequests(currentUser.employeeId));
  };

  // ⚠️ La función ya no está definida aquí, sino arriba con useCallback
  // const getBorrowStatusCount = (status: string) => {
  //   return getStatusCount(borrowRequests, status);
  // };

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
    isLoadingBorrow,

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
    reloadBorrowRequests,
    hideModal,

    // Utilities
    canCancelBorrowRequest,
    canReturnAll
  };
}