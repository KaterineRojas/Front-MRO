import { useState, useEffect } from 'react';
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
  const WAREHOUSE_ID = 1;
  const currentEmployeeId = "amx0142";


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
  const getFilteredRequests = (activeTabStatus?: string) => {
    return requests.filter(request => {

      let filterStatus = activeTabStatus?.toLowerCase() || 'all';

      if (filterStatus === 'pending') {
        filterStatus = 'sent';
      }

      const currentStatus = request.status?.toLowerCase() || '';
      const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus;
      const matchesType = typeFilter === 'all' || true;

      const term = searchTerm.toLowerCase();

      const matchesSearch =
        request.requestNumber.toLowerCase().includes(term) ||
        request.requesterName.toLowerCase().includes(term) ||
        request.departmentId?.toLowerCase().includes(term) ||
        request.items.some(item =>
          item.sku.toLowerCase().includes(term) ||
          item.name.toLowerCase().includes(term) 
        );

      return matchesStatus && matchesType && matchesSearch;
    });
  };





  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {

      // 2. LLAMADA AL SERVICIO (Actualizada)
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
    }
  };




  const handleCancelApprove = () => {
    setSelectedRequest(null);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectNotes.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      await rejectLoanRequest(
        selectedRequest.requestNumber,
        currentEmployeeId,
        rejectNotes
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
      setRejectNotes('');
      // toast.success("Request rejected");

    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject request.");
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
          // insert new type options here
          typesOptions={[/*requestTypeOptions*/]}
        />

        {/** dinamic data table */}
        <div className="space-y-6 border-[2px] p-5 rounded-lg">

          <h2 className="flex items-center space-x-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
            {/* <Check />
            <XCircle /> */}
            {/* <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" /> */}
            <span>{activeTab[0].toUpperCase() + activeTab.slice(1)} Requests ({getFilteredRequests(activeTab).length})</span>
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">

            <RequestsTable
              requests={getFilteredRequests(activeTab)}
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
      />

    </div>
  );
}
