import { WarehouseV2, ZoneV2, RackV2, LevelV2, BinV2 } from '../types/warehouse-v2';

/**
 * Utility functions for warehouse operations
 */

export type ViewLevel = 'warehouse' | 'zone' | 'rack' | 'level' | 'bin';

/**
 * Navigation utilities
 */
export const NavigationUtils = {
  /**
   * Determine current view level based on selections
   */
  getCurrentViewLevel(
    selectedWarehouse: WarehouseV2 | null,
    selectedZone: ZoneV2 | null,
    selectedRack: RackV2 | null,
    selectedLevel: LevelV2 | null
  ): ViewLevel {
    if (selectedLevel) return 'bin';
    if (selectedRack) return 'level';
    if (selectedZone) return 'rack';
    if (selectedWarehouse) return 'zone';
    return 'warehouse';
  },

  /**
   * Get breadcrumb path for current location
   */
  getLocationPath(
    selectedWarehouse: WarehouseV2 | null,
    selectedZone: ZoneV2 | null,
    selectedRack: RackV2 | null,
    selectedLevel: LevelV2 | null,
    onNavigate: (warehouse: WarehouseV2, zone?: ZoneV2, rack?: RackV2, level?: LevelV2) => void
  ): Array<{ label: string; onClick: () => void }> {
    const parts: Array<{ label: string; onClick: () => void }> = [];
    
    if (selectedWarehouse) {
      parts.push({ 
        label: selectedWarehouse.code, 
        onClick: () => onNavigate(selectedWarehouse) 
      });
    }
    if (selectedZone) {
      parts.push({ 
        label: selectedZone.code, 
        onClick: () => selectedWarehouse && onNavigate(selectedWarehouse, selectedZone) 
      });
    }
    if (selectedRack) {
      parts.push({ 
        label: selectedRack.code, 
        onClick: () => selectedWarehouse && selectedZone && onNavigate(selectedWarehouse, selectedZone, selectedRack) 
      });
    }
    if (selectedLevel) {
      parts.push({ 
        label: selectedLevel.code, 
        onClick: () => selectedWarehouse && selectedZone && selectedRack && onNavigate(selectedWarehouse, selectedZone, selectedRack, selectedLevel) 
      });
    }
    
    return parts;
  },

  /**
   * Get appropriate add button text based on current level
   */
  getAddButtonText(currentLevel: ViewLevel): string {
    switch (currentLevel) {
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
  }
};

/**
 * Validation utilities
 */
export const ValidationUtils = {
  /**
   * Check if a zone can be deleted
   */
  canDeleteZone(zone: ZoneV2): boolean {
    return zone.racks.length === 0;
  },

  /**
   * Check if a rack can be deleted
   */
  canDeleteRack(rack: RackV2): boolean {
    return rack.levels.length === 0;
  },

  /**
   * Check if a level can be deleted
   */
  canDeleteLevel(level: LevelV2): boolean {
    return level.bins.length === 0;
  },

  /**
   * Check if a bin can be deleted (always true for now)
   */
  canDeleteBin(_bin: BinV2): boolean {
    return true;
  },

  /**
   * Get validation error message for delete operation
   */
  getDeleteErrorMessage(type: 'zone' | 'rack' | 'level' | 'bin'): string {
    switch (type) {
      case 'zone':
        return 'Cannot delete zone with existing racks';
      case 'rack':
        return 'Cannot delete rack with existing levels';
      case 'level':
        return 'Cannot delete level with existing bins';
      case 'bin':
        return 'Cannot delete this bin';
      default:
        return 'Cannot delete this item';
    }
  }
};

/**
 * UI State utilities
 */
export const UIStateUtils = {
  /**
   * Reset selection state when navigating up the hierarchy
   */
  resetSelectionState(
    currentLevel: ViewLevel,
    deletedItemId: string,
    currentSelections: {
      selectedZone: ZoneV2 | null;
      selectedRack: RackV2 | null;
      selectedLevel: LevelV2 | null;
    }
  ): {
    selectedZone: ZoneV2 | null;
    selectedRack: RackV2 | null;
    selectedLevel: LevelV2 | null;
  } {
    const { selectedZone, selectedRack, selectedLevel } = currentSelections;
    
    switch (currentLevel) {
      case 'zone':
        if (selectedZone?.id === deletedItemId) {
          return {
            selectedZone: null,
            selectedRack: null,
            selectedLevel: null
          };
        }
        break;
      case 'rack':
        if (selectedRack?.id === deletedItemId) {
          return {
            selectedZone,
            selectedRack: null,
            selectedLevel: null
          };
        }
        break;
      case 'level':
        if (selectedLevel?.id === deletedItemId) {
          return {
            selectedZone,
            selectedRack,
            selectedLevel: null
          };
        }
        break;
    }
    
    return currentSelections;
  }
};

/**
 * Format utilities
 */
export const FormatUtils = {
  /**
   * Format date to readable string
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * Format bin code for display
   */
  formatBinCode(code: string): string {
    return code.toUpperCase();
  },

  /**
   * Truncate text with ellipsis
   */
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
};

/**
 * Search and filter utilities
 */
export const SearchUtils = {
  /**
   * Filter zones by search term
   */
  filterZones(zones: ZoneV2[], searchTerm: string): ZoneV2[] {
    if (!searchTerm) return zones;
    const term = searchTerm.toLowerCase();
    return zones.filter(zone => 
      zone.code.toLowerCase().includes(term) || 
      zone.name.toLowerCase().includes(term)
    );
  },

  /**
   * Filter racks by search term
   */
  filterRacks(racks: RackV2[], searchTerm: string): RackV2[] {
    if (!searchTerm) return racks;
    const term = searchTerm.toLowerCase();
    return racks.filter(rack => 
      rack.code.toLowerCase().includes(term) || 
      rack.name.toLowerCase().includes(term)
    );
  },

  /**
   * Filter levels by search term
   */
  filterLevels(levels: LevelV2[], searchTerm: string): LevelV2[] {
    if (!searchTerm) return levels;
    const term = searchTerm.toLowerCase();
    return levels.filter(level => 
      level.code.toLowerCase().includes(term) || 
      level.name.toLowerCase().includes(term)
    );
  },

  /**
   * Filter bins by search term
   */
  filterBins(bins: BinV2[], searchTerm: string): BinV2[] {
    if (!searchTerm) return bins;
    const term = searchTerm.toLowerCase();
    return bins.filter(bin => 
      bin.code.toLowerCase().includes(term) || 
      bin.description.toLowerCase().includes(term)
    );
  }
};

/**
 * Statistics utilities
 */
export const StatsUtils = {
  /**
   * Get warehouse statistics
   */
  getWarehouseStats(warehouse: WarehouseV2): {
    totalZones: number;
    totalRacks: number;
    totalLevels: number;
    totalBins: number;
  } {
    let totalRacks = 0;
    let totalLevels = 0;
    let totalBins = 0;

    warehouse.zones.forEach(zone => {
      totalRacks += zone.racks.length;
      zone.racks.forEach(rack => {
        totalLevels += rack.levels.length;
        rack.levels.forEach(level => {
          totalBins += level.bins.length;
        });
      });
    });

    return {
      totalZones: warehouse.zones.length,
      totalRacks,
      totalLevels,
      totalBins
    };
  },

  /**
   * Get zone statistics
   */
  getZoneStats(zone: ZoneV2): {
    totalRacks: number;
    totalLevels: number;
    totalBins: number;
  } {
    let totalLevels = 0;
    let totalBins = 0;

    zone.racks.forEach(rack => {
      totalLevels += rack.levels.length;
      rack.levels.forEach(level => {
        totalBins += level.bins.length;
      });
    });

    return {
      totalRacks: zone.racks.length,
      totalLevels,
      totalBins
    };
  },

  /**
   * Get rack statistics
   */
  getRackStats(rack: RackV2): {
    totalLevels: number;
    totalBins: number;
  } {
    let totalBins = 0;

    rack.levels.forEach(level => {
      totalBins += level.bins.length;
    });

    return {
      totalLevels: rack.levels.length,
      totalBins
    };
  },

  /**
   * Get level statistics
   */
  getLevelStats(level: LevelV2): {
    totalBins: number;
  } {
    return {
      totalBins: level.bins.length
    };
  }
};