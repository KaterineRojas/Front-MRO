import { useState, useEffect } from 'react';
import { LevelV2, ZoneV2, RackV2 } from '../../../types/warehouse-v2';
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

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (levelData: Partial<LevelV2>) => void;
  level: LevelV2 | null;
  generatedCode: string;
  locationPath?: string;
  availableZones?: ZoneV2[];
  availableRacks?: RackV2[];
  currentZoneId?: string;
  currentRackId?: string;
}

export function LevelModal({ isOpen, onClose, onSave, level, generatedCode, locationPath, availableZones = [], availableRacks = [], currentZoneId, currentRackId }: LevelModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedRackId, setSelectedRackId] = useState<string>('');

  // Extract level code from full code (last segment)
  const getCodeParts = (fullCode: string) => {
    const parts = fullCode.split('-');
    if (parts.length > 1) {
      const levelCode = parts[parts.length - 1];
      const prefix = parts.slice(0, -1).join('-');
      return { prefix, levelCode };
    }
    return { prefix: '', levelCode: fullCode };
  };

  // Filter racks based on selected zone
  const filteredRacks = selectedZoneId 
    ? availableRacks.filter(r => {
        const selectedZone = availableZones.find(z => z.id === selectedZoneId);
        return selectedZone ? r.code.startsWith(selectedZone.code + '-') : false;
      })
    : availableRacks;

  useEffect(() => {
    if (level) {
      const { levelCode } = getCodeParts(level.code);
      setCode(levelCode);
      setName(level.name);
      setSelectedZoneId(currentZoneId || '');
      setSelectedRackId(currentRackId || '');
    } else {
      setCode('');
      setName('');
      setSelectedZoneId(currentZoneId || '');
      setSelectedRackId(currentRackId || '');
    }
  }, [level, generatedCode, isOpen, currentZoneId, currentRackId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reconstruct full code with selected rack
    const selectedRack = filteredRacks.find(r => r.id === selectedRackId);
    const fullCode = level && selectedRack ? `${selectedRack.code}-${code}` : code;
    
    onSave({
      code: fullCode,
      name,
      rackId: selectedRackId || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">{level ? 'Edit Level' : 'Add New Level'}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {level ? 'Update level information' : 'Create a new level in the selected rack'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Location Label */}
          {locationPath && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Location:</span>
                <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{locationPath}</span>
              </div>
            </div>
          )}

          <div className="space-y-4 py-4">
            {level && availableZones.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Level Code</Label>
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
                    <SelectTrigger className="w-auto min-w-[80px] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                      <SelectValue placeholder="Rack" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRacks.map((rack) => (
                        <SelectItem key={rack.id} value={rack.id}>
                          {rack.code.split('-').pop()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="L-01"
                    required
                    className="flex-1 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="code" className="dark:text-gray-200">Level Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="L-01"
                  required
                  className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-200">Level Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ground Level"
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
              {level ? 'Update Level' : 'Create Level'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}