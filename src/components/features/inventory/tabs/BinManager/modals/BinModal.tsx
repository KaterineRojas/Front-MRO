import { useEffect, useState } from 'react';
import { BinV2, ZoneV2, RackV2, LevelV2 } from '../../../types/warehouse-v2';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Textarea } from '../../../../ui/textarea';
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
    description: '',
    itemName: '',
    quantity: 0,
  });
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedRackId, setSelectedRackId] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');

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

  const codePrefix = bin ? getCodeParts(bin.code).prefix : '';

  // No filtrar - mostrar todos los racks y levels disponibles
  const filteredRacks = availableRacks;
  const filteredLevels = availableLevels;

  useEffect(() => {
    if (bin) {
      const { binCode: extractedBinCode } = getCodeParts(bin.code);
      setFormData({
        code: extractedBinCode,
        name: bin.name || '',
        description: bin.description,
        itemName: bin.itemName || '',
        quantity: bin.quantity || 0,
      });
      setSelectedZoneId(currentZoneId || '');
      setSelectedRackId(currentRackId || '');
      setSelectedLevelId(currentLevelId || '');
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        itemName: '',
        quantity: 0,
      });
      setSelectedZoneId(currentZoneId || '');
      setSelectedRackId(currentRackId || '');
      setSelectedLevelId(currentLevelId || '');
    }
  }, [bin, generatedCode, isOpen, currentZoneId, currentRackId, currentLevelId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reconstruct full code with selected level
    const selectedLevel = filteredLevels.find(l => l.id === selectedLevelId);
    const fullCode = bin && selectedLevel ? `${selectedLevel.code}-${formData.code}` : formData.code;
    onSave({ ...formData, code: fullCode, levelId: selectedLevelId || undefined });
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
            {bin && availableZones.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Bin Code</Label>
                <div className="flex items-center gap-2">
                  <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
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
                  <Select value={selectedRackId} onValueChange={setSelectedRackId}>
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
                  <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
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