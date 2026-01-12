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
import { approvePurchaseRequest, rejectPurchaseRequest } from '../orders/services/purchaseService';

export function RequestManagement() {
  const [allRequests, setAllRequests] = useState<UnifiedRequest[]>([]);

  // 2. UI STATES
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. MODAL STATES
  const [loadingModal, setLoadingModal] = useState(false);

  const [reviewState, setReviewState] = useState<{
    isOpen: boolean;
    order: UnifiedRequest | null;
    action: 'approve' | 'reject';
  }>({
    isOpen: false,
    order: null,
    action: 'approve'
  });

  // CONSTANTS
  const currentEmployeeId = "amx0142";
  const requestTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: '1', label: 'Loan Request' },
    { value: '2', label: 'Purchase' },
    { value: '3', label: 'Purchase On Site' },
    { value: '4', label: 'Transfer On Site' },
    { value: '5', label: 'Low Stock' },
    { value: '6', label: 'Urgent' },
    { value: '7', label: 'New Project' },
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


  // COMPUTED DATA (FILTERS & COUNTS)

  const filteredRequests = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const currentTab = activeTab.toLowerCase();

    return allRequests.filter((request) => {
      const data = request.originalData;
      const kind = data.kind; 

      // ----------------------------------------------------
      // STATUS FILTER (Tabs)
      // ----------------------------------------------------
      const rawStatus = (kind === 'Purchase' ? data.statusName : data.status) || '';

      if (currentTab !== 'all') {
        if (rawStatus.toLowerCase() !== currentTab) return false;
      }

      // ----------------------------------------------------
      //  TYPE FILTER (Dropdown)
      // ----------------------------------------------------
      if (typeFilter !== 'all') {

        // GROUP A: LOAN REQUESTS (Dropdown Values 1, 2, 3, 4)
        if (['1', '2', '3', '4'].includes(typeFilter)) {
          if (kind !== 'Loan') return false;

          if (data.typeRequest !== Number(typeFilter)) return false;
        }

        // GROUP B: PURCHASES (Dropdown Values 5, 6, 7)
        else if (['5', '6', '7'].includes(typeFilter)) {
          if (kind !== 'Purchase') return false;

          // Value '5' (Low Stock)   -> Reason 0
          // Value '6' (Urgent)      -> Reason 1
          // Value '7' (New Project) -> Reason 2
          const dropdownToReasonMap: Record<string, number> = {
            '5': 0,
            '6': 1,
            '7': 2
          };

          const targetReasonId = dropdownToReasonMap[typeFilter];

          if (data.reason !== targetReasonId) return false;
        }
      }

      // ----------------------------------------------------
      //  SEARCH FILTER (Top Level)
      // ----------------------------------------------------
      if (!term) return true;

      const searchableFields: string[] = [
        request.requestNumber || '',
        data.requestNumber?.toString() || '',
        request.requester || '',
        data.departmentId || '',
      ];

      if (kind === 'Loan') {
        const loan = data as LoanRequest;
        searchableFields.push(loan.requesterName || '');
        searchableFields.push(loan.departmentId || '');
      }
      else if (kind === 'Purchase') {
        const purchase = data as PurchaseRequest;
        searchableFields.push(purchase.requesterId || '');
        searchableFields.push(purchase.departmentId || '');
      }

      const matchesTopLevel = searchableFields.some(val =>
        val.toLowerCase().includes(term)
      );

      if (matchesTopLevel) return true;

      // ----------------------------------------------------
      //  ITEMS FILTER (Deep Search)
      // ----------------------------------------------------
      const matchesItems = (data.items || []).some((item: any) => {
        const name = item.name || item.productName || '';
        const sku = item.sku || '';

        return (
          name.toLowerCase().includes(term) ||
          sku.toLowerCase().includes(term)
        );
      });

      return matchesItems;
    });
  }, [allRequests, activeTab, searchTerm, typeFilter]);



  // COUNTS (Calculated from allRequests, not filteredRequests)
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

  const handleApprove = async () => {
    if (!reviewState.order) return;

    const request = reviewState.order;
    const data = request.originalData;
    const kind = data.kind;

    try {
      setLoadingModal(true);

      if (kind === 'Loan') {
        await approveLoanRequest(request.requestNumber, currentEmployeeId);
      }
      else if (kind === 'Purchase') {
        const purchaseId = (data as any).id;
        await approvePurchaseRequest(purchaseId);
      }

      setAllRequests(prev => prev.map(req => {
        if (req.id === request.id && req.requestNumber === request.requestNumber) {

          let newOriginalData;

          if (req.originalData.kind === 'Loan') {
            newOriginalData = {
              ...req.originalData,
              status: 'Approved'
            };

            console.log(newOriginalData);

          } else {
            newOriginalData = {
              ...req.originalData,
              statusName: 'Approved',
              status: 1
            };
          }

          return {
            ...req,
            statusLabel: 'Approved',
            originalData: newOriginalData
          };
        }

        return req;
      }));

      reviewState.isOpen = false
      reviewState.order = null;

    } catch (error: any) {
      console.error(`Error approving ${kind}:`, error);
      alert(error.message || "Could not approve request.");
    } finally {
      setLoadingModal(false);
    }
  };




  const handleReject = async (reason: string) => {
    if (!reviewState.order) return;

    if (!reason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    const request = reviewState.order;
    const kind = request.originalData.kind;

    try {
      setLoadingModal(true);

      if (kind === 'Loan') {
        await rejectLoanRequest(request.requestNumber, currentEmployeeId, reason);
      }
      else if (kind === 'Purchase') {
        const purchaseId = (request.originalData as any).id;
        await rejectPurchaseRequest(purchaseId, reason);
      }

      // for updating stae in filteredRequests
      setAllRequests(prev => prev.map(req => {
        // STRICT CHECK: *AND* Kind to prevent collisions
        // backend doesn't send id so we can compare for that value
        const isMatchingKind = req.originalData.kind === kind;
        const isMatchingRequestId = req.originalData.requestNumber === request.requestNumber;

        if (isMatchingKind && isMatchingRequestId) {

          let newOriginalData;

          if (req.originalData.kind === 'Loan') {
            newOriginalData = {
              ...req.originalData,
              status: 'Rejected'
            };
          } else {
            newOriginalData = {
              ...req.originalData,
              statusName: 'Rejected',
              status: 2
            };
          }

          return {
            ...req,
            statusLabel: 'Rejected',
            originalData: newOriginalData
          };
        }

        return req;
      }));

      reviewState.isOpen = false;
      reviewState.order = null;

    } catch (error: any) {
      console.error(`Error rejecting ${kind}:`, error);
      alert(error.message || "Could not reject request.");
    } finally {
      setLoadingModal(false);
    }
  };


  // --- PURCHASE ACTIONS ---
  const handleOpenReview = (order: UnifiedRequest, action: 'approve' | 'reject') => {
    setReviewState({ isOpen: true, order, action });
  };

  const handleCloseReview = () => {
    setReviewState(prev => ({ ...prev, isOpen: false }));
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
                  requests={filteredRequests}
                  statusFilter={activeTab}
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
        show={reviewState.isOpen}
        request={reviewState.order}
        onConfirm={reviewState.action === 'approve' ? handleApprove : handleReject}
        onCancel={handleCloseReview}
        variant={reviewState.action === 'approve' ? 'approve' : 'reject'}
        loading={loadingModal}
      />
    </div>
  );
}