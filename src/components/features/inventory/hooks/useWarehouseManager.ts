import { useState } from 'react';
import { toast } from 'sonner';
import { WarehouseV2, ZoneV2, RackV2, LevelV2, BinV2 } from '../types/warehouse-v2';
import { warehouseService } from '../services/warehouseService';
import { 
  NavigationUtils, 
  ValidationUtils, 
  UIStateUtils, 
  ViewLevel 
} from '../utils/warehouseUtils';

/**
 * Custom hook for warehouse management operations
 */
export function useWarehouseManager() {
  const [warehouses, setWarehouses] = useState(warehouseService.getWarehouses());
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseV2 | null>(warehouses[0]);
  const [selectedZone, setSelectedZone] = useState<ZoneV2 | null>(null);
  const [selectedRack, setSelectedRack] = useState<RackV2 | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelV2 | null>(null);

  // Modal states
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isRackModalOpen, setIsRackModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  // Editing items
  const [editingBin, setEditingBin] = useState<BinV2 | null>(null);
  const [editingZone, setEditingZone] = useState<ZoneV2 | null>(null);
  const [editingRack, setEditingRack] = useState<RackV2 | null>(null);
  const [editingLevel, setEditingLevel] = useState<LevelV2 | null>(null);

  // Delete confirmation state
  const [deletingItem, setDeletingItem] = useState<ZoneV2 | RackV2 | LevelV2 | BinV2 | null>(null);
  const [deletingType, setDeletingType] = useState<'zone' | 'rack' | 'level' | 'bin' | null>(null);

  /**
   * Navigation functions
   */
  const navigate = (warehouse: WarehouseV2, zone?: ZoneV2, rack?: RackV2, level?: LevelV2) => {
    setSelectedWarehouse(warehouse);
    setSelectedZone(zone || null);
    setSelectedRack(rack || null);
    setSelectedLevel(level || null);
  };

  const getCurrentViewLevel = (): ViewLevel => {
    return NavigationUtils.getCurrentViewLevel(selectedWarehouse, selectedZone, selectedRack, selectedLevel);
  };

  const getLocationPath = () => {
    return NavigationUtils.getLocationPath(
      selectedWarehouse,
      selectedZone,
      selectedRack,
      selectedLevel,
      navigate
    );
  };

  const getAddButtonText = () => {
    return NavigationUtils.getAddButtonText(getCurrentViewLevel());
  };

  /**
   * Modal management
   */
  const openAddModal = () => {
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

  const closeModals = () => {
    setIsBinModalOpen(false);
    setIsZoneModalOpen(false);
    setIsRackModalOpen(false);
    setIsLevelModalOpen(false);
    setEditingBin(null);
    setEditingZone(null);
    setEditingRack(null);
    setEditingLevel(null);
  };

  /**
   * CRUD Operations
   */
  
  // Zone operations
  const saveZone = (zoneData: Partial<ZoneV2>) => {
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse first');
      return;
    }

    const result = editingZone
      ? warehouseService.updateZone(selectedWarehouse.id, editingZone.id, zoneData)
      : warehouseService.addZone(selectedWarehouse.id, zoneData);

    if (result.success && result.warehouse) {
      warehouseService.setWarehouses(warehouseService.getWarehouses());
      setWarehouses(warehouseService.getWarehouses());
      setSelectedWarehouse(result.warehouse);
      setIsZoneModalOpen(false);
      setEditingZone(null);
      toast.success(editingZone ? 'Zone updated successfully' : 'Zone created successfully');
    } else {
      toast.error(result.error || 'Failed to save zone');
    }
  };

  // Rack operations
  const saveRack = (rackData: Partial<RackV2>) => {
    if (!selectedWarehouse || !selectedZone) {
      toast.error('Please select a zone first');
      return;
    }

    const result = editingRack
      ? warehouseService.updateRack(selectedWarehouse.id, selectedZone.id, editingRack.id, rackData)
      : warehouseService.addRack(selectedWarehouse.id, selectedZone.id, rackData);

    if (result.success && result.warehouse && result.zone) {
      warehouseService.setWarehouses(warehouseService.getWarehouses());
      setWarehouses(warehouseService.getWarehouses());
      setSelectedWarehouse(result.warehouse);
      setSelectedZone(result.zone);
      setIsRackModalOpen(false);
      setEditingRack(null);
      toast.success(editingRack ? 'Rack updated successfully' : 'Rack created successfully');
    } else {
      toast.error(result.error || 'Failed to save rack');
    }
  };

  // Level operations
  const saveLevel = (levelData: Partial<LevelV2>) => {
    if (!selectedWarehouse || !selectedZone || !selectedRack) {
      toast.error('Please select a rack first');
      return;
    }

    const result = editingLevel
      ? warehouseService.updateLevel(selectedWarehouse.id, selectedZone.id, selectedRack.id, editingLevel.id, levelData)
      : warehouseService.addLevel(selectedWarehouse.id, selectedZone.id, selectedRack.id, levelData);

    if (result.success && result.warehouse && result.zone && result.rack) {
      warehouseService.setWarehouses(warehouseService.getWarehouses());
      setWarehouses(warehouseService.getWarehouses());
      setSelectedWarehouse(result.warehouse);
      setSelectedZone(result.zone);
      setSelectedRack(result.rack);
      setIsLevelModalOpen(false);
      setEditingLevel(null);
      toast.success(editingLevel ? 'Level updated successfully' : 'Level created successfully');
    } else {
      toast.error(result.error || 'Failed to save level');
    }
  };

  // Bin operations
  const saveBin = (binData: Partial<BinV2>) => {
    if (!selectedWarehouse || !selectedZone || !selectedRack || !selectedLevel) {
      toast.error('Please select a level first');
      return;
    }

    const result = editingBin
      ? warehouseService.updateBin(selectedWarehouse.id, selectedZone.id, selectedRack.id, selectedLevel.id, editingBin.id, binData)
      : warehouseService.addBin(selectedWarehouse.id, selectedZone.id, selectedRack.id, selectedLevel.id, binData);

    if (result.success && result.level) {
      setSelectedLevel(result.level);
      setIsBinModalOpen(false);
      setEditingBin(null);
      toast.success(editingBin ? 'Bin updated successfully' : 'Bin created successfully');
    } else {
      toast.error(result.error || 'Failed to save bin');
    }
  };

  /**
   * Edit handlers
   */
  const editZone = (zone: ZoneV2) => {
    setEditingZone(zone);
    setIsZoneModalOpen(true);
  };

  const editRack = (rack: RackV2) => {
    setEditingRack(rack);
    setIsRackModalOpen(true);
  };

  const editLevel = (level: LevelV2) => {
    setEditingLevel(level);
    setIsLevelModalOpen(true);
  };

  const editBin = (bin: BinV2) => {
    setEditingBin(bin);
    setIsBinModalOpen(true);
  };

  /**
   * Delete handlers
   */
  const deleteZone = (zone: ZoneV2) => {
    if (!ValidationUtils.canDeleteZone(zone)) {
      toast.error(ValidationUtils.getDeleteErrorMessage('zone'));
      return;
    }
    setDeletingItem(zone);
    setDeletingType('zone');
  };

  const deleteRack = (rack: RackV2) => {
    if (!ValidationUtils.canDeleteRack(rack)) {
      toast.error(ValidationUtils.getDeleteErrorMessage('rack'));
      return;
    }
    setDeletingItem(rack);
    setDeletingType('rack');
  };

  const deleteLevel = (level: LevelV2) => {
    if (!ValidationUtils.canDeleteLevel(level)) {
      toast.error(ValidationUtils.getDeleteErrorMessage('level'));
      return;
    }
    setDeletingItem(level);
    setDeletingType('level');
  };

  const deleteBin = (bin: BinV2) => {
    setDeletingItem(bin);
    setDeletingType('bin');
  };

  /**
   * Confirm delete operation
   */
  const confirmDelete = () => {
    if (!deletingItem || !deletingType || !selectedWarehouse) return;

    let result;
    const warehouseId = selectedWarehouse.id;

    switch (deletingType) {
      case 'zone':
        result = warehouseService.deleteZone(warehouseId, deletingItem.id);
        if (result.success && result.warehouse) {
          warehouseService.setWarehouses(warehouseService.getWarehouses());
          setWarehouses(warehouseService.getWarehouses());
          setSelectedWarehouse(result.warehouse);
          
          const newSelections = UIStateUtils.resetSelectionState(
            'zone',
            deletingItem.id,
            { selectedZone, selectedRack, selectedLevel }
          );
          setSelectedZone(newSelections.selectedZone);
          setSelectedRack(newSelections.selectedRack);
          setSelectedLevel(newSelections.selectedLevel);
        }
        break;

      case 'rack':
        if (selectedZone) {
          result = warehouseService.deleteRack(warehouseId, selectedZone.id, deletingItem.id);
          if (result.success && result.warehouse && result.zone) {
            warehouseService.setWarehouses(warehouseService.getWarehouses());
            setWarehouses(warehouseService.getWarehouses());
            setSelectedWarehouse(result.warehouse);
            setSelectedZone(result.zone);
            
            const newSelections = UIStateUtils.resetSelectionState(
              'rack',
              deletingItem.id,
              { selectedZone, selectedRack, selectedLevel }
            );
            setSelectedRack(newSelections.selectedRack);
            setSelectedLevel(newSelections.selectedLevel);
          }
        }
        break;

      case 'level':
        if (selectedZone && selectedRack) {
          result = warehouseService.deleteLevel(warehouseId, selectedZone.id, selectedRack.id, deletingItem.id);
          if (result.success && result.warehouse && result.zone && result.rack) {
            warehouseService.setWarehouses(warehouseService.getWarehouses());
            setWarehouses(warehouseService.getWarehouses());
            setSelectedWarehouse(result.warehouse);
            setSelectedZone(result.zone);
            setSelectedRack(result.rack);
            
            const newSelections = UIStateUtils.resetSelectionState(
              'level',
              deletingItem.id,
              { selectedZone, selectedRack, selectedLevel }
            );
            setSelectedLevel(newSelections.selectedLevel);
          }
        }
        break;

      case 'bin':
        if (selectedZone && selectedRack && selectedLevel) {
          result = warehouseService.deleteBin(warehouseId, selectedZone.id, selectedRack.id, selectedLevel.id, deletingItem.id);
          if (result.success && result.level) {
            setSelectedLevel(result.level);
          }
        }
        break;
    }

    if (result?.success) {
      toast.success(`${deletingType} deleted successfully`);
    } else {
      toast.error(result?.error || `Failed to delete ${deletingType}`);
    }

    setDeletingItem(null);
    setDeletingType(null);
  };

  const cancelDelete = () => {
    setDeletingItem(null);
    setDeletingType(null);
  };

  /**
   * Navigation click handlers
   */
  const handleZoneClick = (zone: ZoneV2) => {
    if (selectedWarehouse) {
      navigate(selectedWarehouse, zone);
    }
  };

  const handleRackClick = (rack: RackV2) => {
    if (selectedWarehouse && selectedZone) {
      navigate(selectedWarehouse, selectedZone, rack);
    }
  };

  const handleLevelClick = (level: LevelV2) => {
    if (selectedWarehouse && selectedZone && selectedRack) {
      navigate(selectedWarehouse, selectedZone, selectedRack, level);
    }
  };

  /**
   * Code generators
   */
  const generateZoneCode = () => {
    return selectedWarehouse ? warehouseService.generateZoneCode(selectedWarehouse.id) : 'Z-01';
  };

  const generateRackCode = () => {
    return selectedWarehouse && selectedZone 
      ? warehouseService.generateRackCode(selectedWarehouse.id, selectedZone.id) 
      : 'R-01';
  };

  const generateLevelCode = () => {
    return selectedWarehouse && selectedZone && selectedRack 
      ? warehouseService.generateLevelCode(selectedWarehouse.id, selectedZone.id, selectedRack.id) 
      : 'L-01';
  };

  const generateBinCode = () => {
    return selectedWarehouse && selectedZone && selectedRack && selectedLevel 
      ? warehouseService.generateBinCode(selectedWarehouse.id, selectedZone.id, selectedRack.id, selectedLevel.id) 
      : 'BIN-CODE';
  };

  return {
    // State
    warehouses,
    selectedWarehouse,
    selectedZone,
    selectedRack,
    selectedLevel,
    
    // Modal states
    isBinModalOpen,
    isZoneModalOpen,
    isRackModalOpen,
    isLevelModalOpen,
    
    // Editing states
    editingBin,
    editingZone,
    editingRack,
    editingLevel,
    
    // Delete states
    deletingItem,
    deletingType,
    
    // Navigation functions
    navigate,
    getCurrentViewLevel,
    getLocationPath,
    getAddButtonText,
    handleZoneClick,
    handleRackClick,
    handleLevelClick,
    
    // Modal management
    openAddModal,
    closeModals,
    
    // CRUD operations
    saveZone,
    saveRack,
    saveLevel,
    saveBin,
    
    // Edit handlers
    editZone,
    editRack,
    editLevel,
    editBin,
    
    // Delete handlers
    deleteZone,
    deleteRack,
    deleteLevel,
    deleteBin,
    confirmDelete,
    cancelDelete,
    
    // Code generators
    generateZoneCode,
    generateRackCode,
    generateLevelCode,
    generateBinCode
  };
}