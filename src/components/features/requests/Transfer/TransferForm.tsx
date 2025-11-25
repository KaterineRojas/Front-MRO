import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Checkbox } from '../../../ui/checkbox';
import { ScrollArea } from '../../../ui/scroll-area';
import { 
  Package, X, Camera, Upload, ArrowLeftRight, Search, AlertCircle, ArrowLeft
} from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui2/avatar';
import { toast } from 'sonner';
import { 
  getAvailableUsers, 
  getInventoryItems,
  createTransfer,
  type InventoryItem,
  type User
} from './transferService'; 

interface TransferFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function TransferForm({ onBack, onSuccess }: TransferFormProps) {
  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selection state
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [transferQuantities, setTransferQuantities] = useState<Record<string, number>>({});
  const [targetEngineerId, setTargetEngineerId] = useState('');
  const [transferPhoto, setTransferPhoto] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  
  // Dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [usersData, itemsData] = await Promise.all([
          getAvailableUsers(),
          getInventoryItems()
        ]);
        setUsers(usersData);
        setInventoryItems(itemsData);
      } catch (error) {
        toast.error('Failed to load transfer data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Computed values
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

  const canTransfer = targetEngineerId && transferPhoto && selectedItemIds.size > 0;

  // Handlers
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

  const submitTransfer = async () => {
    try {
      setIsSubmitting(true);
      
      const items = Array.from(selectedItemIds).map(id => ({
        id,
        quantity: transferQuantities[id] || 1
      }));

      await createTransfer({
        targetEngineerId,
        items,
        photo: transferPhoto!
      });

      const targetUser = users.find(u => u.id === targetEngineerId);
      toast.success(
        `Transfer initiated to ${targetUser?.name}. ${selectedItemIds.size} item${selectedItemIds.size !== 1 ? 's' : ''} selected. Requires dual approval.`
      );

      setConfirmDialogOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    closeCamera();
    onBack();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Loading transfer data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleCancel} className="gap-2">
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
                  {users.map((user) => (
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
              {users.find(u => u.id === targetEngineerId)?.name}?
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
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitTransfer}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Yes, Transfer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}