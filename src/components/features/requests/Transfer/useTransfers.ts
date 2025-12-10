import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  getTransfersIncoming,
  getTransfersOutgoing,
  acceptTransfer,
  rejectTransfer,
  deleteTransfer,
  type Transfer
} from './transferService';
 

interface UseTransfersReturn {
  transfers: Transfer[];
  filteredTransfers: Transfer[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  expandedRows: Set<string>;
  toggleRow: (id: string) => void;
  handleCancel: (id: string) => Promise<void>;
  handleAccept: (
    id: string,
    recipientId: string,
    companyId: string,
    customerId: string,
    departmentId: string,
    projectId: string,
    workOrderId: string,
    notes?: string
  ) => Promise<void>;
  handleReject: (id: string) => Promise<void>;
  getStatusCount: (status: string) => number;
  getTypeCount: (type: string) => number;
  canCancelTransfer: (transfer: Transfer) => boolean;
  refreshTransfers: () => Promise<void>;
}

export function useTransfers(): UseTransfersReturn {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Load transfers
  const loadTransfers = async () => {
    try {
      setIsLoading(true);
      // Load both incoming and outgoing transfers in parallel
      const [incomingData, outgoingData] = await Promise.all([
        getTransfersIncoming(),
        getTransfersOutgoing()
      ]);
      
      // Combine both arrays and sort by date (most recent first)
      const allTransfers = [...incomingData, ...outgoingData]
        .filter(transfer => transfer.status === 'pending') // Only show pending transfers
        .sort((a, b) => {
          const dateA = new Date(a.requestDate).getTime();
          const dateB = new Date(b.requestDate).getTime();
          return dateB - dateA; // Most recent first
        });
      
      setTransfers(allTransfers);
    } catch (error) {
      toast.error('Failed to load transfers');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    let filtered = transfers;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transfer =>
        transfer.id.toLowerCase().includes(searchLower) ||
        (transfer.toUser && transfer.toUser.toLowerCase().includes(searchLower)) ||
        (transfer.fromUser && transfer.fromUser.toLowerCase().includes(searchLower)) ||
        transfer.notes.toLowerCase().includes(searchLower) ||
        transfer.items.some(item => item.itemName.toLowerCase().includes(searchLower))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(transfer => transfer.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(transfer => transfer.type === typeFilter);
    }

    return filtered;
  }, [transfers, searchTerm, statusFilter, typeFilter]);

  // Toggle row expansion
  const toggleRow = (transferId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transferId)) {
        newSet.delete(transferId);
      } else {
        newSet.add(transferId);
      }
      return newSet;
    });
  };

  // Cancel transfer
  const handleCancel = async (transferId: string) => {
    try {
      await deleteTransfer(transferId);
      toast.success('Transfer deleted successfully');
      // Reload transfers after successful cancel
      await loadTransfers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transfer');
    }
  };

  // Accept transfer
  const handleAccept = async (
    transferId: string,
    recipientId: string,
    companyId: string,
    customerId: string,
    departmentId: string,
    projectId: string,
    workOrderId: string,
    notes?: string
  ) => {
    try {
      await acceptTransfer(
        transferId,
        recipientId,
        companyId,
        customerId,
        departmentId,
        projectId,
        workOrderId,
        notes
      );
      toast.success('Transfer accepted successfully');
      // Reload transfers after successful accept
      await loadTransfers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept transfer');
    }
  };

  // Reject transfer
  const handleReject = async (transferId: string) => {
    try {
      await rejectTransfer(transferId);
      toast.success('Transfer rejected successfully');
      // Reload transfers after successful reject
      await loadTransfers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject transfer');
    }
  };

  // Get status count
  const getStatusCount = (status: string): number => {
    if (status === 'all') return transfers.length;
    return transfers.filter(tr => tr.status === status).length;
  };

  // Get type count
  const getTypeCount = (type: string): number => {
    if (type === 'all') return transfers.length;
    return transfers.filter(tr => tr.type === type).length;
  };

  // Check if transfer can be cancelled
  const canCancelTransfer = (transfer: Transfer): boolean => {
    return transfer.type === 'outgoing' && transfer.status === 'pending';
  };

  return {
    transfers,
    filteredTransfers,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    expandedRows,
    toggleRow,
    handleCancel,
    handleAccept,
    handleReject,
    getStatusCount,
    getTypeCount,
    canCancelTransfer,
    refreshTransfers: loadTransfers
  };
}