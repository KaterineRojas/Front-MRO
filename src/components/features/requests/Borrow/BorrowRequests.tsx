import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Package, Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { LoanForm } from './borrowForm/LoanForm';
import { ConfirmModal } from '../../../ui/confirm-modal';
import { ProjectDetails } from '../shared/ProjectDetails';
import type { User } from '../types';
import { actionButtonAnimationStyles } from '../styles/actionButtonStyles';
import type { LoanRequest } from './borrowService';

import { useBorrowRequests } from './useBorrowRequests';
import { getStatusColor, getStatusText, formatDate, hasActiveFilters, getStatusStyle } from './borrowUtils';

// Interface para metadata computada de cada request
interface BorrowRequestMeta {
  rowKey: string;
  identifier: string;
  requesterName: string;
  warehouseName: string;
  statusLabel: string;
  statusClass: React.CSSProperties;
  statusColorClass: string;
  projectLabel: string;
  companyLabel?: string;
  customerLabel?: string;
  workOrderLabel?: string;
  expectedReturnDate: string;
  createdDate: string;
  approvedDate: string;
  rejectedDate: string;
  packedDate: string;
  sentDate: string;
  rejectedBy?: string;
  rejectionReason?: string;
  totalItems: number;
  totalQuantity: number;
  notesText?: string;
  hasNotes: boolean;
  locationAddress?: string;
  locationUrl?: string;
  locationZip?: string;
  hasLocation: boolean;
  typeRequestName?: string;
}

