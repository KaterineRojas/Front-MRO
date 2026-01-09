import { useState, useEffect, useMemo, useCallback } from 'react';
import CardRequest from './components/Card';
import TabsGroup from './components/Tabs';
import SearchBar from './components/SearchBar';
import RequestModal from './components/ApproveRequestDialog';
import { LoanRequest, UnifiedRequest } from './types/loanTypes';
import { approveLoanRequest, rejectLoanRequest, getLoanRequests } from './services/requestService';
import { Loader2 } from 'lucide-react';
import { TableErrorBoundary } from '../orders/components/TableErrorBoundary';
import { TableErrorState } from '../orders/components/TableErrorState';
import { OrderTable } from '../orders/components/OrderTable';
import { getAllPurchaseRequests } from '../orders/services/purchaseService';
import { PurchaseRequest } from '../orders/types/purchaseType';
import { ReviewRequestModal } from '../orders/modals/ApproveRequestModal';
import { approvePurchaseRequest, rejectPurchaseRequest } from '../orders/services/purchaseService';

export function RequestManagement() {
  // 1. MAIN DATA STATE (Unified)
  const [allRequests, setAllRequests] = useState<UnifiedRequest[]>([]);

  // 2. UI STATES
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // Note: You might want to add this to your filter logic later
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. MODAL STATES
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null); // For Loan Modal
  const [modalType, setModalType] = useState('approve');
  const [showModal, setShowModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const [reviewState, setReviewState] = useState<{
    isOpen: boolean;
    order: PurchaseRequest | null;
    action: 'approve' | 'reject';
  }>({
    isOpen: false,
    order: null,
    action: 'approve'
  });
  const [isReviewProcessing, setIsReviewProcessing] = useState(false);

  // CONSTANTS
  const currentEmployeeId = "amx0142";
  const requestTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: '1', label: 'Loan Request' },
    { value: '2', label: 'Purchase' },
    { value: '3', label: 'Purchase On Site' },
    { value: '4', label: 'Transfer On Site' },
  ];

  // ===========================================================================
  // DATA FETCHING
  // ===========================================================================

  const getPurchaseStatusLabel = (status: number): string => {
    const map: Record<number, string> = {
      0: 'Pending',
      1: 'Approved',
      2: 'Rejected',
      // Add other status codes if needed (e.g. 5: Sent)
    };
    return map[status] || 'Unknown';
  };

  const fetchUnifiedRequests = useCallback(async (signal?: AbortSignal) => {
    const validSignal = (signal instanceof AbortSignal) ? signal : undefined;

    try {
      setLoading(true);
      setError(null);

      const [purchaseData, loanRes] = await Promise.all([
        getAllPurchaseRequests(validSignal),
        getLoanRequests(1, 100, validSignal)
      ]);

      const formattedPurchases: UnifiedRequest[] = purchaseData.map((p: PurchaseRequest) => ({
        id: p.id,
        requestNumber: p.requestNumber,
        type: p.typeRequestName || 'Purchase',
        warehouse: p.warehouseName,
        requester: p.requesterId,
        date: p.createdAt,
        totalQty: p.totalQuantity,
        statusLabel: getPurchaseStatusLabel(p.status),
        originalData: { ...p, kind: 'Purchase' as const }
      }));

      const formattedLoans: UnifiedRequest[] = loanRes.data.map((l: LoanRequest) => ({
        id: l.id,
        requestNumber: l.requestNumber,
        type: l.typeRequestName || 'Loan',
        warehouse: l.warehouseName,
        requester: l.requesterName,
        date: l.createdAt,
        totalQty: l.totalQuantity,
        statusLabel: l.status,
        originalData: { ...l, kind: 'Loan' as const }
      }));

      const combined = [...formattedPurchases, ...formattedLoans];
      // Sort by newest first
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAllRequests(combined);

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Failed to load requests:", err);
      setError(err.message || "An unexpected error occurred while fetching data.");
    } finally {
      if (!validSignal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchUnifiedRequests(controller.signal);
    return () => controller.abort();
  }, [fetchUnifiedRequests]);


  // ===========================================================================
  // COMPUTED DATA (FILTERS & COUNTS)
  // ===========================================================================

  // 1. FILTER LOGIC
  const filteredRequests = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const currentTab = activeTab.toLowerCase();

    return allRequests.filter((request) => {
      const data = request.originalData || request;

      // Extract Status
      const rawStatus = (data.kind === 'Purchase' ? data.statusName : data.status) || '';
      const status = rawStatus.toLowerCase().trim();

      // Status Filter
      if (currentTab !== 'all') {
        // Strict match because tabs match status names (pending/approved/rejected)
        if (status !== currentTab) return false;
      }

      // Search Filter
      if (term) {
        const idToCheck = data.kind === 'Purchase' ? data.id?.toString() : data.requestNumber;
        const requesterToCheck = data.kind === 'Purchase' ? data.requesterId : data.requesterName;

        const matchesTopLevel =
          (idToCheck && idToCheck.toLowerCase().includes(term)) ||
          (requesterToCheck && requesterToCheck.toLowerCase().includes(term));

        if (matchesTopLevel) return true;

        const matchesItems = (data.items || []).some((item: any) => {
          const name = item.name || item.productName || '';
          const sku = item.sku || '';
          return (
            name.toLowerCase().includes(term) ||
            sku.toLowerCase().includes(term)
          );
        });

        if (!matchesItems) return false;
      }

      return true;
    });
  }, [allRequests, activeTab, searchTerm]);

  // 2. COUNTS (Calculated from allRequests, not filteredRequests)
  const pendingCount = useMemo(() => allRequests.filter(r => {
    const s = r.originalData.kind === 'Purchase' ? r.originalData.statusName : r.originalData.status;
    return (s || '').toLowerCase() === 'pending';
  }).length, [allRequests]);

  const approvedCount = useMemo(() => allRequests.filter(r => {
    const s = r.originalData.kind === 'Purchase' ? r.originalData.statusName : r.originalData.status;
    return (s || '').toLowerCase() === 'approved';
  }).length, [allRequests]);

  const rejectedCount = useMemo(() => allRequests.filter(r => {
    const s = r.originalData.kind === 'Purchase' ? r.originalData.statusName : r.originalData.status;
    return (s || '').toLowerCase() === 'rejected';
  }).length, [allRequests]);


  // ===========================================================================
  // HANDLERS (ACTIONS)
  // ===========================================================================

  // --- LOAN ACTIONS ---
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setLoadingModal(true);
    try {
      await approveLoanRequest(selectedRequest.requestNumber, currentEmployeeId);

      // Update local state to reflect change immediately
      setAllRequests(prev => prev.map(req => {
        if (req.originalData.kind === 'Loan' && req.requestNumber === selectedRequest.requestNumber) {
          return {
            ...req,
            statusLabel: 'Approved',
            originalData: { ...req.originalData, status: 'Approved' }
          };
        }
        return req;
      }));

      setSelectedRequest(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Couldn't approve the request.");
    } finally {
      setLoadingModal(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedRequest) return;
    if (!reason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setLoadingModal(true);
    try {
      await rejectLoanRequest(selectedRequest.requestNumber, currentEmployeeId, reason);

      setAllRequests(prev => prev.map(req => {
        if (req.originalData.kind === 'Loan' && req.requestNumber === selectedRequest.requestNumber) {
          return {
            ...req,
            statusLabel: 'Rejected',
            originalData: { ...req.originalData, status: 'Rejected' }
          };
        }
        return req;
      }));

      setSelectedRequest(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request.");
    } finally {
      setLoadingModal(false);
    }
  };

  const handleCancelApprove = () => {
    setSelectedRequest(null);
    setShowModal(false);
  };


  // --- PURCHASE ACTIONS ---
  const handleOpenReview = (order: PurchaseRequest, action: 'approve' | 'reject') => {
    setReviewState({ isOpen: true, order, action });
  };

  const handleCloseReview = () => {
    setReviewState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirmReview = async (action: 'approve' | 'reject', notes: string) => {
    if (!reviewState.order) return;

    try {
      setIsReviewProcessing(true);
      if (action === 'approve') {
        await approvePurchaseRequest(reviewState.order.id);
      } else {
        await rejectPurchaseRequest(reviewState.order.id, notes);
      }

      // Update local state
      setAllRequests(prev => prev.map(req => {
        if (req.originalData.kind === 'Purchase' && req.id === reviewState.order!.id) {
          const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
          return {
            ...req,
            statusLabel: newStatus,
            originalData: { ...req.originalData, statusName: newStatus, status: action === 'approve' ? 1 : 2 }
          };
        }
        return req;
      }));

      handleCloseReview();
    } catch (error: any) {
      console.error(`Failed to ${action} request:`, error);
      alert(error.message || "Something went wrong.");
    } finally {
      setIsReviewProcessing(false);
    }
  };


  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1>Request Approval</h1>
          <p className="text-muted-foreground">
            Review and approve inventory requests from team members
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <CardRequest
          title='Pending'
          iconType='clock'
          value={pendingCount}
          description='Need to Review'
          mainColor='yellow'
          loading={loading}
        />
        <CardRequest
          title='Approved'
          iconType='check'
          value={approvedCount}
          description='Approved'
          mainColor='green'
          loading={loading}
        />
        <CardRequest
          title='Rejected'
          iconType='xCircle'
          value={rejectedCount}
          description='Rejected'
          mainColor='red'
          loading={loading}
        />
      </div>

      {/* Tabs & Search */}
      <div className="space-y-6 flex flex-col gap-2">
        <TabsGroup
          tabsList={[
            { name: 'Pending', iconType: 'clock' },
            { name: 'Approved', iconType: 'check' },
            { name: 'Rejected', iconType: 'xCircle' },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <SearchBar
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
          selectedType={typeFilter}
          setSelectedType={setTypeFilter}
          typesOptions={requestTypeOptions}
        />

        {/* Dynamic Data Table */}
        <div className="space-y-6 border-gray-200 border-[2px] dark:border-gray-800 p-5 rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Loading requests...</p>
              </div>
            </div>
          ) : (
            error ? (
              <TableErrorState message={error} onRetry={fetchUnifiedRequests} />
            ) : (
              <TableErrorBoundary>
                <OrderTable
                  requests={filteredRequests}  // <--- IMPORTANT: Using filtered data now
                  statusFilter={activeTab}     // Syncing status filter with active tab
                  activeTab={activeTab}
                  onReview={handleOpenReview}
                />
              </TableErrorBoundary>
            )
          )}
        </div>
      </div>

      {/* Loan Modal */}
      <RequestModal
        show={showModal}
        request={selectedRequest}
        onConfirm={modalType === 'approve' ? handleApprove : () => handleReject('')} // Passing empty string wrapper if needed
        onCancel={handleCancelApprove}
        variant={modalType === 'approve' ? 'approve' : 'reject'}
        loading={loadingModal}
      />

      {/* Purchase Modal */}
      <ReviewRequestModal
        isOpen={reviewState.isOpen}
        order={reviewState.order}
        initialAction={reviewState.action}
        onClose={handleCloseReview}
        onConfirm={handleConfirmReview}
        isProcessing={isReviewProcessing}
      />
    </div>
  );
}