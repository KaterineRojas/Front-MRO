import { useEffect, useState } from 'react';
import { BinV2, WarehouseV2 } from '../../../types/warehouse-v2';
import { fetchWarehousesFromApi } from '../../../services/inventoryApi';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../ui/dialog';
import { Switch } from '../../../../ui/switch';

interface BinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bin: Partial<BinV2>) => void;
  bin?: BinV2 | null;
  generatedCode: string;
  locationPath?: string;
  currentZoneId?: string;
  currentRackId?: string;
  currentLevelId?: string;
}

export function BinModal({ isOpen, onClose, onSave, bin, generatedCode, locationPath, currentZoneId, currentRackId, currentLevelId }: BinModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    itemName: '',
    quantity: 0,
    allowDifferentItems: false,
  });
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedRackId, setSelectedRackId] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [warehouses, setWarehouses] = useState<WarehouseV2[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Extract prefix and bin code
  const getCodeParts = (fullCode: string) => {
    const parts = fullCode.split('-');
    if (parts.length > 1) {
      const binCode = parts[parts.length - 1];
      const prefix = parts.slice(0, -1).join('-');
      return { prefix, binCode };
    }
    return { prefix: '', binCode: fullCode };
  };

  // Cargar warehouses desde el API
  const loadWarehouses = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading warehouses from API...');
      const data = await fetchWarehousesFromApi();
      console.log('✅ Warehouses loaded:', data.length);
      setWarehouses(data);
      return data;
    } catch (error) {
      console.error('❌ Error loading warehouses:', error);
      setWarehouses([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener todas las zonas de todos los warehouses
  const getAllZones = () => {
    return warehouses.flatMap(w => w.zones);
  };

  // Obtener todos los racks de todos los warehouses
  const getAllRacks = () => {
    return warehouses.flatMap(w => w.zones.flatMap(z => z.racks));
  };

  // Obtener todos los levels de todos los warehouses
  const getAllLevels = () => {
    return warehouses.flatMap(w => w.zones.flatMap(z => z.racks.flatMap(r => r.levels)));
  };

  // Buscar la ubicación del bin en la estructura de warehouses
  const findBinLocation = (binToFind: BinV2, warehousesData: WarehouseV2[]) => {
    console.log('🔍 Searching for bin:', binToFind.code, 'ID:', binToFind.id);
    
    for (const warehouse of warehousesData) {
      for (const zone of warehouse.zones) {
        for (const rack of zone.racks) {
          for (const level of rack.levels) {
            const foundBin = level.bins.find(b => b.id === binToFind.id);
            if (foundBin) {
              console.log('✅ Found bin location:', {
                warehouse: warehouse.code,
                zone: zone.code,
                rack: rack.code,
                level: level.code,
                zoneId: zone.id,
                rackId: rack.id,
                levelId: level.id
              });
              return { zoneId: zone.id, rackId: rack.id, levelId: level.id };
            }
          }
        }
      }
    }
    console.log('⚠️ Bin location not found');
    return null;
  };

  // Filtrar racks basados en la zona seleccionada
  const filteredRacks = selectedZoneId && selectedZoneId !== 'none'
    ? getAllZones().find(z => z.id === selectedZoneId)?.racks || []
    : getAllRacks();

  // Filtrar levels basados en el rack seleccionado
  const filteredLevels = selectedRackId && selectedRackId !== 'none'
    ? filteredRacks.find(r => r.id === selectedRackId)?.levels || []
    : getAllLevels();

  console.log('🎯 Combobox state:', {
    selectedZoneId,
    selectedRackId,
    selectedLevelId,
    totalZones: getAllZones().length,
    filteredRacks: filteredRacks.length,
    filteredLevels: filteredLevels.length,
    rackIds: filteredRacks.map(r => r.id),
    levelIds: filteredLevels.map(l => l.id)
  });

  // Handler para cambio de zona - resetea rack y level a vacío
  const handleZoneChange = (zoneId: string) => {
    console.log('🔄 Zone changed to:', zoneId);
    setSelectedZoneId(zoneId === 'none' ? '' : zoneId);
    // Resetear a 'none' cuando se cambia la zona
    setSelectedRackId('none');
    setSelectedLevelId('none');
    console.log('✅ Reset rack and level to none');
  };

  // Handler para cambio de rack - resetea level a vacío
  const handleRackChange = (rackId: string) => {
    console.log('🔄 Rack changed to:', rackId);
    setSelectedRackId(rackId === 'none' ? '' : rackId);
    // Resetear a 'none' cuando se cambia el rack
    setSelectedLevelId('none');
    console.log('✅ Reset level to none');
  };

  // Handler para cambio de level
  const handleLevelChange = (levelId: string) => {
    console.log('🔄 Level changed to:', levelId);
    setSelectedLevelId(levelId === 'none' ? '' : levelId);
  };

  // Cargar datos y establecer valores cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const initializeModal = async () => {
        // Cargar warehouses desde el API
        const warehousesData = await loadWarehouses();
        
        if (bin) {
          console.log('🔍 BinModal Opening with bin:', bin.code);
          
          const { binCode: extractedBinCode } = getCodeParts(bin.code);
          setFormData({
            code: extractedBinCode,
            name: bin.name || '',
            itemName: bin.itemName || '',
            quantity: bin.quantity || 0,
            allowDifferentItems: bin.allowDifferentItems || false,
          });
          
          // Buscar la ubicación del bin en los datos cargados
          const location = findBinLocation(bin, warehousesData);
          
          if (location) {
            console.log('✅ Setting comboboxes to:', location);
            setSelectedZoneId(location.zoneId);
            setSelectedRackId(location.rackId);
            setSelectedLevelId(location.levelId);
          } else {
            console.log('⚠️ Location not found, using fallback');
            setSelectedZoneId(currentZoneId || 'none');
            setSelectedRackId(currentRackId || 'none');
            setSelectedLevelId(currentLevelId || 'none');
          }
        } else {
          // Modo creación
          setFormData({
            code: '',
            name: '',
            itemName: '',
            quantity: 0,
            allowDifferentItems: false,
          });
          setSelectedZoneId(currentZoneId || 'none');
          setSelectedRackId(currentRackId || 'none');
          setSelectedLevelId(currentLevelId || 'none');
        }
      };
      
      initializeModal();
    } else {
      // Reset cuando se cierra el modal
      setWarehouses([]);
    }
  }, [isOpen, bin?.id]); // Solo depende de isOpen y bin.id

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los niveles estén seleccionados (no vacíos ni 'none')
    if (!selectedZoneId || selectedZoneId === '' || selectedZoneId === 'none') {
      setValidationError('Please select a Zone');
      console.log('❌ Validation failed: Zone not selected');
      return;
    }
    
    if (!selectedRackId || selectedRackId === '' || selectedRackId === 'none') {
      setValidationError('Please select a Rack');
      console.log('❌ Validation failed: Rack not selected');
      return;
    }
    
    if (!selectedLevelId || selectedLevelId === '' || selectedLevelId === 'none') {
      setValidationError('Please select a Level');
      console.log('❌ Validation failed: Level not selected');
      return;
    }
    
    // Si todas las validaciones pasan, limpiar error
    setValidationError('');
    console.log('✅ Validation passed, all levels selected');
    
    // Reconstruct full code with selected level
    const selectedLevel = filteredLevels.find(l => l.id === selectedLevelId);
    const fullCode = bin && selectedLevel ? `${selectedLevel.code}-${formData.code}` : formData.code;
    
    console.log('📤 Saving bin with code:', fullCode);
    onSave({ ...formData, code: fullCode });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg dark:bg-gray-900 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">{bin ? 'Edit Bin' : 'Add New Bin'}</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {bin ? 'Update bin information' : 'Create a new bin in the selected level'}
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          )}

          {/* Location Label */}
          {locationPath && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-900 dark:text-green-100">Location:</span>
                <span className="text-sm font-bold text-green-700 dark:text-green-300">{locationPath}</span>
              </div>
            </div>
          )}

          <div className="space-y-4 py-4">
            {validationError && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
              </div>
            )}

            {bin && getAllZones().length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Bin Code</Label>
                <div className="flex items-center gap-2">
                  <Select value={selectedZoneId} onValueChange={handleZoneChange}>
                    <SelectTrigger className="w-auto min-w-[80px] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                      <SelectValue placeholder="Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select Zone --</SelectItem>
                      {getAllZones().map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedRackId} onValueChange={handleRackChange} disabled={!selectedZoneId || selectedZoneId === 'none'}>
                    <SelectTrigger className="w-auto min-w-[100px] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                      <SelectValue placeholder="Rack" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select Rack --</SelectItem>
                      {filteredRacks.map((rack) => (
                        <SelectItem key={rack.id} value={rack.id}>
                          {rack.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLevelId} onValueChange={handleLevelChange} disabled={!selectedRackId || selectedRackId === 'none'}>
                    <SelectTrigger className="w-auto min-w-[120px] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select Level --</SelectItem>
                      {filteredLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="B-01"
                    required
                    className="flex-1 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Bin Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="B-01"
                  required
                  className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-200">Bin Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bin 01"
                required
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col">
                <Label htmlFor="allowDifferentItems" className="dark:text-gray-200 font-medium">Allow Different Items</Label>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enable storing multiple item types in this bin</span>
              </div>
              <Switch
                id="allowDifferentItems"
                checked={formData.allowDifferentItems}
                onCheckedChange={(checked: any) => setFormData({ ...formData, allowDifferentItems: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-600">
              Cancel
            </Button>
            <Button type="submit" className="dark:bg-blue-700 dark:hover:bg-blue-600">
              {bin ? 'Update Bin' : 'Create Bin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}