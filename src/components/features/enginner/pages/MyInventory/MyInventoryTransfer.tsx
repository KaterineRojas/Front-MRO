import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Checkbox } from '../../../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { 
  Package, Search, ChevronDown, ChevronRight, Box, ArrowRightLeft, Camera, Upload, X, AlertCircle, History
} from 'lucide-react';
import { ImageWithFallback } from '../../../../figma/ImageWithFallback';
import { toast } from 'sonner';
import { CompleteHistory } from './CompleteHistory';

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

interface GroupedInventoryItem {
  itemId: string;
  name: string;
  description: string;
  image: string;
  sku?: string;
  projects: { project: string; projectCode: string; quantity: number; inventoryId: string; warehouse?: string; warehouseCode?: string }[];
  totalQuantity: number;
}

interface KitItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  image?: string;
}

interface Kit {
  id: string;
  kitId: string;
  name: string;
  description: string;
  project: string;
  projectCode: string;
  quantity: number;
  warehouse: string;
  warehouseCode: string;
  items: KitItem[];
}

type CombinedInventory = {
  type: 'item' | 'kit';
  id: string;
  name: string;
  description: string;
  image?: string;
  sku?: string;
  project: string;
  projectCode: string;
  quantity: number;
  isKit: boolean;
  kitItems?: KitItem[];
  totalQuantity?: number;
  projects?: { project: string; projectCode: string; quantity: number; inventoryId: string; warehouse?: string; warehouseCode?: string }[];
  warehouse?: string;
  warehouseCode?: string;
};

