import { WarehouseV2, ZoneV2, RackV2, LevelV2, BinV2 } from '../types/warehouse-v2';
import { mockWarehousesV2 } from '../data/mockDataV2';

/**
 * Service for managing warehouse operations
 * Handles CRUD operations for all warehouse hierarchy levels
 */
export class WarehouseService {
  private warehouses: WarehouseV2[] = [...mockWarehousesV2];

  /**
   * Get all warehouses
   */
  getWarehouses(): WarehouseV2[] {
    return this.warehouses;
  }

  /**
   * Get warehouse by ID
   */
  getWarehouseById(id: string): WarehouseV2 | null {
    return this.warehouses.find(wh => wh.id === id) || null;
  }

  /**
   * Update warehouses data
   */
  setWarehouses(warehouses: WarehouseV2[]): void {
    this.warehouses = [...warehouses];
  }

  // Zone Operations
  /**
   * Add a new zone to a warehouse
   */
  addZone(warehouseId: string, zoneData: Partial<ZoneV2>): { success: boolean; warehouse?: WarehouseV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    
    if (warehouseIndex === -1) {
      return { success: false, error: 'Warehouse not found' };
    }

    const newZone: ZoneV2 = {
      id: `z${Date.now()}`,
      code: zoneData.code || this.generateZoneCode(warehouseId),
      name: zoneData.name || '',
      racks: [],
    };

    this.warehouses[warehouseIndex].zones.push(newZone);
    return { success: true, warehouse: this.warehouses[warehouseIndex] };
  }

  /**
   * Update a zone in a warehouse
   */
  updateZone(warehouseId: string, zoneId: string, zoneData: Partial<ZoneV2>): { success: boolean; warehouse?: WarehouseV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    
    if (warehouseIndex === -1) {
      return { success: false, error: 'Warehouse not found' };
    }

    const zoneIndex = this.warehouses[warehouseIndex].zones.findIndex(z => z.id === zoneId);
    
    if (zoneIndex === -1) {
      return { success: false, error: 'Zone not found' };
    }

    this.warehouses[warehouseIndex].zones[zoneIndex] = {
      ...this.warehouses[warehouseIndex].zones[zoneIndex],
      ...zoneData
    };

    return { success: true, warehouse: this.warehouses[warehouseIndex] };
  }

  /**
   * Delete a zone from a warehouse
   */
  deleteZone(warehouseId: string, zoneId: string): { success: boolean; warehouse?: WarehouseV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    
    if (warehouseIndex === -1) {
      return { success: false, error: 'Warehouse not found' };
    }

    const zone = this.warehouses[warehouseIndex].zones.find(z => z.id === zoneId);
    
    if (!zone) {
      return { success: false, error: 'Zone not found' };
    }

    if (zone.racks.length > 0) {
      return { success: false, error: 'Cannot delete zone with existing racks' };
    }

    const zoneIndex = this.warehouses[warehouseIndex].zones.findIndex(z => z.id === zoneId);
    this.warehouses[warehouseIndex].zones.splice(zoneIndex, 1);

    return { success: true, warehouse: this.warehouses[warehouseIndex] };
  }

  // Rack Operations
  /**
   * Add a new rack to a zone
   */
  addRack(warehouseId: string, zoneId: string, rackData: Partial<RackV2>): { success: boolean; zone?: ZoneV2; warehouse?: WarehouseV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    
    if (warehouseIndex === -1) {
      return { success: false, error: 'Warehouse not found' };
    }

    const zoneIndex = this.warehouses[warehouseIndex].zones.findIndex(z => z.id === zoneId);
    
    if (zoneIndex === -1) {
      return { success: false, error: 'Zone not found' };
    }

    const newRack: RackV2 = {
      id: `r${Date.now()}`,
      code: rackData.code || this.generateRackCode(warehouseId, zoneId),
      name: rackData.name || '',
      levels: [],
    };

    this.warehouses[warehouseIndex].zones[zoneIndex].racks.push(newRack);
    
    return { 
      success: true, 
      warehouse: this.warehouses[warehouseIndex],
      zone: this.warehouses[warehouseIndex].zones[zoneIndex]
    };
  }

