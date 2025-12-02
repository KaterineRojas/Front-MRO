import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Package, Plus, ChevronDown, ChevronRight, Trash2, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { PurchaseForm } from './PurchaseForm';
//import { toast } from 'sonner';
import { useAppSelector } from '../../../../store';
import { selectCurrentUser } from '../../../../store';
import { getWarehouses, type Warehouse } from '../../enginner/services';
import { usePurchaseRequests } from './usePurchaseRequests';
import { formatDate, getStatusColor, getStatusText, getPriorityColor, getPriorityText } from './purchaseUtils';
import type { PurchaseRequest } from './purchaseService';

export function PurchaseRequests() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Dialog states
  const [confirmPurchaseOpen, setConfirmPurchaseOpen] = useState(false);
  const [purchaseToConfirm, setPurchaseToConfirm] = useState<PurchaseRequest | null>(null);
  const [purchaseEditedQuantities, setPurchaseEditedQuantities] = useState<{ [key: string]: number }>({});

  // Use purchase requests hook
  const {
    filteredPurchaseRequests,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    warehouseFilter,
    setWarehouseFilter,
    expandedRows,
    toggleRow,
    handleCancel,
    handleConfirmBought,
    canCancelRequest,
    canConfirmBought,
    getStatusCount
  } = usePurchaseRequests();

  // Load warehouses
  useEffect(() => {
    const loadWarehouses = async () => {
      const data = await getWarehouses();
      setWarehouses(data);
    };
    loadWarehouses();
  }, []);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCancelPurchaseRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      handleCancel(requestId);
    }
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

  const confirmAlreadyBought = async () => {
    if (!purchaseToConfirm) return;
    
    await handleConfirmBought(purchaseToConfirm.requestId, purchaseEditedQuantities);
    setConfirmPurchaseOpen(false);
    setPurchaseToConfirm(null);
  };

  // Show purchase form
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
 {/** 
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

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
             */}
        <PurchaseForm
          currentUser={currentUser}
          onBack={() => setShowPurchaseForm(false)}
        />
      </div>
    );
  }

  // Main purchase requests list view
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({getStatusCount('all')})</SelectItem>
                <SelectItem value="pending">Pending ({getStatusCount('pending')})</SelectItem>
                <SelectItem value="approved">Approved ({getStatusCount('approved')})</SelectItem>
                <SelectItem value="rejected">Rejected ({getStatusCount('rejected')})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Request List - Mobile Card View or Desktop Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading purchase requests...</p>
          </CardContent>
        </Card>
      ) : filteredPurchaseRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3>No purchase requests found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || warehouseFilter !== 'all'
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
                    onClick={() => toggleRow(request.requestId)}
                  >
                    <div className="flex-1">
                      <h3 className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Purchase #{request.requestId}
                        {expandedRows.has(request.requestId) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline">{request.warehouseName}</Badge>
                        {request.priority && (
                          <Badge className={getPriorityColor(request.priority)} variant="secondary">
                            {getPriorityText(request.priority)}
                          </Badge>
                        )}
                        <Badge className={getStatusColor(request.status)} variant="secondary">
                          {getStatusText(request.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {canConfirmBought(request) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAlreadyBought(request)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {canCancelRequest(request) && (
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

                  {expandedRows.has(request.requestId) && (
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
                      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(request.requestId)}>
                        <TableCell>
                          {expandedRows.has(request.requestId) ? (
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
                                {getPriorityText(request.priority)}
                              </Badge>
                            )}
                            <Badge className={getStatusColor(request.status)} variant="secondary">
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {canConfirmBought(request) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  handleAlreadyBought(request);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Bought
                              </Button>
                            )}
                            {canCancelRequest(request) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
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
                      {expandedRows.has(request.requestId) && (
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

// Default export para compatibilidad con diferentes tipos de import
export default PurchaseRequests;