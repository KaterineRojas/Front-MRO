import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ClipboardCheck, Check, X, Clock, Package, AlertTriangle, ChevronDown, ChevronRight, FileText, CheckCircle, XCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RequestItem {
  id: number;
  articleCode: string;
  articleDescription: string;
  quantity: number;
  unit: string;
  estimatedCost?: number;
  imageUrl?: string;
}

interface Request {
  id: number;
  type: 'loan' | 'purchase' | 'purchase-on-site';
  requestNumber: string;
  requestedBy: string;
  requestedByEmail: string;
  department: string;
  project?: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: string;
  requiredDate?: string;
  returnDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  items: RequestItem[];
  purchasedBy?: 'applicant' | 'keeper'; // Only for purchase types
}

const mockRequests: Request[] = [
  {
    id: 1,
    type: 'loan',
    requestNumber: 'REQ-2025-001',
    requestedBy: 'Mike Chen',
    requestedByEmail: 'mike.chen@company.com',
    department: 'Marketing',
    project: 'Q1 Client Presentations',
    reason: 'Need equipment for important client presentations scheduled for next week',
    urgency: 'high',
    requestDate: '2025-01-22',
    requiredDate: '2025-01-25',
    returnDate: '2025-02-05',
    status: 'pending',
    items: [
      {
        id: 1,
        articleCode: 'TECH-002',
        articleDescription: 'Laptop Dell Latitude 5520',
        quantity: 1,
        unit: 'units',
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300'
      },
      {
        id: 2,
        articleCode: 'PROJ-004',
        articleDescription: 'Projector Epson EB-X41',
        quantity: 1,
        unit: 'units',
        imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300'
      }
    ]
  },
  {
    id: 2,
    type: 'purchase',
    requestNumber: 'REQ-2025-002',
    requestedBy: 'Anna Rodriguez',
    requestedByEmail: 'anna.rodriguez@company.com',
    department: 'IT',
    project: 'Workstation Setup 2025',
    reason: 'Stock is running low, need for new workstation setups',
    urgency: 'medium',
    requestDate: '2025-01-21',
    requiredDate: '2025-01-30',
    status: 'pending',
    purchasedBy: 'keeper',
    items: [
      {
        id: 3,
        articleCode: 'USB-003',
        articleDescription: 'USB Cable Type-C 2m',
        quantity: 20,
        unit: 'units',
        estimatedCost: 8.99,
        imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300'
      },
      {
        id: 4,
        articleCode: 'KB-015',
        articleDescription: 'Wireless Keyboard Logitech',
        quantity: 10,
        unit: 'units',
        estimatedCost: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300'
      }
    ]
  },
  {
    id: 3,
    type: 'purchase-on-site',
    requestNumber: 'REQ-2025-003',
    requestedBy: 'David Wilson',
    requestedByEmail: 'david.wilson@company.com',
    department: 'Finance',
    reason: 'Emergency replacement needed for broken printer',
    urgency: 'urgent',
    requestDate: '2025-01-23',
    requiredDate: '2025-01-24',
    status: 'approved',
    reviewedBy: 'Sarah Johnson',
    reviewDate: '2025-01-23',
    reviewNotes: 'Approved for immediate purchase',
    purchasedBy: 'applicant',
    items: [
      {
        id: 5,
        articleCode: 'PRINT-008',
        articleDescription: 'Printer HP LaserJet Pro',
        quantity: 1,
        unit: 'units',
        estimatedCost: 350.00,
        imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300'
      }
    ]
  },
  {
    id: 4,
    type: 'loan',
    requestNumber: 'REQ-2025-004',
    requestedBy: 'Linda Martinez',
    requestedByEmail: 'linda.martinez@company.com',
    department: 'Training',
    project: 'Q1 Employee Onboarding',
    reason: 'Quarterly training session for new employees',
    urgency: 'medium',
    requestDate: '2025-01-20',
    requiredDate: '2025-01-28',
    returnDate: '2025-02-01',
    status: 'approved',
    reviewedBy: 'Sarah Johnson',
    reviewDate: '2025-01-21',
    reviewNotes: 'Approved for training purposes',
    items: [
      {
        id: 6,
        articleCode: 'PROJ-004',
        articleDescription: 'Projector Epson EB-X41',
        quantity: 1,
        unit: 'units',
        imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300'
      },
      {
        id: 7,
        articleCode: 'SCREEN-002',
        articleDescription: 'Projection Screen 100 inch',
        quantity: 1,
        unit: 'units',
        imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=300'
      },
      {
        id: 8,
        articleCode: 'MIC-005',
        articleDescription: 'Wireless Microphone Set',
        quantity: 2,
        unit: 'units',
        imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300'
      }
    ]
  },
  {
    id: 5,
    type: 'purchase',
    requestNumber: 'REQ-2025-005',
    requestedBy: 'James Thompson',
    requestedByEmail: 'james.thompson@company.com',
    department: 'Sales',
    project: 'Sales Team Equipment Upgrade',
    reason: 'Need for client presentations and training sessions',
    urgency: 'low',
    requestDate: '2025-01-19',
    requiredDate: '2025-02-10',
    status: 'rejected',
    reviewedBy: 'Sarah Johnson',
    reviewDate: '2025-01-22',
    reviewNotes: 'Budget constraints this quarter. Please resubmit next quarter.',
    purchasedBy: 'keeper',
    items: [
      {
        id: 9,
        articleCode: 'REMOTE-003',
        articleDescription: 'Wireless Presenter Remote',
        quantity: 3,
        unit: 'units',
        estimatedCost: 50.00,
        imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300'
      }
    ]
  },
  {
    id: 6,
    type: 'loan',
    requestNumber: 'REQ-2025-006',
    requestedBy: 'Sarah Kim',
    requestedByEmail: 'sarah.kim@company.com',
    department: 'Operations',
    project: 'Warehouse Inventory Audit',
    reason: 'Equipment needed for annual warehouse inventory audit',
    urgency: 'medium',
    requestDate: '2025-01-15',
    requiredDate: '2025-01-18',
    returnDate: '2025-01-20',
    status: 'completed',
    reviewedBy: 'Sarah Johnson',
    reviewDate: '2025-01-16',
    reviewNotes: 'Approved and completed',
    items: [
      {
        id: 10,
        articleCode: 'SCAN-007',
        articleDescription: 'Barcode Scanner Handheld',
        quantity: 5,
        unit: 'units',
        imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=300'
      },
      {
        id: 11,
        articleCode: 'TAB-009',
        articleDescription: 'Tablet Samsung Galaxy Tab',
        quantity: 3,
        unit: 'units',
        imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300'
      }
    ]
  },
  {
    id: 7,
    type: 'purchase-on-site',
    requestNumber: 'REQ-2025-007',
    requestedBy: 'Robert Chang',
    requestedByEmail: 'robert.chang@company.com',
    department: 'Engineering',
    reason: 'Urgent replacement for damaged equipment',
    urgency: 'urgent',
    requestDate: '2025-01-24',
    requiredDate: '2025-01-25',
    status: 'pending',
    purchasedBy: 'applicant',
    items: [
      {
        id: 12,
        articleCode: 'DRILL-012',
        articleDescription: 'Cordless Drill DeWalt 20V',
        quantity: 1,
        unit: 'units',
        estimatedCost: 180.00,
        imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300'
      },
      {
        id: 13,
        articleCode: 'BITS-025',
        articleDescription: 'Drill Bit Set Professional',
        quantity: 1,
        unit: 'sets',
        estimatedCost: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300'
      }
    ]
  }
];

