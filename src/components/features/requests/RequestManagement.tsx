import React, { useState, useEffect, useEffectEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ClipboardCheck, Check, X, Clock, Package, AlertTriangle, ChevronDown, ChevronRight, FileText, CheckCircle, XCircle } from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { mockRequests, type Request } from './data/mockRequest'
import CardRequest from './components/Card'
import TabsGroup from './components/Tabs'
import SearchBar, { SelectOption } from './components/SearchBar'
import RequestsTable from './components/DataTable';






export function RequestManagement() {



  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set());
  const [rejectNotes, setRejectNotes] = useState('');


  useEffect(() => {
    console.log(activeTab);
  }, [activeTab])

  // variables for search bar do not remove
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all"); // 

  const requestTypeOptions: SelectOption[] = [
    { value: "all", label: "All Types" },
    { value: "loan", label: "Loan" },
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
      reviewedBy: 'Current User',
      reviewDate: new Date().toISOString().split('T')[0],
      reviewNotes: 'Approved'
    };

    setRequests(requests.map(request =>
      request.id === selectedRequest.id ? updatedRequest : request
    ));

    setApproveDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!selectedRequest) return;

    const updatedRequest: Request = {
      ...selectedRequest,
      status: 'rejected',
      reviewedBy: 'Current User',
      reviewDate: new Date().toISOString().split('T')[0],
      reviewNotes: rejectNotes
    };

    setRequests(requests.map(request =>
      request.id === selectedRequest.id ? updatedRequest : request
    ));

    setRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectNotes('');
  };

  const getStatusBadge = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
    }
  };

  const getStatusIcon = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'approved':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getUrgencyBadge = (urgency: Request['urgency']) => {
    switch (urgency) {
      case 'low':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">High</Badge>;
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
    }
  };

  const getTypeBadge = (type: Request['type']) => {
    switch (type) {
      case 'loan':
        return <Badge variant="default">Loan</Badge>;
      case 'purchase':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Purchase</Badge>;
      case 'purchase-on-site':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Purchase On Site</Badge>;
    }
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

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
            <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span>{activeTab} Requests ({getFilteredRequests(activeTab).length})</span>
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">

            <RequestsTable
              // Datos
              requests={getFilteredRequests(activeTab)}
              expandedRequests={expandedRequests}

              calculateTotalCost={calculateTotalCost}
              getStatusIcon={getStatusIcon}
              getStatusBadge={getStatusBadge}
              getTypeBadge={getTypeBadge}
              getUrgencyBadge={getUrgencyBadge}

              handleToggleExpand={handleToggleExpand}
              setSelectedRequest={setSelectedRequest}
              setApproveDialogOpen={setApproveDialogOpen}
              setRejectDialogOpen={setRejectDialogOpen}
            />
          </div>

        </div>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request?
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="rounded-md border p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Request Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequest.requestNumber}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    {getTypeBadge(selectedRequest.type)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Requested By</Label>
                    <p className="text-sm">{selectedRequest.requestedBy}</p>
                    <p className="text-xs text-muted-foreground">{selectedRequest.requestedByEmail}</p>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequest.department}</p>
                  </div>
                </div>
                {selectedRequest.project && (
                  <div>
                    <Label>Project</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequest.project}</p>
                  </div>
                )}
                <div>
                  <Label>Reason</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.reason}</p>
                </div>
                <div>
                  <Label>Items ({selectedRequest.items.length})</Label>
                  <div className="space-y-2 mt-2">
                    {selectedRequest.items.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-2 border rounded">
                        <ImageWithFallback
                          src={item.imageUrl || ''}
                          alt={item.articleDescription}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-mono text-sm">{item.articleCode}</p>
                          <p className="text-sm">{item.articleDescription}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.quantity} {item.unit}
                            </Badge>
                            {item.estimatedCost && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                ${(item.estimatedCost * item.quantity).toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setApproveDialogOpen(false);
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleApprove}
                >
                  Approve Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="rounded-md border p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Request Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequest.requestNumber}</p>
                  </div>
                  <div>
                    <Label>Type</Label>
                    {getTypeBadge(selectedRequest.type)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Requested By</Label>
                    <p className="text-sm">{selectedRequest.requestedBy}</p>
                    <p className="text-xs text-muted-foreground">{selectedRequest.requestedByEmail}</p>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequest.department}</p>
                  </div>
                </div>
                <div>
                  <Label>Items ({selectedRequest.items.length})</Label>
                  <div className="space-y-2 mt-2">
                    {selectedRequest.items.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-2 border rounded">
                        <ImageWithFallback
                          src={item.imageUrl || ''}
                          alt={item.articleDescription}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-mono text-sm">{item.articleCode}</p>
                          <p className="text-sm">{item.articleDescription}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.quantity} {item.unit}
                            </Badge>
                            {item.estimatedCost && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                ${(item.estimatedCost * item.quantity).toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="rejectNotes">Rejection Reason *</Label>
                <Textarea
                  id="rejectNotes"
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRejectDialogOpen(false);
                    setSelectedRequest(null);
                    setRejectNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectNotes.trim()}
                >
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
