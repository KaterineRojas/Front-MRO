import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Package, Plus, ChevronDown, ChevronRight, Trash2, CheckCircle, Pencil } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { PurchaseForm } from './purchase form/PurchaseFormRefactored';
import { ModalConfirmPurchase } from './ModalConfirmPurchase';
import { usePurchaseRequests } from './usePurchaseRequests';
import { useIsMobile } from '../../../ui/use-mobile';
import { actionButtonAnimationStyles } from '../styles/actionButtonStyles';
import { formatCurrency, formatDate, getReasonColor, getReasonText, getStatusColor, getStatusText } from './purchaseUtils';
import { getWarehouses } from '../services/sharedServices';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { selectCartItems } from '../../enginner/store/selectors';
import { clearCart } from '../../enginner/store/actions';
import type { PurchaseRequest } from './purchaseService';
import type { User as EngineerUser, CartItem } from '../../enginner/types';
import { toast } from 'sonner';
import { ConfirmModal } from '../../../ui/confirm-modal';

// Configuración de estados visibles (0=pending, 1=approved, 3=completed)
// Excluimos 2=rejected de la vista
const STATUS_CONFIG = {
  pending: { value: 'pending', label: 'Pending', statusCode: 0 },
  approved: { value: 'approved', label: 'Approved', statusCode: 1 },
  completed: { value: 'completed', label: 'Completed', statusCode: 3 },
} as const;

const VISIBLE_STATUSES = Object.values(STATUS_CONFIG);

type ActiveView = 'list' | 'request';

interface WarehouseOption {
  id: string;
  name: string;
}

interface CartSnapshot {
  items: CartItem[];
  warehouseId: string;
}

interface RequestMeta {
  rowKey: string;
  actionKey: string;
  identifier: string;
  warehouseName: string;
  statusLabel: string;
  statusClass: string;
  reasonLabel?: string;
  reasonClass?: string;
  expectedDelivery: string;
  orderedDate: string;
  receivedDate: string;
  createdDate: string;
  totalCostDisplay: string;
  totalItems: number;
  totalQuantity: number;
  notesText?: string;
  hasNotes: boolean;
  projectLabel: string;
  companyLabel?: string;
  customerLabel?: string;
  selfPurchase: boolean;
  clientBilled: boolean;
  purchaserLabel: string;
  billingLabel: string;
  workOrderLabel?: string;
  locationAddress?: string;
  locationUrl?: string;
  locationZip?: string;
  hasLocation: boolean;
}

function computeRequestMeta(request: PurchaseRequest, index: number): RequestMeta {
  const rawRowKey = request.requestId ?? request.requestNumber ?? `purchase-row-${index}`;
  const rowKey = rawRowKey?.toString() ?? `purchase-row-${index}`;
  const actionKey = (request.requestId ?? request.requestNumber ?? rowKey)?.toString() ?? rowKey;

  const totalCost = typeof request.totalCost === 'number' ? request.totalCost : request.estimatedTotalCost;
  const normalizedNotes = (request.notes ?? '').trim();

  const totalItems = request.totalItems ?? (Array.isArray(request.items) ? request.items.length : 0);
  const totalQuantity = request.totalQuantity ?? (Array.isArray(request.items)
    ? request.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
    : 0);

  const reasonValue = request.reasonId ?? (request as any).reason;
  const hasReason = reasonValue !== undefined && reasonValue !== null && reasonValue !== '';

  const workOrderLabel = request.workOrderId ?? '';
  const locationAddress = (request.address ?? '').trim() || undefined;
  const locationUrl = (request.googleMapsUrl ?? '').trim() || undefined;
  const locationZip = (request.zipCode ?? '').trim() || undefined;
  const hasLocation = Boolean(locationAddress || locationUrl || locationZip);

  const identifierSource = request.requestNumber ?? request.requestId ?? `REQ${String(index + 1).padStart(3, '0')}`;

  return {
    rowKey,
    actionKey,
    identifier: identifierSource?.toString() ?? `REQ${String(index + 1).padStart(3, '0')}`,
    warehouseName: request.warehouseName ?? 'No warehouse assigned',
    statusLabel: getStatusText(request.status, request.statusName),
    statusClass: getStatusColor(request.status, request.statusName),
    reasonLabel: hasReason ? getReasonText(reasonValue as any, request.reasonName) : undefined,
    reasonClass: hasReason ? getReasonColor(reasonValue as any, request.reasonName) : undefined,
    expectedDelivery: formatDate(request.expectedDeliveryDate),
    orderedDate: formatDate(request.orderedAt),
    receivedDate: formatDate(request.receivedAt),
    createdDate: formatDate(request.createdAt),
    totalCostDisplay: typeof totalCost === 'number' ? formatCurrency(totalCost) : '—',
    totalItems,
    totalQuantity,
    notesText: normalizedNotes || undefined,
    hasNotes: Boolean(normalizedNotes),
    projectLabel: request.projectName ?? request.projectId ?? 'Untitled project',
    companyLabel: request.companyName ?? request.companyId,
    customerLabel: request.customerName ?? request.customerId,
    selfPurchase: Boolean(request.selfPurchase),
    clientBilled: Boolean(request.clientBilled),
    purchaserLabel: request.selfPurchase ? 'Requester purchases' : 'Keeper purchases',
    billingLabel: request.clientBilled ? 'Billed to client' : 'Not billed to client',
    workOrderLabel: workOrderLabel || undefined,
    locationAddress,
    locationUrl,
    locationZip,
    hasLocation,
  };
}

