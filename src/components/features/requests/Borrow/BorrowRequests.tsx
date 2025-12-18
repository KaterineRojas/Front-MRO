import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Package, Plus, ChevronDown, ChevronRight, Trash2, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { LoanForm } from './LoanForm';
import { ConfirmModal } from '../../../ui/confirm-modal';
import type { User } from '../../enginner/types';
import { actionButtonAnimationStyles } from '../styles/actionButtonStyles';

import { useBorrowRequests } from './useBorrowRequests';
import { getStatusColor, getStatusText, formatDate, hasActiveFilters, getStatusStyle } from './borrowUtils';

export function BorrowRequests() {
  const {
    // State
    showBorrowForm,
    filteredBorrowRequests,
    borrowSearchTerm,
    borrowStatusFilter,
    warehouseFilter,
    expandedBorrowRows,
    returnDialogOpen,
    isMobile,
    warehouses,
    modalState,
    cartItems,
    currentUser,

    // Setters
    setShowBorrowForm,
    setBorrowSearchTerm,
    setBorrowStatusFilter,
    setWarehouseFilter,
    setReturnDialogOpen,
    setModalOpen,

    // Handlers
    handleClearCart,
    handleCancelBorrowRequest,
    handleReturnAll,
    confirmReturnAll,
    toggleBorrowRow,
    getBorrowStatusCount,
    reloadBorrowRequests,

    // Utilities
    canCancelBorrowRequest,
    canReturnAll
  } = useBorrowRequests();

  // Render Borrow Form
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

    // Asegurar que currentUser tenga todas las propiedades necesarias
    const userForForm: User = {
      id: currentUser.id || '',
      name: currentUser.name || '',
      email: currentUser.email || '',
      department: currentUser.departmentId || currentUser.department || '',
      departmentId: currentUser.departmentId || currentUser.department || '',
      departmentName: currentUser.departmentName || '',
      role: (currentUser as any).role || 'user',
      employeeId: (currentUser as any).employeeId || ''
    };

    return (
      <LoanForm
        cartItems={cartItems}
        clearCart={handleClearCart}
        currentUser={userForForm}
        onBack={() => setShowBorrowForm(false)}
        onBorrowCreated={reloadBorrowRequests}
      />
    );
  }

  // Main UI
  return (
    <div className="space-y-6">
      <style>{actionButtonAnimationStyles}</style>
      {/* Header */}
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
                  <SelectItem key={wh.id} value={wh.name}>
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
                <SelectItem value="Pending">Pending ({getBorrowStatusCount('Pending')})</SelectItem>
                <SelectItem value="Packing">Packing ({getBorrowStatusCount('Packing')})</SelectItem>
                <SelectItem value="Sent">Sent ({getBorrowStatusCount('Sent')})</SelectItem>
                <SelectItem value="Approved">Approved ({getBorrowStatusCount('Approved')})</SelectItem>
                <SelectItem value="Rejected">Rejected ({getBorrowStatusCount('Rejected')})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredBorrowRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3>No borrow requests found</h3>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters(borrowSearchTerm, borrowStatusFilter, warehouseFilter)
                ? 'Try adjusting your search or filters'
                : 'When you make borrow requests, they will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile Card View
        <div className="space-y-4">
          {filteredBorrowRequests.map((request) => (
            <Card key={request.requestNumber}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleBorrowRow(request.requestNumber)}
                  >
                    <div className="flex-1">
                      <h3 className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Loan #{request.requestNumber}
                        {expandedBorrowRows.has(request.requestNumber) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge 
                          className={getStatusColor(request.status)} 
                          variant={null as any}
                          style={getStatusStyle(request.status)}
                        >
                          {getStatusText(request.status)}
                        </Badge>
                        <Badge variant="outline">{request.warehouseName}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {canReturnAll(request) && (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="action-btn-enhance btn-accept gap-2 h-auto py-2 px-4"
                                onClick={() => handleReturnAll(request.requestNumber)}
                              >
                                Return
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>Return items</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {canCancelBorrowRequest(request) && (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="action-btn-enhance btn-cancel p-2 h-auto"
                                onClick={() => handleCancelBorrowRequest(request.requestNumber)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>Cancel request</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-sm">
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        Requested: {formatDate(request.createdAt || '')}
                      </p>
                      <p>Project: {request.projectId}</p>
                      <p>Return: {formatDate(request.expectedReturnDate)}</p>
                    </div>
                    {request.notes && (
                      <p className="text-xs italic">Notes: {request.notes}</p>
                    )}
                  </div>

                  {expandedBorrowRows.has(request.requestNumber) && (
                    <div>
                      {/* Cadena de relaciones en móvil */}
                      <div className="bg-white rounded-lg p-3 border border-muted mb-4">
                        <h4 className="text-[10px] sm:text-xs font-semibold mb-2 text-muted-foreground">Details project</h4>
                        <div className="flex items-center gap-1 flex-wrap">
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] sm:text-[10px] opacity-50">Company</span>
                            <span className="text-[9px] sm:text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{request.companyId}</span>
                          </div>
                          <span className="text-muted-foreground text-[8px] sm:text-xs">→</span>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] sm:text-[10px] opacity-50">Customer</span>
                            <span className="text-[9px] sm:text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">{request.customerId}</span>
                          </div>
                          <span className="text-muted-foreground text-[8px] sm:text-xs">→</span>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] sm:text-[10px] opacity-50">Project</span>
                            <span className="text-[9px] sm:text-xs font-medium text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">{request.projectId}</span>
                          </div>
                          <span className="text-muted-foreground text-[8px] sm:text-xs">→</span>
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] sm:text-[10px] opacity-50">Work Order</span>
                            <span className="text-[9px] sm:text-xs font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{request.workOrderId}</span>
                          </div>
                        </div>
                      </div>
                      
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
                              <p className="text-xs sm:text-sm truncate">{item.name}</p>
                              {item.description && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.description}</p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">x{item.quantityRequested}</Badge>
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
        // Desktop Table View - FIXED COLUMNS
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center"></TableHead>
                    <TableHead className="text-center">Request ID</TableHead>
                    <TableHead className="text-center">Warehouse</TableHead>
                    <TableHead className="text-center">Project</TableHead>
                    <TableHead className="text-center">Return Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Notes</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBorrowRequests.map((request) => (
                    <React.Fragment key={request.requestNumber}>
                      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleBorrowRow(request.requestNumber)}>
                        <TableCell className="text-center">
                          {expandedBorrowRows.has(request.requestNumber) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-center">#{request.requestNumber}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="mx-auto">{request.warehouseName}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="text-sm">{request.projectId}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground text-center">
                          {formatDate(request.expectedReturnDate)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`${getStatusColor(request.status)} mx-auto`} 
                            variant={null as any}
                            style={getStatusStyle(request.status)}
                          >
                            {getStatusText(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="text-sm text-muted-foreground truncate max-w-[200px] mx-auto" title={request.notes}>
                            {request.notes || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            {canReturnAll(request) && (
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="action-btn-enhance btn-accept gap-2 h-auto py-2 px-4"
                                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        handleReturnAll(request.requestNumber);
                                      }}
                                    >
                                      Return
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={8}>Return items</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {canCancelBorrowRequest(request) && (
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="action-btn-enhance btn-cancel p-2 h-auto"
                                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        handleCancelBorrowRequest(request.requestNumber);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={8}>Cancel request</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedBorrowRows.has(request.requestNumber) && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/20 p-0">
                            <div className="p-4 space-y-4">
                              {/* Cadena de relaciones */}
                              <div className="bg-white rounded-lg p-4 border border-muted flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-muted-foreground">Details project</h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="flex flex-col items-center">
                                    <span className="text-xs opacity-50 mb-1">Company</span>
                                    <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm font-medium">
                                      {request.companyId}
                                    </div>
                                  </div>
                                  <span className="text-muted-foreground">→</span>
                                  <div className="flex flex-col items-center">
                                    <span className="text-xs opacity-50 mb-1">Customer</span>
                                    <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm font-medium">
                                      {request.customerId}
                                    </div>
                                  </div>
                                  <span className="text-muted-foreground">→</span>
                                  <div className="flex flex-col items-center">
                                    <span className="text-xs opacity-50 mb-1">Project</span>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-sm font-medium">
                                      {request.projectId}
                                    </div>
                                  </div>
                                  <span className="text-muted-foreground">→</span>
                                  <div className="flex flex-col items-center">
                                    <span className="text-xs opacity-50 mb-1">Work Order</span>
                                    <div className="bg-purple-50 border border-purple-200 rounded px-3 py-2 text-sm font-medium">
                                      {request.workOrderId}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Tabla de items */}
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[80px] text-center">Image</TableHead>
                                    <TableHead className="hidden md:table-cell text-center">SKU</TableHead>
                                    <TableHead className="text-center">Name & Description</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {request.items.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="text-center">
                                        {item.imageUrl ? (
                                          <ImageWithFallback
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded mx-auto"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mx-auto">
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell className="font-mono text-sm hidden md:table-cell text-center">{item.sku || '-'}</TableCell>
                                      <TableCell className="text-center">
                                        <p className="text-sm">{item.name}</p>
                                        {item.description && (
                                          <p className="text-xs text-muted-foreground">{item.description}</p>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center text-sm">x{item.quantityRequested}</TableCell>
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