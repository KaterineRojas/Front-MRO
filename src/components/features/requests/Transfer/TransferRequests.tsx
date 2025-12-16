import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Label } from '../../../ui/label';
import { 
  Package, ArrowLeftRight, ChevronDown, ChevronRight, Trash2, CheckCircle, X
} from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { toast } from 'sonner';
import { useAppSelector } from '../../../../store/hooks';
import { getProjects, type Project } from '../../enginner/services';
import { useTransfers } from './useTransfers';
import { TransferForm } from './TransferForm';
import { formatDate, getStatusColor, getStatusText } from './transferUtils';
import { getTransferId, type Transfer } from './transferService';
import {
  getCompanies,
  getCustomersByCompany,
  getProjectsByCustomer,
  getWorkOrdersByProject,
  type Company,
  type Customer,
  type WorkOrder,
  type Project as SharedProject
} from '../services/sharedServices';
import { actionButtonAnimationStyles } from '../styles/actionButtonStyles';

const typeBadgeClassNames: Record<Transfer['type'], string> = {
  outgoing: 'bg-amber-200 text-amber-950 border-amber-300 dark:bg-amber-900/50 dark:text-amber-50 dark:border-amber-800',
  incoming: 'bg-sky-200 text-sky-950 border-sky-300 dark:bg-sky-900/50 dark:text-sky-50 dark:border-sky-800'
};

