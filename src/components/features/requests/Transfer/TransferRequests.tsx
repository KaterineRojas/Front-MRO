import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Label } from '../../../ui/label';
import { 
  Package, ArrowLeftRight, ChevronDown, ChevronRight, Trash2, CheckCircle, X
} from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { toast } from 'sonner';
import { getProjects, type Project } from '../../enginner/services';
import { useTransfers } from './useTransfers';
import { TransferForm } from './TransferForm';
import { formatDate, getStatusColor, getStatusText } from './transferUtils';
import { getAvailableUsers, type Transfer, type User } from './transferService';


export function TransferRequests() {
  const [showTransferMode, setShowTransferMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [transferToAccept, setTransferToAccept] = useState<Transfer | null>(null);
  const [confirmTransferOpen, setConfirmTransferOpen] = useState(false);

  const {
    filteredTransfers,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    expandedRows,
    toggleRow,
    handleCancel,
    handleAccept,
    handleReject,
    getStatusCount,
    getTypeCount,
    canCancelTransfer,
    refreshTransfers
  } = useTransfers();

  // Load projects and users
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, usersData] = await Promise.all([
          getProjects(),
          getAvailableUsers()
        ]);
        setProjects(projectsData);
        setUsers(usersData);
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
    setConfirmTransferOpen(true);
  };

  const confirmTransferAccept = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }
    
    if (transferToAccept) {
      const selectedProjectData = projects.find(p => p.id === selectedProject);
      await handleAccept(transferToAccept.id, selectedProject);
      toast.success(`Items assigned to ${selectedProjectData?.name}.`);
      setConfirmTransferOpen(false);
      setTransferToAccept(null);
      setSelectedProject('');
    }
  };

  const handleCancelClick = (transferId: string) => {
    if (window.confirm('Are you sure you want to cancel this transfer?')) {
      handleCancel(transferId);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({getStatusCount('all')})</SelectItem>
                <SelectItem value="pending-manager">Pending Manager ({getStatusCount('pending-manager')})</SelectItem>
                <SelectItem value="pending-engineer">Pending Engineer ({getStatusCount('pending-engineer')})</SelectItem>
                <SelectItem value="approved">Approved ({getStatusCount('approved')})</SelectItem>
                <SelectItem value="rejected">Rejected ({getStatusCount('rejected')})</SelectItem>
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
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
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
                    onClick={() => toggleRow(transfer.id)}
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
                        <Badge variant="outline">
                          {transfer.type === 'outgoing' ? 'Outgoing' : 'Incoming'}
                        </Badge>
                        <Badge className={getStatusColor(transfer.status)} variant="secondary">
                          {getStatusText(transfer.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {transfer.type === 'incoming' && transfer.status === 'pending-engineer' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTransferAcceptStart(transfer)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(transfer.id)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {canCancelTransfer(transfer) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelClick(transfer.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
                      <h4 className="text-sm mb-2">Items:</h4>
                      <div className="space-y-2">
                        {transfer.items.map((item, index) => (
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
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <React.Fragment key={transfer.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(transfer.id)}
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
                        <Badge variant="outline">
                          {transfer.type === 'outgoing' ? 'Outgoing' : 'Incoming'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transfer.type === 'outgoing' ? transfer.toUser : transfer.fromUser}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transfer.items.length} item{transfer.items.length !== 1 ? 's' : ''}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(transfer.items.map(item => item.warehouseCode).filter(Boolean))).map((wh, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{wh}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(transfer.requestDate)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transfer.status)} variant="secondary">
                          {getStatusText(transfer.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {transfer.type === 'incoming' && transfer.status === 'pending-engineer' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTransferAcceptStart(transfer)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReject(transfer.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {canCancelTransfer(transfer) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelClick(transfer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(transfer.id) && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/30 p-0">
                          <div className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm mb-2">Items:</h4>
                                <div className="space-y-2">
                                  {transfer.items.map((item, index) => (
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
                              {transfer.notes && (
                                <div>
                                  <h4 className="text-sm mb-1">Notes:</h4>
                                  <p className="text-sm text-muted-foreground">{transfer.notes}</p>
                                </div>
                              )}
                            </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this transfer?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {transferToAccept && (
              <>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={users.find(u => u.id === transferToAccept.fromUserId)?.avatar} 
                      alt={transferToAccept.fromUser} 
                    />
                    <AvatarFallback>
                      {transferToAccept.fromUser?.split(' ').map(n => n[0]).join('') || 'NA'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>From</p>
                    <p className="text-muted-foreground">{transferToAccept.fromUser}</p>
                    <p className="text-sm text-muted-foreground">
                      {users.find(u => u.id === transferToAccept.fromUserId)?.department}
                    </p>
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
                  <Label htmlFor="project-select">Assign to Project *</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger id="project-select" className="mt-2">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmTransferOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmTransferAccept} disabled={!selectedProject}>
              Accept Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default export para compatibilidad con diferentes tipos de import
export default TransferRequests;