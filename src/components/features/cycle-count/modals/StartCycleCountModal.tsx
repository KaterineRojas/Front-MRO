import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { useState } from 'react';

interface StartCycleCountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { zone: string; countType: 'Annual' | 'Biannual' | 'Spot Check'; auditor: string }) => void;
  keeperName: string;
}

export function StartCycleCountModal({ open, onClose, onConfirm, keeperName }: StartCycleCountModalProps) {
  const [zone, setZone] = useState<string>('all');
  const [countType, setCountType] = useState<'Annual' | 'Biannual' | 'Spot Check'>('Annual');

  const zones = ['all', 'Good Condition', 'Damaged', 'Quarantine'];

  const handleConfirm = () => {
    onConfirm({
      zone,
      countType,
      auditor: keeperName
    });
    onClose();
  };

  const handleCancel = () => {
    // Reset to defaults
    setZone('all');
    setCountType('Annual');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Cycle Count</DialogTitle>
          <DialogDescription>
            Configure the cycle count settings before starting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="zone">Zone</Label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger id="zone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z} value={z}>
                    {z === 'all' ? 'All Zones' : z}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countType">Count Type</Label>
            <Select value={countType} onValueChange={(value: string) => setCountType(value as 'Annual' | 'Biannual' | 'Spot Check')}>
              <SelectTrigger id="countType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Annual">Annual</SelectItem>
                <SelectItem value="Biannual">Biannual</SelectItem>
                <SelectItem value="Spot Check">Spot Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditor">Auditor</Label>
            <div className="p-2 bg-muted rounded-md text-sm">
              {keeperName}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Start Count
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