  /**
   * Update a rack in a zone
   */
  updateRack(warehouseId: string, zoneId: string, rackId: string, rackData: Partial<RackV2>): { success: boolean; zone?: ZoneV2; warehouse?: WarehouseV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    const zoneIndex = this.warehouses[warehouseIndex]?.zones.findIndex(z => z.id === zoneId) ?? -1;
    const rackIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks.findIndex(r => r.id === rackId) ?? -1;
    
    if (warehouseIndex === -1 || zoneIndex === -1 || rackIndex === -1) {
      return { success: false, error: 'Rack, zone, or warehouse not found' };
    }

    this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex] = {
      ...this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex],
      ...rackData
    };

    return { 
      success: true, 
      warehouse: this.warehouses[warehouseIndex],
      zone: this.warehouses[warehouseIndex].zones[zoneIndex]
    };
  }

  /**
   * Delete a rack from a zone
   */
  deleteRack(warehouseId: string, zoneId: string, rackId: string): { success: boolean; zone?: ZoneV2; warehouse?: WarehouseV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    const zoneIndex = this.warehouses[warehouseIndex]?.zones.findIndex(z => z.id === zoneId) ?? -1;
    
    if (warehouseIndex === -1 || zoneIndex === -1) {
      return { success: false, error: 'Zone or warehouse not found' };
    }

    const rack = this.warehouses[warehouseIndex].zones[zoneIndex].racks.find(r => r.id === rackId);
    
    if (!rack) {
      return { success: false, error: 'Rack not found' };
    }

    if (rack.levels.length > 0) {
      return { success: false, error: 'Cannot delete rack with existing levels' };
    }

    const rackIndex = this.warehouses[warehouseIndex].zones[zoneIndex].racks.findIndex(r => r.id === rackId);
    this.warehouses[warehouseIndex].zones[zoneIndex].racks.splice(rackIndex, 1);

    return { 
      success: true, 
      warehouse: this.warehouses[warehouseIndex],
      zone: this.warehouses[warehouseIndex].zones[zoneIndex]
    };
  }

  // Level Operations
  /**
   * Add a new level to a rack
   */
  addLevel(warehouseId: string, zoneId: string, rackId: string, levelData: Partial<LevelV2>): { success: boolean; rack?: RackV2; zone?: ZoneV2; warehouse?: WarehouseV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    const zoneIndex = this.warehouses[warehouseIndex]?.zones.findIndex(z => z.id === zoneId) ?? -1;
    const rackIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks.findIndex(r => r.id === rackId) ?? -1;
    
    if (warehouseIndex === -1 || zoneIndex === -1 || rackIndex === -1) {
      return { success: false, error: 'Rack, zone, or warehouse not found' };
    }

    const newLevel: LevelV2 = {
      id: `l${Date.now()}`,
      code: levelData.code || this.generateLevelCode(warehouseId, zoneId, rackId),
      name: levelData.name || '',
      bins: [],
    };

    this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.push(newLevel);
    
    return { 
      success: true, 
      warehouse: this.warehouses[warehouseIndex],
      zone: this.warehouses[warehouseIndex].zones[zoneIndex],
      rack: this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex]
    };
  }

  /**
   * Update a level in a rack
   */
  updateLevel(warehouseId: string, zoneId: string, rackId: string, levelId: string, levelData: Partial<LevelV2>): { success: boolean; rack?: RackV2; zone?: ZoneV2; warehouse?: WarehouseV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    const zoneIndex = this.warehouses[warehouseIndex]?.zones.findIndex(z => z.id === zoneId) ?? -1;
    const rackIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks.findIndex(r => r.id === rackId) ?? -1;
    const levelIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks[rackIndex]?.levels.findIndex(l => l.id === levelId) ?? -1;
    
    if (warehouseIndex === -1 || zoneIndex === -1 || rackIndex === -1 || levelIndex === -1) {
      return { success: false, error: 'Level, rack, zone, or warehouse not found' };
    }

    this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex] = {
      ...this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex],
      ...levelData
    };

    return { 
      success: true, 
      warehouse: this.warehouses[warehouseIndex],
      zone: this.warehouses[warehouseIndex].zones[zoneIndex],
      rack: this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex]
    };
  }

  /**
   * Delete a level from a rack
   */
  deleteLevel(warehouseId: string, zoneId: string, rackId: string, levelId: string): { success: boolean; rack?: RackV2; zone?: ZoneV2; warehouse?: WarehouseV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    const zoneIndex = this.warehouses[warehouseIndex]?.zones.findIndex(z => z.id === zoneId) ?? -1;
    const rackIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks.findIndex(r => r.id === rackId) ?? -1;
    
    if (warehouseIndex === -1 || zoneIndex === -1 || rackIndex === -1) {
      return { success: false, error: 'Rack, zone, or warehouse not found' };
    }

    const level = this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.find(l => l.id === levelId);
    
    if (!level) {
      return { success: false, error: 'Level not found' };
    }

    if (level.bins.length > 0) {
      return { success: false, error: 'Cannot delete level with existing bins' };
    }

    const levelIndex = this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.findIndex(l => l.id === levelId);
    this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels.splice(levelIndex, 1);

    return { 
      success: true, 
      warehouse: this.warehouses[warehouseIndex],
      zone: this.warehouses[warehouseIndex].zones[zoneIndex],
      rack: this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex]
    };
  }

  // Bin Operations
  /**
   * Add a new bin to a level
   */
  addBin(warehouseId: string, zoneId: string, rackId: string, levelId: string, binData: Partial<BinV2>): { success: boolean; level?: LevelV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    const zoneIndex = this.warehouses[warehouseIndex]?.zones.findIndex(z => z.id === zoneId) ?? -1;
    const rackIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks.findIndex(r => r.id === rackId) ?? -1;
    const levelIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks[rackIndex]?.levels.findIndex(l => l.id === levelId) ?? -1;
    
    if (warehouseIndex === -1 || zoneIndex === -1 || rackIndex === -1 || levelIndex === -1) {
      return { success: false, error: 'Level, rack, zone, or warehouse not found' };
    }

    const newBin: BinV2 = {
      id: `b${Date.now()}`,
      code: binData.code || this.generateBinCode(warehouseId, zoneId, rackId, levelId),
      description: binData.description || '',
      createdAt: new Date(),
    };

    this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins.push(newBin);
    
    return { 
      success: true, 
      level: this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex]
    };
  }

  /**
   * Update a bin in a level
   */
  updateBin(warehouseId: string, zoneId: string, rackId: string, levelId: string, binId: string, binData: Partial<BinV2>): { success: boolean; level?: LevelV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    const zoneIndex = this.warehouses[warehouseIndex]?.zones.findIndex(z => z.id === zoneId) ?? -1;
    const rackIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks.findIndex(r => r.id === rackId) ?? -1;
    const levelIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks[rackIndex]?.levels.findIndex(l => l.id === levelId) ?? -1;
    const binIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks[rackIndex]?.levels[levelIndex]?.bins.findIndex(b => b.id === binId) ?? -1;
    
    if (warehouseIndex === -1 || zoneIndex === -1 || rackIndex === -1 || levelIndex === -1 || binIndex === -1) {
      return { success: false, error: 'Bin, level, rack, zone, or warehouse not found' };
    }

    this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins[binIndex] = {
      ...this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins[binIndex],
      ...binData
    };

    return { 
      success: true, 
      level: this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex]
    };
  }

  /**
   * Delete a bin from a level
   */
  deleteBin(warehouseId: string, zoneId: string, rackId: string, levelId: string, binId: string): { success: boolean; level?: LevelV2; error?: string } {
    const warehouseIndex = this.warehouses.findIndex(wh => wh.id === warehouseId);
    const zoneIndex = this.warehouses[warehouseIndex]?.zones.findIndex(z => z.id === zoneId) ?? -1;
    const rackIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks.findIndex(r => r.id === rackId) ?? -1;
    const levelIndex = this.warehouses[warehouseIndex]?.zones[zoneIndex]?.racks[rackIndex]?.levels.findIndex(l => l.id === levelId) ?? -1;
    
    if (warehouseIndex === -1 || zoneIndex === -1 || rackIndex === -1 || levelIndex === -1) {
      return { success: false, error: 'Level, rack, zone, or warehouse not found' };
    }

    const binIndex = this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins.findIndex(b => b.id === binId);
    
    if (binIndex === -1) {
      return { success: false, error: 'Bin not found' };
    }

    this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex].bins.splice(binIndex, 1);

    return { 
      success: true, 
      level: this.warehouses[warehouseIndex].zones[zoneIndex].racks[rackIndex].levels[levelIndex]
    };
  }

  // Code Generators
  /**
   * Generate zone code
   */
  generateZoneCode(warehouseId: string): string {
    const warehouse = this.getWarehouseById(warehouseId);
    if (!warehouse) return 'Z-01';
    const existingZones = warehouse.zones.length;
    return `Z-${String(existingZones + 1).padStart(2, '0')}`;
  }

  /**
   * Generate rack code
   */
  generateRackCode(warehouseId: string, zoneId: string): string {
    const warehouse = this.getWarehouseById(warehouseId);
    const zone = warehouse?.zones.find(z => z.id === zoneId);
    if (!zone) return 'R-01';
    const existingRacks = zone.racks.length;
    return `R-${String(existingRacks + 1).padStart(2, '0')}`;
  }

  /**
   * Generate level code
   */
  generateLevelCode(warehouseId: string, zoneId: string, rackId: string): string {
    const warehouse = this.getWarehouseById(warehouseId);
    const zone = warehouse?.zones.find(z => z.id === zoneId);
    const rack = zone?.racks.find(r => r.id === rackId);
    if (!rack) return 'L-01';
    const existingLevels = rack.levels.length;
    return `L-${String(existingLevels + 1).padStart(2, '0')}`;
  }

  /**
   * Generate bin code
   */
  generateBinCode(warehouseId: string, zoneId: string, rackId: string, levelId: string): string {
    const warehouse = this.getWarehouseById(warehouseId);
    const zone = warehouse?.zones.find(z => z.id === zoneId);
    const rack = zone?.racks.find(r => r.id === rackId);
    const level = rack?.levels.find(l => l.id === levelId);
    
    if (!warehouse || !zone || !rack || !level) {
      return 'BIN-CODE';
    }
    
    const existingBins = level.bins.length;
    const nextBinNumber = String(existingBins + 1).padStart(2, '0');
    return `${warehouse.code}-${zone.code}-${rack.code}-${level.code}-B${nextBinNumber}`;
  }
}

// Create a singleton instance
export const warehouseService = new WarehouseService();