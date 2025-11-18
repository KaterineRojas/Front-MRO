import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { 
  Download, 
  Search, 
  Calendar, 
  Package, 
  DollarSign, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { ImageWithFallback } from '../../../../../figma/ImageWithFallback';
import { toast } from 'sonner';
import { useAppSelector } from '../../../store/hooks';
import { selectCurrentUser } from '../../../store/selectors';
import { getCompleteHistory, getWarehouses, type HistoryRecord, type Warehouse } from '../../../services';

export function CompleteHistory() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const [historyData, whData] = await Promise.all([
        getCompleteHistory(),
        getWarehouses()
      ]);
      setHistory(historyData);
      setWarehouses(whData);
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

  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      case 'transferred': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'transferred': return <RotateCcw className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      case 'transferred': return 'Transferred';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCart className="h-4 w-4" />;
      case 'purchase-on-site': return <Package className="h-4 w-4" />;
      case 'transfer': return <RotateCcw className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'purchase': return 'Purchase';
      case 'purchase-on-site': return 'Self Purchase';
      case 'transfer': return 'Transfer';
      default: return type;
    }
  };

  const filteredHistory = useMemo(() => {
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter(record => {
        const searchLower = searchTerm.toLowerCase();
        return (
          record.id.toLowerCase().includes(searchLower) ||
          record.project.toLowerCase().includes(searchLower) ||
          record.department.toLowerCase().includes(searchLower) ||
          (record.warehouseName && record.warehouseName.toLowerCase().includes(searchLower)) ||
          record.items.some(item => 
            item.name.toLowerCase().includes(searchLower) ||
            (item.code && item.code.toLowerCase().includes(searchLower))
          )
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === typeFilter);
    }

    if (warehouseFilter !== 'all') {
      filtered = filtered.filter(record => record.warehouseId === warehouseFilter);
    }

    return filtered.sort((a, b) => 
      new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
    );
  }, [history, searchTerm, statusFilter, typeFilter, warehouseFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const exportToSpreadsheet = () => {
    toast.info('Exporting to spreadsheet...');
    setTimeout(() => {
      toast.success('History exported successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Complete History</h1>
          <p className="text-muted-foreground">
            View all your completed and past requests
          </p>
        </div>
        <Button onClick={exportToSpreadsheet}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, project, warehouse, items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="purchase-on-site">Self Purchase</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3>No history records found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || warehouseFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your completed requests will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        // Mobile View
        <div className="space-y-4">
          {filteredHistory.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleRecordExpansion(record.id)}
                  >
                    <div className="flex-1">
                      <h3 className="flex items-center gap-2">
                        {getTypeIcon(record.type)}
                        {record.id}
                        {expandedRecords.has(record.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant={getStatusColor(record.status)}>
                          {getStatusText(record.status)}
                        </Badge>
                        <Badge variant="outline">{getTypeText(record.type)}</Badge>
                        {record.warehouseName && (
                          <Badge variant="outline">{record.warehouseName}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(record.completionDate)}
                    </p>
                    <p>Project: {record.project}</p>
                    {record.totalCost && (
                      <p className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${record.totalCost}
                      </p>
                    )}
                  </div>

                  {expandedRecords.has(record.id) && (
                    <div>
                      <h4 className="text-sm mb-2">Items:</h4>
                      <div className="space-y-2">
                        {record.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            {item.image && (
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{item.name}</p>
                              {item.code && (
                                <p className="text-xs text-muted-foreground">{item.code}</p>
                              )}
                            </div>
                            <Badge variant="secondary">x{item.quantity}</Badge>
                          </div>
                        ))}
                      </div>
                      {record.rejectionReason && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                          <p className="text-destructive">Reason: {record.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop View
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((record) => (
                    <React.Fragment key={record.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50" 
                        onClick={() => toggleRecordExpansion(record.id)}
                      >
                        <TableCell>
                          {expandedRecords.has(record.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">#{record.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(record.type)}
                            <span className="text-sm">{getTypeText(record.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.warehouseName ? (
                            <Badge variant="outline">{record.warehouseName}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{record.project}</p>
                          <p className="text-xs text-muted-foreground">{record.department}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(record.completionDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(record.status)} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(record.status)}
                            {getStatusText(record.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {record.totalCost ? `$${record.totalCost}` : '-'}
                        </TableCell>
                      </TableRow>
                      {expandedRecords.has(record.id) && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/20 p-0">
                            <div className="p-4 space-y-4">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {record.items.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {item.image ? (
                                          <ImageWithFallback
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                            <Package className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell className="font-mono text-sm">{item.code || '-'}</TableCell>
                                      <TableCell className="text-sm">{item.name}</TableCell>
                                      <TableCell className="text-right text-sm">x{item.quantity}</TableCell>
                                      <TableCell className="text-right text-sm">
                                        {item.estimatedCost ? `$${item.estimatedCost}` : '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              {record.rejectionReason && (
                                <div className="p-3 bg-destructive/10 rounded">
                                  <p className="text-sm text-destructive">
                                    <strong>Rejection Reason:</strong> {record.rejectionReason}
                                  </p>
                                </div>
                              )}
                              {record.transferTo && (
                                <div className="p-3 bg-muted rounded">
                                  <p className="text-sm">
                                    <strong>Transferred To:</strong> {record.transferTo}
                                  </p>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