const formatWorkOrderDate = (value?: string) => {
  if (!value) return 'No date provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function TransferRequests() {
  const [showTransferMode, setShowTransferMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sharedProjectsList, setSharedProjectsList] = useState<SharedProject[]>([]);

  const [selectedProject, setSelectedProject] = useState<string>('');
  const [transferToAccept, setTransferToAccept] = useState<Transfer | null>(null);
  const [confirmTransferOpen, setConfirmTransferOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [transferToRejectId, setTransferToRejectId] = useState<string | null>(null);
  const [transferToCancelId, setTransferToCancelId] = useState<string | null>(null);
  const [expandedTransferDetails, setExpandedTransferDetails] = useState<Record<string, Transfer>>({});
  const [loadingTransferIds, setLoadingTransferIds] = useState<Set<string>>(new Set());

  // Company, Customer, Project, Work Order states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string>('');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrderDetails, setSelectedWorkOrderDetails] = useState<WorkOrder | null>(null);
  const [workOrderDetailModalOpen, setWorkOrderDetailModalOpen] = useState(false);

  // Loading states for cascading selects
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);

  const currentUser = useAppSelector((state) => state.auth.user);

  const {
    filteredTransfers,
    isLoading,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    expandedRows,
    toggleRow,
    handleCancel,
    handleAccept,
    handleReject,
    getTypeCount,
    canCancelTransfer,
    refreshTransfers
  } = useTransfers();

  // Load projects
  useEffect(() => {
    const loadData = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };
    loadData();
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

  const handleTransferAcceptStart = (transfer: Transfer) => {
    setTransferToAccept(transfer);
    setSelectedProject('');
    setSelectedCompany('');
    setSelectedCustomer('');
    setSelectedWorkOrder('');
    setSelectedWorkOrderDetails(null);
    setWorkOrderDetailModalOpen(false);
    setConfirmTransferOpen(true);
    
    // Load companies when opening modal
    loadCompanies();

    // Load transfer details to get the full imageUrl
    const loadTransferDetails = async () => {
      try {
        const transferDetails = await getTransferId(transfer.id);
        // Update transferToAccept with the complete details including imageUrl
        setTransferToAccept(transferDetails);
      } catch (error) {
        console.error('Error loading transfer details for image:', error);
        // Keep the original transfer data if fetch fails
      }
    };

    loadTransferDetails();
  };

  const loadCompanies = async () => {
    if (companiesLoaded || loadingCompanies) return;
    
    setLoadingCompanies(true);
    try {
      const companyData = await getCompanies();
      setCompanies(companyData);
      setCompaniesLoaded(true);
    } catch (error: any) {
      toast.error('Failed to load companies');
      console.error('Error loading companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Load customers when company changes
  useEffect(() => {
    if (!selectedCompany) {
      setCustomers([]);
      setSharedProjectsList([]);
      setWorkOrders([]);
      setSelectedCustomer('');
      setSelectedProject('');
      setSelectedWorkOrder('');
      return;
    }

    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const customerData = await getCustomersByCompany(selectedCompany);
        setCustomers(customerData);
      } catch (error: any) {
        toast.error('Failed to load customers');
        console.error('Error loading customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, [selectedCompany]);

  // Load projects when customer changes
  useEffect(() => {
    if (!selectedCustomer) {
      setSharedProjectsList([]);
      setWorkOrders([]);
      setSelectedProject('');
      setSelectedWorkOrder('');
      return;
    }

    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const projectData = await getProjectsByCustomer(selectedCompany, selectedCustomer);
        setSharedProjectsList(projectData);
      } catch (error: any) {
        toast.error('Failed to load projects');
        console.error('Error loading projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [selectedCustomer, selectedCompany]);

  // Load work orders when project changes
  useEffect(() => {
    if (!selectedProject) {
      setWorkOrders([]);
      setSelectedWorkOrder('');
      return;
    }

    const loadWorkOrders = async () => {
      setLoadingWorkOrders(true);
      try {
        const workOrderData = await getWorkOrdersByProject(selectedCompany, selectedCustomer, selectedProject);
        setWorkOrders(workOrderData);
      } catch (error: any) {
        toast.error('Failed to load work orders');
        console.error('Error loading work orders:', error);
      } finally {
        setLoadingWorkOrders(false);
      }
    };

    loadWorkOrders();
  }, [selectedProject, selectedCompany, selectedCustomer]);

  const confirmTransferAccept = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }

    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (!currentUser) {
      toast.error('User information not available');
      return;
    }
    
    if (transferToAccept) {
      const selectedProjectData = sharedProjectsList.find(p => p.id === selectedProject);
      
      // Call handleAccept with all required parameters
      await handleAccept(
        transferToAccept.id,
        currentUser.employeeId || '',
        selectedCompany,
        selectedCustomer,
        currentUser.department,
        selectedProject,
        selectedWorkOrder,
        ''
      );
      
      toast.success(`Items assigned to ${selectedProjectData?.name}.`);
      setConfirmTransferOpen(false);
      setTransferToAccept(null);
      setSelectedProject('');
      setSelectedCompany('');
      setSelectedCustomer('');
    }
  };

  const handleRejectClick = (transferId: string) => {
    setTransferToRejectId(transferId);
    setRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setTransferToRejectId(null);
  };

  const confirmRejectTransfer = async () => {
    if (!transferToRejectId) return;
    await handleReject(transferToRejectId);
    closeRejectDialog();
  };

  const handleCancelClick = (transferId: string) => {
    setTransferToCancelId(transferId);
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setTransferToCancelId(null);
  };

  const confirmCancelTransfer = async () => {
    if (!transferToCancelId) return;
    await handleCancel(transferToCancelId);
    closeCancelDialog();
  };

  const handleExpandTransfer = async (transferId: string) => {
    // Si ya está expandido, simplemente contraerlo
    if (expandedRows.has(transferId)) {
      toggleRow(transferId);
      return;
    }

    // Si los detalles ya están cargados, solo expandir
    if (expandedTransferDetails[transferId]) {
      toggleRow(transferId);
      return;
    }

    // Cargar detalles del transfer
    try {
      setLoadingTransferIds(prev => new Set(prev).add(transferId));
      const transferDetails = await getTransferId(transferId);
      setExpandedTransferDetails(prev => ({
        ...prev,
        [transferId]: transferDetails
      }));
      toggleRow(transferId);
    } catch (error) {
      console.error('Error loading transfer details:', error);
      toast.error('Failed to load transfer details');
    } finally {
      setLoadingTransferIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(transferId);
        return newSet;
      });
    }
  };

  const handleTransferSuccess = () => {
    setShowTransferMode(false);
    refreshTransfers();
  };

  // Show transfer form
  if (showTransferMode) {
    return (
      <TransferForm 
        onBack={() => setShowTransferMode(false)}
        onSuccess={handleTransferSuccess}
      />
    );
  }

  // Main transfers list view
  return (
    <div className="space-y-6">
      <style>{actionButtonAnimationStyles}</style>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Transfers</h1>
          <p className="text-muted-foreground">
            Manage your equipment transfers with other engineers
          </p>
        </div>
        <Button onClick={() => setShowTransferMode(true)}>
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Make Transfer
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Search by user, items, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({getTypeCount('all')})</SelectItem>
                <SelectItem value="outgoing">Outgoing ({getTypeCount('outgoing')})</SelectItem>
                <SelectItem value="incoming">Incoming ({getTypeCount('incoming')})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transfer List - Mobile Card View or Desktop Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading transfers...</p>
          </CardContent>
        </Card>
      ) : filteredTransfers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3>No transfers found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'Your transfers will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile Card View
        <div className="space-y-4">
          {filteredTransfers.map((transfer) => (
            <Card key={transfer.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => handleExpandTransfer(transfer.id)}
                  >
                    <div className="flex-1">
                      <h3 className="flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        Transfer #{transfer.id}
                        {expandedRows.has(transfer.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge className={typeBadgeClassNames[transfer.type]}>
                          {transfer.type === 'outgoing' ? 'Outgoing' : 'Incoming'}
                        </Badge>
                        <Badge className={getStatusColor(transfer.status)} variant="secondary">
                          {getStatusText(transfer.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {transfer.type === 'incoming' && (
                        <>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="action-btn-enhance btn-accept h-auto py-2 px-4"
                                  onClick={() => handleTransferAcceptStart(transfer)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={8}>Accept transfer</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="action-btn-enhance btn-reject p-2 h-auto"
                                      onClick={() => handleRejectClick(transfer.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={8}>Reject transfer</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                      {canCancelTransfer(transfer) && (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="action-btn-enhance btn-cancel p-2 h-auto"
                                onClick={() => handleCancelClick(transfer.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>Delete transfer</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Date: {formatDate(transfer.requestDate)}</p>
                    <p>{transfer.type === 'outgoing' ? `To: ${transfer.toUser}` : `From: ${transfer.fromUser}`}</p>
                    {transfer.notes && <p className="text-xs">Notes: {transfer.notes}</p>}
                  </div>

                  {expandedRows.has(transfer.id) && (
                    <div>
                      {loadingTransferIds.has(transfer.id) ? (
                        <p className="text-sm text-muted-foreground">Loading items...</p>
                      ) : (
                        <>
                          <h4 className="text-sm mb-2">Items:</h4>
                          <div className="space-y-2">
                            {(expandedTransferDetails[transfer.id]?.items || transfer.items).map((item, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                {item.image && (
                                  <ImageWithFallback
                                    src={item.image}
                                    alt={item.itemName}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{item.itemName}</p>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                  )}
                                  {item.warehouseCode && (
                                    <Badge className="text-xs mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{item.warehouseCode}</Badge>
                                  )}
                                </div>
                                <Badge variant="secondary">x{item.quantity}</Badge>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <React.Fragment key={transfer.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleExpandTransfer(transfer.id)}
                    >
                      <TableCell>
                        {expandedRows.has(transfer.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell>#{transfer.id}</TableCell>
                      <TableCell>
                        {transfer.type === 'outgoing' ? transfer.toUser : transfer.fromUser}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transfer.items.length} item{transfer.items.length !== 1 ? 's' : ''}</Badge>
                      </TableCell>
                      <TableCell>
                        {transfer.warehouseName || 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(transfer.requestDate)}</TableCell>
                      <TableCell>
                        <Badge className={typeBadgeClassNames[transfer.type]}>
                          {transfer.type === 'outgoing' ? 'Outgoing' : 'Incoming'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transfer.status)} variant="secondary">
                          {getStatusText(transfer.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {transfer.type === 'incoming' && (
                            <>
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="action-btn-enhance btn-accept gap-2 h-auto py-2 px-4"
                                      onClick={() => handleTransferAcceptStart(transfer)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={8}>Accept transfer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="action-btn-enhance btn-reject p-2 h-auto"
                                      onClick={() => handleRejectClick(transfer.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={8}>Reject transfer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                          {canCancelTransfer(transfer) && (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className="action-btn-enhance btn-cancel gap-2 h-auto py-2 px-4"
                                    onClick={() => handleCancelClick(transfer.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Cancel
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={8}>Delete transfer</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(transfer.id) && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/30 p-0">
                          <div className="p-4">
                            {loadingTransferIds.has(transfer.id) ? (
                              <p className="text-sm text-muted-foreground">Loading transfer details...</p>
                            ) : (
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm mb-2">Items:</h4>
                                  <div className="space-y-2">
                                    {(expandedTransferDetails[transfer.id]?.items || transfer.items).map((item, index) => (
                                      <div key={index} className="flex items-center gap-3 p-2 bg-background rounded border">
                                        {item.image && (
                                          <ImageWithFallback
                                            src={item.image}
                                            alt={item.itemName}
                                            className="w-12 h-12 object-cover rounded"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <p>{item.itemName}</p>
                                          {item.code && (
                                            <p className="text-sm text-muted-foreground">{item.code}</p>
                                          )}
                                          {item.description && (
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {item.warehouseCode && (
                                            <Badge variant="outline" className="text-xs">{item.warehouseCode}</Badge>
                                          )}
                                          <Badge variant="secondary">Qty: {item.quantity}</Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {(expandedTransferDetails[transfer.id]?.notes || transfer.notes) && (
                                  <div>
                                    <h4 className="text-sm mb-1">Notes:</h4>
                                    <p className="text-sm text-muted-foreground">{expandedTransferDetails[transfer.id]?.notes || transfer.notes}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Accept Transfer Confirmation Dialog */}
      <Dialog open={confirmTransferOpen} onOpenChange={setConfirmTransferOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Accept Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this transfer?
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-4">
              {transferToAccept && (
                <>
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        alt={transferToAccept.fromUser} 
                      />
                      <AvatarFallback>
                        {transferToAccept.fromUser?.split(' ').map(n => n[0]).join('') || 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>From</p>
                      <p className="text-muted-foreground">{transferToAccept.fromUser}</p>
                    </div>
                  </div>

                  {transferToAccept.transferPhoto && (
                    <div>
                      <h4 className="text-sm mb-2">Transfer Photo:</h4>
                      <img
                        src={transferToAccept.transferPhoto}
                        alt="Transfer evidence"
                        className="w-full h-48 object-cover rounded border"
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm mb-2">Items:</h4>
                    <div className="space-y-2">
                      {transferToAccept.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          {item.image && (
                            <ImageWithFallback
                              src={item.image}
                              alt={item.itemName}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{item.itemName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">{item.code}</p>
                              {item.warehouseCode && (
                                <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{item.warehouseCode}</Badge>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary">x{item.quantity}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company-select">Company *</Label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger id="company-select" className="mt-2">
                        <SelectValue placeholder={
                          loadingCompanies ? "Loading companies..." : "Select a company"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.name} value={company.name}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="customer-select">Customer *</Label>
                    <Select 
                      value={selectedCustomer} 
                      onValueChange={setSelectedCustomer}
                      disabled={!selectedCompany || loadingCustomers}
                    >
                      <SelectTrigger id="customer-select" className="mt-2">
                        <SelectValue placeholder={
                          !selectedCompany ? "Select company first" :
                          loadingCustomers ? "Loading customers..." :
                          "Select a customer"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.name}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="project-select">Project *</Label>
                    <Select 
                      value={selectedProject} 
                      onValueChange={setSelectedProject}
                      disabled={!selectedCustomer || loadingProjects}
                    >
                      <SelectTrigger id="project-select" className="mt-2">
                        <SelectValue placeholder={
                          !selectedCustomer ? "Select customer first" :
                          loadingProjects ? "Loading projects..." :
                          "Select a project"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {sharedProjectsList.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} ({project.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="workorder-select">Work Order</Label>
                    <Select 
                      value={selectedWorkOrder} 
                      onValueChange={(value: string) => {
                        setSelectedWorkOrder(value);
                        if (!value) {
                          setSelectedWorkOrderDetails(null);
                          return;
                        }
                        const details = workOrders.find((wo) => String(wo.id) === value);
                        if (details) {
                          setSelectedWorkOrderDetails(details);
                          setWorkOrderDetailModalOpen(true);
                        }
                      }}
                      disabled={!selectedProject || loadingWorkOrders}
                    >
                      <SelectTrigger id="workorder-select" className="mt-2">
                        <SelectValue placeholder={
                          !selectedProject ? "Select project first" :
                          loadingWorkOrders ? "Loading work orders..." :
                          "Select a work order (optional)"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {workOrders.map((wo) => (
                          <SelectItem key={wo.id} value={String(wo.id)}>
                            {wo.orderNumber} - {wo.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-end flex-shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setConfirmTransferOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmTransferAccept} disabled={!selectedProject}>
              Accept Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={workOrderDetailModalOpen && !!selectedWorkOrderDetails}
        onOpenChange={setWorkOrderDetailModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>
              Review the selected work order before assigning the transfer.
            </DialogDescription>
          </DialogHeader>
          {selectedWorkOrderDetails && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Order Number</p>
                <p className="font-semibold">
                  {selectedWorkOrderDetails.orderNumber || selectedWorkOrderDetails.wo}
                </p>
              </div>
              {selectedWorkOrderDetails.description && (
                <div>
                  <p className="text-muted-foreground text-xs">Description</p>
                  <p>{selectedWorkOrderDetails.description}</p>
                </div>
              )}
              {selectedWorkOrderDetails.serviceDesc && (
                <div>
                  <p className="text-muted-foreground text-xs">Service Description</p>
                  <p>{selectedWorkOrderDetails.serviceDesc}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">Start Date</p>
                  <p>{formatWorkOrderDate(selectedWorkOrderDetails.startDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">End Date</p>
                  <p>{formatWorkOrderDate(selectedWorkOrderDetails.endDate)}</p>
                </div>
              </div>
              {selectedWorkOrderDetails.status && (
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className="uppercase tracking-wide text-sm">
                    {selectedWorkOrderDetails.status}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setWorkOrderDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Transfer Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => (open ? setRejectDialogOpen(true) : closeRejectDialog())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this transfer request?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeRejectDialog}>
              Cancel
            </Button>
            <Button
              className="action-btn-enhance btn-reject gap-2 h-auto py-2 px-4"
              onClick={confirmRejectTransfer}
            >
              Confirm Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Transfer Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => (open ? setCancelDialogOpen(true) : closeCancelDialog())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this transfer request?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeCancelDialog}>
              Cancel
            </Button>
            <Button
              className="action-btn-enhance btn-cancel gap-2 h-auto py-2 px-4"
              onClick={confirmCancelTransfer}
            >
              Confirm Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default export para compatibilidad con diferentes tipos de import
export default TransferRequests;