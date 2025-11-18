import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Badge } from '../../../../ui/badge';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../ui/table';
import { Package, Plus, ChevronDown, ChevronRight, Trash2, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from '../../../../figma/ImageWithFallback';
import { PurchaseForm } from '../../forms/PurchaseForm';
import { toast } from 'sonner';
import { useAppSelector } from '../../../../../store';
import { selectCurrentUser } from '../../../../../store';
import { getPurchaseRequests, getWarehouses, type PurchaseRequest, type Warehouse } from '../../../enginner/services';


export function PurchaseRequests() {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);

  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [filteredPurchaseRequests, setFilteredPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [purchaseSearchTerm, setPurchaseSearchTerm] = useState('');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [expandedPurchaseRows, setExpandedPurchaseRows] = useState<Set<string>>(new Set());
  const [confirmPurchaseOpen, setConfirmPurchaseOpen] = useState(false);
  const [purchaseToConfirm, setPurchaseToConfirm] = useState<PurchaseRequest | null>(null);
  const [purchaseEditedQuantities, setPurchaseEditedQuantities] = useState<{ [key: string]: number }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const [requestsData, whData] = await Promise.all([
        getPurchaseRequests(),
        getWarehouses()
      ]);
      setPurchaseRequests(requestsData);
      setWarehouses(whData);
    };
    loadData();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter purchase requests
  useEffect(() => {
    let filtered = purchaseRequests;

    if (purchaseSearchTerm) {
      filtered = filtered.filter(request => {
        const searchLower = purchaseSearchTerm.toLowerCase();
        return (
          request.requestId.toLowerCase().includes(searchLower) ||
          request.project.toLowerCase().includes(searchLower) ||
          request.department.toLowerCase().includes(searchLower) ||
          request.warehouseName.toLowerCase().includes(searchLower) ||
          request.items.some(item => 
            item.name.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    if (purchaseStatusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === purchaseStatusFilter);
    }

    if (warehouseFilter !== 'all') {
      filtered = filtered.filter(request => request.warehouseId === warehouseFilter);
    }

    setFilteredPurchaseRequests(filtered);
  }, [purchaseRequests, purchaseSearchTerm, purchaseStatusFilter, warehouseFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleCancelPurchaseRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      setPurchaseRequests(prev => prev.filter(req => req.requestId !== requestId));
      toast.success('Request cancelled successfully');
    }
  };

  const canCancelPurchaseRequest = (request: PurchaseRequest) => {
    return request.status === 'pending';
  };

  const handleAlreadyBought = (request: PurchaseRequest) => {
    setPurchaseToConfirm(request);
    const initialQuantities: { [key: string]: number } = {};
    request.items.forEach((item, index) => {
      initialQuantities[index.toString()] = item.quantity;
    });
    setPurchaseEditedQuantities(initialQuantities);
    setConfirmPurchaseOpen(true);
  };

  const updatePurchaseQuantity = (index: string, newQuantity: number, maxQuantity: number) => {
    if (newQuantity > maxQuantity) return;
    if (newQuantity < 1) return;
    
    setPurchaseEditedQuantities(prev => ({
      ...prev,
      [index]: newQuantity
    }));
  };

  const confirmAlreadyBought = () => {
    if (!purchaseToConfirm) return;
    
    setPurchaseRequests(prev => prev.filter(req => req.requestId !== purchaseToConfirm.requestId));
    
    setConfirmPurchaseOpen(false);
    setPurchaseToConfirm(null);
    toast.success('Purchase confirmed! Item now appears in Borrow module as pending return');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPurchaseStatusCount = (status: string) => {
    if (status === 'all') return purchaseRequests.length;
    return purchaseRequests.filter(req => req.status === status).length;
  };

  const togglePurchaseRow = (requestId: string) => {
    setExpandedPurchaseRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  if (showPurchaseForm) {
    if (!currentUser) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">User information not available</p>
              <Button variant="outline" onClick={() => setShowPurchaseForm(false)} className="mt-4">
                ← Back to Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button variant="outline" onClick={() => setShowPurchaseForm(false)}>
            ← Back to Requests
          </Button>
          <Card className="flex-1 md:ml-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Engineer</p>
                  <p className="font-medium">{currentUser.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{currentUser.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Request Type</p>
                  <p className="font-medium">Purchase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <PurchaseForm
          currentUser={currentUser}
          onBack={() => setShowPurchaseForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Purchase Requests</h1>
          <p className="text-muted-foreground">
            Manage your equipment purchase requests
          </p>
        </div>
        <Button onClick={() => setShowPurchaseForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Purchase
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Search by ID, project, warehouse, items..."
              value={purchaseSearchTerm}
              onChange={(e) => setPurchaseSearchTerm(e.target.value)}
            />
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={purchaseStatusFilter} onValueChange={setPurchaseStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({getPurchaseStatusCount('all')})</SelectItem>
                <SelectItem value="pending">Pending ({getPurchaseStatusCount('pending')})</SelectItem>
                <SelectItem value="approved">Approved ({getPurchaseStatusCount('approved')})</SelectItem>
                <SelectItem value="rejected">Rejected ({getPurchaseStatusCount('rejected')})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Request List - Mobile Card View or Desktop Table */}
      {filteredPurchaseRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3>No purchase requests found</h3>
            <p className="text-sm text-muted-foreground">
              {purchaseSearchTerm || purchaseStatusFilter !== 'all' || warehouseFilter !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'When you make purchase requests, they will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile Card View
        <div className="space-y-4">
          {filteredPurchaseRequests.map((request) => (
            <Card key={request.requestId}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => togglePurchaseRow(request.requestId)}
                  >
                    <div className="flex-1">
                      <h3 className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Purchase #{request.requestId}
                        {expandedPurchaseRows.has(request.requestId) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline">{request.warehouseName}</Badge>
                        {request.priority && (
                          <Badge className={getPriorityColor(request.priority)} variant="secondary">
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                          </Badge>
                        )}
                        <Badge className={getStatusColor(request.status)} variant="secondary">
                          {getStatusText(request.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {request.status === 'approved' && request.selfPurchase && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAlreadyBought(request)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {canCancelPurchaseRequest(request) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelPurchaseRequest(request.requestId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Requested: {formatDate(request.createdAt || '')}</p>
                    <p>Project: {request.project}</p>
                    {request.totalCost && <p>Cost: ${request.totalCost}</p>}
                  </div>

                  {expandedPurchaseRows.has(request.requestId) && (
                    <div>
                      <h4 className="text-sm mb-2">Items:</h4>
                      <div className="space-y-2">
                        {request.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            {item.imageUrl && (
                              <ImageWithFallback
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                              )}
                            </div>
                            <Badge variant="secondary">x{item.quantity}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop Table View
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Priority / Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseRequests.map((request) => (
                    <React.Fragment key={request.requestId}>
                      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => togglePurchaseRow(request.requestId)}>
                        <TableCell>
                          {expandedPurchaseRows.has(request.requestId) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">#{request.requestId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.warehouseName}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{request.project}</p>
                          <p className="text-xs text-muted-foreground">{request.department}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {request.totalCost ? `$${request.totalCost}` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {request.priority && (
                              <Badge className={getPriorityColor(request.priority)} variant="secondary">
                                {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                              </Badge>
                            )}
                            <Badge className={getStatusColor(request.status)} variant="secondary">
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {request.status === 'approved' && request.selfPurchase && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e:any) => {
                                  e.stopPropagation();
                                  handleAlreadyBought(request);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Bought
                              </Button>
                            )}
                            {canCancelPurchaseRequest(request) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e:any) => {
                                  e.stopPropagation();
                                  handleCancelPurchaseRequest(request.requestId);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedPurchaseRows.has(request.requestId) && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/20 p-0">
                            <div className="p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead className="hidden md:table-cell">SKU</TableHead>
                                    <TableHead>Name & Description</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {request.items.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {item.imageUrl ? (
                                          <ImageWithFallback
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell className="font-mono text-sm hidden md:table-cell">{item.sku || '-'}</TableCell>
                                      <TableCell>
                                        <p className="text-sm">{item.name}</p>
                                        {item.description && (
                                          <p className="text-xs text-muted-foreground">{item.description}</p>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right text-sm">
                                        {item.estimatedCost ? `$${item.estimatedCost}` : '-'}
                                      </TableCell>
                                      <TableCell className="text-right text-sm">x{item.quantity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
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
      )}

      {/* Confirm Purchase Dialog */}
      <Dialog open={confirmPurchaseOpen} onOpenChange={setConfirmPurchaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Confirm quantities purchased and mark as ready for return
            </DialogDescription>
          </DialogHeader>
          {purchaseToConfirm && (
            <div className="space-y-4">
              {purchaseToConfirm.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded">
                  {item.imageUrl && (
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Qty:</Label>
                    <Input
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={purchaseEditedQuantities[index.toString()] || item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1;
                        updatePurchaseQuantity(index.toString(), newQuantity, item.quantity);
                      }}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmPurchaseOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmAlreadyBought}>
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}