export function PurchaseRequests() {
  const [activeView, setActiveView] = useState<ActiveView>('list');
  const [requestToEdit, setRequestToEdit] = useState<PurchaseRequest | null>(null);
  const [confirmPurchaseOpen, setConfirmPurchaseOpen] = useState(false);
  const [purchaseToConfirm, setPurchaseToConfirm] = useState<PurchaseRequest | null>(null);
  const [warehouseChoices, setWarehouseChoices] = useState<WarehouseOption[]>([]);

  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();

  const {
    purchaseRequests,
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
    getStatusCount,
    refreshRequests,
    modalState,
    setModalOpen,
  } = usePurchaseRequests();

  const authUser = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector(selectCartItems);
  const [pendingCartSnapshot, setPendingCartSnapshot] = useState<CartSnapshot | null>(null);

  const currentUser = useMemo<EngineerUser | null>(() => {
    if (!authUser) {
      return null;
    }

    return {
      id: authUser.id ?? '',
      name: authUser.name ?? '',
      email: authUser.email ?? '',
      role: authUser.roleName ?? 'Engineer',
      department: authUser.department ?? authUser.departmentId ?? '',
      departmentId: authUser.departmentId ?? authUser.department ?? '',
      departmentName: authUser.departmentName ?? '',
      employeeId: authUser.employeeId ?? '',
    };
  }, [authUser]);

  useEffect(() => {
    let isMounted = true;

    const loadWarehouses = async () => {
      try {
        const data = await getWarehouses();
        if (!isMounted) {
          return;
        }

        const mapped = data
          .map((wh) => ({
            id: wh.id.toString(),
            name: wh.name ?? wh.code ?? wh.id.toString(),
          }))
          .filter((wh) => Boolean(wh.id));

        setWarehouseChoices(mapped);
      } catch (error) {
        console.error('Failed to load warehouses for filters', error);
        toast.error('Failed to load warehouses');
      }
    };

    void loadWarehouses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const shouldOpenPurchase = sessionStorage.getItem('openPurchaseForm');
    if (shouldOpenPurchase === 'true') {
      sessionStorage.removeItem('openPurchaseForm');
      handleUseCartForRequest();
      setRequestToEdit(null);
      setActiveView('request');
    }
  }, []);

  useEffect(() => {
    if (pendingCartSnapshot) {
      return;
    }
    const storedSnapshot = sessionStorage.getItem('purchaseCartSnapshot');
    if (!storedSnapshot) {
      return;
    }
    try {
      const parsed = JSON.parse(storedSnapshot) as CartSnapshot;
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        setPendingCartSnapshot(parsed);
      }
    } catch (error) {
      console.error('Failed to restore purchase cart snapshot', error);
    }
  }, [pendingCartSnapshot]);

  const derivedWarehouseChoices = useMemo<WarehouseOption[]>(() => {
    const seen = new Map<string, string>();
    purchaseRequests.forEach((request) => {
      const rawId = (request.warehouseId ?? request.warehouseName)?.toString();
      if (!rawId || seen.has(rawId)) {
        return;
      }

      const name = request.warehouseName ?? rawId;
      seen.set(rawId, name);
    });

    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [purchaseRequests]);

  const warehousesForFilter = warehouseChoices.length > 0 ? warehouseChoices : derivedWarehouseChoices;

  const cloneCartItems = useCallback((items: CartItem[]): CartItem[] =>
    items.map((cartItem) => ({
      ...cartItem,
      item: { ...cartItem.item }
    })),
  []);

  const handleUseCartForRequest = (): CartSnapshot | null => {
    if (cartItems.length === 0) {
      sessionStorage.removeItem('purchaseCartSnapshot');
      setPendingCartSnapshot(null);
      return null;
    }

    const snapshot: CartSnapshot = {
      items: cloneCartItems(cartItems),
      warehouseId: cartItems[0]?.warehouseId ?? ''
    };

    sessionStorage.setItem('purchaseCartSnapshot', JSON.stringify(snapshot));
    setPendingCartSnapshot(snapshot);
    return snapshot;
  };

  const cartSnapshotForForm = useMemo<CartSnapshot | null>(() => {
    if (requestToEdit) {
      return null;
    }
    if (pendingCartSnapshot) {
      return pendingCartSnapshot;
    }
    if (cartItems.length === 0) {
      return null;
    }
    return {
      items: cloneCartItems(cartItems),
      warehouseId: cartItems[0]?.warehouseId ?? ''
    };
  }, [requestToEdit, pendingCartSnapshot, cartItems, cloneCartItems]);

  const cartItemsForForm = requestToEdit ? undefined : (cartSnapshotForForm?.items ?? cartItems);

  const openCreateRequest = () => {
    handleUseCartForRequest();
    setRequestToEdit(null);
    setActiveView('request');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const backToList = () => {
    setActiveView('list');
    setRequestToEdit(null);
    handleUseCartForRequest();
    void refreshRequests();
  };

  const handleEditRequest = (request: PurchaseRequest) => {
    setRequestToEdit(request);
    setActiveView('request');
  };

  const handleCancelPurchaseRequest = async (requestId: string) => {
    if (!requestId) {
      toast.error('Unable to identify the request to cancel');
      return;
    }

    await handleCancel(requestId);
  };

  const handleAlreadyBought = (request: PurchaseRequest) => {
    const actionKey = (request.requestId ?? request.requestNumber)?.toString();
    if (!actionKey) {
      toast.error('Unable to identify the request to confirm');
      return;
    }
    setPurchaseToConfirm(request);
    setConfirmPurchaseOpen(true);
  };

  const handleConfirmDialogChange = (open: boolean) => {
    setConfirmPurchaseOpen(open);
    if (!open) {
      setPurchaseToConfirm(null);
    }
  };

  const handleConfirmPurchase = async (quantities: Record<string, number>) => {
    if (!purchaseToConfirm) {
      return;
    }

    const actionKey = (purchaseToConfirm.requestId ?? purchaseToConfirm.requestNumber)?.toString();
    if (!actionKey) {
      toast.error('Unable to identify the request to confirm');
      return;
    }

    await handleConfirmBought(actionKey, quantities);
  };

  if (activeView === 'request') {
    if (!currentUser) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">User information not available</p>
              <Button variant="outline" onClick={backToList} className="mt-4">
                ← Back to Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <PurchaseForm
          currentUser={currentUser}
          onBack={backToList}
          initialRequest={requestToEdit}
          cartItems={cartItemsForForm}
          cartSnapshot={cartSnapshotForForm}
          clearCart={handleClearCart}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style>{actionButtonAnimationStyles}</style>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Purchase Requests</h1>
          <p className="text-muted-foreground">Manage your equipment purchase requests</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={openCreateRequest}>
            <Plus className="h-4 w-4 mr-2" />
            Request Purchase
          </Button>
        </div>
      </div>

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
                {warehousesForFilter.map((wh) => (
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
                {VISIBLE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label} ({getStatusCount(status.value)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
        <div className="space-y-4">
          {filteredPurchaseRequests.map((request, index) => {
            const meta = computeRequestMeta(request, index);
            const isExpanded = expandedRows.has(meta.rowKey);
            const toggleDetails = () => toggleRow(meta.rowKey);
            const totalSummary = `${meta.totalItems} items • ${meta.totalQuantity} pieces`;

            return (
              <Card key={meta.rowKey}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={toggleDetails}>
                    <div className="space-y-1">
                      <p className="font-mono text-sm font-semibold">Request {meta.identifier}</p>
                      <p className="text-xs text-muted-foreground">{meta.warehouseName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {meta.reasonLabel && (
                          <Badge className={meta.reasonClass} variant="secondary">
                            {meta.reasonLabel}
                          </Badge>
                        )}
                        <Badge className={meta.statusClass} variant="secondary">
                          {meta.statusLabel}
                        </Badge>
                        {meta.selfPurchase && <Badge variant="outline">Self purchase</Badge>}
                        {meta.clientBilled && <Badge variant="outline">Client billed</Badge>}
                      </div>
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
                      <p className="text-muted-foreground uppercase tracking-wide">Client</p>
                      <p>{meta.companyLabel || '—'}</p>
                      {meta.customerLabel && <p>{meta.customerLabel}</p>}
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">Work order</p>
                      <p>{meta.workOrderLabel || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">Location</p>
                      {meta.hasLocation ? (
                        <div className="space-y-1">
                          {meta.locationAddress && <p className="text-foreground">{meta.locationAddress}</p>}
                          {meta.locationZip && <p className="text-muted-foreground">ZIP: {meta.locationZip}</p>}
                          {meta.locationUrl && (
                            <a
                              href={meta.locationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              Open map
                            </a>
                          )}
                        </div>
                      ) : (
                        <p>—</p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">Estimated delivery</p>
                      <p>{meta.expectedDelivery}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">Estimated cost</p>
                      <p className="font-medium text-foreground">{meta.totalCostDisplay}</p>
                      <p className="text-muted-foreground mt-1">{totalSummary}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 h-auto py-2 px-4"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleEditRequest(request);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                     {/* Edit */}
                    </Button>
                    <Button
                      className="action-btn-enhance btn-approve gap-2 h-auto py-2 px-4"
                      disabled={!canConfirmBought(request)}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleAlreadyBought(request);
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirm
                    </Button>
                    <Button
                      className="action-btn-enhance btn-cancel p-2 h-auto"
                      disabled={!canCancelRequest(request)}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        void handleCancelPurchaseRequest(meta.actionKey || meta.rowKey);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 border-t pt-3">
                      <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                        <p>Created: {meta.createdDate}</p>
                        <p>Ordered: {meta.orderedDate}</p>
                        <p>Expected delivery: {meta.expectedDelivery}</p>
                        <p>Received: {meta.receivedDate}</p>
                        {meta.notesText && <p className="text-foreground">Notes: {meta.notesText}</p>}
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Items ({request.items.length})</h4>
                        {request.items.map((item, itemIndex) => {
                          const itemCost = item.cost ?? item.estimatedCost;
                          return (
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
                                  <Badge variant="secondary">x{item.quantity}</Badge>
                                </div>
                                {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  {typeof itemCost === 'number' && <span>{formatCurrency(itemCost)}</span>}
                                  {item.productUrl && (
                                    <a href={item.productUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                      View product
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]" />
                    <TableHead>Request</TableHead>
                    <TableHead>Project &amp; client</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchaser</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseRequests.map((request, index) => {
                    const meta = computeRequestMeta(request, index);
                    const isExpanded = expandedRows.has(meta.rowKey);
                    const toggleDetails = () => toggleRow(meta.rowKey);
                    const totalSummary = `${meta.totalItems} items • ${meta.totalQuantity} pieces`;

                    return (
                      <React.Fragment key={meta.rowKey}>
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={toggleDetails}>
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
                              <div className="flex gap-1 flex-wrap">
                                {/*<Badge variant="outline">{meta.selfPurchase ? 'Me' : 'Keeper'}</Badge>*/}
                                {meta.hasNotes && <Badge variant="outline">Notes</Badge>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">{meta.projectLabel}</p>
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                                {meta.companyLabel && <span>{meta.companyLabel}</span>}
                                {meta.customerLabel && <span>{meta.customerLabel}</span>}
                              </div>
                              {meta.workOrderLabel && (
                                <p className="text-xs text-muted-foreground">Work order: {meta.workOrderLabel}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <p className="text-sm text-foreground">{meta.reasonLabel ?? '—'}</p>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex flex-wrap gap-1">
                              <Badge className={meta.statusClass} variant="secondary">
                                {meta.statusLabel}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">{meta.purchaserLabel}</p>
                              <p className="text-xs text-muted-foreground">{meta.billingLabel}</p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">{meta.totalCostDisplay}</p>
                              <p className="text-xs text-muted-foreground">{totalSummary}</p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex items-start justify-end gap-2">
                              <Button
                                variant="outline"
                                className="gap-2 h-auto py-2 px-4"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  handleEditRequest(request);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                               {/* Edit */}
                              </Button>
                              <Button
                                className="action-btn-enhance btn-approve gap-2 h-auto py-2 px-4"
                                disabled={!canConfirmBought(request)}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  handleAlreadyBought(request);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Confirm
                              </Button>
                              <Button
                                className="action-btn-enhance btn-cancel p-2 h-auto"
                                disabled={!canCancelRequest(request)}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  void handleCancelPurchaseRequest(meta.actionKey || meta.rowKey);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/20 p-0">
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
                                    <p className="mt-1 text-foreground">{meta.notesText || 'No additional notes'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Owner</p>
                                    <p className="mt-1">{meta.selfPurchase ? 'Requester purchases' : 'Keeper purchases'}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {meta.clientBilled ? 'Billed to client' : 'Not billed to client'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
                                    {meta.hasLocation ? (
                                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                                        {meta.locationAddress && <li className="text-foreground">Address: {meta.locationAddress}</li>}
                                        {meta.locationZip && <li>ZIP: {meta.locationZip}</li>}
                                        {meta.locationUrl && (
                                          <li>
                                            <a
                                              href={meta.locationUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-primary hover:underline"
                                            >
                                              Open map
                                            </a>
                                          </li>
                                        )}
                                      </ul>
                                    ) : (
                                      <p className="mt-1 text-muted-foreground">No location info</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Dates</p>
                                    <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                                      <li>Created: {meta.createdDate}</li>
                                      <li>Ordered: {meta.orderedDate}</li>
                                      <li>Expected delivery: {meta.expectedDelivery}</li>
                                      <li>Received: {meta.receivedDate}</li>
                                    </ul>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold mb-3">Items ({request.items.length})</h4>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {request.items.map((item, itemIndex) => {
                                      const itemCost = item.cost ?? item.estimatedCost;

                                      return (
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
                                              <Badge variant="secondary">x{item.quantity}</Badge>
                                            </div>
                                            {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                                            {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                              {typeof itemCost === 'number' && <span>{formatCurrency(itemCost)}</span>}
                                              {item.productUrl && (
                                                <a href={item.productUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                  View product
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
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

      <ModalConfirmPurchase
        open={confirmPurchaseOpen}
        onOpenChange={handleConfirmDialogChange}
        request={purchaseToConfirm}
        onConfirm={handleConfirmPurchase}
      />

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

export default PurchaseRequests;