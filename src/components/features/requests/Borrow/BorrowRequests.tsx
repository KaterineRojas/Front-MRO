/**
 * BorrowRequests.tsx
 * Componente de presentación para Borrow Requests
 * Siguiendo principios SOLID: UI separada de lógica
 */

import React from 'react';
import { Card, CardContent } from '../../enginner/ui/card';
import { Button } from '../../enginner/ui/button';
import { Badge } from '../../enginner/ui/badge';
import { Input } from '../../enginner/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../enginner/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../enginner/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../enginner/ui/table';
import { Package, Plus, ChevronDown, ChevronRight, Trash2, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { LoanForm } from './LoanForm';
import { ConfirmModal } from '../../../ui/confirm-modal';
import type { User } from '../../enginner/types';

import { useBorrowRequests } from './useBorrowRequests';
import { getStatusColor, getStatusText, formatDate, hasActiveFilters } from './borrowUtils';

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
      department: currentUser.department || '',
      role: (currentUser as any).role || 'user'
    };

    return (
      <LoanForm
        cartItems={cartItems}
        clearCart={handleClearCart}
        currentUser={userForForm}
        onBack={() => setShowBorrowForm(false)}
      />
    );
  }

  // Main UI
  return (
    <div className="space-y-6">
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