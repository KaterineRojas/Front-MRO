import { useState, useEffect } from 'react';
import { BinV2, ZoneV2 } from '../../../types/warehouse-v2';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../ui/dialog';

interface QuickBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (binData: { 
    code: string; 
    name: string; 
    rackCode: string; 
    levelCode: string;
    allowDifferentItems: boolean;
  }) => void;
  selectedZone: ZoneV2;
  locationPath?: string;
}

export function QuickBinModal({ isOpen, onClose, onSave, selectedZone , locationPath}: QuickBinModalProps) {
  const [rackCode, setRackCode] = useState('');
  const [levelCode, setLevelCode] = useState('');
  const [binCode, setBinCode] = useState('');
  const [name, setName] = useState('');
  const [allowDifferentItems, setAllowDifferentItems] = useState(false);

  // Sanitize code: only alphanumeric and uppercase, max 6 characters
  const handleCodeChange = (value: string, setter: (val: string) => void) => {
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    setter(sanitized);
  };

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setRackCode('');
      setLevelCode('');
      setBinCode('');
      setName('');
      setAllowDifferentItems(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rackCode || !levelCode || !binCode || !name) {
      return;
    }

    onSave({
      code: binCode,
      name,
      rackCode,
      levelCode,
      allowDifferentItems,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg dark:bg-gray-900 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Add New Bin</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Create a new bin in zone: <span className="font-bold text-primary">{selectedZone?.code}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Bin Code - All levels in one horizontal row */}
            <div className="space-y-2">
              <Label htmlFor="code" className="dark:text-gray-200">Full warehouse & Bin Code</Label>
              <div className="flex items-center gap-2">
                {/* Zone - Disabled */}
                <Input
                  value={selectedZone?.code || ''}
                  disabled
                  className="w-24 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 text-center font-medium"
                  title="Zone"
                />
                
                {/* Rack - Text Input */}
                <Input
                  id="rackCode"
                  value={rackCode}
                  onChange={(e) => handleCodeChange(e.target.value, setRackCode)}
                  placeholder="Rack"
                  required
                  className="w-24 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 text-center"
                  title="Rack Code"
                />
                
                {/* Level - Text Input */}
                <Input
                  id="levelCode"
                  value={levelCode}
                  onChange={(e) => handleCodeChange(e.target.value, setLevelCode)}
                  placeholder="Level"
                  required
                  className="w-24 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 text-center"
                  title="Level Code"
                />
                
                {/* Bin Code */}
                <Input
                  id="binCode"
                  value={binCode}
                  onChange={(e) => handleCodeChange(e.target.value, setBinCode)}
                  placeholder="B01"
                  required
                  className="w-24 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 text-center"
                  title="Bin Code"
                />
              </div>
            </div>

            {/* Bin Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-200">Bin Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Storage Bin A1"
                required
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
              />
            </div>

            {/* Location Label */}
            {locationPath && (
              <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Location:</span>
                  <span className="text-sm font-bold text-green-700 dark:text-green-300">{locationPath}</span>
                </div>
              </div>
            )}
            
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-600">
              Cancel
            </Button>
            <Button type="submit" className="dark:bg-blue-700 dark:hover:bg-blue-600">
              Create Bin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
