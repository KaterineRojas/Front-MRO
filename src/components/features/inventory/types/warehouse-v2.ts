export interface BinV2 {
  id: string;
  code: string;
  description: string;
  createdAt: Date;
}

export interface LevelV2 {
  id: string;
  code: string;
  name: string;
  bins: BinV2[];
}

export interface RackV2 {
  id: string;
  code: string;
  name: string;
  levels: LevelV2[];
}

export interface ZoneV2 {
  id: string;
  code: string;
  name: string;
  racks: RackV2[];
}

export interface WarehouseV2 {
  id: string;
  code: string;
  name: string;
  zones: ZoneV2[];
}