export function RequestManagement() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<Set<number>>(new Set());
  const [rejectNotes, setRejectNotes] = useState('');

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

  const renderRequestsTable = (filteredRequests: Request[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Request #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.map((request) => {
            const totalCost = calculateTotalCost(request);
            return (
            <React.Fragment key={request.id}>
              <TableRow className="hover:bg-muted/50">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleExpand(request.id)}
                  >
                    {expandedRequests.has(request.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-mono">
                  <div>
                    <p>{request.requestNumber}</p>
                    {(request.type === 'purchase' || request.type === 'purchase-on-site') && totalCost > 0 && (
                      <p className="text-xs text-green-600 font-mono">
                        ${totalCost.toFixed(2)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    {getStatusBadge(request.status)}
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(request.type)}</TableCell>
                <TableCell>
                  <div>
                    <p>{request.requestedBy}</p>
                    <p className="text-xs text-muted-foreground">{request.requestedByEmail}</p>
                  </div>
                </TableCell>
                <TableCell>{request.department}</TableCell>
                <TableCell>
                  {request.project ? (
                    <p className="text-sm">{request.project}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">-</p>
                  )}
                </TableCell>
                <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{request.requestDate}</p>
                    {request.requiredDate && (
                      <p className="text-xs text-muted-foreground">
                        Need by: {request.requiredDate}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {request.status === 'pending' ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setApproveDialogOpen(true);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setRejectDialogOpen(true);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      {request.reviewedBy && (
                        <p>By: {request.reviewedBy}</p>
                      )}
                      {request.reviewDate && (
                        <p>{request.reviewDate}</p>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>

              {/* Expanded Item Details Section */}
              {expandedRequests.has(request.id) && (
                <TableRow>
                  <TableCell colSpan={10} className="bg-muted/30 p-0">
                    <div className="p-4">
                      <h4 className="flex items-center mb-3">
                        <Package className="h-4 w-4 mr-2" />
                        Request Details ({request.items.length} item{request.items.length > 1 ? 's' : ''})
                      </h4>
                      <div className="rounded-md border bg-card p-4 space-y-4">
                        {/* Return Date (for loan types) */}
                        {request.returnDate && (
                          <div className="pb-4 border-b">
                            <Label>Return Date</Label>
                            <p className="text-sm">{request.returnDate}</p>
                          </div>
                        )}

                        {/* Purchase Info (for purchase types) */}
                        {(request.type === 'purchase' || request.type === 'purchase-on-site') && request.purchasedBy && (
                          <div className="pb-4 border-b">
                            <Label>Purchased By</Label>
                            <p className="text-sm capitalize">{request.purchasedBy}</p>
                          </div>
                        )}

                        {/* Reason */}
                        <div className="pb-4 border-b">
                          <Label>Reason</Label>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                        </div>

                        {/* Items */}
                        <div>
                          <Label className="mb-3 block">Items</Label>
                          <div className="space-y-3">
                            {request.items.map((item) => (
                              <div key={item.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                                <ImageWithFallback
                                  src={item.imageUrl || ''}
                                  alt={item.articleDescription}
                                  className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-mono text-sm">{item.articleCode}</p>
                                  <p>{item.articleDescription}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant="outline">
                                      {item.quantity} {item.unit}
                                    </Badge>
                                    {item.estimatedCost && (
                                      <Badge variant="outline" className="text-green-600 border-green-600">
                                        ${item.estimatedCost.toFixed(2)} each
                                      </Badge>
                                    )}
                                    {item.estimatedCost && (
                                      <Badge variant="default">
                                        Total: ${(item.estimatedCost * item.quantity).toFixed(2)}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Review Notes */}
                        {request.reviewNotes && (
                          <div className="pt-4 border-t">
                            <Label>Review Notes</Label>
                            <p className="text-sm text-muted-foreground">{request.reviewNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Request Approval</h1>
          <p className="text-muted-foreground">
            Review and approve inventory requests from team members
          </p>
        </div>
        
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Need review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex items-center space-x-2 flex-1">
            <FileText className="h-4 w-4" />
            <span>Overview ({requests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center space-x-2 flex-1">
            <Clock className="h-4 w-4" />
            <span>Pending ({pendingCount})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2 flex-1">
            <Check className="h-4 w-4" />
            <span>Approved ({approvedCount})</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center space-x-2 flex-1">
            <CheckCircle className="h-4 w-4" />
            <span>Inactive ({completedCount + rejectedCount})</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by request #, requester, department, or item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="purchase-on-site">Purchase On Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardCheck className="h-5 w-5" />
                <span>All Requests ({getFilteredRequests().filter(r => r.status !== 'completed').length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRequestsTable(getFilteredRequests().filter(r => r.status !== 'completed' && r.status !== 'rejected'))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by request #, requester, department, or item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="purchase-on-site">Purchase On Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Pending Requests ({getFilteredRequests('pending').length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRequestsTable(getFilteredRequests('pending'))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by request #, requester, department, or item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="purchase-on-site">Purchase On Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Check className="h-5 w-5" />
                <span>Approved Requests ({getFilteredRequests('approved').length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRequestsTable(getFilteredRequests('approved'))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inactive Tab */}
        <TabsContent value="inactive" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by request #, requester, department, or item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="purchase-on-site">Purchase On Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Inactive Requests ({getFilteredRequests('completed').length + getFilteredRequests('rejected').length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRequestsTable([...getFilteredRequests('completed'), ...getFilteredRequests('rejected')])}
            </CardContent>
          </Card>
        </TabsContent>
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
