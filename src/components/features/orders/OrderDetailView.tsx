import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { ArrowLeft, Package, ShoppingCart, Calendar, MapPin, PackagePlus, CheckCircle, ExternalLink } from 'lucide-react';

interface PurchaseOrder {
  id: number | string;
  poNumber: string;
  supplier: string;
  supplierContact: string;
  department: string;
  project: string;
  orderDate: string;
  requestedBy?: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  status: 'pending' | 'approved' | 'ordered' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  approvedBy?: string;
  totalOrderValue: number;
  notes?: string;
  items: Array<{
    id: number | string;
    articleCode: string;
    articleDescription?: string;
    description?: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    status: 'pending' | 'partial' | 'received';
    receivedQuantity?: number;
    receivedDate?: string;
    purchaseUrl?: string;
  }>;
}

interface OrderDetailViewProps {
  order: PurchaseOrder;
  onBack: () => void;
}

export function OrderDetailView({ order, onBack }: OrderDetailViewProps) {
  const [items, setItems] = useState(order.items);

  const handleItemReceive = (itemId: number | string, receiveQuantity: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newReceivedQuantity = (item.receivedQuantity || 0) + receiveQuantity;
        const newStatus = newReceivedQuantity >= item.quantity ? 'received' : 'partial';
        return {
          ...item,
          receivedQuantity: newReceivedQuantity,
          status: newStatus,
          receivedDate: newStatus === 'received' ? new Date().toISOString().split('T')[0] : item.receivedDate
        };
      }
      return item;
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline', label: 'Pending' },
      approved: { variant: 'secondary', label: 'Approved' },
      ordered: { variant: 'default', label: 'Ordered' },
      delivered: { variant: 'default', label: 'Delivered' },
      received: { variant: 'default', label: 'Received' },
      partial: { variant: 'secondary', label: 'Partial Delivery' },
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
          Back to Purchase Orders
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Purchase Order Details</h1>
          <p className="text-muted-foreground">PO #{order.poNumber}</p>
        </div>
      </div>

      {/* Order Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Order Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(order.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <div className="mt-1">{getPriorityBadge(order.priority)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Order Date</label>
              <p className="mt-1">{order.orderDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Supplier</label>
              <p className="mt-1">{order.supplier}</p>
              <p className="text-sm text-muted-foreground">{order.supplierContact}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="mt-1">{order.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Project</label>
              <p className="mt-1">{order.project}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
              <p className="mt-1">{order.expectedDelivery || 'Not specified'}</p>
            </div>
            {order.actualDelivery && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Actual Delivery</label>
                <p className="mt-1 text-green-600">{order.actualDelivery}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Value</label>
              <p className="mt-1 text-lg font-semibold">${order.totalOrderValue.toFixed(2)}</p>
            </div>
            {order.approvedBy && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                <p className="mt-1">{order.approvedBy}</p>
              </div>
            )}
            {order.requestedBy && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                <p className="mt-1">{order.requestedBy}</p>
              </div>
            )}
            {order.notes && (
              <div className="col-span-full">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="mt-1">{order.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order Items ({items.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Ordered Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received Qty</TableHead>
                <TableHead>Purchase URL</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.articleCode}</TableCell>
                  <TableCell>{item.articleDescription || item.description}</TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>${item.unitCost?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>${item.totalCost?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {item.receivedQuantity || 0} {item.unit}
                    {item.receivedQuantity && item.receivedQuantity > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Remaining: {item.quantity - item.receivedQuantity}
                      </div>
                    )}
                    {item.receivedDate && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{item.receivedDate}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.purchaseUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(item.purchaseUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {(item.status === 'pending' || item.status === 'partial') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const remainingQuantity = item.quantity - (item.receivedQuantity || 0);
                          if (remainingQuantity > 0) {
                            const receiveQuantity = prompt(`How many ${item.unit} received? (Remaining: ${remainingQuantity})`);
                            if (receiveQuantity && parseInt(receiveQuantity) > 0 && parseInt(receiveQuantity) <= remainingQuantity) {
                              handleItemReceive(item.id, parseInt(receiveQuantity));
                            }
                          }
                        }}
                      >
                        <PackagePlus className="h-4 w-4 mr-1" />
                        Add to Stock
                      </Button>
                    )}
                    {item.status === 'received' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Completed</span>
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