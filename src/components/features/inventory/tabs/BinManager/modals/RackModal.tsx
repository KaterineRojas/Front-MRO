import { useState, useEffect } from 'react';
import { RackV2, ZoneV2 } from '../../../types/warehouse-v2';
import { Button } from '../../../../../ui/button';
import { Input } from '../../../../../ui/input';
import { Label } from '../../../../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../../ui/dialog';

interface RackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rackData: Partial<RackV2>) => void;
  rack: RackV2 | null;
  generatedCode: string;
  locationPath?: string;
  availableZones?: ZoneV2[];
  currentZoneId?: string;
}

export function RackModal({ isOpen, onClose, onSave, rack, generatedCode, locationPath, availableZones = [], currentZoneId }: RackModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  // Sanitize code: only alphanumeric and uppercase
  const handleCodeChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setCode(sanitized);
  };

  // Handler para cambio de zona
  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId === 'none' ? '' : zoneId);
  };

  // Extract rack code from full code (last segment after last dash)
  const getCodeParts = (fullCode: string) => {
    const parts = fullCode.split('-');
    if (parts.length > 1) {
      const rackCode = parts[parts.length - 1];
      const prefix = parts.slice(0, -1).join('-');
      return { prefix, rackCode };
    }
    return { prefix: '', rackCode: fullCode };
  };

  useEffect(() => {
    if (rack) {
      const { rackCode } = getCodeParts(rack.code);
      setCode(rackCode);
      setName(rack.name);
      setSelectedZoneId(currentZoneId || 'none');
    } else {
      setCode('');
      setName('');
      setSelectedZoneId(currentZoneId || 'none');
    }
  }, [rack, generatedCode, isOpen, currentZoneId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reconstruct full code with selected zone
    const effectiveZoneId = selectedZoneId === 'none' ? undefined : selectedZoneId;
    const selectedZone = availableZones.find(z => z.id === effectiveZoneId);
    const fullCode = rack && selectedZone ? `${selectedZone.code}-${code}` : code;
    
    onSave({
      code: fullCode,
      name,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">{rack ? 'Edit Rack' : 'Add New Rack'}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {rack ? 'Update rack information' : 'Create a new rack in the selected zone'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Location Label */}
          {locationPath && (
            <div className="mb-4 p-3 bg-pink-50 dark:bg-pink-950 border border-pink-200 dark:border-pink-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-pink-900 dark:text-pink-100">Location:</span>
                <span className="text-sm font-bold text-pink-700 dark:text-pink-300">{locationPath}</span>
              </div>
            </div>
          )}

          <div className="space-y-4 py-4">
            {rack && availableZones.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Rack Code</Label>
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
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="R01"
                    required
                    className="flex-1 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Rack Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="R01"
                  required
                  className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-200">Rack Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rack 01"
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
              {rack ? 'Update Rack' : 'Create Rack'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}