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
import { ProjectDetails } from '../shared/ProjectDetails';

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
                      {/* Project Details Chain */}
                      <ProjectDetails
                        companyLabel={meta.companyLabel}
                        customerLabel={meta.customerLabel}
                        projectLabel={meta.projectLabel}
                        workOrderLabel={meta.workOrderLabel}
                      />

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
                    <TableHead>Project</TableHead>
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
                                {/* Project Details Chain */}
                                <ProjectDetails
                                  companyLabel={meta.companyLabel}
                                  customerLabel={meta.customerLabel}
                                  projectLabel={meta.projectLabel}
                                  workOrderLabel={meta.workOrderLabel}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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

                                  {/* Owner */}
                                  <div className="bg-sky-50 dark:bg-sky-950/40 rounded-lg p-3 border border-sky-200 dark:border-sky-800 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                      </div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Owner</p>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{meta.selfPurchase ? 'Requester purchases' : 'Keeper purchases'}</p>
                                    <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${meta.clientBilled ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300'}`}>
                                      {meta.clientBilled ? '✓ Billed to client' : 'Not billed to client'}
                                    </span>
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
                                        {meta.locationAddress && (
                                          <p className="text-sm text-foreground">{meta.locationAddress}</p>
                                        )}
                                        {meta.locationZip && (
                                          <span className="inline-block px-2 py-0.5 bg-sky-100 dark:bg-sky-900/50 rounded text-xs text-sky-700 dark:text-sky-300">ZIP: {meta.locationZip}</span>
                                        )}
                                        {meta.locationUrl && (
                                          <a
                                            href={meta.locationUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                          >
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
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created</span>
                                        <span className="text-foreground font-medium">{meta.createdDate}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Ordered</span>
                                        <span className="text-foreground font-medium">{meta.orderedDate}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Expected</span>
                                        <span className="text-foreground font-medium">{meta.expectedDelivery}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Received</span>
                                        <span className="text-foreground font-medium">{meta.receivedDate}</span>
                                      </div>
                                    </div>
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