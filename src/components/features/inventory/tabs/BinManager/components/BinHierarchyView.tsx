import { WarehouseV2, ZoneV2, RackV2, LevelV2, BinV2 } from '../../../types/warehouse-v2';
import { ZoneGridView, RackGridView, LevelGridView, BinGridView } from './GridViews';

type ViewLevel = 'warehouse' | 'zone' | 'rack' | 'level' | 'bin';

interface BinHierarchyViewProps {
  currentViewLevel: ViewLevel;
  selectedWarehouse: WarehouseV2 | null;
  selectedZone: ZoneV2 | null;
  selectedRack: RackV2 | null;
  selectedLevel: LevelV2 | null;
  onZoneClick: (zone: ZoneV2) => void;
  onRackClick: (rack: RackV2) => void;
  onLevelClick: (level: LevelV2) => void;
  onEditZone: (zone: ZoneV2) => void;
  onDeleteZone: (zone: ZoneV2) => void;
  onEditRack: (rack: RackV2) => void;
  onDeleteRack: (rack: RackV2) => void;
  onEditLevel: (level: LevelV2) => void;
  onDeleteLevel: (level: LevelV2) => void;
  onEditBin: (bin: BinV2) => void;
  onDeleteBin: (bin: BinV2) => void;
}

export function BinHierarchyView({
  currentViewLevel,
  selectedWarehouse,
  selectedZone,
  selectedRack,
  selectedLevel,
  onZoneClick,
  onRackClick,
  onLevelClick,
  onEditZone,
  onDeleteZone,
  onEditRack,
  onDeleteRack,
  onEditLevel,
  onDeleteLevel,
  onEditBin,
  onDeleteBin,
}: BinHierarchyViewProps) {
  switch (currentViewLevel) {
    case 'zone':
      return selectedWarehouse ? (
        <ZoneGridView 
          zones={selectedWarehouse.zones} 
          onZoneClick={onZoneClick}
          onEditZone={onEditZone}
          onDeleteZone={onDeleteZone}
        />
      ) : null;

    case 'rack':
      return selectedZone ? (
        <RackGridView 
          racks={selectedZone.racks} 
          onRackClick={onRackClick}
          onEditRack={onEditRack}
          onDeleteRack={onDeleteRack}
        />
      ) : null;

    case 'level':
      return selectedRack ? (
        <LevelGridView 
          levels={selectedRack.levels} 
          onLevelClick={onLevelClick}
          onEditLevel={onEditLevel}
          onDeleteLevel={onDeleteLevel}
        />
      ) : null;

    case 'bin':
      return selectedLevel ? (
        <BinGridView 
          bins={selectedLevel.bins}
          levelName={selectedLevel.name}
          onEditBin={onEditBin}
          onDeleteBin={onDeleteBin}
        />
      ) : null;

    default:
      return null;
  }
}
