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
import { approveLoanRequest, rejectLoanRequest, getLoanRequests } from './services/requestService'



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
    console.log(loading);
  }, [loading])
  

  useEffect(() => {
    const controller = new AbortController();

    const loadRequests = async () => {
      setLoading(true);
      try {
        const result = await getLoanRequests(
          "1",
          pagination.pageNumber,
          pagination.pageSize,
          controller.signal
        );

        console.log('API Response:', result);

        setRequests(result.data);
        setPagination(prev => ({
          ...prev,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          hasPreviousPage: result.hasPreviousPage,
          hasNextPage: result.hasNextPage
        }));

      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadRequests();

    return () => controller.abort();

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
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;


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
        <div className="space-y-6 border-gray-200 border-[1px] p-5 rounded-lg">

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
