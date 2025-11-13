import { useState } from 'react';
import { Plus, Warehouse } from 'lucide-react';
import { mockWarehousesV2 } from '../../data/mockDataV2';
import { WarehouseV2, ZoneV2, RackV2, LevelV2, BinV2 } from '../../types/warehouse-v2';
import { BinModal } from './modals/BinModal';
import { ZoneModal } from './modals/ZoneModal';
import { RackModal } from './modals/RackModal';
import { LevelModal } from './modals/LevelModal';
import { ZoneGridView, RackGridView, LevelGridView, BinGridView } from './components/GridViews';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../ui/alert-dialog';
import { toast } from 'sonner';

type ViewLevel = 'warehouse' | 'zone' | 'rack' | 'level' | 'bin';

export function BinManagerTab() {
  const [warehouses, setWarehouses] = useState(mockWarehousesV2);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseV2 | null>(warehouses[0]);
  const [selectedZone, setSelectedZone] = useState<ZoneV2 | null>(null);
  const [selectedRack, setSelectedRack] = useState<RackV2 | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelV2 | null>(null);
  
  // Modals state
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isRackModalOpen, setIsRackModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  
  // Editing items
  const [editingBin, setEditingBin] = useState<BinV2 | null>(null);
  const [editingZone, setEditingZone] = useState<ZoneV2 | null>(null);
  const [editingRack, setEditingRack] = useState<RackV2 | null>(null);
  const [editingLevel, setEditingLevel] = useState<LevelV2 | null>(null);
  
  const [deletingItem, setDeletingItem] = useState<ZoneV2 | RackV2 | LevelV2 | BinV2 | null>(null);
  const [deletingType, setDeletingType] = useState<'zone' | 'rack' | 'level' | 'bin' | null>(null);

  const handleNavigate = (warehouse: WarehouseV2, zone?: ZoneV2, rack?: RackV2, level?: LevelV2) => {
    setSelectedWarehouse(warehouse);
    setSelectedZone(zone || null);
    setSelectedRack(rack || null);
    setSelectedLevel(level || null);
  };

  const getCurrentViewLevel = (): ViewLevel => {
    if (selectedLevel) return 'bin';
    if (selectedRack) return 'level';
    if (selectedZone) return 'rack';
    if (selectedWarehouse) return 'zone';
    return 'warehouse';
  };

  const getAddButtonText = () => {
    const level = getCurrentViewLevel();
    switch (level) {
      case 'zone':
        return 'Add Zone';
      case 'rack':
        return 'Add Rack';
      case 'level':
        return 'Add Level';
      case 'bin':
        return 'Add Bin';
      default:
        return 'Add';
    }
  };

  const handleAddClick = () => {
    const level = getCurrentViewLevel();
    
    if (level === 'zone' && selectedWarehouse) {
      setEditingZone(null);
      setIsZoneModalOpen(true);
    } else if (level === 'rack' && selectedZone) {
      setEditingRack(null);
      setIsRackModalOpen(true);
    } else if (level === 'level' && selectedRack) {
      setEditingLevel(null);
      setIsLevelModalOpen(true);
    } else if (level === 'bin' && selectedLevel) {
      setEditingBin(null);
      setIsBinModalOpen(true);
    } else {
      toast.error('Please select a parent location first');
    }
  };

  // Code generators
  const generateZoneCode = () => {
    if (!selectedWarehouse) return 'Z-01';
    const existingZones = selectedWarehouse.zones.length;
    return `Z-${String(existingZones + 1).padStart(2, '0')}`;
  };

  const generateRackCode = () => {
    if (!selectedZone) return 'R-01';
    const existingRacks = selectedZone.racks.length;
    return `R-${String(existingRacks + 1).padStart(2, '0')}`;
  };

  const generateLevelCode = () => {
    if (!selectedRack) return 'L-01';
    const existingLevels = selectedRack.levels.length;
    return `L-${String(existingLevels + 1).padStart(2, '0')}`;
  };

  const generateBinCode = () => {
    if (!selectedWarehouse || !selectedZone || !selectedRack || !selectedLevel) {
      return 'BIN-CODE';
    }
    
    const existingBins = selectedLevel.bins.length;
    const nextBinNumber = String(existingBins + 1).padStart(2, '0');
    return `${selectedWarehouse.code}-${selectedZone.code}-${selectedRack.code}-${selectedLevel.code}-B${nextBinNumber}`;
  };

  // Save handlers
  const handleSaveZone = (zoneData: Partial<ZoneV2>) => {
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse first');
      return;
    }

    const newWarehouses = [...warehouses];
    const warehouseIndex = newWarehouses.findIndex(wh => wh.id === selectedWarehouse.id);
    
    if (warehouseIndex !== -1) {
      if (editingZone) {
        const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === editingZone.id);
        if (zoneIndex !== -1) {
          newWarehouses[warehouseIndex].zones[zoneIndex] = { ...newWarehouses[warehouseIndex].zones[zoneIndex], ...zoneData };
        }
      } else {
        const newZone: ZoneV2 = {
          id: `z${Date.now()}`,
          code: zoneData.code || generateZoneCode(),
          name: zoneData.name || '',
          racks: [],
        };
        newWarehouses[warehouseIndex].zones.push(newZone);
      }
    }

    setWarehouses(newWarehouses);
    setSelectedWarehouse(newWarehouses[warehouseIndex]);

    setIsZoneModalOpen(false);
    setEditingZone(null);
    toast.success(editingZone ? 'Zone updated successfully' : 'Zone created successfully');
  };

  const handleSaveRack = (rackData: Partial<RackV2>) => {
    if (!selectedWarehouse || !selectedZone) {
      toast.error('Please select a zone first');
      return;
    }

    const newWarehouses = [...warehouses];
    const warehouseIndex = newWarehouses.findIndex(wh => wh.id === selectedWarehouse.id);
    const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === selectedZone.id);
    
    if (warehouseIndex !== -1 && zoneIndex !== -1) {
      if (editingRack) {
        const rackIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === editingRack.id);
        if (rackIndex !== -1) {
          newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex] = { 
            ...newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex], 
            ...rackData 
          };
        }
      } else {
        const newRack: RackV2 = {
          id: `r${Date.now()}`,
          code: rackData.code || generateRackCode(),
          name: rackData.name || '',
          levels: [],
        };
        newWarehouses[warehouseIndex].zones[zoneIndex].racks.push(newRack);
      }
    }

    setWarehouses(newWarehouses);
    setSelectedWarehouse(newWarehouses[warehouseIndex]);
    setSelectedZone(newWarehouses[warehouseIndex].zones[zoneIndex]);

    setIsRackModalOpen(false);
    setEditingRack(null);
    toast.success(editingRack ? 'Rack updated successfully' : 'Rack created successfully');
  };

  const handleSaveLevel = (levelData: Partial<LevelV2>) => {
    if (!selectedWarehouse || !selectedZone || !selectedRack) {
      toast.error('Please select a rack first');
      return;
    }

    const newWarehouses = [...warehouses];
    const warehouseIndex = newWarehouses.findIndex(wh => wh.id === selectedWarehouse.id);
    const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === selectedZone.id);
    const rackIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === selectedRack.id);
    
    if (warehouseIndex !== -1 && zoneIndex !== -1 && rackIndex !== -1) {
      if (editingLevel) {
        const levelIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.findIndex(l => l.id === editingLevel.id);
        if (levelIndex !== -1) {
          newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex] = { 
            ...newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex], 
            ...levelData 
          };
        }
      } else {
        const newLevel: LevelV2 = {
          id: `l${Date.now()}`,
          code: levelData.code || generateLevelCode(),
          name: levelData.name || '',
          bins: [],
        };
        newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.push(newLevel);
      }
    }

    setWarehouses(newWarehouses);
    setSelectedWarehouse(newWarehouses[warehouseIndex]);
    setSelectedZone(newWarehouses[warehouseIndex].zones[zoneIndex]);
    setSelectedRack(newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex]);

    setIsLevelModalOpen(false);
    setEditingLevel(null);
    toast.success(editingLevel ? 'Level updated successfully' : 'Level created successfully');
  };

  const handleSaveBin = (binData: Partial<BinV2>) => {
    if (!selectedWarehouse || !selectedZone || !selectedRack || !selectedLevel) {
      toast.error('Please select a level first');
      return;
    }

    const newWarehouses = [...warehouses];
    const warehouseIndex = newWarehouses.findIndex(wh => wh.id === selectedWarehouse.id);
    const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === selectedZone.id);
    const rackIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === selectedRack.id);
    const levelIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.findIndex(l => l.id === selectedLevel.id);
    
    if (warehouseIndex !== -1 && zoneIndex !== -1 && rackIndex !== -1 && levelIndex !== -1) {
      if (editingBin) {
        const binIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins.findIndex(b => b.id === editingBin.id);
        if (binIndex !== -1) {
          newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins[binIndex] = { 
            ...newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins[binIndex], 
            ...binData 
          };
        }
      } else {
        const newBin: BinV2 = {
          id: `b${Date.now()}`,
          code: binData.code || generateBinCode(),
          description: binData.description || '',
          createdAt: new Date(),
        };
        newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins.push(newBin);
      }
    }

    setWarehouses(newWarehouses);
    setSelectedLevel(newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex]);

    setIsBinModalOpen(false);
    setEditingBin(null);
    toast.success(editingBin ? 'Bin updated successfully' : 'Bin created successfully');
  };

  // Edit and delete handlers for GridViews
  const handleEditZone = (zone: ZoneV2) => {
    setEditingZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleDeleteZone = (zone: ZoneV2) => {
    if (zone.racks.length > 0) {
      toast.error('Cannot delete zone with existing racks');
      return;
    }
    setDeletingItem(zone);
    setDeletingType('zone');
  };

  const handleEditRack = (rack: RackV2) => {
    setEditingRack(rack);
    setIsRackModalOpen(true);
  };

  const handleDeleteRack = (rack: RackV2) => {
    if (rack.levels.length > 0) {
      toast.error('Cannot delete rack with existing levels');
      return;
    }
    setDeletingItem(rack);
    setDeletingType('rack');
  };

  const handleEditLevel = (level: LevelV2) => {
    setEditingLevel(level);
    setIsLevelModalOpen(true);
  };

  const handleDeleteLevel = (level: LevelV2) => {
    if (level.bins.length > 0) {
      toast.error('Cannot delete level with existing bins');
      return;
    }
    setDeletingItem(level);
    setDeletingType('level');
  };

  const handleEditBin = (bin: BinV2) => {
    setEditingBin(bin);
    setIsBinModalOpen(true);
  };

  const handleDeleteBin = (bin: BinV2) => {
    setDeletingItem(bin);
    setDeletingType('bin');
  };

  // Navigate handlers
  const handleZoneClick = (zone: ZoneV2) => {
    if (selectedWarehouse) {
      handleNavigate(selectedWarehouse, zone);
    }
  };

  const handleRackClick = (rack: RackV2) => {
    if (selectedWarehouse && selectedZone) {
      handleNavigate(selectedWarehouse, selectedZone, rack);
    }
  };

  const handleLevelClick = (level: LevelV2) => {
    if (selectedWarehouse && selectedZone && selectedRack) {
      handleNavigate(selectedWarehouse, selectedZone, selectedRack, level);
    }
  };

  const getLocationPath = () => {
    const parts: Array<{ label: string; onClick: () => void }> = [];
    
    if (selectedWarehouse) {
      parts.push({ 
        label: selectedWarehouse.code, 
        onClick: () => handleNavigate(selectedWarehouse) 
      });
    }
    if (selectedZone) {
      parts.push({ 
        label: selectedZone.code, 
        onClick: () => selectedWarehouse && handleNavigate(selectedWarehouse, selectedZone) 
      });
    }
    if (selectedRack) {
      parts.push({ 
        label: selectedRack.code, 
        onClick: () => selectedWarehouse && selectedZone && handleNavigate(selectedWarehouse, selectedZone, selectedRack) 
      });
    }
    if (selectedLevel) {
      parts.push({ 
        label: selectedLevel.code, 
        onClick: () => selectedWarehouse && selectedZone && selectedRack && handleNavigate(selectedWarehouse, selectedZone, selectedRack, selectedLevel) 
      });
    }
    
    return parts;
  };

  const renderGridView = () => {
    const level = getCurrentViewLevel();

    switch (level) {
      case 'zone':
        return selectedWarehouse ? (
          <ZoneGridView 
            zones={selectedWarehouse.zones} 
            onZoneClick={handleZoneClick}
            onEditZone={handleEditZone}
            onDeleteZone={handleDeleteZone}
          />
        ) : null;

      case 'rack':
        return selectedZone ? (
          <RackGridView 
            racks={selectedZone.racks} 
            onRackClick={handleRackClick}
            onEditRack={handleEditRack}
            onDeleteRack={handleDeleteRack}
          />
        ) : null;

      case 'level':
        return selectedRack ? (
          <LevelGridView 
            levels={selectedRack.levels} 
            onLevelClick={handleLevelClick}
            onEditLevel={handleEditLevel}
            onDeleteLevel={handleDeleteLevel}
          />
        ) : null;

      case 'bin':
        return selectedLevel ? (
          <BinGridView 
            bins={selectedLevel.bins}
            levelName={selectedLevel.name}
            onEditBin={handleEditBin}
            onDeleteBin={handleDeleteBin}
          />
        ) : null;

      default:
        return null;
    }
  };

  const handleDelete = () => {
    if (!deletingItem || !deletingType || !selectedWarehouse) return;

    const newWarehouses = [...warehouses];
    const warehouseIndex = newWarehouses.findIndex(wh => wh.id === selectedWarehouse.id);
    
    if (deletingType === 'zone') {
      const zone = deletingItem as ZoneV2;
      const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === zone.id);
      if (zoneIndex !== -1) {
        newWarehouses[warehouseIndex].zones.splice(zoneIndex, 1);
        setWarehouses(newWarehouses);
        setSelectedWarehouse(newWarehouses[warehouseIndex]);
        if (selectedZone?.id === zone.id) {
          setSelectedZone(null);
          setSelectedRack(null);
          setSelectedLevel(null);
        }
        toast.success('Zone deleted successfully');
      }
    } else if (deletingType === 'rack' && selectedZone) {
      const rack = deletingItem as RackV2;
      const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === selectedZone.id);
      if (zoneIndex !== -1) {
        const rackIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === rack.id);
        if (rackIndex !== -1) {
          newWarehouses[warehouseIndex].zones[zoneIndex].racks.splice(rackIndex, 1);
          setWarehouses(newWarehouses);
          setSelectedWarehouse(newWarehouses[warehouseIndex]);
          setSelectedZone(newWarehouses[warehouseIndex].zones[zoneIndex]);
          if (selectedRack?.id === rack.id) {
            setSelectedRack(null);
            setSelectedLevel(null);
          }
          toast.success('Rack deleted successfully');
        }
      }
    } else if (deletingType === 'level' && selectedZone && selectedRack) {
      const level = deletingItem as LevelV2;
      const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === selectedZone.id);
      const rackIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === selectedRack.id);
      if (zoneIndex !== -1 && rackIndex !== -1) {
        const levelIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.findIndex(l => l.id === level.id);
        if (levelIndex !== -1) {
          newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.splice(levelIndex, 1);
          setWarehouses(newWarehouses);
          setSelectedWarehouse(newWarehouses[warehouseIndex]);
          setSelectedZone(newWarehouses[warehouseIndex].zones[zoneIndex]);
          setSelectedRack(newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex]);
          if (selectedLevel?.id === level.id) {
            setSelectedLevel(null);
          }
          toast.success('Level deleted successfully');
        }
      }
    } else if (deletingType === 'bin' && selectedZone && selectedRack && selectedLevel) {
      const bin = deletingItem as BinV2;
      const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === selectedZone.id);
      const rackIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === selectedRack.id);
      const levelIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.findIndex(l => l.id === selectedLevel.id);
      if (zoneIndex !== -1 && rackIndex !== -1 && levelIndex !== -1) {
        const binIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins.findIndex(b => b.id === bin.id);
        if (binIndex !== -1) {
          newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins.splice(binIndex, 1);
          setWarehouses(newWarehouses);
          setSelectedLevel(newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex]);
          toast.success('Bin deleted successfully');
        }
      }
    }

    setDeletingItem(null);
    setDeletingType(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-2xl font-bold">
              <Warehouse className="h-6 w-6 mr-2" />
              Bin Manager
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Warehouse Physical Structure Management
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-2 bg-muted/50 rounded-lg">
          {/* Location Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Location:</span>
            <div className="flex items-center gap-1 flex-wrap px-2 py-1 bg-primary/10 rounded border">
              {getLocationPath().length > 0 ? (
                getLocationPath().map((part, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {index > 0 && <span className="text-muted-foreground">→</span>}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={part.onClick}
                      className="h-auto p-1 text-primary hover:text-primary/80 hover:underline font-medium"
                    >
                      {part.label}
                    </Button>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Select a location</span>
              )}
            </div>
          </div>
          
          {/* Add Button */}
          <Button onClick={handleAddClick} size="sm" className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            {getAddButtonText()}
          </Button>
        </div>

        {/* Grid View */}
        <div className="px-2">
          {renderGridView()}
        </div>
      </CardContent>

      {/* Modals */}
      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => {
          setIsZoneModalOpen(false);
          setEditingZone(null);
        }}
        onSave={handleSaveZone}
        zone={editingZone}
        generatedCode={generateZoneCode()}
      />

      <RackModal
        isOpen={isRackModalOpen}
        onClose={() => {
          setIsRackModalOpen(false);
          setEditingRack(null);
        }}
        onSave={handleSaveRack}
        rack={editingRack}
        generatedCode={generateRackCode()}
      />

      <LevelModal
        isOpen={isLevelModalOpen}
        onClose={() => {
          setIsLevelModalOpen(false);
          setEditingLevel(null);
        }}
        onSave={handleSaveLevel}
        level={editingLevel}
        generatedCode={generateLevelCode()}
      />

      <BinModal
        isOpen={isBinModalOpen}
        onClose={() => {
          setIsBinModalOpen(false);
          setEditingBin(null);
        }}
        onSave={handleSaveBin}
        bin={editingBin}
        generatedCode={generateBinCode()}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingItem} onOpenChange={() => {
        setDeletingItem(null);
        setDeletingType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingType}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deletingType}? 
              {deletingType !== 'bin' && (
                <span className="block mt-2">
                  Only empty {deletingType}s can be deleted.
                </span>
              )}
              {deletingType === 'bin' && (
                <span className="block mt-2">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}