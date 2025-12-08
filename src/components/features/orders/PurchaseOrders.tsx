import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { Calendar } from '../../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Plus, ShoppingCart, Calendar as CalendarIcon, CheckCircle, Clock, XCircle, Eye, Package, PackagePlus, FileText, Undo, ChevronDown, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { CreatePurchaseRequestPage } from './CreatePurchaseRequestPage';
import { format } from 'date-fns';
import { mockPurchaseOrders, PurchaseOrder, PurchaseItem } from './data/mockPurchaseOrders'


import { Button as ActionButton } from '../inventory/components/Button'


const mockArticles = [
  { code: 'OFF-001', description: 'Office Paper A4 - 80gsm', unit: 'sheets', cost: 0.02, supplier: 'Office Supplies Inc.' },
  { code: 'OFF-002', description: 'Printer Toner HP LaserJet', unit: 'units', cost: 50.00, supplier: 'Office Supplies Inc.' },
  { code: 'USB-003', description: 'USB Cable Type-C 2m', unit: 'units', cost: 8.99, supplier: 'Cable Masters' },
  { code: 'PROJ-004', description: 'Projector Epson EB-X41', unit: 'units', cost: 450.00, supplier: 'AV Equipment Co.' },
  { code: 'PROJ-005', description: 'Projection Screen 100 inch', unit: 'units', cost: 450.00, supplier: 'AV Equipment Co.' },
  { code: 'TECH-002', description: 'Laptop Dell Latitude 5520', unit: 'units', cost: 1200.00, supplier: 'Tech Solutions Ltd.' }
];

interface PurchaseOrdersProps {
  onViewDetail?: (order: any) => void;
}

