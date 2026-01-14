import { useEffect, useState } from 'react';
import { BinV2, ZoneV2, RackV2, LevelV2 } from '../../../types/warehouse-v2';
import { Button } from '../../../../ui2/button';
import { Input } from '../../../../ui2/input';
import { Label } from '../../../../ui2/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../ui2/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../ui2/dialog';
import { Switch } from '../../../../ui2/switch';

interface BinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bin: Partial<BinV2>) => void;
  bin?: BinV2 | null;
  generatedCode: string;
  locationPath?: string;
  availableZones?: ZoneV2[];
  availableRacks?: RackV2[];
  availableLevels?: LevelV2[];
  currentZoneId?: string;
  currentRackId?: string;
  currentLevelId?: string;
}

export function BinModal({ isOpen, onClose, onSave, bin, generatedCode, locationPath, availableZones = [], availableRacks = [], availableLevels = [], currentZoneId, currentRackId, currentLevelId }: BinModalProps) {
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
  const [validationError, setValidationError] = useState<string>('');

  // Sanitize code: only alphanumeric and uppercase
  const handleCodeChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setFormData(prev => ({ ...prev, code: sanitized }));
  };

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

  // Filtrar racks basados en la zona seleccionada
  const filteredRacks = selectedZoneId && selectedZoneId !== 'none'
    ? availableZones.find(z => z.id === selectedZoneId)?.racks || []
    : availableRacks;

  // Filtrar levels basados en el rack seleccionado
  const filteredLevels = selectedRackId && selectedRackId !== 'none'
    ? filteredRacks.find(r => r.id === selectedRackId)?.levels || []
    : availableLevels;


  // Handler para cambio de zona - resetea rack y level a vacío
  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId === 'none' ? '' : zoneId);
    // Resetear a 'none' cuando se cambia la zona
    setSelectedRackId('none');
    setSelectedLevelId('none');
  };

  // Handler para cambio de rack - resetea level a vacío
  const handleRackChange = (rackId: string) => {
    setSelectedRackId(rackId === 'none' ? '' : rackId);
    // Resetear a 'none' cuando se cambia el rack
    setSelectedLevelId('none');
  };

  // Handler para cambio de level
  const handleLevelChange = (levelId: string) => {
    setSelectedLevelId(levelId === 'none' ? '' : levelId);
  };

  // Cargar datos y establecer valores cuando se abre el modal
  useEffect(() => {
    if (bin) {
      const { binCode: extractedBinCode } = getCodeParts(bin.code);
      setFormData({
        code: extractedBinCode,
        name: bin.name || '',
        itemName: bin.itemName || '',
        quantity: bin.quantity || 0,
        allowDifferentItems: bin.allowDifferentItems || false,
      });
      setSelectedZoneId(currentZoneId || '');
      setSelectedRackId(currentRackId || '');
      setSelectedLevelId(currentLevelId || '');
    } else {
      // Modo creación
      setFormData({
        code: '',
        name: '',
        itemName: '',
        quantity: 0,
        allowDifferentItems: false,
      });
      setSelectedZoneId(currentZoneId || '');
      setSelectedRackId(currentRackId || '');
      setSelectedLevelId(currentLevelId || '');
    }
  }, [bin, generatedCode, isOpen, currentZoneId, currentRackId, currentLevelId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los niveles estén seleccionados (no vacíos ni 'none')
    if (!selectedZoneId || selectedZoneId === '' || selectedZoneId === 'none') {
      setValidationError('Please select a Zone');
      return;
    }
    
    if (!selectedRackId || selectedRackId === '' || selectedRackId === 'none') {
      setValidationError('Please select a Rack');
      return;
    }
    
    if (!selectedLevelId || selectedLevelId === '' || selectedLevelId === 'none') {
      setValidationError('Please select a Level');
      return;
    }
    
    // Si todas las validaciones pasan, limpiar error
    setValidationError('');
    
    // Reconstruct full code with selected level
    const selectedLevel = filteredLevels.find(l => l.id === selectedLevelId);
    const fullCode = bin && selectedLevel ? `${selectedLevel.code}-${formData.code}` : formData.code;
    
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

            {bin && availableZones.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Bin Code</Label>
                <div className="flex items-center gap-2">
                  <Select value={selectedZoneId} onValueChange={handleZoneChange}>
                    <SelectTrigger className="w-auto min-w-[80px] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                      <SelectValue placeholder="Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableZones.map((zone) => (
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
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="B01"
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
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="B01"
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