const mockUsers = [
  { id: '2', name: 'Ana Martínez', department: 'Development' },
  { id: '3', name: 'Luis González', department: 'Design' },
  { id: '4', name: 'María Rodriguez', department: 'Marketing' },
  { id: '5', name: 'Juan Pérez', department: 'Engineering' }
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

const mockKits: Kit[] = [
  {
    id: 'kit-1',
    kitId: 'electrical-kit-001',
    name: 'Electrical Maintenance Kit',
    description: 'Complete electrical maintenance toolkit',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 2,
    warehouse: 'Central',
    warehouseCode: 'CENT',
    items: [
      { 
        id: 'kit-item-1', 
        sku: 'EL-MC-001', 
        name: 'Digital Multimeter', 
        description: 'Professional multimeter', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581092580497-e7d24e29d284?w=400'
      },
      { 
        id: 'kit-item-2', 
        sku: 'ST-WC-002', 
        name: 'Screwdriver Set', 
        description: '5-piece Phillips set', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'
      },
      { 
        id: 'kit-item-3', 
        sku: 'SE-MC-001', 
        name: 'Safety Glasses', 
        description: 'Clear safety glasses', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400'
      }
    ]
  },
  {
    id: 'kit-2',
    kitId: 'power-tool-kit-001',
    name: 'Power Tools Kit',
    description: 'Complete power tools set for construction',
    project: 'Proyecto Construcción',
    projectCode: 'CONS-2024',
    quantity: 1,
    warehouse: 'Amax',
    warehouseCode: 'AMAX',
    items: [
      { 
        id: 'kit-item-4', 
        sku: 'DR-BC-001', 
        name: 'Cordless Drill', 
        description: '18V cordless drill', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'
      },
      { 
        id: 'kit-item-5', 
        sku: 'SA-BC-002', 
        name: 'Circular Saw', 
        description: '7.25" circular saw', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'
      },
      { 
        id: 'kit-item-6', 
        sku: 'IM-BC-003', 
        name: 'Impact Driver', 
        description: '18V impact driver', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'
      }
    ]
  },
  {
    id: 'kit-3',
    kitId: 'networking-kit-001',
    name: 'Network Installation Kit',
    description: 'Complete networking tools',
    project: 'Proyecto Innova',
    projectCode: 'INN-2024',
    quantity: 1,
    warehouse: 'Best',
    warehouseCode: 'BEST',
    items: [
      { 
        id: 'kit-item-7', 
        sku: 'CR-NC-001', 
        name: 'Cable Crimper', 
        description: 'RJ45 cable crimper', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
      },
      { 
        id: 'kit-item-8', 
        sku: 'CA-NC-002', 
        name: 'Cable Tester', 
        description: 'Network cable tester', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400'
      },
      { 
        id: 'kit-item-9', 
        sku: 'PU-NC-003', 
        name: 'Punch Down Tool', 
        description: 'Professional punch tool', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581092580497-e7d24e29d284?w=400'
      }
    ]
  }
];

export function MyInventoryTransfer() {
  const [inventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [kits] = useState<Kit[]>(mockKits);
  const [expandedKits, setExpandedKits] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'items' | 'kits'>('all');

  // Transfer mode states
  const [showTransferMode, setShowTransferMode] = useState(false);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<Set<string>>(new Set());
  const [selectedKitIds, setSelectedKitIds] = useState<Set<string>>(new Set());
  const [transferQuantities, setTransferQuantities] = useState<Record<string, number>>({});
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [targetEngineerId, setTargetEngineerId] = useState('');
  const [transferPhoto, setTransferPhoto] = useState<string | null>(null);
  const [transferNotes, setTransferNotes] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Complete History Dialog
  const [showCompleteHistory, setShowCompleteHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleKitExpansion = (kitId: string) => {
    setExpandedKits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(kitId)) {
        newSet.delete(kitId);
      } else {
        newSet.add(kitId);
      }
      return newSet;
    });
  };

  const groupedItems = useMemo(() => {
    const grouped: Record<string, GroupedInventoryItem> = {};
    
    inventoryItems.forEach(item => {
      if (!grouped[item.itemId]) {
        grouped[item.itemId] = {
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          image: item.image,
          sku: item.sku,
          projects: [],
          totalQuantity: 0
        };
      }
      
      grouped[item.itemId].projects.push({
        project: item.project,
        projectCode: item.projectCode,
        quantity: item.quantity,
        inventoryId: item.id,
        warehouse: item.warehouse,
        warehouseCode: item.warehouseCode
      });
      grouped[item.itemId].totalQuantity += item.quantity;
    });
    
    return Object.values(grouped);
  }, [inventoryItems]);

  const uniqueProjects = useMemo(() => {
    const projects = new Set<string>();
    inventoryItems.forEach(item => projects.add(item.project));
    kits.forEach(kit => projects.add(kit.project));
    return Array.from(projects).sort();
  }, [inventoryItems, kits]);

  const uniqueWarehouses = useMemo(() => {
    const warehouses = new Set<string>();
    inventoryItems.forEach(item => item.warehouse && warehouses.add(item.warehouse));
    kits.forEach(kit => kit.warehouse && warehouses.add(kit.warehouse));
    return Array.from(warehouses).filter(w => w).sort();
  }, [inventoryItems, kits]);

  // Combine items and kits for display
  const combinedInventory = useMemo(() => {
    const combined: CombinedInventory[] = [];

    // Add items
    groupedItems.forEach(item => {
      combined.push({
        type: 'item',
        id: item.itemId,
        name: item.name,
        description: item.description,
        image: item.image,
        sku: item.sku,
        project: item.projects[0]?.project || '',
        projectCode: item.projects[0]?.projectCode || '',
        quantity: item.totalQuantity,
        totalQuantity: item.totalQuantity,
        projects: item.projects,
        isKit: false
      });
    });

    // Add kits
    kits.forEach(kit => {
      combined.push({
        type: 'kit',
        id: kit.id,
        name: kit.name,
        description: kit.description,
        project: kit.project,
        projectCode: kit.projectCode,
        quantity: kit.quantity,
        isKit: true,
        kitItems: kit.items,
        warehouse: kit.warehouse,
        warehouseCode: kit.warehouseCode
      });
    });

    return combined;
  }, [groupedItems, kits]);

  const filteredCombinedInventory = useMemo(() => {
    return combinedInventory.filter(item => {
      // Filter by type
      if (typeFilter === 'items' && item.isKit) return false;
      if (typeFilter === 'kits' && !item.isKit) return false;

      // Filter by search
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.kitItems && item.kitItems.some(ki => 
          ki.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ki.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      // Filter by project
      const matchesProject = projectFilter === 'all' || 
        item.project === projectFilter ||
        (item.projects && item.projects.some(p => p.project === projectFilter));
      
      // Filter by warehouse
      const matchesWarehouse = warehouseFilter === 'all' || 
        item.warehouse === warehouseFilter ||
        (item.projects && item.projects.some(p => p.warehouse === warehouseFilter));
      
      return matchesSearch && matchesProject && matchesWarehouse;
    });
  }, [combinedInventory, searchTerm, projectFilter, warehouseFilter, typeFilter]);

  const handleInventorySelection = (inventoryId: string, checked: boolean) => {
    const newSelected = new Set(selectedInventoryIds);
    if (checked) {
      newSelected.add(inventoryId);
      const item = inventoryItems.find(i => i.id === inventoryId);
      if (item) {
        setTransferQuantities(prev => ({
          ...prev,
          [inventoryId]: 1
        }));
      }
    } else {
      newSelected.delete(inventoryId);
      setTransferQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[inventoryId];
        return newQuantities;
      });
    }
    setSelectedInventoryIds(newSelected);
  };

  const handleKitSelection = (kitId: string, checked: boolean) => {
    const newSelected = new Set(selectedKitIds);
    if (checked) {
      newSelected.add(kitId);
      const kit = kits.find(k => k.id === kitId);
      if (kit) {
        setTransferQuantities(prev => ({
          ...prev,
          [kitId]: 1
        }));
      }
    } else {
      newSelected.delete(kitId);
      setTransferQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[kitId];
        return newQuantities;
      });
    }
    setSelectedKitIds(newSelected);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    const item = inventoryItems.find(i => i.id === id);
    const kit = kits.find(k => k.id === id);
    const maxQty = item ? item.quantity : kit ? kit.quantity : 1;
    
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
    if (selectedInventoryIds.size === 0 && selectedKitIds.size === 0) {
      toast.error('Please select at least one item or kit to transfer');
      return;
    }
    setTransferDialogOpen(true);
  };

  const handleConfirmTransfer = () => {
    if (!targetEngineerId) {
      toast.error('Please select a target engineer');
      return;
    }

    if (!transferPhoto) {
      toast.error('Please upload or capture a photo');
      return;
    }

    setConfirmDialogOpen(true);
  };

  const submitTransfer = () => {
    const targetUser = mockUsers.find(u => u.id === targetEngineerId);
    const itemCount = selectedInventoryIds.size;
    const kitCount = selectedKitIds.size;
    
    toast.success(
      `Transfer initiated to ${targetUser?.name}. ${itemCount} item${itemCount !== 1 ? 's' : ''} and ${kitCount} kit${kitCount !== 1 ? 's' : ''} selected. Requires dual approval.`
    );

    // Reset all states
    setShowTransferMode(false);
    setSelectedInventoryIds(new Set());
    setSelectedKitIds(new Set());
    setTransferQuantities({});
    setTargetEngineerId('');
    setTransferPhoto(null);
    setTransferNotes('');
    setTransferDialogOpen(false);
    setConfirmDialogOpen(false);
    closeCamera();
  };

  const cancelTransferMode = () => {
    setShowTransferMode(false);
    setSelectedInventoryIds(new Set());
    setSelectedKitIds(new Set());
    setTransferQuantities({});
    setTargetEngineerId('');
    setTransferPhoto(null);
    setTransferNotes('');
    closeCamera();
  };

  const renderDesktopView = () => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {showTransferMode && <TableHead className="w-12"></TableHead>}
            <TableHead className="w-12"></TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Quantity</TableHead>
            {showTransferMode && <TableHead>Transfer Qty</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCombinedInventory.map((item) => (
            <React.Fragment key={item.id}>
              <TableRow 
                className={item.isKit ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={item.isKit && !showTransferMode ? () => toggleKitExpansion(item.id) : undefined}
              >
                {showTransferMode && (
                  <TableCell>
                    <Checkbox
                      checked={item.isKit ? selectedKitIds.has(item.id) : 
                        (item.projects?.some(p => selectedInventoryIds.has(p.inventoryId)) || false)}
                      onCheckedChange={(checked:any) => {
                        if (item.isKit) {
                          handleKitSelection(item.id, checked as boolean);
                        }
                      }}
                      disabled={!item.isKit}
                    />
                  </TableCell>
                )}
                <TableCell>
                  {item.isKit && (
                    expandedKits.has(item.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  )}
                </TableCell>
                <TableCell>
                  {item.isKit ? (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Box className="h-6 w-6 text-muted-foreground" />
                    </div>
                  ) : (
                    <ImageWithFallback
                      src={item.image || ''}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div>{item.name}</div>
                    {item.sku && (
                      <div className="text-xs text-muted-foreground">{item.sku}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground max-w-xs">{item.description}</div>
                </TableCell>
                <TableCell>
                  {item.isKit ? (
                    <div>
                      <div className="text-sm">{item.project}</div>
                      <div className="text-xs text-muted-foreground">{item.projectCode}</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {item.projects?.map((proj, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {showTransferMode && (
                            <Checkbox
                              checked={selectedInventoryIds.has(proj.inventoryId)}
                              onCheckedChange={(checked:any) => handleInventorySelection(proj.inventoryId, checked as boolean)}
                            />
                          )}
                          <div className="text-sm">
                            {proj.quantity} {proj.project}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {item.isKit ? (
                    <Badge variant="outline" className="text-xs">{item.warehouseCode}</Badge>
                  ) : (
                    <div className="space-y-1">
                      {item.projects?.map((proj, idx) => (
                        <div key={idx}>
                          <Badge variant="outline" className="text-xs">{proj.warehouseCode}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.quantity}</Badge>
                </TableCell>
                {showTransferMode && (
                  <TableCell>
                    {item.isKit && selectedKitIds.has(item.id) && (
                      <Input
                        type="number"
                        min={1}
                        max={item.quantity}
                        value={transferQuantities[item.id] || 1}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    )}
                    {!item.isKit && item.projects?.map((proj) => (
                      selectedInventoryIds.has(proj.inventoryId) && (
                        <Input
                          key={proj.inventoryId}
                          type="number"
                          min={1}
                          max={proj.quantity}
                          value={transferQuantities[proj.inventoryId] || 1}
                          onChange={(e) => handleQuantityChange(proj.inventoryId, parseInt(e.target.value) || 1)}
                          className="w-20 mb-1"
                        />
                      )
                    ))}
                  </TableCell>
                )}
              </TableRow>
              {item.isKit && expandedKits.has(item.id) && item.kitItems && (
                <TableRow>
                  <TableCell colSpan={showTransferMode ? 9 : 8} className="bg-muted/30 p-0">
                    <div className="p-4">
                      <div className="text-sm mb-3 ml-2">Kit Contents:</div>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b">
                            <TableHead className="bg-muted/50">Image</TableHead>
                            <TableHead className="bg-muted/50">Name</TableHead>
                            <TableHead className="bg-muted/50">Description</TableHead>
                            <TableHead className="bg-muted/50">Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {item.kitItems.map((kitItem) => (
                            <TableRow key={kitItem.id} className="border-b last:border-0">
                              <TableCell>
                                <ImageWithFallback
                                  src={kitItem.image || ''}
                                  alt={kitItem.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm">{kitItem.name}</div>
                                  <div className="text-xs text-muted-foreground">{kitItem.sku}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">{kitItem.description}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{kitItem.quantity}</Badge>
                              </TableCell>
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
  );

  const renderMobileView = () => (
    <div className="space-y-3">
      {filteredCombinedInventory.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div 
              className="flex gap-3"
              onClick={item.isKit && !showTransferMode ? () => toggleKitExpansion(item.id) : undefined}
            >
              {showTransferMode && (
                <div className="flex items-start pt-1">
                  <Checkbox
                    checked={item.isKit ? selectedKitIds.has(item.id) : 
                      (item.projects?.some(p => selectedInventoryIds.has(p.inventoryId)) || false)}
                    onCheckedChange={(checked:any) => {
                      if (item.isKit) {
                        handleKitSelection(item.id, checked as boolean);
                      }
                    }}
                    disabled={!item.isKit}
                  />
                </div>
              )}
              {item.isKit ? (
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  <Box className="h-8 w-8 text-muted-foreground" />
                </div>
              ) : (
                <ImageWithFallback
                  src={item.image || ''}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <h3 className="truncate flex-1">{item.name}</h3>
                  {item.isKit && (
                    expandedKits.has(item.id) ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.isKit ? (
                    <>
                      <Badge variant="outline" className="text-xs">{item.projectCode}</Badge>
                      <Badge variant="default" className="text-xs">Kit</Badge>
                      <Badge variant="secondary" className="text-xs">Qty: {item.quantity}</Badge>
                      <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{item.warehouseCode}</Badge>
                    </>
                  ) : (
                    <>
                      {item.projects?.map((proj, idx) => (
                        <div key={idx} className="flex items-center gap-1 flex-wrap">
                          {showTransferMode && (
                            <Checkbox
                              checked={selectedInventoryIds.has(proj.inventoryId)}
                              onCheckedChange={(checked:any) => handleInventorySelection(proj.inventoryId, checked as boolean)}
                            />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {proj.quantity} {proj.project}
                          </Badge>
                          <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{proj.warehouseCode}</Badge>
                        </div>
                      ))}
                      <Badge variant="secondary" className="text-xs">Total: {item.totalQuantity}</Badge>
                    </>
                  )}
                </div>
                {showTransferMode && (item.isKit ? selectedKitIds.has(item.id) : item.projects?.some(p => selectedInventoryIds.has(p.inventoryId))) && (
                  <div className="mt-2">
                    <Label className="text-xs">Transfer Quantity:</Label>
                    {item.isKit ? (
                      <Input
                        type="number"
                        min={1}
                        max={item.quantity}
                        value={transferQuantities[item.id] || 1}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-20 h-8 text-sm mt-1"
                      />
                    ) : (
                      item.projects?.map((proj) => (
                        selectedInventoryIds.has(proj.inventoryId) && (
                          <Input
                            key={proj.inventoryId}
                            type="number"
                            min={1}
                            max={proj.quantity}
                            value={transferQuantities[proj.inventoryId] || 1}
                            onChange={(e) => handleQuantityChange(proj.inventoryId, parseInt(e.target.value) || 1)}
                            className="w-20 h-8 text-sm mt-1"
                          />
                        )
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            {item.isKit && expandedKits.has(item.id) && item.kitItems && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="text-sm">Kit Contents:</div>
                {item.kitItems.map((kitItem) => (
                  <div key={kitItem.id} className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded">
                    <ImageWithFallback
                      src={kitItem.image || ''}
                      alt={kitItem.name}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div>{kitItem.name}</div>
                      <div className="text-xs text-muted-foreground">{kitItem.sku} - {kitItem.description}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">x{kitItem.quantity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const totalItems = filteredCombinedInventory.length;
  const selectedCount = selectedInventoryIds.size + selectedKitIds.size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>My Inventory</h1>
          <p className="text-muted-foreground">
            Items currently under your responsibility
          </p>
        </div>
        <Button onClick={() => setShowCompleteHistory(true)} variant="outline">
          <History className="h-4 w-4 mr-2" />
          Complete History
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value: 'all' | 'items' | 'kits') => setTypeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Inventory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inventory</SelectItem>
                <SelectItem value="items">Items</SelectItem>
                <SelectItem value="kits">Kits</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
        </CardContent>
      </Card>

      <div className="mt-6">
          {totalItems === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3>No items in your inventory</h3>
                <p className="text-muted-foreground">
                  {searchTerm || projectFilter !== 'all' || warehouseFilter !== 'all'
                    ? 'No items match your search criteria' 
                    : 'When items are assigned to you, they will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Inventory ({totalItems})</CardTitle>
              </CardHeader>
              <CardContent>
                {isMobile ? renderMobileView() : renderDesktopView()}
              </CardContent>
            </Card>
          )}
        </div>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={(open:any) => {
        setTransferDialogOpen(open);
        if (!open) {
          closeCamera();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transfer Items</DialogTitle>
            <DialogDescription>
              Transfer selected items to another engineer with photo evidence.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target Engineer</Label>
              <Select value={targetEngineerId} onValueChange={setTargetEngineerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select engineer" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} - {user.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Selected Items ({selectedInventoryIds.size})</Label>
              <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                {Array.from(selectedInventoryIds).map(id => {
                  const item = inventoryItems.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 p-2 bg-accent/50 rounded text-sm">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div>{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.projectCode} • Transfer: {transferQuantities[id] || 1} of {item.quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Selected Kits ({selectedKitIds.size})</Label>
              <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                {Array.from(selectedKitIds).map(id => {
                  const kit = kits.find(k => k.id === id);
                  if (!kit) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 p-2 bg-accent/50 rounded text-sm">
                      <Package className="h-10 w-10 text-muted-foreground" />
                      <div className="flex-1">
                        <div>{kit.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {kit.projectCode} • Transfer: {transferQuantities[id] || 1} of {kit.quantity} • {kit.items.length} items per kit
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photo Upload Section */}
            <div>
              <Label>Photo Evidence (Required)</Label>
              <div className="space-y-3 mt-2">
                {transferPhoto ? (
                  <div className="relative">
                    <img
                      src={transferPhoto}
                      alt="Transfer evidence"
                      className="w-full h-48 object-cover rounded border"
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
                      className="w-full h-48 object-cover rounded border bg-black"
                    />
                    <div className="flex gap-2">
                      <Button onClick={capturePhoto} className="flex-1">
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>
                      <Button variant="outline" onClick={closeCamera}>
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
                    >
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => fileInputRef.current?.click()}
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

            {/* Notes Section */}
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this transfer..."
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setTransferDialogOpen(false);
                  closeCamera();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmTransfer}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Confirm Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Transfer Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to transfer {selectedInventoryIds.size + selectedKitIds.size} item{selectedInventoryIds.size + selectedKitIds.size !== 1 ? 's' : ''} to{' '}
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

      {/* Complete History Dialog */}
      <Dialog open={showCompleteHistory} onOpenChange={setShowCompleteHistory}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-hidden p-0">
          <div className="h-full overflow-y-auto p-6">
            <CompleteHistory />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
