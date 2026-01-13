import { Card, CardContent } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { Skeleton } from '../../../ui/skeleton';
import { Search, Package, ShoppingCart, ArrowLeftRight, History, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useCompleteHistory, type RequestType, type UnifiedRequest } from './useCompleteHistory';
import { cn } from '../../../ui/utils';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';

// Type badge configuration
const TYPE_CONFIG: Record<RequestType, { label: string; icon: React.ReactNode; className: string }> = {
  borrow: {
    label: 'Borrow',
    icon: <Package className="h-3 w-3" />,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  purchase: {
    label: 'Purchase',
    icon: <ShoppingCart className="h-3 w-3" />,
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  transfer: {
    label: 'Transfer',
    icon: <ArrowLeftRight className="h-3 w-3" />,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
};

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  packing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  sent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
};

function getStatusColor(status: string): string {
  const normalized = status.toLowerCase();
  return STATUS_COLORS[normalized] || 'bg-gray-100 text-gray-800';
}

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CompleteHistory() {
  const {
    filteredRequests,
    isLoading,
    isMobile,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    getTypeCount,
    expandedRows,
    toggleRow,
  } = useCompleteHistory();

  const renderItemsDetail = (request: UnifiedRequest) => {
    if (!expandedRows.has(request.id) || request.items.length === 0) return null;

    return (
      <TableRow>
        <TableCell colSpan={8} className="bg-muted/30 p-0">
          <div className="p-4 space-y-3">
            {/* Transfer-specific info: From/To users */}
            {request.type === 'transfer' && (request.fromUser || request.toUser) && (
              <div className="flex flex-wrap gap-4 text-sm pb-2 border-b">
                {request.fromUser && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">From:</span>
                    <span className="font-medium">{request.fromUser}</span>
                  </div>
                )}
                {request.toUser && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">To:</span>
                    <span className="font-medium">{request.toUser}</span>
                  </div>
                )}
              </div>
            )}
            <h4 className="text-sm font-semibold">Items ({request.items.length})</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {request.items.map((item, idx) => (
                <div key={item.id || idx} className="flex items-start gap-3 rounded-lg border bg-background p-3">
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
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <Badge variant="secondary">x{item.quantity}</Badge>
                    </div>
                    {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {item.cost !== undefined && item.cost !== null && (
                        <span className="font-medium text-foreground">{formatCurrency(item.cost)}</span>
                      )}
                      {item.productUrl && (
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          View product
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {request.notes && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Notes:</span> {request.notes}
              </p>
            )}
            {(() => {
              const isRejected = request.status.toLowerCase() === 'rejected';
              const hasReason = !!request.rejectionReason;
              console.log('Desktop view - rejection check:', {
                requestNumber: request.requestNumber,
                status: request.status,
                statusLower: request.status.toLowerCase(),
                isRejected,
                rejectionReason: request.rejectionReason,
                hasReason
              });
              return null;
            })()}
            {request.status.toLowerCase() === 'rejected' && request.rejectionReason && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm font-semibold text-red-900 dark:text-red-300">Rejection Reason:</p>
                <p className="text-sm text-red-800 dark:text-red-400 mt-1 whitespace-pre-wrap">{request.rejectionReason}</p>
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Complete History</h2>
            <p className="text-sm text-muted-foreground">
              View all your requests in one place
            </p>
          </div>
        </div>
        
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1">
            <Package className="h-3 w-3" />
            Borrow: {getTypeCount('borrow')}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <ShoppingCart className="h-3 w-3" />
            Purchase: {getTypeCount('purchase')}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <ArrowLeftRight className="h-3 w-3" />
            Transfer: {getTypeCount('transfer')}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type filter */}
            <Select value={typeFilter} onValueChange={(v: string) => setTypeFilter(v as RequestType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types ({getTypeCount('all')})</SelectItem>
                <SelectItem value="borrow">Borrow ({getTypeCount('borrow')})</SelectItem>
                <SelectItem value="purchase">Purchase ({getTypeCount('purchase')})</SelectItem>
                <SelectItem value="transfer">Transfer ({getTypeCount('transfer')})</SelectItem>
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <TableSkeleton />
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No requests found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? `No results for "${searchTerm}"` : 'No request history available'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile Card View
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const isExpanded = expandedRows.has(request.id);
            return (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header row - clickable to expand */}
                    <div
                      className="flex justify-between items-start cursor-pointer"
                      onClick={() => toggleRow(request.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="flex items-center gap-2 text-sm font-medium">
                          {TYPE_CONFIG[request.type].icon}
                          <span className="truncate">#{request.requestNumber}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge 
                            variant="secondary" 
                            className={cn('gap-1 text-xs', TYPE_CONFIG[request.type].className)}
                          >
                            {TYPE_CONFIG[request.type].label}
                          </Badge>
                          <Badge 
                            variant="secondary"
                            className={cn('text-xs', getStatusColor(request.status))}
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <p>Date: {formatDate(request.date)}</p>
                      <p>Items: {request.itemCount}</p>
                      {request.project && <p className="truncate">Project: {request.project}</p>}
                      {request.warehouse && <p>Warehouse: {request.warehouse}</p>}
                    </div>

                    {/* Transfer-specific info */}
                    {request.type === 'transfer' && (request.fromUser || request.toUser) && (
                      <div className="flex flex-wrap gap-3 text-xs border-t pt-2">
                        {request.fromUser && (
                          <span><span className="text-muted-foreground">From:</span> {request.fromUser}</span>
                        )}
                        {request.toUser && (
                          <span><span className="text-muted-foreground">To:</span> {request.toUser}</span>
                        )}
                      </div>
                    )}

                    {/* Expanded items */}
                    {isExpanded && request.items.length > 0 && (
                      <div className="border-t pt-3">
                        <h4 className="text-xs font-semibold mb-2">Items ({request.items.length})</h4>
                        <div className="space-y-2">
                          {request.items.map((item, idx) => (
                            <div key={item.id || idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                              {item.imageUrl ? (
                                <ImageWithFallback
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 flex items-center justify-center rounded bg-background flex-shrink-0">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{item.name}</p>
                                {item.description && (
                                  <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-xs flex-shrink-0">x{item.quantity}</Badge>
                            </div>
                          ))}
                        </div>
                        {request.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            Notes: {request.notes}
                          </p>
                        )}
                        {(() => {
                          const isRejected = request.status.toLowerCase() === 'rejected';
                          const hasReason = !!request.rejectionReason;
                          console.log('Mobile view - rejection check:', {
                            requestNumber: request.requestNumber,
                            status: request.status,
                            statusLower: request.status.toLowerCase(),
                            isRejected,
                            rejectionReason: request.rejectionReason,
                            hasReason
                          });
                          return null;
                        })()}
                        {request.status.toLowerCase() === 'rejected' && request.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                            <p className="text-xs font-semibold text-red-900 dark:text-red-300">Rejection Reason:</p>
                            <p className="text-xs text-red-800 dark:text-red-400 mt-1 whitespace-pre-wrap">{request.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                    <TableHead>Request #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const isExpanded = expandedRows.has(request.id);
                    return (
                      <>
                        <TableRow 
                          key={request.id} 
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleRow(request.id)}
                        >
                          <TableCell className="w-[40px]">
                            <button
                              className="p-1 rounded hover:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(request.id);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="font-medium">
                            {request.requestNumber}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className={cn('gap-1', TYPE_CONFIG[request.type].className)}
                            >
                              {TYPE_CONFIG[request.type].icon}
                              {TYPE_CONFIG[request.type].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate" title={request.project}>
                            {request.project || '-'}
                          </TableCell>
                          <TableCell>{request.warehouse || '-'}</TableCell>
                          <TableCell>{formatDate(request.date)}</TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {request.itemCount} item{request.itemCount !== 1 ? 's' : ''}
                              {request.totalQuantity > 0 && (
                                <span className="text-muted-foreground ml-1">
                                  (qty: {request.totalQuantity})
                                </span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={getStatusColor(request.status)}
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {renderItemsDetail(request)}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      {!isLoading && filteredRequests.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredRequests.length} of {getTypeCount('all')} requests
        </p>
      )}
    </div>
  );
}