function computeBorrowMeta(request: LoanRequest, index: number): BorrowRequestMeta {
  const rowKey = request.requestNumber || `borrow-row-${index}`;
  
  const totalItems = request.totalItems ?? (Array.isArray(request.items) ? request.items.length : 0);
  const totalQuantity = request.totalQuantity ?? (Array.isArray(request.items)
    ? request.items.reduce((sum, item) => sum + (item.quantityRequested ?? 0), 0)
    : 0);

  const normalizedNotes = (request.notes ?? '').trim();
  const locationAddress = ((request as any).address ?? '').trim() || undefined;
  const locationUrl = ((request as any).googleMapsUrl ?? '').trim() || undefined;
  const locationZip = ((request as any).zipCode ?? '').trim() || undefined;
  const hasLocation = Boolean(locationAddress || locationUrl || locationZip);

  return {
    rowKey,
    identifier: request.requestNumber || `REQ${String(index + 1).padStart(3, '0')}`,
    requesterName: request.requesterName || 'Unknown',
    warehouseName: request.warehouseName || 'No warehouse assigned',
    statusLabel: getStatusText(request.status),
    statusClass: getStatusStyle(request.status),
    statusColorClass: getStatusColor(request.status),
    projectLabel: request.projectId || 'Untitled project',
    companyLabel: request.companyId || undefined,
    customerLabel: request.customerId || undefined,
    workOrderLabel: request.workOrderId || undefined,
    expectedReturnDate: formatDate(request.expectedReturnDate),
    createdDate: formatDate(request.createdAt || ''),
    approvedDate: formatDate((request as any).approvedAt),
    rejectedDate: formatDate((request as any).rejectedAt),
    packedDate: formatDate((request as any).packedAt),
    sentDate: formatDate((request as any).sentAt),
    rejectedBy: (request as any).rejectedByName || (request as any).rejectedBy || undefined,
    rejectionReason: (request as any).rejectionReason || undefined,
    totalItems,
    totalQuantity,
    notesText: normalizedNotes || undefined,
    hasNotes: Boolean(normalizedNotes),
    locationAddress,
    locationUrl,
    locationZip,
    hasLocation,
    typeRequestName: (request as any).typeRequestName || undefined,
  };
}

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
      department: currentUser.department || '',
      departmentId: (currentUser as any).departmentId || currentUser.department || '',
      departmentName: (currentUser as any).departmentName || '',
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
                <SelectItem value="Approved">Approved ({getBorrowStatusCount('Approved')})</SelectItem>
                <SelectItem value="Packing">Packing ({getBorrowStatusCount('Packing')})</SelectItem>
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
          {filteredBorrowRequests.map((request, index) => {
            const meta = computeBorrowMeta(request, index);
            const isExpanded = expandedBorrowRows.has(meta.rowKey);
            const totalSummary = `${meta.totalItems} items • ${meta.totalQuantity} pieces`;

            return (
              <Card key={meta.rowKey}>
                <CardContent className="p-4 space-y-4">
                  <div
                    className="flex items-start justify-between gap-3 cursor-pointer"
                    onClick={() => toggleBorrowRow(meta.rowKey)}
                  >
                    <div className="space-y-1">
                      <p className="font-mono text-sm font-semibold">Request {meta.identifier}</p>
                      <p className="text-xs text-muted-foreground">{meta.warehouseName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        className={meta.statusColorClass} 
                        variant={null as any}
                        style={meta.statusClass}
                      >
                        {meta.statusLabel}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">Project</p>
                      <p className="font-medium text-foreground">{meta.projectLabel}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">Return Date</p>
                      <p className="text-foreground">{meta.expectedReturnDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">Items</p>
                      <p className="text-foreground">{totalSummary}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">Created</p>
                      <p className="text-foreground">{meta.createdDate}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                    {canReturnAll(request) && (
                      <Button
                        className="action-btn-enhance btn-accept gap-2 h-auto py-2 px-4"
                        onClick={() => handleReturnAll(meta.rowKey)}
                      >
                        Return
                      </Button>
                    )}
                    <Button
                      className="action-btn-enhance btn-cancel p-2 h-auto"
                      onClick={() => handleCancelBorrowRequest(meta.rowKey)}
                      disabled={!canCancelBorrowRequest(request)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 border-t pt-3">
                      {/* Project Details Chain */}
                      <ProjectDetails
                        companyLabel={meta.companyLabel}
                        customerLabel={meta.customerLabel}
                        projectLabel={meta.projectLabel}
                        workOrderLabel={meta.workOrderLabel}
                      />

                      {/* Location */}
                      {meta.hasLocation && (
                        <div className="bg-sky-50 dark:bg-sky-950/40 rounded-lg p-3 border border-sky-200 dark:border-sky-800">
                          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300 mb-2">Location</p>
                          <div className="space-y-1 text-sm">
                            {meta.locationAddress && <p className="text-foreground">{meta.locationAddress}</p>}
                            {meta.locationZip && <p className="text-muted-foreground">ZIP: {meta.locationZip}</p>}
                            {meta.locationUrl && (
                              <a href={meta.locationUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                Open map
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      {(meta.approvedDate !== '—' || meta.packedDate !== '—' || meta.sentDate !== '—' || meta.rejectedDate !== '—') && (
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {meta.approvedDate !== '—' && <p>Approved: {meta.approvedDate}</p>}
                          {meta.packedDate !== '—' && <p>Packed: {meta.packedDate}</p>}
                          {meta.sentDate !== '—' && <p>Sent: {meta.sentDate}</p>}
                          {meta.rejectedDate !== '—' && <p>Rejected: {meta.rejectedDate}</p>}
                        </div>
                      )}

                      {/* Rejection reason */}
                      {meta.rejectionReason && (
                        <div className="bg-red-50 dark:bg-red-950/40 rounded-lg p-3 border border-red-200 dark:border-red-800">
                          <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300 mb-1">Rejection Reason</p>
                          <p className="text-sm text-foreground">{meta.rejectionReason}</p>
                          {meta.rejectedBy && <p className="text-xs text-muted-foreground mt-1">By: {meta.rejectedBy}</p>}
                        </div>
                      )}

                      {/* Notes */}
                      {meta.notesText && (
                        <p className="text-xs text-foreground">Notes: {meta.notesText}</p>
                      )}

                      {/* Items */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Items ({request.items.length})</h4>
                        {request.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start gap-3 rounded-lg border p-3">
                            {item.imageUrl ? (
                              <ImageWithFallback
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center rounded bg-muted">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium">{item.name}</p>
                                <Badge variant="secondary">x{item.quantityRequested}</Badge>
                              </div>
                              {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                              {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                              {item.quantityFulfilled !== undefined && item.quantityFulfilled > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400">Fulfilled: {item.quantityFulfilled}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Desktop Table View
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]" />
                    <TableHead>Request</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBorrowRequests.map((request, index) => {
                    const meta = computeBorrowMeta(request, index);
                    const isExpanded = expandedBorrowRows.has(meta.rowKey);
                    const totalSummary = `${meta.totalItems} items • ${meta.totalQuantity} pcs`;

                    return (
                      <React.Fragment key={meta.rowKey}>
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleBorrowRow(meta.rowKey)}>
                          <TableCell className="align-top">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <p className="font-mono text-sm font-semibold">#{meta.identifier}</p>
                              <p className="text-xs text-muted-foreground">{meta.warehouseName}</p>
                              {meta.hasNotes && <Badge variant="outline" className="text-xs">Notes</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <p className="text-sm font-medium text-foreground">{meta.projectLabel}</p>
                            {meta.workOrderLabel && (
                              <p className="text-xs text-muted-foreground">WO: {meta.workOrderLabel}</p>
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <p className="text-sm text-foreground">{meta.expectedReturnDate}</p>
                              <p className="text-xs text-muted-foreground">Created: {meta.createdDate}</p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge 
                              className={meta.statusColorClass} 
                              variant={null as any}
                              style={meta.statusClass}
                            >
                              {meta.statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <p className="text-sm text-foreground">{totalSummary}</p>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex items-start justify-end gap-2">
                              {canReturnAll(request) && (
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        className="action-btn-enhance btn-accept gap-2 h-auto py-2 px-4"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                          e.stopPropagation();
                                          handleReturnAll(meta.rowKey);
                                        }}
                                      >
                                        Return
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={8}>Return items</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="action-btn-enhance btn-cancel p-2 h-auto"
                                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        handleCancelBorrowRequest(meta.rowKey);
                                      }}
                                      disabled={!canCancelBorrowRequest(request)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={8}>
                                    {canCancelBorrowRequest(request) ? 'Cancel request' : 'Only pending requests can be cancelled'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-muted/20 p-0">
                              <div className="p-4 space-y-4">
                                {/* Project Details Chain */}
                                <ProjectDetails
                                  companyLabel={meta.companyLabel}
                                  customerLabel={meta.customerLabel}
                                  projectLabel={meta.projectLabel}
                                  workOrderLabel={meta.workOrderLabel}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  {/* Notes */}
                                  <div className="bg-sky-50 dark:bg-sky-950/40 rounded-lg p-3 border border-sky-200 dark:border-sky-800 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Notes</p>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed">{meta.notesText || 'No additional notes'}</p>
                                  </div>

                                  {/* Location */}
                                  <div className="bg-sky-50 dark:bg-sky-950/40 rounded-lg p-3 border border-sky-200 dark:border-sky-800 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                      </div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Location</p>
                                    </div>
                                    {meta.hasLocation ? (
                                      <div className="space-y-1.5">
                                        {meta.locationAddress && <p className="text-sm text-foreground">{meta.locationAddress}</p>}
                                        {meta.locationZip && (
                                          <span className="inline-block px-2 py-0.5 bg-sky-100 dark:bg-sky-900/50 rounded text-xs text-sky-700 dark:text-sky-300">ZIP: {meta.locationZip}</span>
                                        )}
                                        {meta.locationUrl && (
                                          <a href={meta.locationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Open map
                                          </a>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground italic">No location info</p>
                                    )}
                                  </div>

                                  {/* Dates */}
                                  <div className="bg-sky-50 dark:bg-sky-950/40 rounded-lg p-3 border border-sky-200 dark:border-sky-800 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Dates</p>
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                      {meta.approvedDate !== '—' && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Approved</span>
                                          <span className="text-foreground font-medium">{meta.approvedDate}</span>
                                        </div>
                                      )}
                                      {meta.packedDate !== '—' && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Packed</span>
                                          <span className="text-foreground font-medium">{meta.packedDate}</span>
                                        </div>
                                      )}
                                      {meta.sentDate !== '—' && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Sent</span>
                                          <span className="text-foreground font-medium">{meta.sentDate}</span>
                                        </div>
                                      )}
                                      {meta.rejectedDate !== '—' && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Rejected</span>
                                          <span className="text-red-600 dark:text-red-400 font-medium">{meta.rejectedDate}</span>
                                        </div>
                                      )}
                                      {meta.approvedDate === '—' && meta.packedDate === '—' && meta.sentDate === '—' && meta.rejectedDate === '—' && (
                                        <p className="text-muted-foreground italic">No status dates yet</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Rejection Reason */}
                                {meta.rejectionReason && (
                                  <div className="bg-red-50 dark:bg-red-950/40 rounded-lg p-3 border border-red-200 dark:border-red-800 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                      </div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">Rejection Reason</p>
                                    </div>
                                    <p className="text-sm text-foreground">{meta.rejectionReason}</p>
                                    {meta.rejectedBy && <p className="text-xs text-muted-foreground mt-1">By: {meta.rejectedBy}</p>}
                                  </div>
                                )}

                                {/* Items */}
                                <div>
                                  <h4 className="text-sm font-semibold mb-3">Items ({request.items.length})</h4>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {request.items.map((item, itemIndex) => (
                                      <div key={itemIndex} className="flex gap-3 rounded-lg border bg-background p-3">
                                        {item.imageUrl ? (
                                          <ImageWithFallback
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded"
                                          />
                                        ) : (
                                          <div className="w-16 h-16 flex items-center justify-center rounded bg-muted">
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                        )}
                                        <div className="flex-1 space-y-1">
                                          <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium">{item.name}</p>
                                            <Badge variant="secondary">x{item.quantityRequested}</Badge>
                                          </div>
                                          {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                          {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                                          {item.quantityFulfilled !== undefined && item.quantityFulfilled > 0 && (
                                            <p className="text-xs text-green-600 dark:text-green-400">Fulfilled: {item.quantityFulfilled}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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