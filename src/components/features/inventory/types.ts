export interface Article {
  id: number;
  imageUrl?: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  consumable: boolean;
  minStock: number;
  status: boolean;
  //    NUEVO: Array de bins en vez de un solo binCode
  bins: ArticleBin[];

  //    NUEVO: Datos calculados del API
  quantityAvailable: number;
  quantityOnLoan: number;
  quantityReserved: number;
  totalPhysical: number;

  unit: string;
  cost: number;
  createdAt: string;
}

// Nueva interface para bins individuales
export interface ArticleBin {
  binId: number;
  binCode: string;
  binPurpose: 'GoodCondition' | 'OnRevision' | 'Scrap' | 'Hold' | 'Packing' | 'Reception';
  quantity: number;
}

// Tipo que llega del backend
export interface InventoryItemResponse {
  itemId: number;
  itemSku: string;
  itemName: string;
  category: string;
  description: string;
  consumable: boolean;
  minStock: number;
  imageUrl: string | null;
  bins: {
    binId: number;
    binCode: string;
    binPurpose: string;
    quantity: number;
  }[];
  quantityAvailable: number;
  quantityOnLoan: number;
  quantityReserved: number;
  totalPhysical: number;
};


export interface KitItem {
  articleId: number;
  articleBinCode: string;
  articleName: string;
  quantity: number;
}

export interface Kit {
  id: number;
  binCode: string;
  name: string;
  description: string;

  category: 'office-supplies' | 'technology' | 'tools' | 'clothing' | 'electronics' | 'furniture' | 'vehicles' | 'safety-equipment' | 'medical-supplies' | 'cleaning-supplies' | 'construction-materials' | 'laboratory-equipment' | 'HandTools' | 'PowerTools' | 'CuttingTools' | 'MeasuringTools' | 'StrikingTools' | 'FasteningTools' | 'ClampingTools' | 'DiggingTools' | 'ElectricalTools' | 'ElectricalSupplies' | 'WiringMaterials' | 'LightingEquipment' | 'ElectricalComponents' | 'BatteriesPowerSupplies' | 'PlumbingTools' | 'PlumbingSupplies' | 'PipesFittings' | 'ValvesRegulators' | 'WoodworkingTools' | 'LumberMaterials' | 'WoodFinishing' | 'ConstructionTools' | 'BuildingMaterials' | 'ConcreteMasonry' | 'RoofingMaterials' | 'InsulationMaterials' | 'DrywallMaterials' | 'MetalworkingTools' | 'WeldingEquipment' | 'MetalMaterials' | 'HardwareSupplies' | 'PaintingTools' | 'PaintingSupplies' | 'SurfacePreparation' | 'AdhesivesSealants' | 'GardeningTools' | 'OutdoorEquipment' | 'IrrigationSupplies' | 'SafetyEquipment' | 'ProtectiveGear' | 'FirstAid' | 'FireSafety' | 'AutomotiveTools' | 'VehicleParts' | 'TransportationEquipment' | 'Electronics' | 'ComputersPeripherals' | 'AudioVideoEquipment' | 'NetworkEquipment' | 'OfficeSupplies' | 'OfficeEquipment' | 'FurnitureFixtures' | 'StorageOrganization' | 'CleaningTools' | 'CleaningSupplies' | 'MaintenanceEquipment' | 'JanitorialSupplies' | 'IndustrialEquipment' | 'ManufacturingSupplies' | 'MaterialHandling' | 'PackagingShipping' | 'MedicalEquipment' | 'LaboratoryEquipment' | 'ScientificInstruments' | 'ArtCraftSupplies' | 'MusicEquipment' | 'SportsEquipment' | 'Consumables' | 'LubricantsChemicals' | 'FuelPropane' | 'RawMaterials' | 'FinishedGoods' | 'RentalEquipment' | 'SeasonalItems' | 'Miscellaneous' | 'Other';

  items: KitItem[];
  imageUrl?: string;
  status: 'good-condition' | 'on-revision' | 'scrap' | 'repaired';
  createdAt: string;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  createdAt: string;
}

export interface Bin {
  id: number;
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}



export interface BinModel {
  id: number;
  binCode: string;
  name: string;
  description: string;
  binPurpose: number;
  binPurposeDisplay: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BinResponse {
  id: number;
  binCode: string;
  name: string; // Tu modelo actual no usa este campo, lo ignoraremos en la transformación
  description: string;
  binPurpose: number; // Ignorado en la transformación
  binPurposeDisplay: 'GoodCondition' | 'OnRevision' | 'Scrap' | 'Hold' | 'Packing' | 'Reception' | 'NotApplicable';
  isActive: boolean; // Ignorado en la transformación
  createdAt: string; // Ignorado en la transformación
  updatedAt: string; // Ignorado en la transformación
  totalQuantity: number;
}


export interface MovementData {
  itemType: 'item' | 'kit';
  movementType: 'entry' | 'exit' | 'relocation';
  articleSKU: string;
  articleBinCode: string;
  kitBinCode: string;
  quantity: string;
  unitPrice: string;
  status: Article['status'];
  newLocation: string;
  notes: string;
}

export interface Transaction {
  id: number;
  type: 'entry' | 'exit' | 'adjustment';
  subtype: 'purchase' | 'return' | 'audit' | 'consumption' | 'loan' | 'sale';
  articleCode: string;
  articleDescription: string;
  quantity: number;
  unit: string;
  reference: string;
  notes: string;
  user: string;
  project: string;
  date: string;
  createdAt: string;
}
