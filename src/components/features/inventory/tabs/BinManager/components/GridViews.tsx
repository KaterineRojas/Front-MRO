import { Warehouse, Box, Grid3x3, Layers, Edit, Trash2 } from 'lucide-react';
import { ZoneV2, RackV2, LevelV2, BinV2 } from '../../../types/warehouse-v2';
import { Button } from '../../../../ui/button';

// Zone Grid View
interface ZoneGridViewProps {
  zones: ZoneV2[];
  onZoneClick: (zone: ZoneV2) => void;
  onEditZone: (zone: ZoneV2) => void;
  onDeleteZone: (zone: ZoneV2) => void;
}

export function ZoneGridView({ zones, onZoneClick, onEditZone, onDeleteZone }: ZoneGridViewProps) {
  const getZoneColor = (zoneCode: string) => {
    const code = zoneCode.toUpperCase();
    if (code.includes('GC') || code.includes('GOOD')) return {
      backgroundColor: '#bbf7d0',
      borderColor: '#16a34a',
      color: '#15803d'
    };
    if (code.includes('DMG') || code.includes('DAMAGE')) return {
      backgroundColor: '#fecaca',
      borderColor: '#dc2626',
      color: '#b91c1c'
    };
    if (code.includes('QTN') || code.includes('QUARANTINE')) return {
      backgroundColor: '#fef3c7',
      borderColor: '#d97706',
      color: '#b45309'
    };
    return {
      backgroundColor: '#bfdbfe',
      borderColor: '#2563eb',
      color: '#1d4ed8'
    };
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-gray-400 dark:border-gray-600 shadow-md p-6">
      <div className="mb-6 pb-4 border-b-2 border-blue-500 dark:border-blue-400">
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Warehouse className="w-6 h-6" />
          Warehouse Zones
        </h2>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">Select a zone to view racks</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {zones.map((zone) => {
          const zoneStyle = getZoneColor(zone.code);
          return (
          <div
            key={zone.id}
            onClick={() => onZoneClick(zone)}
            className="border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 relative group cursor-pointer"
            style={{
              backgroundColor: zoneStyle.backgroundColor,
              borderColor: zoneStyle.borderColor,
              color: zoneStyle.color
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEditZone(zone);
                }}
                className="h-8 w-8 p-0 bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDeleteZone(zone);
                }}
                className="h-8 w-8 p-0 bg-white dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex items-start gap-3 mb-3">
              <Warehouse className="w-8 h-8 flex-shrink-0" style={{ color: zoneStyle.color }} />
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold" style={{ color: zoneStyle.color }}>{zone.code}</div>
                <div className="text-sm truncate opacity-75" style={{ color: zoneStyle.color }}>{zone.name}</div>
              </div>
            </div>
            <div className="text-xs opacity-60" style={{ color: zoneStyle.color }}>
              {zone.racks.length} {zone.racks.length === 1 ? 'Rack' : 'Racks'}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

// Rack Grid View
interface RackGridViewProps {
  racks: RackV2[];
  onRackClick: (rack: RackV2) => void;
  onEditRack: (rack: RackV2) => void;
  onDeleteRack: (rack: RackV2) => void;
}

export function RackGridView({ racks, onRackClick, onEditRack, onDeleteRack }: RackGridViewProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-gray-400 dark:border-gray-600 shadow-md p-6">
      <div className="mb-6 pb-4 border-b-2 border-purple-500 dark:border-purple-400">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <Grid3x3 className="w-6 h-6" />
          Storage Racks
        </h2>
        <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 font-medium">Select a rack to view levels</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {racks.map((rack) => (
          <div
            key={rack.id}
            onClick={() => onRackClick(rack)}
            className="border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 relative group cursor-pointer"
            style={{
              backgroundColor: '#e9d5ff',
              borderColor: '#9333ea',
              color: '#7c2d12'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d8b4fe';
              e.currentTarget.style.borderColor = '#7c3aed';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#e9d5ff';
              e.currentTarget.style.borderColor = '#9333ea';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEditRack(rack);
                }}
                className="h-8 w-8 p-0 bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDeleteRack(rack);
                }}
                className="h-8 w-8 p-0 bg-white dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex items-start gap-3 mb-3">
              <Grid3x3 className="w-8 h-8 flex-shrink-0" style={{ color: '#7c2d12' }} />
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold" style={{ color: '#7c2d12' }}>{rack.code}</div>
                <div className="text-sm truncate opacity-75" style={{ color: '#7c2d12' }}>{rack.name}</div>
              </div>
            </div>
            <div className="text-xs opacity-60" style={{ color: '#7c2d12' }}>
              {rack.levels.length} {rack.levels.length === 1 ? 'Level' : 'Levels'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Level Grid View
interface LevelGridViewProps {
  levels: LevelV2[];
  onLevelClick: (level: LevelV2) => void;
  onEditLevel: (level: LevelV2) => void;
  onDeleteLevel: (level: LevelV2) => void;
}

export function LevelGridView({ levels, onLevelClick, onEditLevel, onDeleteLevel }: LevelGridViewProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-gray-400 dark:border-gray-600 shadow-md p-6">
      <div className="mb-6 pb-4 border-b-2 border-orange-500 dark:border-orange-400">
        <h2 className="text-xl font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2">
          <Layers className="w-6 h-6" />
          Rack Levels
        </h2>
        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1 font-medium">Select a level to view bins</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {levels.map((level) => (
          <div
            key={level.id}
            onClick={() => onLevelClick(level)}
            className="border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 relative group cursor-pointer"
            style={{
              backgroundColor: '#fed7aa',
              borderColor: '#ea580c',
              color: '#9a3412'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fdba74';
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fed7aa';
              e.currentTarget.style.borderColor = '#ea580c';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEditLevel(level);
                }}
                className="h-8 w-8 p-0 bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDeleteLevel(level);
                }}
                className="h-8 w-8 p-0 bg-white dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex items-start gap-3 mb-3">
              <Layers className="w-8 h-8 flex-shrink-0" style={{ color: '#9a3412' }} />
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold" style={{ color: '#9a3412' }}>{level.code}</div>
                <div className="text-sm truncate opacity-75" style={{ color: '#9a3412' }}>{level.name}</div>
              </div>
            </div>
            <div className="text-xs opacity-60" style={{ color: '#9a3412' }}>
              {level.bins.length} {level.bins.length === 1 ? 'Bin' : 'Bins'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bin Grid View
interface BinGridViewProps {
  bins: BinV2[];
  levelName: string;
  onBinClick?: (bin: BinV2) => void;
  onEditBin: (bin: BinV2) => void;
  onDeleteBin: (bin: BinV2) => void;
}

export function BinGridView({ bins, levelName, onBinClick, onEditBin, onDeleteBin }: BinGridViewProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-gray-400 dark:border-gray-600 shadow-md p-6">
      <div className="mb-6 pb-4 border-b-2 border-emerald-500 dark:border-emerald-400">
        <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Box className="w-6 h-6" />
          Storage Bins
        </h2>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
          Level: <span className="font-bold">{levelName}</span> - Manage bins in this level
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {bins.map((bin) => {
          const binCode = bin.code.split('-').pop() || bin.code;

          return (
            <div
              key={bin.id}
              onClick={() => onBinClick?.(bin)}
              className="border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-xl hover:scale-105 relative flex flex-col items-start justify-between min-h-[120px] group cursor-pointer"
              style={{
                backgroundColor: '#a7f3d0',
                borderColor: '#059669',
                color: '#065f46'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6ee7b7';
                e.currentTarget.style.borderColor = '#047857';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#a7f3d0';
                e.currentTarget.style.borderColor = '#059669';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Action Buttons */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onEditBin(bin);
                  }}
                  className="h-7 w-7 p-0 bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onDeleteBin(bin);
                  }}
                  className="h-7 w-7 p-0 bg-white dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-6 h-6 flex-shrink-0" style={{ color: '#065f46' }} />
                <div className="text-sm font-bold truncate" style={{ color: '#065f46' }}>{binCode}</div>
              </div>
              <div className="text-xs opacity-75 line-clamp-2" style={{ color: '#065f46' }}>
                {bin.description || 'Empty bin'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}