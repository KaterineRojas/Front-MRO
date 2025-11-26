import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Checkbox } from '../../../ui/checkbox';
import { ScrollArea } from '../../../ui/scroll-area';
import { 
  Package, Plus, ChevronDown, ChevronRight, Trash2, CheckCircle,
  Calendar, User, X, Camera, Upload, ArrowLeftRight, Search, AlertCircle, ArrowLeft
} from 'lucide-react';
import { ImageWithFallback } from '../../../../../figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar';
import { toast } from 'sonner';
import { getProjects, type Project } from '../../../services';

interface Transfer {
  id: string;
  type: 'outgoing' | 'incoming';
  fromUser?: string;
  toUser?: string;
  fromUserId?: string;
  toUserId?: string;
  items: { itemId: string; itemName: string; code?: string; quantity: number; image: string; description?: string; warehouse?: string; warehouseCode?: string }[];
  notes: string;
  requestDate: string;
  status: 'pending-manager' | 'pending-engineer' | 'approved' | 'rejected';
  transferPhoto?: string;
}

interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  image: string;
  project: string;
  projectCode: string;
  quantity: number;
  sku?: string;
  warehouse?: string;
  warehouseCode?: string;
}

const mockUsers = [
  { id: '2', name: 'Ana Martínez', department: 'Development', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' },
  { id: '3', name: 'Luis González', department: 'Design', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis' },
  { id: '4', name: 'María Rodriguez', department: 'Marketing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
  { id: '5', name: 'Juan Pérez', department: 'Engineering', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan' }
];

const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-1',
    itemId: 'hammer-001',
    name: 'Hammer',
    description: 'Professional grade hammer',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    project: 'Proyecto Amazonas',
    projectCode: 'AMZ-2024',
    quantity: 4,
    sku: 'HAM-001',
    warehouse: 'Amax',
    warehouseCode: 'AMAX'
  },
  {
    id: 'inv-2',
    itemId: 'hammer-001',
    name: 'Hammer',
    description: 'Professional grade hammer',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    project: 'Proyecto Innova',
    projectCode: 'INN-2024',
    quantity: 6,
    sku: 'HAM-001',
    warehouse: 'Best',
    warehouseCode: 'BEST'
  },
  {
    id: 'inv-3',
    itemId: 'keyboard-001',
    name: 'Mechanical Keyboard RGB',
    description: 'Gaming keyboard with RGB lighting',
    image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 2,
    sku: 'MECH-KB-001',
    warehouse: 'Central',
    warehouseCode: 'CENT'
  },
  {
    id: 'inv-4',
    itemId: 'monitor-001',
    name: 'Samsung 27" Monitor',
    description: 'Full HD display',
    image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 1,
    sku: 'SAM-003',
    warehouse: 'Amax',
    warehouseCode: 'AMAX'
  },
  {
    id: 'inv-5',
    itemId: 'drill-001',
    name: 'Power Drill',
    description: 'Cordless drill with battery',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
    project: 'Proyecto Construcción',
    projectCode: 'CONS-2024',
    quantity: 3,
    sku: 'DRL-001',
    warehouse: 'Best',
    warehouseCode: 'BEST'
  }
];

const mockTransfers: Transfer[] = [
  {
    id: 'TR003',
    type: 'outgoing',
    toUser: 'Luis González',
    toUserId: '3',
    items: [
      {
        itemId: '1',
        itemName: 'Mechanical Keyboard RGB',
        code: 'MECH-KB-001',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=100',
        description: 'Gaming keyboard',
        warehouse: 'Central',
        warehouseCode: 'CENT'
      }
    ],
    notes: 'Transferring for their project',
    requestDate: '2024-01-17',
    status: 'pending-manager',
    transferPhoto: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400'
  },
  {
    id: 'TR001',
    type: 'incoming',
    fromUser: 'Juan Pérez',
    fromUserId: '5',
    items: [
      {
        itemId: '3',
        itemName: 'Samsung 27" Monitor',
        code: 'SAM-003',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=100',
        description: 'Full HD display',
        warehouse: 'Amax',
        warehouseCode: 'AMAX'
      }
    ],
    notes: 'Additional monitor for development project',
    requestDate: '2024-01-16',
    status: 'pending-engineer',
    transferPhoto: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400'
  },
  {
    id: 'TR004',
    type: 'outgoing',
    toUser: 'Ana Martínez',
    toUserId: '2',
    items: [
      {
        itemId: '1',
        itemName: 'Hammer',
        code: 'IT-HT-NC-2025001',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100',
        description: 'Professional grade hammer',
        warehouse: 'Amax',
        warehouseCode: 'AMAX'
      },
      {
        itemId: '1',
        itemName: 'Hammer',
        code: 'IT-HT-NC-2025001',
        quantity: 3,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100',
        description: 'Professional grade hammer',
        warehouse: 'Best',
        warehouseCode: 'BEST'
      },
      {
        itemId: '2',
        itemName: 'Power Drill',
        code: 'DRL-001',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=100',
        description: 'Cordless drill',
        warehouse: 'Central',
        warehouseCode: 'CENT'
      }
    ],
    notes: 'Multiple items from different warehouses for construction project',
    requestDate: '2024-01-18',
    status: 'pending-engineer',
    transferPhoto: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'
  },
  {
    id: 'TR005',
    type: 'incoming',
    fromUser: 'María Rodriguez',
    fromUserId: '4',
    items: [
      {
        itemId: '4',
        itemName: 'Screwdriver Set',
        code: 'HT-NC-002',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=100',
        description: '5-piece Phillips set',
        warehouse: 'Best',
        warehouseCode: 'BEST'
      },
      {
        itemId: '5',
        itemName: 'Safety Goggles',
        code: 'SG-002',
        quantity: 5,
        image: 'https://images.unsplash.com/photo-1577760258779-e787a1733016?w=100',
        description: 'Clear protective safety goggles',
        warehouse: 'Best',
        warehouseCode: 'BEST'
      },
      {
        itemId: '6',
        itemName: 'Webcam 1080p',
        code: 'WEB-001',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=100',
        description: 'High definition webcam',
        warehouse: 'Central',
        warehouseCode: 'CENT'
      }
    ],
    notes: 'Safety equipment and webcam from different warehouses',
    requestDate: '2024-01-15',
    status: 'approved',
    transferPhoto: 'https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400'
  }
];

export function TransferRequests() {
  const navigate = useNavigate();
  const [showTransferMode, setShowTransferMode] = useState(false);
  const [transfers, setTransfers] = useState(mockTransfers);
  const [filteredTransfers, setFilteredTransfers] = useState(mockTransfers);
  const [transferSearchTerm, setTransferSearchTerm] = useState('');
  const [transferStatusFilter, setTransferStatusFilter] = useState<string>('all');
  const [transferTypeFilter, setTransferTypeFilter] = useState<string>('all');
  const [expandedTransferRows, setExpandedTransferRows] = useState<Set<string>>(new Set());
  const [transferToAccept, setTransferToAccept] = useState<Transfer | null>(null);
  const [confirmTransferOpen, setConfirmTransferOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

  // New Transfer Mode State
  const [inventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [transferQuantities, setTransferQuantities] = useState<Record<string, number>>({});
  const [targetEngineerId, setTargetEngineerId] = useState('');
  const [transferPhoto, setTransferPhoto] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        toast.error('Failed to load projects');
      }
    };
    loadProjects();
  }, []);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter transfers
  React.useEffect(() => {
    let filtered = transfers;

    if (transferSearchTerm) {
      filtered = filtered.filter(transfer => {
        const searchLower = transferSearchTerm.toLowerCase();
        return (
          transfer.id.toLowerCase().includes(searchLower) ||
          (transfer.toUser && transfer.toUser.toLowerCase().includes(searchLower)) ||
          (transfer.fromUser && transfer.fromUser.toLowerCase().includes(searchLower)) ||
          transfer.notes.toLowerCase().includes(searchLower) ||
          transfer.items.some(item => item.itemName.toLowerCase().includes(searchLower))
        );
      });
    }

    if (transferStatusFilter !== 'all') {
      filtered = filtered.filter(transfer => transfer.status === transferStatusFilter);
    }

    if (transferTypeFilter !== 'all') {
      filtered = filtered.filter(transfer => transfer.type === transferTypeFilter);
    }

    setFilteredTransfers(filtered);
  }, [transfers, transferSearchTerm, transferStatusFilter, transferTypeFilter]);

  const uniqueProjects = useMemo(() => {
    const projects = new Set<string>();
    inventoryItems.forEach(item => projects.add(item.project));
    return Array.from(projects).sort();
  }, [inventoryItems]);

  const uniqueWarehouses = useMemo(() => {
    const warehouses = new Set<string>();
    inventoryItems.forEach(item => item.warehouse && warehouses.add(item.warehouse));
    return Array.from(warehouses).filter(w => w).sort();
  }, [inventoryItems]);

  const filteredInventoryItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesProject = projectFilter === 'all' || item.project === projectFilter;
      const matchesWarehouse = warehouseFilter === 'all' || item.warehouse === warehouseFilter;
      
      return matchesSearch && matchesProject && matchesWarehouse;
    });
  }, [inventoryItems, searchTerm, projectFilter, warehouseFilter]);

  const selectedItems = useMemo(() => {
    return inventoryItems.filter(item => selectedItemIds.has(item.id));
  }, [inventoryItems, selectedItemIds]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending-manager': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'pending-engineer': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending-manager': return 'Pending Manager';
      case 'pending-engineer': return 'Pending Engineer';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTransferStatusCount = (status: string) => {
    if (status === 'all') return transfers.length;
    return transfers.filter(tr => tr.status === status).length;
  };

  const getTransferTypeCount = (type: string) => {
    if (type === 'all') return transfers.length;
    return transfers.filter(tr => tr.type === type).length;
  };

  const toggleTransferRow = (transferId: string) => {
    setExpandedTransferRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transferId)) {
        newSet.delete(transferId);
      } else {
        newSet.add(transferId);
      }
      return newSet;
    });
  };

  const handleCancelTransfer = (transferId: string) => {
    if (window.confirm('Are you sure you want to cancel this transfer?')) {
      setTransfers(prev => prev.filter(tr => tr.id !== transferId));
      toast.success('Transfer cancelled successfully');
    }
  };

  const canCancelTransfer = (transfer: Transfer) => {
    return transfer.type === 'outgoing' && (transfer.status === 'pending-manager' || transfer.status === 'pending-engineer');
  };

  const handleTransferAcceptStart = (transfer: Transfer) => {
    setTransferToAccept(transfer);
    setSelectedProject('');
    setSelectedProject('');
    setConfirmTransferOpen(true);
  };

  const confirmTransferAccept = () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }
    
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }
    
    if (transferToAccept) {
      const selectedProjectData = projects.find(p => p.id === selectedProject);
      setTransfers(prev => prev.filter(tr => tr.id !== transferToAccept.id));
      toast.success(`Transfer accepted successfully. Items assigned to ${selectedProjectData?.name}.`);
      setConfirmTransferOpen(false);
      setTransferToAccept(null);
      setSelectedProject('');
    }
  };

  const handleTransferReject = (transferId: string) => {
    setTransfers(prev => prev.filter(tr => tr.id !== transferId));
    toast.success('Transfer rejected successfully');
  };

  const handleItemSelection = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItemIds);
    if (checked) {
      newSelected.add(itemId);
      const item = inventoryItems.find(i => i.id === itemId);
      if (item) {
        setTransferQuantities(prev => ({
          ...prev,
          [itemId]: 1
        }));
      }
    } else {
      newSelected.delete(itemId);
      setTransferQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[itemId];
        return newQuantities;
      });
    }
    setSelectedItemIds(newSelected);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    const item = inventoryItems.find(i => i.id === id);
    const maxQty = item ? item.quantity : 1;
    
    if (quantity >= 1 && quantity <= maxQty) {
      setTransferQuantities(prev => ({
        ...prev,
        [id]: quantity
      }));
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setCameraOpen(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      toast.error('Could not access camera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg');
        setTransferPhoto(photoData);
        closeCamera();
        toast.success('Photo captured');
      }
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTransferPhoto(reader.result as string);
        toast.success('Photo uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransferClick = () => {
    if (!targetEngineerId) {
      toast.error('Please select a target engineer');
      return;
    }

    if (!transferPhoto) {
      toast.error('Please upload or capture a photo');
      return;
    }

    if (selectedItemIds.size === 0) {
      toast.error('Please select at least one item to transfer');
      return;
    }

    setConfirmDialogOpen(true);
  };

  const submitTransfer = () => {
    const targetUser = mockUsers.find(u => u.id === targetEngineerId);
    toast.success(
      `Transfer initiated to ${targetUser?.name}. ${selectedItemIds.size} item${selectedItemIds.size !== 1 ? 's' : ''} selected. Requires dual approval.`
    );

    // Reset all states
    setShowTransferMode(false);
    setSelectedItemIds(new Set());
    setTransferQuantities({});
    setTargetEngineerId('');
    setTransferPhoto(null);
    setSearchTerm('');
    setProjectFilter('all');
    setWarehouseFilter('all');
    setConfirmDialogOpen(false);
    closeCamera();
  };

  const cancelTransferMode = () => {
    setShowTransferMode(false);
    setSelectedItemIds(new Set());
    setTransferQuantities({});
    setTargetEngineerId('');
    setTransferPhoto(null);
    setSearchTerm('');
    setProjectFilter('all');
    setWarehouseFilter('all');
    closeCamera();
  };

  const canTransfer = targetEngineerId && transferPhoto && selectedItemIds.size > 0;

  // Transfer Mode View - Two Column Layout
  if (showTransferMode) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={cancelTransferMode} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Requests
            </Button>
          </div>
          <Button 
            onClick={handleTransferClick}
            disabled={!canTransfer}
            className="gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Transfer ({selectedItemIds.size})
          </Button>
        </div>

        <div>
          <h2>Transfer Mode</h2>
          <p className="text-muted-foreground">Select items and quantity to transfer</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Item Selector */}
          <Card className="flex flex-col h-[calc(100vh-16rem)]">
            <CardHeader>
              <CardTitle>Available Items</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Search and Filter */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {uniqueProjects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="All Warehouses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Warehouses</SelectItem>
                      {uniqueWarehouses.map((warehouse) => (
                        <SelectItem key={warehouse} value={warehouse}>
                          {warehouse}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Items List with Scrollbar */}
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-2 pr-4">
                  {filteredInventoryItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No items found</p>
                    </div>
                  ) : (
                    filteredInventoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedItemIds.has(item.id) ? 'bg-accent border-accent-foreground/20' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleItemSelection(item.id, !selectedItemIds.has(item.id))}
                      >
                        <Checkbox
                          checked={selectedItemIds.has(item.id)}
                          onCheckedChange={(checked: boolean) => handleItemSelection(item.id, checked)}
                        />
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.sku}</div>
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0">Qty: {item.quantity}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{item.projectCode}</Badge>
                            <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{item.warehouseCode}</Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Column - Selected Items and Transfer Details */}
          <Card className="flex flex-col h-[calc(100vh-16rem)]">
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Target Engineer Selection */}
              <div>
                <Label>Target Engineer</Label>
                <Select value={targetEngineerId} onValueChange={setTargetEngineerId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span>{user.name} - {user.department}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Photograph Section */}
              <div>
                <Label>Photograph (Required)</Label>
                <div className="mt-2">
                  {transferPhoto ? (
                    <div className="relative">
                      <img
                        src={transferPhoto}
                        alt="Transfer evidence"
                        className="w-full h-32 object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setTransferPhoto(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : cameraOpen ? (
                    <div className="space-y-2">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-32 object-cover rounded border bg-black"
                      />
                      <div className="flex gap-2">
                        <Button onClick={capturePhoto} className="flex-1" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Capture
                        </Button>
                        <Button variant="outline" onClick={closeCamera} size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={openCamera}
                        size="sm"
                      >
                        <Camera className="h-4 w-4" />
                        Camera
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => fileInputRef.current?.click()}
                        size="sm"
                      >
                        <Upload className="h-4 w-4" />
                        Upload
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Items with Scrollbar */}
              <div className="flex-1 flex flex-col min-h-0">
                <Label className="mb-2">Selected Items ({selectedItemIds.size})</Label>
                <ScrollArea className="flex-1 -mx-6 px-6">
                  {selectedItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No items selected</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pr-4">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-accent/50 rounded border">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{item.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{item.projectCode}</span>
                              <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{item.warehouseCode}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              max={item.quantity}
                              value={transferQuantities[item.id] || 1}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-xs text-muted-foreground">/ {item.quantity}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                handleItemSelection(item.id, false);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confirm Transfer Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Transfer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Are you sure you want to transfer {selectedItemIds.size} item{selectedItemIds.size !== 1 ? 's' : ''} to{' '}
                {mockUsers.find(u => u.id === targetEngineerId)?.name}?
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="mb-2">This transfer requires dual approval:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Manager approval</li>
                      <li>Target engineer acceptance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitTransfer}>
                Yes, Transfer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Transfers List View
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by user, items, notes..."
                value={transferSearchTerm}
                onChange={(e) => setTransferSearchTerm(e.target.value)}
              />
            </div>
            <Select value={transferTypeFilter} onValueChange={setTransferTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({getTransferTypeCount('all')})</SelectItem>
                <SelectItem value="outgoing">Outgoing ({getTransferTypeCount('outgoing')})</SelectItem>
                <SelectItem value="incoming">Incoming ({getTransferTypeCount('incoming')})</SelectItem>
              </SelectContent>
            </Select>
            <Select value={transferStatusFilter} onValueChange={setTransferStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({getTransferStatusCount('all')})</SelectItem>
                <SelectItem value="pending-manager">Pending Manager ({getTransferStatusCount('pending-manager')})</SelectItem>
                <SelectItem value="pending-engineer">Pending Engineer ({getTransferStatusCount('pending-engineer')})</SelectItem>
                <SelectItem value="approved">Approved ({getTransferStatusCount('approved')})</SelectItem>
                <SelectItem value="rejected">Rejected ({getTransferStatusCount('rejected')})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transfer List - Mobile Card View or Desktop Table */}
      {filteredTransfers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3>No transfers found</h3>
            <p className="text-sm text-muted-foreground">
              {transferSearchTerm || transferStatusFilter !== 'all' || transferTypeFilter !== 'all'
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
                    onClick={() => toggleTransferRow(transfer.id)}
                  >
                    <div className="flex-1">
                      <h3 className="flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        Transfer #{transfer.id}
                        {expandedTransferRows.has(transfer.id) ? (
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
                            onClick={() => handleTransferReject(transfer.id)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {canCancelTransfer(transfer) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelTransfer(transfer.id)}
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

                  {expandedTransferRows.has(transfer.id) && (
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
                      onClick={() => toggleTransferRow(transfer.id)}
                    >
                      <TableCell>
                        {expandedTransferRows.has(transfer.id) ? (
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
                                onClick={() => handleTransferReject(transfer.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {canCancelTransfer(transfer) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelTransfer(transfer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedTransferRows.has(transfer.id) && (
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

      {/* Accept Transfer Confirmation Dialog with Engineer Photo */}
      <Dialog open={confirmTransferOpen} onOpenChange={setConfirmTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Transfer</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this transfer?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Engineer Info with Photo */}
            {transferToAccept && (
              <>
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={mockUsers.find(u => u.id === transferToAccept.fromUserId)?.avatar} 
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
                      {mockUsers.find(u => u.id === transferToAccept.fromUserId)?.department}
                    </p>
                  </div>
                </div>

                {/* Transfer Photo */}
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

                {/* Project Selector */}
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