import { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCurrentUser } from '../../../../store/selectors';
import { fetchCompleteHistory, type RequestType, type UnifiedRequest } from './historySlice';
import type { RootState } from '../../../../store/store';

export type { RequestType, UnifiedRequest };

interface UseCompleteHistoryReturn {
  requests: UnifiedRequest[];
  filteredRequests: UnifiedRequest[];
  isLoading: boolean;
  isMobile: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  typeFilter: RequestType | 'all';
  setTypeFilter: (type: RequestType | 'all') => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  getTypeCount: (type: RequestType | 'all') => number;
  getStatusCount: (status: string) => number;
  refresh: () => void;
  expandedRows: Set<string>;
  toggleRow: (id: string) => void;
}

// 1. Mantenemos la lógica de visibilidad fuera
const getVisibleRequests = (data: UnifiedRequest[]) => {
  return data.filter(req => {
    const status = req.status.toLowerCase();
    if (req.type === 'borrow') return status === 'sent' || status === 'rejected';
    if (req.type === 'purchase') return status === 'rejected' || status === 'received' || status === 'archived';
    if (req.type === 'transfer') return status === 'completed' || status === 'rejected';
    return true;
  });
};

export function useCompleteHistory(): UseCompleteHistoryReturn {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const { requests, isLoading } = useAppSelector((state: RootState) => state.history);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (currentUser?.employeeId) {
      dispatch(fetchCompleteHistory(currentUser.employeeId));
    }
  }, [dispatch, currentUser?.employeeId]);

  // 2. Aplicamos la visibilidad PRIMERO
  const visibleRequests = useMemo(() => getVisibleRequests(requests), [requests]);

  // 3. Filtramos sobre lo que es visible
  const filteredRequests = useMemo(() => {
    let filtered = visibleRequests;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(req => req.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => 
        req.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.requestNumber.toLowerCase().includes(searchLower) ||
        req.project.toLowerCase().includes(searchLower) ||
        req.warehouse.toLowerCase().includes(searchLower) ||
        req.notes.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [visibleRequests, typeFilter, statusFilter, searchTerm]);

  // 4. CORRECCIÓN: Los contadores ahora usan 'visibleRequests'
  const getTypeCount = (type: RequestType | 'all'): number => {
    if (type === 'all') return visibleRequests.length;
    return visibleRequests.filter(req => req.type === type).length;
  };

  const getStatusCount = (status: string): number => {
    if (status === 'all') return visibleRequests.length;
    return visibleRequests.filter(req => 
      req.status.toLowerCase() === status.toLowerCase()
    ).length;
  };

  const refresh = () => {
    if (currentUser?.employeeId) {
      dispatch(fetchCompleteHistory(currentUser.employeeId));
    }
  };

  return {
    requests,
    filteredRequests,
    isLoading,
    isMobile,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    getTypeCount,
    getStatusCount,
    refresh,
    expandedRows,
    toggleRow,
  };
}