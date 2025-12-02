import { Warehouse, Box, Grid3x3, Layers } from 'lucide-react';
import { ZoneV2, RackV2, LevelV2, BinV2 } from '../../../types/warehouse-v2';
import { HierarchyCard } from './HierarchyCard';

// Zone Grid View
interface ZoneGridViewProps {
  zones: ZoneV2[];
  onZoneClick: (zone: ZoneV2) => void;
  onEditZone: (zone: ZoneV2) => void;
  onDeleteZone: (zone: ZoneV2) => void;
}

export function ZoneGridView({ zones, onZoneClick, onEditZone, onDeleteZone }: ZoneGridViewProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md p-6">
      <div className="mb-6 pb-4 border-b-2 border-gray-300 dark:border-gray-600">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Warehouse className="w-6 h-6" />
          Warehouse Zones
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Select a zone to view racks</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {zones.map((zone) => (
          <HierarchyCard
            key={zone.id}
            id={zone.id}
            code={zone.code}
            name={zone.name}
            icon={Warehouse}
            color="blue"
            subtitle={`${zone.racks.length} ${zone.racks.length === 1 ? 'Rack' : 'Racks'}`}
            onClick={() => onZoneClick(zone)}
            onEdit={() => onEditZone(zone)}
            onDelete={() => onDeleteZone(zone)}
          />
        ))}
      </div>
    </div>
  );
}

// Rack Grid View with Bins organized by Level
interface RackGridViewProps {
  racks: RackV2[];
  onRackClick: (rack: RackV2) => void;
  onEditRack: (rack: RackV2) => void;
  onDeleteRack: (rack: RackV2) => void;
  showBins?: boolean;
  onEditBin?: (bin: BinV2) => void;
  onDeleteBin?: (bin: BinV2) => void;
}

export function RackGridView({ racks, onRackClick, onEditRack, onDeleteRack, showBins = false, onEditBin, onDeleteBin }: RackGridViewProps) {
  if (showBins) {
    // Show all bins organized by levels
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md p-6">
        <div className="mb-6 pb-4 border-b-2 border-gray-300 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Box className="w-6 h-6" />
            All Bins in Zone
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Organized by racks and levels</p>
        </div>
        
        <div className="space-y-6">
          {racks.map((rack) => (
            <div key={rack.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                {rack.code} - {rack.name}
              </h3>
              
              {rack.levels.map((level) => (
                <div key={level.id} className="mb-4 last:mb-0">
                  <div className="mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {level.code} - {level.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      ({level.bins.length} bins)
                    </span>
                  </div>
                  
                  {level.bins.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 ml-6">
                      {level.bins.map((bin) => {
                        const binCode = bin.code.split('-').pop() || bin.code;
                        return (
                          <HierarchyCard
                            key={bin.id}
                            id={bin.id}
                            code={binCode}
                            name={bin.name || 'Empty bin'}
                            icon={Box}
                            color="green"
                            subtitle=""
                            onClick={() => {}}
                            onEdit={() => onEditBin?.(bin)}
                            onDelete={() => onDeleteBin?.(bin)}
                            extraContent={
                              <>
                                {bin.itemName && (
                                  <div className="text-xs font-medium mt-1 mb-1 text-green-800 dark:text-green-200 truncate">
                                    {bin.itemName}
                                  </div>
                                )}
                                <div className={`text-xs font-semibold ${bin.quantity > 0 ? 'text-green-700 dark:text-green-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                  Qty: {bin.quantity}
                                </div>
                              </>
                            }
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ml-6 text-sm text-gray-400 dark:text-gray-500 italic">
                      No bins in this level
                    </div>
                  )}
                </div>
              ))}
              
              {rack.levels.length === 0 && (
                <div className="text-sm text-gray-400 dark:text-gray-500 italic">
                  No levels in this rack
                </div>
              )}
            </div>
          ))}
          
          {racks.length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              No racks in this zone
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original rack view
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md p-6">
      <div className="mb-6 pb-4 border-b-2 border-gray-300 dark:border-gray-600">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Grid3x3 className="w-6 h-6" />
          Storage Racks
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Select a rack to view levels</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {racks.map((rack) => (
          <HierarchyCard
            key={rack.id}
            id={rack.id}
            code={rack.code}
            name={rack.name}
            icon={Grid3x3}
            color="pink"
            subtitle={`${rack.levels.length} ${rack.levels.length === 1 ? 'Level' : 'Levels'}`}
            onClick={() => onRackClick(rack)}
            onEdit={() => onEditRack(rack)}
            onDelete={() => onDeleteRack(rack)}
          />
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
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md p-6">
      <div className="mb-6 pb-4 border-b-2 border-gray-300 dark:border-gray-600">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Layers className="w-6 h-6" />
          Rack Levels
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Select a level to view bins</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {levels.map((level) => (
          <HierarchyCard
            key={level.id}
            id={level.id}
            code={level.code}
            name={level.name}
            icon={Layers}
            color="yellow"
            subtitle={`${level.bins.length} ${level.bins.length === 1 ? 'Bin' : 'Bins'}`}
            onClick={() => onLevelClick(level)}
            onEdit={() => onEditLevel(level)}
            onDelete={() => onDeleteLevel(level)}
          />
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
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md p-6">
      <div className="mb-6 pb-4 border-b-2 border-gray-300 dark:border-gray-600">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Box className="w-6 h-6" />
          Storage Bins
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
          Level: <span className="font-bold">{levelName}</span> - Manage bins in this level
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {bins.map((bin) => {
          const binCode = bin.code.split('-').pop() || bin.code;

          return (
            <HierarchyCard
              key={bin.id}
              id={bin.id}
              code={binCode}
              name={bin.name || 'Empty bin'}
              icon={Box}
              color="green"
              subtitle=""
              onClick={() => onBinClick?.(bin)}
              onEdit={() => onEditBin(bin)}
              onDelete={() => onDeleteBin(bin)}
              extraContent={
                <>
                  {bin.itemName && (
                    <div className="text-xs font-medium mt-1 mb-1 text-green-800 dark:text-green-200">
                      Item: {bin.itemName}
                    </div>
                  )}
                  <div className={`text-xs font-semibold ${bin.quantity > 0 ? 'text-green-700 dark:text-green-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    Qty: {bin.quantity}
                  </div>
                </>
              }
            />
          );
        })}
      </div>
    </div>
  );
}