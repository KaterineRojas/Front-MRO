import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, Package, User, Calendar, MapPin, Undo, CheckCircle } from 'lucide-react';

interface LoanRequest {
  id: string;
  requestNumber: string;
  borrower: string;
  borrowerEmail: string;
  department: string;
  project: string;
  requestDate: string;
  expectedReturnDate: string;
  purpose: string;
  status: 'pending' | 'approved' | 'active' | 'returned' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  approvedBy?: string;
  approvedDate?: string;
  items: Array<{
    id: string;
    articleCode: string;
    description: string;
    quantity: number;
    unit: string;
    status: 'pending' | 'approved' | 'active' | 'returned' | 'partial';
    returnedQuantity?: number;
    returnedDate?: string;
  }>;
}

interface LoanDetailViewProps {
  request: LoanRequest;
  onBack: () => void;
}

export function LoanDetailView({ request, onBack }: LoanDetailViewProps) {
  const [items, setItems] = useState(request.items);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline', label: 'Pending' },
      approved: { variant: 'secondary', label: 'Approved' },
      active: { variant: 'default', label: 'Active' },
      returned: { variant: 'default', label: 'Returned' },
      partial: { variant: 'secondary', label: 'Partial Return' },
      overdue: { variant: 'destructive', label: 'Overdue' },
      cancelled: { variant: 'outline', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'outline', label: 'Low' },
      medium: { variant: 'secondary', label: 'Medium' },
      high: { variant: 'default', label: 'High' },
      urgent: { variant: 'destructive', label: 'Urgent' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background pb-4 flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Loan Orders
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Loan Request Details</h1>
          <p className="text-muted-foreground">Request #{request.requestNumber}</p>
        </div>
      </div>

      {/* Request Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Request Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(request.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <div className="mt-1">{getPriorityBadge(request.priority)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Request Date</label>
              <p className="mt-1">{request.requestDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Borrower</label>
              <p className="mt-1">{request.borrower}</p>
              <p className="text-sm text-muted-foreground">{request.borrowerEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="mt-1">{request.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project</label>
              <p className="mt-1">{request.project}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expected Return</label>
              <p className="mt-1">{request.expectedReturnDate}</p>
            </div>
            {request.approvedBy && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                <p className="mt-1">{request.approvedBy}</p>
                <p className="text-sm text-muted-foreground">{request.approvedDate}</p>
              </div>
            )}
            <div className="col-span-full">
              <label className="text-sm font-medium text-muted-foreground">Purpose</label>
              <p className="mt-1">{request.purpose}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Requested Items ({items.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Requested Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Returned Qty</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.articleCode}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {item.returnedQuantity || 0} {item.unit}
                    {item.returnedQuantity && item.returnedQuantity > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Remaining: {item.quantity - item.returnedQuantity}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.returnedDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.returnedDate}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.status === 'returned' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Completed</span>
                      </div>
                    )}
                    {(item.status === 'pending' || item.status === 'active' || item.status === 'partial') && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Package className="h-4 w-4" />
                        <span className="text-sm">Active</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}