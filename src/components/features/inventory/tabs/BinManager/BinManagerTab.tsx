import { useState, useEffect } from 'react';
import { Plus, Warehouse, Grid3x3, Table2 } from 'lucide-react';
import { mockWarehousesV2 } from '../../data/mockDataV2';
import { WarehouseV2, ZoneV2, RackV2, LevelV2, BinV2 } from '../../types/warehouse-v2';
import { BinModal } from './modals/BinModal';
import { ZoneModal } from './modals/ZoneModal';
import { RackModal } from './modals/RackModal';
import { LevelModal } from './modals/LevelModal';
import { QuickBinModal } from './modals/QuickBinModal';
import { BinHierarchyView } from './components/BinHierarchyView';
import { BinTableView } from './components/BinTableView';
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
import { fetchWarehousesFromApi, createZoneApi, createRackApi, createLevelApi, createBinApi, createBinByHierarchyApi } from '../../services/inventoryApi';

type ViewLevel = 'warehouse' | 'zone' | 'rack' | 'level' | 'bin';
type ViewMode = 'grid' | 'table';

export function BinManagerTab() {
  const [warehouses, setWarehouses] = useState(mockWarehousesV2);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseV2 | null>(warehouses[0]);
  const [selectedZone, setSelectedZone] = useState<ZoneV2 | null>(null);
  const [selectedRack, setSelectedRack] = useState<RackV2 | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelV2 | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Table filters
  const [filterWarehouse, setFilterWarehouse] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterRack, setFilterRack] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  
  // Modals state
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [isQuickBinModalOpen, setIsQuickBinModalOpen] = useState(false);
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

  // Error state for QuickBinModal
  const [quickBinError, setQuickBinError] = useState<string>('');

  // Load warehouses from API on mount
  useEffect(() => {
    const loadWarehouses = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWarehousesFromApi();
        console.log('📦 Warehouses data received:', data);
        
        if (data && data.length > 0) {
          setWarehouses(data);
          setSelectedWarehouse(data[0]);
          toast.success('Warehouses loaded from backend');
        }
      } catch (error) {
        console.error('❌ Error loading warehouses:', error);
        toast.error('Failed to load warehouses from backend, using mock data');
        // Keep using mock data on error
      } finally {
        setIsLoading(false);
      }
    };

    loadWarehouses();
  }, []);

  const handleNavigate = (warehouse: WarehouseV2, zone?: ZoneV2, rack?: RackV2, level?: LevelV2) => {
    setSelectedWarehouse(warehouse);
    setSelectedZone(zone || null);
    setSelectedRack(rack || null);
    setSelectedLevel(level || null);
    
    // Sync table filters with navigation
    setFilterWarehouse(warehouse.id);
    setFilterZone(zone?.id || 'all');
    setFilterRack(rack?.id || 'all');
    setFilterLevel(level?.id || 'all');
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

  const handleQuickAddBin = () => {
    if (selectedZone) {
      setIsQuickBinModalOpen(true);
    } else {
      toast.error('Please select a zone first');
    }
  };

  // Code generators
  const generateZoneCode = () => {
    if (!selectedWarehouse) return 'Z01';
    const existingZones = selectedWarehouse.zones.length;
    return `Z${String(existingZones + 1).padStart(2, '0')}`;
  };

  const generateRackCode = () => {
    if (!selectedZone) return 'R01';
    const existingRacks = selectedZone.racks.length;
    return `R${String(existingRacks + 1).padStart(2, '0')}`;
  };

  const generateLevelCode = () => {
    if (!selectedRack) return 'L01';
    const existingLevels = selectedRack.levels.length;
    return `L${String(existingLevels + 1).padStart(2, '0')}`;
  };

  const generateBinCode = () => {
    if (!selectedWarehouse || !selectedZone || !selectedRack || !selectedLevel) {
      return 'BIN-CODE';
    }
    
    const existingBins = selectedLevel.bins.length;
    const nextBinNumber = String(existingBins + 1).padStart(2, '0');
    return `${selectedWarehouse.code}-${selectedZone.code}-${selectedRack.code}-${selectedLevel.code}-B${nextBinNumber}`;
  };

  // Helper functions to get all available items for modals
  const getAllZones = (): ZoneV2[] => {
    const warehouse = selectedWarehouse || warehouses[0];
    if (!warehouse) return [];
    return warehouse.zones;
  };

  const getAllRacks = (): RackV2[] => {
    const warehouse = selectedWarehouse || warehouses[0];
    if (!warehouse) return [];
    return warehouse.zones.flatMap(zone => zone.racks);
  };

  const getAllLevels = (): LevelV2[] => {
    const warehouse = selectedWarehouse || warehouses[0];
    if (!warehouse) return [];
    return warehouse.zones.flatMap(zone => 
      zone.racks.flatMap(rack => rack.levels)
    );
  };

  const findZoneIdForRack = (rack: RackV2): string | undefined => {
    const warehouse = selectedWarehouse || warehouses[0];
    if (!warehouse) return undefined;
    for (const zone of warehouse.zones) {
      if (zone.racks.some(r => r.id === rack.id)) {
        return zone.id;
      }
    }
    return undefined;
  };

  const findZoneIdForLevel = (level: LevelV2): string | undefined => {
    const warehouse = selectedWarehouse || warehouses[0];
    if (!warehouse) return undefined;
    for (const zone of warehouse.zones) {
      for (const rack of zone.racks) {
        if (rack.levels.some(l => l.id === level.id)) {
          return zone.id;
        }
      }
    }
    return undefined;
  };

  const findRackIdForLevel = (level: LevelV2): string | undefined => {
    const warehouse = selectedWarehouse || warehouses[0];
    if (!warehouse) return undefined;
    for (const zone of warehouse.zones) {
      for (const rack of zone.racks) {
        if (rack.levels.some(l => l.id === level.id)) {
          return rack.id;
        }
      }
    }
    return undefined;
  };

  const findZoneIdForBin = (bin: BinV2): string | undefined => {
    // Buscar en TODOS los warehouses, no solo el seleccionado
    for (const warehouse of warehouses) {
      for (const zone of warehouse.zones) {
        for (const rack of zone.racks) {
          for (const level of rack.levels) {
            if (level.bins.some(b => b.id === bin.id)) {
              return zone.id;
            }
          }
        }
      }
    }
    return undefined;
  };

  const findRackIdForBin = (bin: BinV2): string | undefined => {
    // Buscar en TODOS los warehouses
    for (const warehouse of warehouses) {
      for (const zone of warehouse.zones) {
        for (const rack of zone.racks) {
          for (const level of rack.levels) {
            if (level.bins.some(b => b.id === bin.id)) {
              return rack.id;
            }
          }
        }
      }
    }
    return undefined;
  };

  const findLevelIdForBin = (bin: BinV2): string | undefined => {
    // Buscar en TODOS los warehouses
    for (const warehouse of warehouses) {
      for (const zone of warehouse.zones) {
        for (const rack of zone.racks) {
          for (const level of rack.levels) {
            if (level.bins.some(b => b.id === bin.id)) {
              return level.id;
            }
          }
        }
      }
    }
    return undefined;
  };

  // Obtener el path completo de ubicación para un bin
  const getFullLocationPath = (bin: BinV2): string | undefined => {
    for (const warehouse of warehouses) {
      for (const zone of warehouse.zones) {
        for (const rack of zone.racks) {
          for (const level of rack.levels) {
            if (level.bins.some(b => b.id === bin.id)) {
              return `${warehouse.code} → ${zone.code} → ${rack.code} → ${level.code}`;
            }
          }
        }
      }
    }
    return undefined;
  };

  // Save handlers
  const handleSaveZone = async (zoneData: Partial<ZoneV2>) => {
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse first');
      return;
    }

    try {
      if (editingZone) {
        // Modo edición - actualizar localmente (TODO: implementar PUT API)
        const newWarehouses = [...warehouses];
        const warehouseIndex = newWarehouses.findIndex(wh => wh.id === selectedWarehouse.id);
        
        if (warehouseIndex !== -1) {
          const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === editingZone.id);
          if (zoneIndex !== -1) {
            newWarehouses[warehouseIndex].zones[zoneIndex] = { ...newWarehouses[warehouseIndex].zones[zoneIndex], ...zoneData };
          }
        }

        setWarehouses(newWarehouses);
        setSelectedWarehouse(newWarehouses[warehouseIndex]);
        toast.success('Zone updated successfully');
      } else {
        // Modo creación - llamar al API
        await createZoneApi({
          warehouseId: parseInt(selectedWarehouse.id),
          code: zoneData.code || '',
          name: zoneData.name || '',
        });

        // Recargar warehouses desde el API
        const updatedWarehouses = await fetchWarehousesFromApi();
        setWarehouses(updatedWarehouses);
        
        // Mantener la selección del warehouse actual
        const updatedWarehouse = updatedWarehouses.find(wh => wh.id === selectedWarehouse.id);
        if (updatedWarehouse) {
          setSelectedWarehouse(updatedWarehouse);
        }

        toast.success('Zone created successfully');
      }

      setIsZoneModalOpen(false);
      setEditingZone(null);
    } catch (error) {
      console.log('🔴 CAUGHT ERROR:', error);
      const message = error instanceof Error ? error.message : 'Failed to save zone';
      console.log('🔴 ERROR MESSAGE:', message);
      toast.error(message, { duration: 5000 });
      console.log('🔴 TOAST CALLED');
      alert('ERROR: ' + message); // Temporal para debug
    }
  };

  const handleSaveRack = async (rackData: Partial<RackV2>) => {
    if (!selectedWarehouse || !selectedZone) {
      toast.error('Please select a zone first');
      return;
    }

    try {
      if (editingRack) {
        // Modo edición - actualizar localmente (TODO: implementar PUT API)
        const newWarehouses = [...warehouses];
        const warehouseIndex = newWarehouses.findIndex(wh => wh.id === selectedWarehouse.id);
        const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === selectedZone.id);
        
        if (warehouseIndex !== -1 && zoneIndex !== -1) {
          const rackIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === editingRack.id);
          if (rackIndex !== -1) {
            newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex] = { 
              ...newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex], 
              ...rackData 
            };
          }
        }

        setWarehouses(newWarehouses);
        setSelectedWarehouse(newWarehouses[warehouseIndex]);
        setSelectedZone(newWarehouses[warehouseIndex].zones[zoneIndex]);
        toast.success('Rack updated successfully');
      } else {
        // Modo creación - llamar al API
        await createRackApi({
          zoneId: parseInt(selectedZone.id),
          code: rackData.code || '',
          name: rackData.name || '',
        });

        // Recargar warehouses desde el API
        const updatedWarehouses = await fetchWarehousesFromApi();
        setWarehouses(updatedWarehouses);
        
        // Mantener la selección actual
        const updatedWarehouse = updatedWarehouses.find(wh => wh.id === selectedWarehouse.id);
        if (updatedWarehouse) {
          setSelectedWarehouse(updatedWarehouse);
          const updatedZone = updatedWarehouse.zones.find(z => z.id === selectedZone.id);
          if (updatedZone) {
            setSelectedZone(updatedZone);
          }
        }

        toast.success('Rack created successfully');
      }

      setIsRackModalOpen(false);
      setEditingRack(null);
    } catch (error) {
      console.log('🔴 CAUGHT ERROR:', error);
      const message = error instanceof Error ? error.message : 'Failed to save rack';
      console.log('🔴 ERROR MESSAGE:', message);
      toast.error(message, { duration: 5000 });
      console.log('🔴 TOAST CALLED');
      alert('ERROR: ' + message); // Temporal para debug
    }
  };

  const handleSaveLevel = async (levelData: Partial<LevelV2>) => {
    if (!selectedWarehouse || !selectedZone || !selectedRack) {
      toast.error('Please select a rack first');
      return;
    }

    try {
      if (editingLevel) {
        // Modo edición - actualizar localmente (TODO: implementar PUT API)
        const newWarehouses = [...warehouses];
        const warehouseIndex = newWarehouses.findIndex(wh => wh.id === selectedWarehouse.id);
        const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === selectedZone.id);
        const rackIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === selectedRack.id);
        
        if (warehouseIndex !== -1 && zoneIndex !== -1 && rackIndex !== -1) {
          const levelIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.findIndex(l => l.id === editingLevel.id);
          if (levelIndex !== -1) {
            newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex] = { 
              ...newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex], 
              ...levelData 
            };
          }
        }

        setWarehouses(newWarehouses);
        setSelectedWarehouse(newWarehouses[warehouseIndex]);
        setSelectedZone(newWarehouses[warehouseIndex].zones[zoneIndex]);
        setSelectedRack(newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex]);
        toast.success('Level updated successfully');
      } else {
        // Modo creación - llamar al API
        await createLevelApi({
          rackId: parseInt(selectedRack.id),
          code: levelData.code || '',
          name: levelData.name || '',
        });

        // Recargar warehouses desde el API
        const updatedWarehouses = await fetchWarehousesFromApi();
        setWarehouses(updatedWarehouses);
        
        // Mantener la selección actual
        const updatedWarehouse = updatedWarehouses.find(wh => wh.id === selectedWarehouse.id);
        if (updatedWarehouse) {
          setSelectedWarehouse(updatedWarehouse);
          const updatedZone = updatedWarehouse.zones.find(z => z.id === selectedZone.id);
          if (updatedZone) {
            setSelectedZone(updatedZone);
            const updatedRack = updatedZone.racks.find(r => r.id === selectedRack.id);
            if (updatedRack) {
              setSelectedRack(updatedRack);
            }
          }
        }

        toast.success('Level created successfully');
      }

      setIsLevelModalOpen(false);
      setEditingLevel(null);
    } catch (error) {
      console.log('🔴 CAUGHT ERROR:', error);
      const message = error instanceof Error ? error.message : 'Failed to save level';
      console.log('🔴 ERROR MESSAGE:', message);
      toast.error(message, { duration: 5000 });
      console.log('🔴 TOAST CALLED');
      alert('ERROR: ' + message); // Temporal para debug
    }
  };

  const handleSaveBin = async (binData: Partial<BinV2>) => {
    if (!selectedWarehouse || !selectedZone || !selectedRack || !selectedLevel) {
      toast.error('Please select a level first');
      return;
    }

    try {
      if (editingBin) {
        // Modo edición - actualizar localmente (TODO: implementar PUT API)
        const newWarehouses = [...warehouses];
        const warehouseIndex = newWarehouses.findIndex(wh => wh.id === selectedWarehouse.id);
        const zoneIndex = newWarehouses[warehouseIndex].zones.findIndex(z => z.id === selectedZone.id);
        const rackIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === selectedRack.id);
        const levelIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.findIndex(l => l.id === selectedLevel.id);
        
        if (warehouseIndex !== -1 && zoneIndex !== -1 && rackIndex !== -1 && levelIndex !== -1) {
          const binIndex = newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins.findIndex(b => b.id === editingBin.id);
          if (binIndex !== -1) {
            newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins[binIndex] = { 
              ...newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins[binIndex], 
              ...binData 
            };
          }
        }

        setWarehouses(newWarehouses);
        setSelectedLevel(newWarehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex]);
        toast.success('Bin updated successfully');
      } else {
        // Modo creación - llamar al API
        await createBinApi({
          levelId: parseInt(selectedLevel.id),
          code: binData.code || '',
          name: binData.name || '',
          allowDifferentItems: binData.allowDifferentItems || false
        });

        // Recargar warehouses desde el API
        const updatedWarehouses = await fetchWarehousesFromApi();
        setWarehouses(updatedWarehouses);
        
        // Mantener la selección actual
        const updatedWarehouse = updatedWarehouses.find(wh => wh.id === selectedWarehouse.id);
        if (updatedWarehouse) {
          setSelectedWarehouse(updatedWarehouse);
          const updatedZone = updatedWarehouse.zones.find(z => z.id === selectedZone.id);
          if (updatedZone) {
            setSelectedZone(updatedZone);
            const updatedRack = updatedZone.racks.find(r => r.id === selectedRack.id);
            if (updatedRack) {
              setSelectedRack(updatedRack);
              const updatedLevel = updatedRack.levels.find(l => l.id === selectedLevel.id);
              if (updatedLevel) {
                setSelectedLevel(updatedLevel);
              }
            }
          }
        }

        toast.success('Bin created successfully');
      }

      setIsBinModalOpen(false);
      setEditingBin(null);
    } catch (error) {
      console.log('🔴 CAUGHT ERROR:', error);
      const message = error instanceof Error ? error.message : 'Failed to save bin';
      console.log('🔴 ERROR MESSAGE:', message);
      toast.error(message, { duration: 5000 });
      console.log('🔴 TOAST CALLED');
      alert('ERROR: ' + message); // Temporal para debug
    }
  };

  const handleSaveQuickBin = async (binData: {
    code: string;
    name: string;
    rackCode: string;
    levelCode: string;
    allowDifferentItems: boolean;
  }) => {
    if (!selectedWarehouse || !selectedZone) {
      setQuickBinError('Debe seleccionar una zona primero');
      return;
    }

    // Clear any previous errors
    setQuickBinError('');

    try {
      // Formatear códigos: agregar padding de ceros si es necesario
      // R1 -> R01, L2 -> L02, B3 -> B03
      const formatCode = (code: string): string => {
        const match = code.match(/^([A-Z]+)(\d+)$/i);
        if (match) {
          const prefix = match[1].toUpperCase();
          const number = match[2].padStart(2, '0');
          return `${prefix}${number}`;
        }
        return code.toUpperCase();
      };

      const formattedData = {
        warehouseCode: selectedWarehouse.code,
        zoneCode: selectedZone.code,
        rackCode: formatCode(binData.rackCode),
        levelCode: formatCode(binData.levelCode),
        binCode: formatCode(binData.code),
        name: binData.name,
      };

      console.log('🔍 Creating bin:', formattedData);

      // Usar el nuevo endpoint que crea el bin usando códigos jerárquicos
      await createBinByHierarchyApi(formattedData);

      // Recargar warehouses
      const updatedWarehouses = await fetchWarehousesFromApi();
      setWarehouses(updatedWarehouses);

      // Mantener selección
      const updatedWarehouse = updatedWarehouses.find(wh => wh.id === selectedWarehouse.id);
      if (updatedWarehouse) {
        setSelectedWarehouse(updatedWarehouse);
        const updatedZone = updatedWarehouse.zones.find(z => z.id === selectedZone.id);
        if (updatedZone) {
          setSelectedZone(updatedZone);
        }
      }

      // Success - show toast and close modal
      toast.success(`Bin creado exitosamente: ${formattedData.warehouseCode}-${formattedData.zoneCode}-${formattedData.rackCode}-${formattedData.levelCode}-${formattedData.binCode}`,
        { duration: 4000 });
      setIsQuickBinModalOpen(false);
      setQuickBinError(''); // Clear error
    } catch (error) {
      console.error('❌ Error creating bin:', error);

      // Extraer el mensaje de error más específico posible
      let errorMessage = 'No se pudo crear el bin';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Set error state to display in modal
      setQuickBinError(errorMessage);
    }
  };

  // Edit and delete handlers for GridViews
  const handleEditZone = (zone: ZoneV2) => {
    setEditingZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleDeleteZone = (zone: ZoneV2) => {
    setDeletingItem(zone);
    setDeletingType('zone');
  };

  const handleEditRack = (rack: RackV2) => {
    setEditingRack(rack);
    setIsRackModalOpen(true);
  };

  const handleDeleteRack = (rack: RackV2) => {
    setDeletingItem(rack);
    setDeletingType('rack');
  };

  const handleEditLevel = (level: LevelV2) => {
    setEditingLevel(level);
    setIsLevelModalOpen(true);
  };

  const handleDeleteLevel = (level: LevelV2) => {
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

  // Filter change handlers that sync with navigation
  const handleFilterWarehouseChange = (warehouseId: string) => {
    setFilterWarehouse(warehouseId);
    if (warehouseId !== 'all') {
      const warehouse = warehouses.find(wh => wh.id === warehouseId);
      if (warehouse) {
        handleNavigate(warehouse);
      }
    } else {
      setSelectedWarehouse(null);
      setSelectedZone(null);
      setSelectedRack(null);
      setSelectedLevel(null);
    }
  };

  const handleFilterZoneChange = (zoneId: string) => {
    setFilterZone(zoneId);
    if (selectedWarehouse) {
      if (zoneId !== 'all') {
        const zone = selectedWarehouse.zones.find(z => z.id === zoneId);
        if (zone) {
          handleNavigate(selectedWarehouse, zone);
        }
      } else {
        handleNavigate(selectedWarehouse);
      }
    }
  };

  const handleFilterRackChange = (rackId: string) => {
    setFilterRack(rackId);
    if (selectedWarehouse && selectedZone) {
      if (rackId !== 'all') {
        const rack = selectedZone.racks.find(r => r.id === rackId);
        if (rack) {
          handleNavigate(selectedWarehouse, selectedZone, rack);
        }
      } else {
        handleNavigate(selectedWarehouse, selectedZone);
      }
    }
  };

  const handleFilterLevelChange = (levelId: string) => {
    setFilterLevel(levelId);
    if (selectedWarehouse && selectedZone && selectedRack) {
      if (levelId !== 'all') {
        const level = selectedRack.levels.find(l => l.id === levelId);
        if (level) {
          handleNavigate(selectedWarehouse, selectedZone, selectedRack, level);
        }
      } else {
        handleNavigate(selectedWarehouse, selectedZone, selectedRack);
      }
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
    <>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {/* Location Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Location:</span>
            <div className="flex items-center gap-1 flex-wrap px-2 py-1 bg-white dark:bg-gray-900 rounded border dark:border-gray-700">
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
          
          {/* View Toggle and Add Button */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8"
              >
                <Grid3x3 className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                onClick={() => setViewMode('table')}
                className="h-8"
              >
                <Table2 className="w-4 h-4 mr-1" />
                Table
              </Button>
            </div>
            
            {/* Quick Add Bin Button (only in zone view) */}
            {getCurrentViewLevel() === 'rack' && selectedZone && (
              <Button onClick={handleQuickAddBin} size="sm" variant="outline" className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Bin
              </Button>
            )}
            
            {/* Add Button */}
            {/* <Button onClick={handleAddClick} size="sm" className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              {getAddButtonText()}
            </Button>*/}
          </div>
        </div>

        {/* Content View */}
        <div className="px-2">
          {viewMode === 'grid' ? (
            <BinHierarchyView
              currentViewLevel={getCurrentViewLevel()}
              selectedWarehouse={selectedWarehouse}
              selectedZone={selectedZone}
              selectedRack={selectedRack}
              selectedLevel={selectedLevel}
              onZoneClick={handleZoneClick}
              onRackClick={handleRackClick}
              onLevelClick={handleLevelClick}
              onEditZone={handleEditZone}
              onDeleteZone={handleDeleteZone}
              onEditRack={handleEditRack}
              onDeleteRack={handleDeleteRack}
              onEditLevel={handleEditLevel}
              onDeleteLevel={handleDeleteLevel}
              onEditBin={handleEditBin}
              onDeleteBin={handleDeleteBin}
            />
          ) : (
            <BinTableView
              warehouses={warehouses}
              filterWarehouse={filterWarehouse}
              filterZone={filterZone}
              filterRack={filterRack}
              filterLevel={filterLevel}
              onFilterWarehouseChange={handleFilterWarehouseChange}
              onFilterZoneChange={handleFilterZoneChange}
              onFilterRackChange={handleFilterRackChange}
              onFilterLevelChange={handleFilterLevelChange}
              onEditBin={handleEditBin}
              onDeleteBin={handleDeleteBin}
            />
          )}
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
        warehouseCode={selectedWarehouse?.code}
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
        locationPath={selectedWarehouse && selectedZone ? `${selectedWarehouse.code} → ${selectedZone.code}` : undefined}
        availableZones={getAllZones()}
        currentZoneId={editingRack ? findZoneIdForRack(editingRack) : selectedZone?.id}
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
        locationPath={selectedWarehouse && selectedZone && selectedRack ? `${selectedWarehouse.code} → ${selectedZone.code} → ${selectedRack.code}` : undefined}
        availableZones={getAllZones()}
        availableRacks={getAllRacks()}
        currentZoneId={editingLevel ? findZoneIdForLevel(editingLevel) : selectedZone?.id}
        currentRackId={editingLevel ? findRackIdForLevel(editingLevel) : selectedRack?.id}
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
        locationPath={editingBin ? getFullLocationPath(editingBin) : (selectedWarehouse && selectedZone && selectedRack && selectedLevel ? `${selectedWarehouse.code} → ${selectedZone.code} → ${selectedRack.code} → ${selectedLevel.code}` : undefined)}
        availableZones={getAllZones()}
        availableRacks={getAllRacks()}
        availableLevels={getAllLevels()}
        currentZoneId={editingBin ? findZoneIdForBin(editingBin) : selectedZone?.id}
        currentRackId={editingBin ? findRackIdForBin(editingBin) : selectedRack?.id}
        currentLevelId={editingBin ? findLevelIdForBin(editingBin) : selectedLevel?.id}
      />

      <QuickBinModal
        isOpen={isQuickBinModalOpen}
        onClose={() => {
          setIsQuickBinModalOpen(false);
          setQuickBinError(''); // Clear error on close
        }}
        onSave={handleSaveQuickBin}
        selectedZone={selectedZone!}
        locationPath={selectedWarehouse && selectedZone ? `${selectedWarehouse.code} → ${selectedZone.code}` : undefined}
        errorMessage={quickBinError}
        onClearError={() => setQuickBinError('')}
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
              {(() => {
                if (!deletingItem) return null;
                
                let canDelete = true;
                let message = `Are you sure you want to delete this ${deletingType}?`;
                
                if (deletingType === 'zone') {
                  const zone = deletingItem as ZoneV2;
                  if (zone.racks.length > 0) {
                    canDelete = false;
                    message = `Cannot delete this zone because it contains ${zone.racks.length} rack${zone.racks.length > 1 ? 's' : ''}.`;
                  }
                } else if (deletingType === 'rack') {
                  const rack = deletingItem as RackV2;
                  if (rack.levels.length > 0) {
                    canDelete = false;
                    message = `Cannot delete this rack because it contains ${rack.levels.length} level${rack.levels.length > 1 ? 's' : ''}.`;
                  }
                } else if (deletingType === 'level') {
                  const level = deletingItem as LevelV2;
                  if (level.bins.length > 0) {
                    canDelete = false;
                    message = `Cannot delete this level because it contains ${level.bins.length} bin${level.bins.length > 1 ? 's' : ''}.`;
                  }
                } else if (deletingType === 'bin') {
                  const bin = deletingItem as BinV2;
                  if (bin.quantity > 0) {
                    canDelete = false;
                    message = `Cannot delete this bin because it contains ${bin.quantity} item${bin.quantity > 1 ? 's' : ''}. The quantity must be zero.`;
                  }
                }
                
                return (
                  <>
                    <span>{message}</span>
                    {canDelete && (
                      <span className="block mt-2 text-sm text-muted-foreground">
                        This action cannot be undone.
                      </span>
                    )}
                    {!canDelete && (
                      <span className="block mt-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                        Please remove all content before deleting.
                      </span>
                    )}
                  </>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={(() => {
                if (!deletingItem) return true;
                if (deletingType === 'zone') return (deletingItem as ZoneV2).racks.length > 0;
                if (deletingType === 'rack') return (deletingItem as RackV2).levels.length > 0;
                if (deletingType === 'level') return (deletingItem as LevelV2).bins.length > 0;
                if (deletingType === 'bin') return (deletingItem as BinV2).quantity > 0;
                return false;
              })()}
              className="bg-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
    </>
  );
}
