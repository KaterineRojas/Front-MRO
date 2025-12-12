import { useState, useEffect, useMemo } from 'react';
import { Badge } from '../../ui/badge';
import { Check, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { mockRequests, type Request } from './data/mockRequest'
import CardRequest from './components/Card'
import TabsGroup from './components/Tabs'
import SearchBar, { SelectOption } from './components/SearchBar'
import RequestsTable from './components/DataTable';
import RequestModal from './components/ApproveRequestDialog';
import { API_URL } from '../../../url'
import { LoanRequestItem, LoanRequest, PaginatedLoanRequestResponse } from './types/loanTypes'
import { approveLoanRequest, rejectLoanRequest } from './services/requestService'


export function RequestManagement() {

  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [rejectNotes, setRejectNotes] = useState('');
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


  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          warehouseId: "1",
          pageNumber: pagination.pageNumber.toString(),
          pageSize: pagination.pageSize.toString()
        });

        const response = await fetch(`${API_URL}/loan-requests?${params}`, {
          signal: controller.signal
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const result: PaginatedLoanRequestResponse = await response.json();

        console.log('API Response:', result);

        setRequests(result.data);

        setPagination(prev => ({
          ...prev,
          totalCount: result.totalCount,
          totalPages: result.totalPages
        }));

      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    return () => controller.abort(); // Cleanup

    // Agregamos dependencias si quieres que se refresque al cambiar de página
  }, [pagination.pageNumber, pagination.pageSize]);




  const handleToggleExpand = (reqNumber: string) => {
    const newSet = new Set(expandedRequests);
    if (newSet.has(reqNumber)) {
      newSet.delete(reqNumber);
    } else {
      newSet.add(reqNumber);
    }
    setExpandedRequests(newSet);
  };


  // corregir esto cuando el backend devuelva type
  // type: 'purchase' | 'purchase-on-site' | 'transfer-on-site';



  // ... inside your component

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {

      // ------------------------------------------------------------
      // 1. STATUS FILTER
      // ------------------------------------------------------------
      const currentStatus = request.status?.toLowerCase() || '';
      const targetStatus = activeTab?.toLowerCase() || 'all';

      if (targetStatus !== 'all' && currentStatus !== targetStatus) {
        return false;
      }

      // ------------------------------------------------------------
      // 2. TYPE FILTER (✅ NEW)
      // ------------------------------------------------------------
      // We compare strings to numbers safely using toString()
      // Assuming 'typeFilter' is state holding "all", "1", "2", etc.
      if (typeFilter !== 'all') {
        // Backend sends number (e.g., 1), typeFilter is likely string (e.g., "1")
        if (request.typeRequest.toString() !== typeFilter) {
          return false;
        }
      }

      // ------------------------------------------------------------
      // 3. SEARCH FILTER
      // ------------------------------------------------------------
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
  }, [requests, activeTab, searchTerm, typeFilter]); // ✅ Added typeFilter dependency




  const handleApprove = async () => {
    if (!selectedRequest) return;
    setLoadingModal(true)

    try {

      // 2. LLAMADA AL SERVICIO 
      await approveLoanRequest(selectedRequest.requestNumber, currentEmployeeId);

      const updatedRequest = {
        ...selectedRequest,
        status: 'approved',
        // ...responseData 
      };

      setRequests(prev => prev.map(req =>
        req.requestNumber === selectedRequest.requestNumber ? updatedRequest : req
      ));

      setSelectedRequest(null);
      console.log("Request approved successfully");

    } catch (error) {
      console.error("Error approving request:", error);
      alert("No se pudo aprobar la solicitud. Revisa la consola.");
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
            status: 'rejected',
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
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  // const urgentCount = requests.filter(r => r.status === 'pending' && r.urgency === 'urgent').length;

  const calculateTotalCost = (request: Request) => {
    return request.items.reduce((total, item) => {
      return total + ((item.estimatedCost || 0) * item.quantity);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1>Request Approval</h1>
          <p className="text-muted-foreground">
            Review and approve inventory requests from team members
          </p>
        </div>

        {/* pending items alert */}
        {/* {pendingCount > 0 && (
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm">
              {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
              {urgentCount > 0 && (
                <span className="text-red-600 ml-1">
                  ({urgentCount} urgent)
                </span>
              )}
            </span>
          </div>
        )} */}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <CardRequest
          title='Pending'
          iconType='clock'
          value={pendingCount}
          description='Need to Review'
          mainColor='yellow'
        />

        <CardRequest
          title='Approved'
          iconType='check'
          value={approvedCount}
          description='Approved'
          mainColor='green'
        />

        <CardRequest
          title='Rejected'
          iconType='xCircle'
          value={rejectedCount}
          description='Rejected'
          mainColor='red'
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
        <div className="space-y-6 border-[2px] p-5 rounded-lg">

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

              loading={loading}
            />
          </div>

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

    </div>
  );
}
