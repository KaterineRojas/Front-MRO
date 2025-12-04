import { useState, useEffect, useMemo, useCallback } from 'react'; // 👈 Importar useMemo y useCallback
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '../../enginner/store/hooks';
import { clearCart } from '../../enginner/store/slices/cartSlice';
import { selectCartItems, selectCurrentUser } from '../../enginner/store/selectors';
import { useConfirmModal } from '../../../ui/confirm-modal';
import { handleError, setupConnectionListener } from '../../enginner/services/errorHandler';

import {
  getBorrowRequests,
  deleteBorrow,
  type LoanRequest
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

interface GetRequestsParams {
  warehouseId?: string;
  status?: string;
  requesterId?: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

interface PagedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Custom Hook para manejar la lógica de Borrow Requests
 */
export function useBorrowRequests() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const currentUser = useAppSelector(selectCurrentUser);

  // Estados del componente
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowRequests, setBorrowRequests] = useState<LoanRequest[]>([]);
  
  // ⚠️ Ya no inicializaremos filteredBorrowRequests aquí, lo hará useMemo
  // const [filteredBorrowRequests, setFilteredBorrowRequests] = useState<BorrowRequest[]>([]);
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
          getBorrowRequests(currentUser?.id) 
        ]);
        setWarehouses(whData);
        setStatuses(statusData);
        setBorrowRequests(requestsData.items || []);
        console.log('Departamentos de los préstamos:', requestsData.items?.map(req => ({ requestNumber: req.requestNumber, departmentId: req.departmentId })));
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
  }, [currentUser?.id]); // Añadir currentUser?.id a las dependencias

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ 3. Reemplazar el useEffect de filtrado por useMemo
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
    
    if (status === 'all') return borrowRequests.length;
    
    // Normalizar para la comparación
    return borrowRequests.filter(req => {
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
            setBorrowRequests(prev => prev.filter(req => req.requestNumber !== requestId));
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

  // ⚠️ La función ya no está definida aquí, sino arriba con useCallback
  // const getBorrowStatusCount = (status: string) => {
  //   return getStatusCount(borrowRequests, status);
  // };

  return {
    // State
    showBorrowForm,
    borrowRequests,
    filteredBorrowRequests, // 👈 Ahora es el resultado de useMemo
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
    getBorrowStatusCount, // 👈 Ahora es la función de useCallback
    hideModal,

    // Utilities
    canCancelBorrowRequest,
    canReturnAll
  };
}