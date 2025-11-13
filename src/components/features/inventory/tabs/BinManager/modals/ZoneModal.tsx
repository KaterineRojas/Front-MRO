import { useState, useEffect } from 'react';
import { ZoneV2 } from '../../../types/warehouse-v2';
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

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (zoneData: Partial<ZoneV2>) => void;
  zone: ZoneV2 | null;
  generatedCode: string;
}

export function ZoneModal({ isOpen, onClose, onSave, zone, generatedCode }: ZoneModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (zone) {
      setCode(zone.code);
      setName(zone.name);
    } else {
      setCode(generatedCode);
      setName('');
    }
  }, [zone, generatedCode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code,
      name,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">{zone ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {zone ? 'Update zone information' : 'Create a new zone in the warehouse'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="dark:text-gray-200">Zone Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Z-01"
                required
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-200">Zone Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Good Condition Storage"
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
              {zone ? 'Update Zone' : 'Create Zone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}