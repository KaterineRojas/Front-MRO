import { useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { WarehouseV2, ZoneV2, RackV2, LevelV2, BinV2 } from '../../../types/warehouse-v2';
import { Button } from '../../../../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../ui/select';

interface BinTableViewProps {
  warehouses: WarehouseV2[];
  filterWarehouse: string;
  filterZone: string;
  filterRack: string;
  filterLevel: string;
  onFilterWarehouseChange: (value: string) => void;
  onFilterZoneChange: (value: string) => void;
  onFilterRackChange: (value: string) => void;
  onFilterLevelChange: (value: string) => void;
  onEditBin: (bin: BinV2) => void;
  onDeleteBin: (bin: BinV2) => void;
}

export function BinTableView({
  warehouses,
  filterWarehouse,
  filterZone,
  filterRack,
  filterLevel,
  onFilterWarehouseChange,
  onFilterZoneChange,
  onFilterRackChange,
  onFilterLevelChange,
  onEditBin,
  onDeleteBin,
}: BinTableViewProps) {
  // Get all bins with their hierarchy
  const getAllBins = useMemo(() => {
    const allBins: Array<{
      bin: BinV2;
      warehouse: WarehouseV2;
      zone: ZoneV2;
      rack: RackV2;
      level: LevelV2;
    }> = [];

    warehouses.forEach(warehouse => {
      warehouse.zones.forEach(zone => {
        zone.racks.forEach(rack => {
          rack.levels.forEach(level => {
            level.bins.forEach(bin => {
              allBins.push({ bin, warehouse, zone, rack, level });
            });
          });
        });
      });
    });

    return allBins;
  }, [warehouses]);

  // Filtered bins
  const filteredBins = useMemo(() => {
    return getAllBins.filter(({ warehouse, zone, rack, level }) => {
      if (filterWarehouse !== 'all' && warehouse.id !== filterWarehouse) return false;
      if (filterZone !== 'all' && zone.id !== filterZone) return false;
      if (filterRack !== 'all' && rack.id !== filterRack) return false;
      if (filterLevel !== 'all' && level.id !== filterLevel) return false;
      return true;
    });
  }, [getAllBins, filterWarehouse, filterZone, filterRack, filterLevel]);

  // Get available zones based on selected warehouse filter
  const availableZones = useMemo(() => {
    if (filterWarehouse === 'all') {
      const allZones: ZoneV2[] = [];
      warehouses.forEach(wh => allZones.push(...wh.zones));
      return allZones;
    }
    const warehouse = warehouses.find(wh => wh.id === filterWarehouse);
    return warehouse?.zones || [];
  }, [warehouses, filterWarehouse]);

  // Get available racks based on selected zone filter
  const availableRacks = useMemo(() => {
    if (filterZone === 'all') {
      const allRacks: RackV2[] = [];
      availableZones.forEach(zone => allRacks.push(...zone.racks));
      return allRacks;
    }
    const zone = availableZones.find(z => z.id === filterZone);
    return zone?.racks || [];
  }, [availableZones, filterZone]);

  // Get available levels based on selected rack filter
  const availableLevels = useMemo(() => {
    if (filterRack === 'all') {
      const allLevels: LevelV2[] = [];
      availableRacks.forEach(rack => allLevels.push(...rack.levels));
      return allLevels;
    }
    const rack = availableRacks.find(r => r.id === filterRack);
    return rack?.levels || [];
  }, [availableRacks, filterRack]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 border dark:border-border rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium">Warehouse</label>
          <Select value={filterWarehouse} onValueChange={onFilterWarehouseChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map(wh => (
                <SelectItem key={wh.id} value={wh.id}>{wh.code} - {wh.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Zone</label>
          <Select value={filterZone} onValueChange={onFilterZoneChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {availableZones.map(zone => (
                <SelectItem key={zone.id} value={zone.id}>{zone.code} - {zone.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Rack</label>
          <Select value={filterRack} onValueChange={onFilterRackChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Racks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Racks</SelectItem>
              {availableRacks.map(rack => (
                <SelectItem key={rack.id} value={rack.id}>{rack.code} - {rack.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Level</label>
          <Select value={filterLevel} onValueChange={onFilterLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {availableLevels.map(level => (
                <SelectItem key={level.id} value={level.id}>{level.code} - {level.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border dark:border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bin Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Rack</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No bins found
                </TableCell>
              </TableRow>
            ) : (
              filteredBins.map(({ bin, warehouse, zone, rack, level }) => (
                <TableRow key={bin.id}>
                  <TableCell className="font-medium">{bin.code}</TableCell>
                  <TableCell>{bin.name || '-'}</TableCell>
                  <TableCell>{bin.itemName || '-'}</TableCell>
                  <TableCell>
                    <span className={bin.quantity > 0 ? 'font-semibold text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                      {bin.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{warehouse.code}</TableCell>
                  <TableCell>{zone.code}</TableCell>
                  <TableCell>{rack.code}</TableCell>
                  <TableCell>{level.code}</TableCell>
                  <TableCell>{new Date(bin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditBin(bin)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteBin(bin)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredBins.length} of {getAllBins.length} bins
      </div>
    </div>
  );
}
