import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Badge } from '../../../../ui/badge';
import { Input } from '../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../ui/table';
import { Package, Plus, ChevronDown, ChevronRight, Trash2, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../../../../../../figma/ImageWithFallback';
import { LoanForm } from '../../../forms/LoanForm';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { clearCart } from '../../../../store/slices/cartSlice';
import { selectCartItems, selectCurrentUser } from '../../../../store/selectors';
import { getBorrowRequests, getWarehouses, getStatuses, deleteBorrowRequest, type BorrowRequest, type Warehouse, type Status } from '../../../../services';
import { ConfirmModal, useConfirmModal } from '../../../../ui/confirm-modal';
import { handleError, setupConnectionListener } from '../../../../services/errorHandler';
import type { AppError } from '../../../../services/errorHandler';

export function BorrowRequests() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector(selectCartItems);
  const currentUser = useAppSelector(selectCurrentUser);

  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [filteredBorrowRequests, setFilteredBorrowRequests] = useState<BorrowRequest[]>([]);
  const [borrowSearchTerm, setBorrowSearchTerm] = useState('');
  const [borrowStatusFilter, setBorrowStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [expandedBorrowRows, setExpandedBorrowRows] = useState<Set<string>>(new Set());
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [requestToReturn, setRequestToReturn] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  // Setup connection listener
  useEffect(() => {
    const cleanup = setupConnectionListener(
      () => {
        setIsOnline(true);
        toast.success('Internet connection restored');
      },
      () => {
        setIsOnline(false);
        showConfirm({
          title: 'No Internet Connection',
          description: 'Please check your network connection. The app will retry automatically when connection is restored.',
          type: 'network',
          confirmText: 'OK',
          showCancel: false
        });
      }
    );
    return cleanup;
  }, []);

  // Load warehouses and statuses
  useEffect(() => {
    const loadData = async () => {
      try {
        const [whData, statusData, requestsData] = await Promise.all([
          getWarehouses(),
          getStatuses(),
          getBorrowRequests()
        ]);
        setWarehouses(whData);
        setStatuses(statusData);
        setBorrowRequests(requestsData);
      } catch (error: any) {
        const appError = handleError(error);
        showConfirm({
          title: appError.type === 'NETWORK_ERROR' ? 'Connection Error' : 'Error Loading Data',
          description: appError.message,
          type: appError.type === 'NETWORK_ERROR' ? 'network' : 'error',
          confirmText: 'Retry',
          cancelText: 'Cancel',
          retryable: appError.retryable,
          onConfirm: () => {
            hideModal();
            loadData();
          }
        });
      }
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

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // Filter borrow requests
  useEffect(() => {
    let filtered = borrowRequests;

    if (borrowSearchTerm) {
      filtered = filtered.filter(request => {
        const searchLower = borrowSearchTerm.toLowerCase();
        return (
          request.requestId.toLowerCase().includes(searchLower) ||
          request.project.toLowerCase().includes(searchLower) ||
          request.department.toLowerCase().includes(searchLower) ||
          request.warehouseName.toLowerCase().includes(searchLower) ||
          request.items.some(item => 
            item.name.toLowerCase().includes(searchLower) ||
            (item.sku && item.sku.toLowerCase().includes(searchLower))
          )
        );
      });
    }

    if (borrowStatusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === borrowStatusFilter);
    }

    if (warehouseFilter !== 'all') {
      filtered = filtered.filter(request => request.warehouseId === warehouseFilter);
    }

    setFilteredBorrowRequests(filtered);
  }, [borrowRequests, borrowSearchTerm, borrowStatusFilter, warehouseFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Active';
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleCancelBorrowRequest = (requestId: string) => {
    setRequestToDelete(requestId);
    showConfirm({
      title: 'Cancel Borrow Request',
      description: 'Are you sure you want to cancel this borrow request? This action cannot be undone.',
      type: 'warning',
      confirmText: 'Yes, Cancel Request',
      cancelText: 'Keep Request',
      onConfirm: async () => {
        try {
          const result = await deleteBorrowRequest(requestId);
          if (result.success) {
            setBorrowRequests(prev => prev.filter(req => req.requestId !== requestId));
            toast.success('Request cancelled successfully');
            hideModal();
          } else {
            showConfirm({
              title: 'Cannot Cancel Request',
              description: result.message,
              type: 'error',
              confirmText: 'OK',
              showCancel: false
            });
          }
        } catch (error: any) {
          const appError = handleError(error);
          showConfirm({
            title: 'Error Cancelling Request',
            description: appError.message,
            type: appError.type === 'NETWORK_ERROR' ? 'network' : 'error',
            confirmText: 'Retry',
            cancelText: 'Close',
            retryable: appError.retryable,
            onConfirm: () => {
              hideModal();
              handleCancelBorrowRequest(requestId);
            }
          });
        } finally {
          setRequestToDelete(null);
        }
      }
    });
  };

  const canCancelBorrowRequest = (request: BorrowRequest) => {
    return request.status === 'pending';
  };

  const handleReturnAll = (requestId: string) => {
    setRequestToReturn(requestId);
    setReturnDialogOpen(true);
  };

  const confirmReturnAll = () => {
    const request = borrowRequests.find(r => r.requestId === requestToReturn);
    if (request) {
      setBorrowRequests(prev => prev.filter(r => r.requestId !== requestToReturn));
      toast.success('All items returned successfully');
    }
    setReturnDialogOpen(false);
    setRequestToReturn('');
  };

  const canReturnAll = (request: BorrowRequest) => {
    return request.status === 'completed' || request.status === 'approved';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getBorrowStatusCount = (status: string) => {
    if (status === 'all') return borrowRequests.length;
    return borrowRequests.filter(req => req.status === status).length;
  };

  const toggleBorrowRow = (requestId: string) => {
    setExpandedBorrowRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  if (showBorrowForm) {
    if (!currentUser) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Please log in to create a borrow request.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button variant="outline" onClick={() => setShowBorrowForm(false)}>
            ← Back to Requests
          </Button>
          <Card className="flex-1 md:ml-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cart Items</p>
                  <p className="font-medium">{cartItems.length} items</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Quantity</p>
                  <p className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Engineer</p>
                  <p className="font-medium">{currentUser.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{currentUser.department || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <LoanForm
          cartItems={cartItems}
          clearCart={handleClearCart}
          currentUser={currentUser}
          onBack={() => setShowBorrowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Borrow Requests</h1>
          <p className="text-muted-foreground">
            Manage your equipment borrow requests
          </p>
        </div>
        <Button onClick={() => setShowBorrowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Borrow
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Search by ID, project, warehouse, items..."
              value={borrowSearchTerm}
              onChange={(e) => setBorrowSearchTerm(e.target.value)}
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
            <Select value={borrowStatusFilter} onValueChange={setBorrowStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({getBorrowStatusCount('all')})</SelectItem>
                <SelectItem value="pending">Pending ({getBorrowStatusCount('pending')})</SelectItem>
                <SelectItem value="approved">Approved ({getBorrowStatusCount('approved')})</SelectItem>
                <SelectItem value="completed">Active ({getBorrowStatusCount('completed')})</SelectItem>
                <SelectItem value="rejected">Rejected ({getBorrowStatusCount('rejected')})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Request List - Mobile Card View or Desktop Table */}
      {filteredBorrowRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3>No borrow requests found</h3>
            <p className="text-sm text-muted-foreground">
              {borrowSearchTerm || borrowStatusFilter !== 'all' || warehouseFilter !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'When you make borrow requests, they will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile Card View
        <div className="space-y-4">
          {filteredBorrowRequests.map((request) => (
            <Card key={request.requestId}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleBorrowRow(request.requestId)}
                  >
                    <div className="flex-1">
                      <h3 className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Loan #{request.requestId}
                        {expandedBorrowRows.has(request.requestId) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={getStatusColor(request.status)} variant="secondary">
                          {getStatusText(request.status)}
                        </Badge>
                        <Badge variant="outline">{request.warehouseName}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {canReturnAll(request) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReturnAll(request.requestId)}
                        >
                          Return
                        </Button>
                      )}
                      {canCancelBorrowRequest(request) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelBorrowRequest(request.requestId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Requested: {formatDate(request.createdAt || '')}
                    </p>
                    <p>Project: {request.project}</p>
                    <p>Return Date: {formatDate(request.returnDate)}</p>
                  </div>

                  {expandedBorrowRows.has(request.requestId) && (
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
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBorrowRequests.map((request) => (
                    <React.Fragment key={request.requestId}>
                      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleBorrowRow(request.requestId)}>
                        <TableCell>
                          {expandedBorrowRows.has(request.requestId) ? (
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
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(request.returnDate)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)} variant="secondary">
                            {getStatusText(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {canReturnAll(request) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  handleReturnAll(request.requestId);
                                }}
                              >
                                Return
                              </Button>
                            )}
                            {canCancelBorrowRequest(request) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  handleCancelBorrowRequest(request.requestId);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedBorrowRows.has(request.requestId) && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/20 p-0">
                            <div className="p-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead className="hidden md:table-cell">SKU</TableHead>
                                    <TableHead>Name & Description</TableHead>
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

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return All Items</DialogTitle>
            <DialogDescription>
              Are you sure you want to return all items from this request?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReturnAll}>
              Confirm Return
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Modal */}
      <ConfirmModal
        open={modalState.open}
        onOpenChange={setModalOpen}
        title={modalState.title}
        description={modalState.description}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        showCancel={modalState.showCancel}
        retryable={modalState.retryable}
      />
    </div>
  );
}