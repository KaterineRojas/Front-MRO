import { useState, useEffect } from 'react';
import { Badge } from '../../ui/badge';
import { Check, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { mockRequests, type Request } from './data/mockRequest'
import CardRequest from './components/Card'
import TabsGroup from './components/Tabs'
import SearchBar, { SelectOption } from './components/SearchBar'
import RequestsTable from './components/DataTable';
import RequestModal from './components/ApproveRequestDialog';


export function RequestManagement() {

  const [requests, setRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set());
  const [rejectNotes, setRejectNotes] = useState('');
  const [modalType, setModalType] = useState('approve')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:3001/requests');

        if (!response.ok) throw new Error('Error fetching data');

        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false)
      }
    };

    fetchRequests();
  }, []);

  const requestTypeOptions: SelectOption[] = [
    { value: "all", label: "All Types" },
    { value: "transfer-on-site", label: "Transfer on Site" },
    { value: "purchase", label: "Purchase" },
    { value: "purchase-on-site", label: "Purchase on Site" },
  ];


  const handleToggleExpand = (requestId: number) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const getFilteredRequests = (status?: string) => {
    return requests.filter(request => {
      const matchesStatus = !status || status === 'all' || request.status === status;
      const matchesType = typeFilter === 'all' || request.type === typeFilter;
      const matchesSearch =
        request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.items.some(item =>
          item.articleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.articleDescription.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesStatus && matchesType && matchesSearch;
    });
  };

  const handleApprove = () => {
    if (!selectedRequest) return;

    const updatedRequest: Request = {
      ...selectedRequest,
      status: 'approved',
      reviewedBy: 'insert current user here',
      reviewDate: new Date().toISOString().split('T')[0],
      reviewNotes: 'Approved'
    };

    setRequests(requests.map(request =>
      request.id === selectedRequest.id ? updatedRequest : request
    ));

    setSelectedRequest(null);
  };

  const handleCancelApprove = () => {
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!selectedRequest) return;

    const updatedRequest: Request = {
      ...selectedRequest,
      status: 'rejected',
      reviewedBy: 'Insert current user here',
      reviewDate: new Date().toISOString().split('T')[0],
      reviewNotes: rejectNotes
    };

    setRequests(requests.map(request =>
      request.id === selectedRequest.id ? updatedRequest : request
    ));

    setSelectedRequest(null);
    setRejectNotes('');
  };

  

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const urgentCount = requests.filter(r => r.status === 'pending' && r.urgency === 'urgent').length;

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
        {pendingCount > 0 && (
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
        )}
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
            <span>{activeTab[0].toUpperCase() + activeTab.slice(1)} Requests ({getFilteredRequests(activeTab).length})</span>
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">

            <RequestsTable
              requests={getFilteredRequests(activeTab)}
              expandedRequests={expandedRequests}

              calculateTotalCost={calculateTotalCost}

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
