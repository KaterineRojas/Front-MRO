import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Package, Search, ChevronDown, ChevronRight, Box, History } from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { toast } from 'sonner';
import { getInventoryEngineer, type InventoryItem } from './myInventoryService';
import { useAppSelector } from '../requests/store/hooks';
import { store } from '../../../store/store';

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

export function MyInventoryTransfer() {
  const navigate = useNavigate();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [expandedKits, setExpandedKits] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'items' | 'kits'>('all');

  // Load inventory and kits from service
  useEffect(() => {
    const loadInventory = async () => {
      const currentUser = (store.getState() as any).auth?.user;
      if (!currentUser?.employeeId) return;

      try {
        const response = await getInventoryEngineer(currentUser.employeeId);
        setInventoryItems(response.items);
        setKits(response.kits);
      } catch (error) {
        console.error('Error loading inventory:', error);
        toast.error('Failed to load inventory');
        setInventoryItems([]);
        setKits([]);
      }
    };

    loadInventory();
  }, []);

  useEffect(() => {
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

  const combinedInventory = useMemo(() => {
    const combined: CombinedInventory[] = [];

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
      if (typeFilter === 'items' && item.isKit) return false;
      if (typeFilter === 'kits' && !item.isKit) return false;

      const matchesSearch = !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.kitItems && item.kitItems.some(ki =>
          ki.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ki.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesProject = projectFilter === 'all' ||
        item.project === projectFilter ||
        (item.projects && item.projects.some(p => p.project === projectFilter));

      const matchesWarehouse = warehouseFilter === 'all' ||
        item.warehouse === warehouseFilter ||
        (item.projects && item.projects.some(p => p.warehouse === warehouseFilter));

      return matchesSearch && matchesProject && matchesWarehouse;
    });
  }, [combinedInventory, searchTerm, projectFilter, warehouseFilter, typeFilter]);




  const renderDesktopView = () => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCombinedInventory.map((item) => (
            <React.Fragment key={item.id}>
              <TableRow onClick={() => item.isKit && toggleKitExpansion(item.id)} className={item.isKit ? 'cursor-pointer hover:bg-muted/50' : ''}>
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
                  <Badge variant="outline" className="text-xs">{item.projectCode}</Badge>
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
              </TableRow>
              {item.isKit && expandedKits.has(item.id) && item.kitItems && (
                <TableRow>
                  <TableCell colSpan={7} className="bg-muted/30 p-0">
                    <div className="p-4 space-y-2">
                      <div className="font-semibold text-sm">Kit Contents:</div>
                      {item.kitItems.map((kitItem) => (
                        <div key={kitItem.id} className="flex items-center gap-3 text-sm bg-muted/50 p-2 rounded">
                          <ImageWithFallback
                            src={kitItem.image || ''}
                            alt={kitItem.name}
                            className="w-8 h-8 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div>{kitItem.name}</div>
                            <div className="text-xs text-muted-foreground">{kitItem.sku}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">x{kitItem.quantity}</Badge>
                        </div>
                      ))}
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
        <Card key={item.id} onClick={() => item.isKit && toggleKitExpansion(item.id)} className={item.isKit ? 'cursor-pointer' : ''}>
          <CardContent className="p-4">
            <div className="flex gap-3">
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
                <div className="flex items-start gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-medium">{item.name}</h3>
                    {item.sku && <div className="text-xs text-muted-foreground">{item.sku}</div>}
                  </div>
                  {item.isKit && (
                    expandedKits.has(item.id) ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 mt-1" />
                    )
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{item.projectCode}</Badge>
                  {item.isKit ? (
                    <Badge variant="outline" className="text-xs">{item.warehouseCode}</Badge>
                  ) : (
                    item.projects?.[0] && <Badge variant="outline" className="text-xs">{item.projects[0].warehouseCode}</Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">Qty: {item.quantity}</Badge>
                </div>
              </div>
            </div>
            {item.isKit && expandedKits.has(item.id) && item.kitItems && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="text-sm font-semibold">Kit Contents:</div>
                {item.kitItems.map((kitItem) => (
                  <div key={kitItem.id} className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded">
                    <ImageWithFallback
                      src={kitItem.image || ''}
                      alt={kitItem.name}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{kitItem.name}</div>
                      <div className="text-xs text-muted-foreground">{kitItem.sku}</div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">x{kitItem.quantity}</Badge>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Inventory</h1>
          <p className="text-muted-foreground">
            Items currently under your responsibility
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => navigate('/engineer/requests?tab=history')} variant="outline" className="w-full sm:w-auto">
            <History className="h-4 w-4 mr-2" />
            Complete History
          </Button>
          <Button onClick={() => navigate('/engineer/requests?tab=transfer')} className="w-full sm:w-auto">
            Request Transfer
          </Button>
        </div>
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
              <h3 className="font-semibold mb-2">No items in your inventory</h3>
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


    </div>
  );
}