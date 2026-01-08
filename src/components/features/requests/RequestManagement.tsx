import { useState, useEffect, useMemo, useCallback } from 'react';
import CardRequest from './components/Card'
import TabsGroup from './components/Tabs'
import SearchBar from './components/SearchBar'
import RequestsTable from './components/DataTable';
import RequestModal from './components/ApproveRequestDialog';
import { LoanRequest, UnifiedRequest} from './types/loanTypes'
import { approveLoanRequest, rejectLoanRequest, getLoanRequests } from './services/requestService'
import { Main } from '../orders/Main'
import { Loader2 } from 'lucide-react'
import { TableErrorBoundary } from '../orders/components/TableErrorBoundary'
import { TableErrorState } from '../orders/components/TableErrorState'
import { OrderTable } from '../orders/components/OrderTable'
import { getAllPurchaseRequests } from '../orders/services/purchaseService'
import { PurchaseRequest } from '../orders/types/purchaseType'
import { ReviewRequestModal } from '../orders/modals/ApproveRequestModal'
import { approvePurchaseRequest, rejectPurchaseRequest } from '../orders/services/purchaseService'



export function RequestManagement() {

  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [modalType, setModalType] = useState('approve')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingModal, setLoadingModal] = useState(false)
  const WAREHOUSE_ID = 1;
  const currentEmployeeId = "amx0142";
  const requestTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: '1', label: 'Loan Request' },
    { value: '2', label: 'Purchase' },
    { value: '3', label: 'Purchase On Site' },
    { value: '4', label: 'Transfer On Site' },
  ];

  useEffect(() => {
    console.log(filteredRequests);
  }, [])



  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseRequest[]>([]);
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
  const [allRequests, setAllRequests] = useState<UnifiedRequest[]>([]);





  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  useEffect(() => {
    console.log(loading);
  }, [])



  useEffect(() => {
    const controller = new AbortController();

    const loadRequests = async () => {
      setLoading(true);
      try {
        const result = await getLoanRequests(
          1,
          100,
          controller.signal
        );

        // console.log('API Response:', result);

        setRequests(result.data);
        // setPagination(prev => ({
        //   ...prev,
        //   totalCount: result.totalCount,
        //   totalPages: result.totalPages,
        //   hasPreviousPage: result.hasPreviousPage,
        //   hasNextPage: result.hasNextPage
        // }));

      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Fetch error:", error);
        }
      }
      setLoading(false);
    };

    loadRequests();

    return () => controller.abort();

  }, []);


  const handlePageChange = (newPage: number) => {
    // Prevent fetching if we are already on that page or it's invalid
    if (newPage < 1 || (pagination.totalPages > 0 && newPage > pagination.totalPages)) return;

    setPagination(prev => ({
      ...prev,
      pageNumber: newPage
    }));
  };


  const handleToggleExpand = (reqNumber: string) => {
    const newSet = new Set(expandedRequests);
    if (newSet.has(reqNumber)) {
      newSet.delete(reqNumber);
    } else {
      newSet.add(reqNumber);
    }
    setExpandedRequests(newSet);
  };


  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {

      // STATUS FILTER
      const currentStatus = request.status?.toLowerCase() || '';
      const targetStatus = activeTab?.toLowerCase() || 'all';

      if (targetStatus !== 'all' && currentStatus !== targetStatus) {
        return false;
      }

      // TYPE FILTER 
      // We compare strings to numbers safely using toString()
      // Assuming 'typeFilter' is state holding "all", "1", "2", etc.
      if (typeFilter !== 'all') {
        // Backend sends number (e.g., 1), typeFilter is likely string (e.g., "1")
        if (request.typeRequest.toString() !== typeFilter) {
          return false;
        }
      }

      // SEARCH FILTER
      if (!searchTerm) return true;

      const term = searchTerm.toLowerCase();

      // Check top-level fields
      const matchesTopLevel =
        request.requestNumber.toLowerCase().includes(term) ||
        request.requesterName.toLowerCase().includes(term) ||
        (request.departmentId && request.departmentId.toLowerCase().includes(term)) ||
        (request.workOrderId && request.workOrderId.toLowerCase().includes(term)); // Added WO search too

      if (matchesTopLevel) return true;

      // Check items
      return request.items.some((item) =>
        item.sku.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term)
      );
    });
  }, [requests, activeTab, searchTerm, typeFilter]);




  const handleApprove = async () => {
    if (!selectedRequest) return;
    setLoadingModal(true)

    try {

      // 2. LLAMADA AL SERVICIO 
      await approveLoanRequest(selectedRequest.requestNumber, currentEmployeeId);

      const updatedRequest = {
        ...selectedRequest,
        status: 'Approved',
        // ...responseData 
      };

      // for changing state in redux and update state in data table
      setRequests(prev => prev.map(req =>
        req.requestNumber === selectedRequest.requestNumber ? updatedRequest : req
      ));

      setSelectedRequest(null);
      // console.log("Request approved successfully");

    } catch (error) {
      console.error("Error approving request:", error);
      alert("Couldn't approved the request, check the console");
    } finally {
      setLoadingModal(false)
    }
  };


  const handleCancelApprove = () => {
    setSelectedRequest(null);
  };

  const handleReject = async (reason: string) => {
    if (!selectedRequest) return;
    setLoadingModal(true)


    if (!reason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      await rejectLoanRequest(
        selectedRequest.requestNumber,
        currentEmployeeId,
        reason
      );

      setRequests(prev => prev.map(req =>
        req.requestNumber === selectedRequest.requestNumber
          ? {
            ...req,
            status: 'Rejected',
          }
          : req
      ));

      setSelectedRequest(null);
      // toast.success("Request rejected");

    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request.");
    } finally {
      setLoadingModal(false)
    }
  };



  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;











  const fetchOrders = useCallback(async (signal?: AbortSignal) => {
    const validSignal = (signal instanceof AbortSignal) ? signal : undefined;

    try {
      setLoading(true);
      setError(null);
      const data = await getAllPurchaseRequests(validSignal);
      console.log(data);

      setPurchaseOrders(data);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Failed to load orders:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      if (!validSignal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchOrders]);


  const filteredOrders = useMemo(() => {
    let data = purchaseOrders;

    if (activeTab === 'pending') {
      data = data.filter(order => order.status === 0);
    } else {
      data = data.filter(order => order.status === 1 || order.status === 2);
    }

    // 2. APPLY DROPDOWN FILTER (If you still use the dropdown inside the tab)
    if (statusFilter !== 'all') {
      data = data.filter(order => order.status.toString() === statusFilter);
    }

    return data;
  }, [purchaseOrders, activeTab, statusFilter]);

  const handleOpenReview = (order: PurchaseRequest, action: 'approve' | 'reject') => {
    setReviewState({
      isOpen: true,
      order,
      action
    });
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

      handleCloseReview();
      fetchOrders(); // Refresh list after action

    } catch (error: any) {
      console.error(`Failed to ${action} request:`, error);
      alert(error.message || "Something went wrong while processing the request.");
    } finally {
      setIsReviewProcessing(false);
    }
  };



  const getPurchaseStatusLabel = (status: number): string => {
    const map: Record<number, string> = {
      0: 'Pending',
      1: 'Approved',
      2: 'Rejected',
      // ... add your specific mappings
    };
    return map[status] || 'Unknown';
  };


  // fetch all data at once
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
        statusLabel: l.status, // Already a string
        originalData: { ...l, kind: 'Loan' as const }
      }));

      const combined = [...formattedPurchases, ...formattedLoans];
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAllRequests(combined);
      

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }

      console.error("Failed to load requests:", err);
      setError(err.message || "An unexpected error occurred while fetching data.");

      // Optional: Reset data on error
      // setAllRequests([]); 

    } finally {
      if (!validSignal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    console.log(allRequests);
  }, [allRequests])
  





  // Single Effect to trigger the unified fetch
  useEffect(() => {
    const controller = new AbortController();

    fetchUnifiedRequests(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchUnifiedRequests]);


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

      {/* Tabs */}
      <div className="space-y-6 flex flex-col gap-2">
        <TabsGroup
          tabsList={[
            {
              name: 'Pending',
              iconType: 'clock',
            },
            {
              name: 'Approved',
              iconType: 'check',
            },
            {
              name: 'Rejected',
              iconType: 'xCircle',
            },

          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* search bar */}
        <SearchBar
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
          selectedType={typeFilter}
          setSelectedType={setTypeFilter}
          typesOptions={requestTypeOptions}
        />

        {/** dinamic data table */}
        <div className="space-y-6 border-gray-200 border-[2px] dark:border-gray-800 p-5 rounded-lg">

          <h2 className="flex items-center space-x-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
            {/* <Check />
            <XCircle /> */}
            {/* <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" /> */}
            <span>{activeTab[0].toUpperCase() + activeTab.slice(1)} Requests ({filteredRequests.length})</span>
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">

            <RequestsTable
              requests={filteredRequests}
              expandedRequests={expandedRequests}
              handleToggleExpand={handleToggleExpand}
              setSelectedRequest={setSelectedRequest}
              setShowModal={setShowModal}
              setModalType={setModalType}
              // pagination={pagination}
              // onPageChange={handlePageChange}

              loading={loading}
            />





          </div>









          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Loading requests...</p>
              </div>
            </div>
          ) : (
            error ? (
              <TableErrorState message={error} onRetry={fetchOrders} />
            ) : (
              <TableErrorBoundary>
                <OrderTable
                  requests={allRequests}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  activeTab={activeTab}
                  onReview={handleOpenReview}
                />
              </TableErrorBoundary>
            )
          )}








        </div>
      </div>

      {/* Modal */}
      <RequestModal
        show={showModal}
        request={selectedRequest}
        onConfirm={modalType === 'approve' ? handleApprove : handleReject}
        onCancel={handleCancelApprove}
        variant={modalType === 'approve' ? 'approve' : 'reject'}
        loading={loadingModal}
      />

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