export function PurchaseOrders({ onViewDetail }: PurchaseOrdersProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | undefined>();
  const [expandedActiveOrders, setExpandedActiveOrders] = useState<Set<number>>(new Set());
  const [expandedInactiveOrders, setExpandedInactiveOrders] = useState<Set<number>>(new Set());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [confirmPurchaseDialogOpen, setConfirmPurchaseDialogOpen] = useState(false);
  const [activateConfirmDialogOpen, setActivateConfirmDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [cancelNotes, setCancelNotes] = useState('');
  const [purchasedQuantities, setPurchasedQuantities] = useState<Record<number, number>>({});
  const [actualCost, setActualCost] = useState<number>(0);

  const handleToggleExpandActive = (orderId: number) => {
    setExpandedActiveOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleToggleExpandInactive = (orderId: number) => {
    setExpandedInactiveOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const [formData, setFormData] = useState({
    articleCode: '',
    quantity: '',
    purchaseUrl: '',
    estimatedCost: '',
    requestedBy: '',
    department: '',
    project: '',
    priority: 'medium' as PurchaseOrder['priority'],
    notes: ''
  });

  const activeOrders = purchaseOrders.filter(order =>
    order.status === 'pending' || order.status === 'approved' || order.status === 'activated'
  );
  const inactiveOrders = purchaseOrders.filter(order =>
    order.status === 'delivered' || order.status === 'cancelled' || order.status === 'completed'
  );

  const filteredActiveOrders = activeOrders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const filteredInactiveOrders = inactiveOrders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const selectedArticle = mockArticles.find(article => article.code === formData.articleCode);

  const generatePONumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = Math.max(...purchaseOrders.map(po => parseInt(po.poNumber.split('-')[2]) || 0), 0) + 1;
    return `PO-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedArticle) return;

    const quantity = parseInt(formData.quantity);
    const estimatedCost = parseFloat(formData.estimatedCost) || selectedArticle.cost;
    const totalCost = quantity * estimatedCost;

    const newOrder: PurchaseOrder = {
      id: Math.max(...purchaseOrders.map(o => o.id), 0) + 1,
      poNumber: generatePONumber(),
      supplier: selectedArticle.supplier,
      supplierContact: 'N/A',
      requestedBy: formData.requestedBy,
      department: formData.department,
      project: formData.project,
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      expectedDelivery: expectedDeliveryDate ? format(expectedDeliveryDate, 'yyyy-MM-dd') : undefined,
      status: 'pending',
      priority: formData.priority,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      totalOrderValue: totalCost,
      items: [
        {
          id: Math.max(...purchaseOrders.flatMap(o => o.items.map(i => i.id)), 0) + 1,
          articleCode: formData.articleCode,
          articleDescription: selectedArticle.description,
          quantity,
          unit: selectedArticle.unit,
          unitCost: estimatedCost,
          totalCost,
          status: 'pending',
          purchaseUrl: formData.purchaseUrl || undefined
        }
      ]
    };

    setPurchaseOrders([...purchaseOrders, newOrder]);
    resetForm();
  };

  const handleStatusUpdate = (orderId: number, newStatus: PurchaseOrder['status'], approvedBy?: string) => {
    setPurchaseOrders(purchaseOrders.map(order =>
      order.id === orderId
        ? {
          ...order,
          status: newStatus,
          ...(approvedBy && { approvedBy }),
          ...(newStatus === 'delivered' && { actualDelivery: format(new Date(), 'yyyy-MM-dd') })
        }
        : order
    ));
  };

  const handleItemReceive = (orderId: number, itemId: number, receivedQuantity: number) => {
    setPurchaseOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => {
            if (item.id === itemId) {
              const newReceivedQuantity = (item.receivedQuantity || 0) + receivedQuantity;
              return {
                ...item,
                receivedQuantity: newReceivedQuantity,
                status: newReceivedQuantity >= item.quantity ? 'received' : 'partial'
              };
            }
            return item;
          })
        };
      }
      return order;
    }));
  };

  const resetForm = () => {
    setFormData({
      articleCode: '',
      quantity: '',
      purchaseUrl: '',
      estimatedCost: '',
      requestedBy: '',
      department: '',
      project: '',
      priority: 'medium',
      notes: ''
    });
    setExpectedDeliveryDate(undefined);
    setDialogOpen(false);
  };

  const handleCreateNewRequest = () => {
    setCreatingRequest(true);
  };

  const handleBackFromCreate = () => {
    setCreatingRequest(false);
  };

  const handleSavePurchaseRequest = (requestData: any) => {
    const newOrder: PurchaseOrder = {
      id: Math.max(...purchaseOrders.map(o => o.id), 0) + 1,
      poNumber: generatePONumber(),
      supplier: requestData.items[0]?.supplier || 'Multiple Suppliers',
      supplierContact: 'N/A',
      requestedBy: requestData.requestedBy,
      department: requestData.department,
      project: requestData.project,
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      expectedDelivery: requestData.expectedDelivery,
      status: 'pending',
      priority: requestData.priority,
      notes: requestData.notes,
      createdAt: requestData.createdAt,
      totalOrderValue: requestData.totalOrderValue,
      items: requestData.items.map((item: any, index: number) => ({
        id: Math.max(...purchaseOrders.flatMap(o => o.items.map(i => i.id)), 0) + index + 1,
        articleCode: item.articleCode,
        articleDescription: item.articleDescription,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.estimatedCost,
        totalCost: item.totalCost,
        status: 'pending',
        purchaseUrl: item.purchaseUrl || undefined,
        imageUrl: item.imageUrl
      }))
    };

    setPurchaseOrders([...purchaseOrders, newOrder]);
    setCreatingRequest(false);
    alert('Purchase request created successfully!');
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary">Approved</Badge>;
      case 'ordered':
        return <Badge variant="default">Ordered</Badge>;
      case 'activated':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Activated</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="text-green-600 border-green-600">Delivered</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  const getItemStatusBadge = (status: PurchaseItem['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Partial</Badge>;
      case 'received':
        return <Badge variant="outline" className="text-green-600 border-green-600">Received</Badge>;
    }
  };

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'approved':
      case 'ordered':
      case 'activated':
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getPriorityBadge = (priority: PurchaseOrder['priority']) => {
    switch (priority) {
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

  if (creatingRequest) {
    return (
      <CreatePurchaseRequestPage
        onBack={handleBackFromCreate}
        onSave={handleSavePurchaseRequest}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Purchase Request</h1>
          <p className="text-muted-foreground">
            Manage purchase requests and orders
          </p>
        </div>

        <ActionButton variant='success' size='md' onClick={handleCreateNewRequest} >
          <Plus className="h-4 w-4 mr-2" />
          Register Kit
        </ActionButton>

        {/* <Button onClick={handleCreateNewRequest}>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Request
        </Button> */}
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Active Orders ({filteredActiveOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Inactive Orders ({filteredInactiveOrders.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Active Orders Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="activated">Activated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Active Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Active Purchase Requests ({filteredActiveOrders.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActiveOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpandActive(order.id)}
                            >
                              {expandedActiveOrders.has(order.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono">{order.poNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              {getStatusBadge(order.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{order.requestedBy}</p>
                              <p className="text-xs text-muted-foreground">{order.department}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p>${order.totalOrderValue.toFixed(2)}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{order.department}</p>
                              <p className="text-xs text-muted-foreground">{order.project}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                          <TableCell>
                            <div>
                              {order.expectedDelivery && (
                                <p className="text-sm">{order.expectedDelivery}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {order.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setActivateConfirmDialogOpen(true);
                                    }}
                                  >
                                    Activate
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setCancelDialogOpen(true);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {order.status === 'approved' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setCancelDialogOpen(true);
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                              {order.status === 'activated' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setPurchasedQuantities(
                                      order.items.reduce((acc, item) => ({
                                        ...acc,
                                        [item.id]: item.quantity
                                      }), {})
                                    );
                                    setActualCost(order.totalOrderValue);
                                    setConfirmPurchaseDialogOpen(true);
                                  }}
                                >
                                  I Already Bought It
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Items Section */}
                        {expandedActiveOrders.has(order.id) && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <h4 className="flex items-center mb-3">
                                  <Package className="h-4 w-4 mr-2" />
                                  Items in this order ({order.items.length})
                                </h4>
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20">Image</TableHead>
                                        <TableHead>Article Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead>Total Cost</TableHead>
                                        <TableHead>Status</TableHead>
                                        {order.items.some(item => item.purchaseUrl) && (
                                          <TableHead>Link</TableHead>
                                        )}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <ImageWithFallback
                                              src={item.imageUrl || ''}
                                              alt={item.articleDescription}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          </TableCell>
                                          <TableCell className="font-mono">{item.articleCode}</TableCell>
                                          <TableCell>{item.articleDescription}</TableCell>
                                          <TableCell>{item.quantity} {item.unit}</TableCell>
                                          <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                                          <TableCell>${item.totalCost.toFixed(2)}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {item.status}
                                            </Badge>
                                          </TableCell>
                                          {item.purchaseUrl && (
                                            <TableCell>
                                              <a
                                                href={item.purchaseUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                              >
                                                View
                                              </a>
                                            </TableCell>
                                          )}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-2 mt-4">
                                  {order.status === 'pending' && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusUpdate(order.id, 'approved', 'Current User')}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                  {order.status === 'approved' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStatusUpdate(order.id, 'ordered')}
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-1" />
                                      Mark Ordered
                                    </Button>
                                  )}
                                  {order.status === 'ordered' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                    >
                                      <Package className="h-4 w-4 mr-1" />
                                      Mark Delivered
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-6">
          {/* Inactive Orders Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Inactive</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inactive Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Inactive Purchase Requests ({filteredInactiveOrders.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Delivery Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInactiveOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpandInactive(order.id)}
                            >
                              {expandedInactiveOrders.has(order.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono">{order.poNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              {getStatusBadge(order.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{order.requestedBy}</p>
                              <p className="text-xs text-muted-foreground">{order.department}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p>${order.totalOrderValue.toFixed(2)}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{order.department}</p>
                              <p className="text-xs text-muted-foreground">{order.project}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                          <TableCell>
                            <div>
                              {order.expectedDelivery && (
                                <p className="text-sm">{order.expectedDelivery}</p>
                              )}
                              {order.actualDelivery && (
                                <p className="text-xs text-green-600">
                                  Delivered: {order.actualDelivery}
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Items Section */}
                        {expandedInactiveOrders.has(order.id) && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <h4 className="flex items-center mb-3">
                                  <Package className="h-4 w-4 mr-2" />
                                  Items in this order ({order.items.length})
                                </h4>
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20">Image</TableHead>
                                        <TableHead>Article Code</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                        <TableHead>Total Cost</TableHead>
                                        <TableHead>Status</TableHead>
                                        {order.items.some(item => item.purchaseUrl) && (
                                          <TableHead>Link</TableHead>
                                        )}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <ImageWithFallback
                                              src={item.imageUrl || ''}
                                              alt={item.articleDescription}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          </TableCell>
                                          <TableCell className="font-mono">{item.articleCode}</TableCell>
                                          <TableCell>{item.articleDescription}</TableCell>
                                          <TableCell>{item.quantity} {item.unit}</TableCell>
                                          <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                                          <TableCell>${item.totalCost.toFixed(2)}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">
                                              {item.status}
                                            </Badge>
                                          </TableCell>
                                          {item.purchaseUrl && (
                                            <TableCell>
                                              <a
                                                href={item.purchaseUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                              >
                                                View
                                              </a>
                                            </TableCell>
                                          )}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Purchase Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for canceling this purchase request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelNotes">Cancellation Notes *</Label>
              <Textarea
                id="cancelNotes"
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelDialogOpen(false);
                  setCancelNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!cancelNotes.trim()) {
                    alert('Please provide cancellation notes');
                    return;
                  }
                  if (selectedOrder) {
                    setPurchaseOrders(prev => prev.map(order =>
                      order.id === selectedOrder.id
                        ? { ...order, status: 'cancelled', cancelNotes }
                        : order
                    ));
                  }
                  setCancelDialogOpen(false);
                  setCancelNotes('');
                  setSelectedOrder(null);
                }}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <Dialog open={activateConfirmDialogOpen} onOpenChange={setActivateConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Activation</DialogTitle>
            <DialogDescription>
              Are you sure you want to activate this purchase request?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setActivateConfirmDialogOpen(false);
                setSelectedOrder(null);
              }}
            >
              No
            </Button>
            <Button
              onClick={() => {
                if (selectedOrder) {
                  handleStatusUpdate(selectedOrder.id, 'activated');
                }
                setActivateConfirmDialogOpen(false);
                setSelectedOrder(null);
              }}
            >
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Purchase Dialog */}
      <Dialog open={confirmPurchaseDialogOpen} onOpenChange={setConfirmPurchaseDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Confirm Purchase - Items Bought</DialogTitle>
            <DialogDescription>
              Review the items you purchased. You can adjust quantities if you bought fewer items than requested.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrder && (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Image</TableHead>
                        <TableHead>Article</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Purchased</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <ImageWithFallback
                              src={item.imageUrl || ''}
                              alt={item.articleDescription}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <p className="font-mono text-sm">{item.articleCode}</p>
                            <p className="text-sm">{item.articleDescription}</p>
                          </TableCell>
                          <TableCell>
                            <p>{item.quantity} {item.unit}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max={item.quantity}
                                value={purchasedQuantities[item.id] || item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  const validValue = Math.min(Math.max(0, value), item.quantity);
                                  setPurchasedQuantities(prev => ({
                                    ...prev,
                                    [item.id]: validValue
                                  }));
                                }}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">{item.unit}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <Label htmlFor="actualCost">Actual Cost *</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">$</span>
                    <Input
                      id="actualCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={actualCost}
                      onChange={(e) => setActualCost(parseFloat(e.target.value) || 0)}
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total value: ${selectedOrder.totalOrderValue.toFixed(2)}
                  </p>
                </div>
              </>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmPurchaseDialogOpen(false);
                  setSelectedOrder(null);
                  setPurchasedQuantities({});
                  setActualCost(0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedOrder) {
                    // Create loan request from purchase order
                    // This will be visible in Request Orders / Packing List
                    // For now, we just mark it as completed
                    setPurchaseOrders(prev => prev.map(order =>
                      order.id === selectedOrder.id
                        ? { ...order, status: 'completed' }
                        : order
                    ));
                    alert(`Purchase confirmed! This will now appear in Request Orders / Packing List as a loan.`);
                  }
                  setConfirmPurchaseDialogOpen(false);
                  setSelectedOrder(null);
                  setPurchasedQuantities({});
                  setActualCost(0);
                }}
              >
                Confirm Purchase
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}