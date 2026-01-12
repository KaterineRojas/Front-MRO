import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Save } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conditionCounts: { good: number; revision: number; lost: number };
  setConditionCounts: (v: { good: number; revision: number; lost: number }) => void;
  onSave: () => void;
}

export const ConditionDialog: React.FC<Props> = ({ open, onOpenChange, conditionCounts, setConditionCounts, onSave }) => {
  // Validación defensiva: asegurar que conditionCounts siempre tenga un valor
  const safeConditionCounts = conditionCounts || { good: 0, revision: 0, lost: 0 };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Set Item Condition</DialogTitle>
          <DialogDescription>Specify the quantity for each condition type.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="good-count">Good Condition</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="text-black cursor-pointer" size="sm" onClick={() => setConditionCounts({ ...safeConditionCounts, good: Math.max(0, safeConditionCounts.good - 1) })}>-</Button>
              <Input 
                id="good-count" 
                type="number" 
                min="0" 
                value={safeConditionCounts.good} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => setConditionCounts({ ...safeConditionCounts, good: Math.max(0, parseInt(e.target.value) || 0) })} 
                className="w-20 text-center" 
              />
              <Button variant="outline" className="text-black cursor-pointer" size="sm" onClick={() => setConditionCounts({ ...safeConditionCounts, good: safeConditionCounts.good + 1 })}>+</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revision-count">On Revision</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="text-black cursor-pointer" size="sm" onClick={() => setConditionCounts({ ...safeConditionCounts, revision: Math.max(0, safeConditionCounts.revision - 1) })}>-</Button>
              <Input 
                id="revision-count" 
                type="number" 
                min="0" 
                value={safeConditionCounts.revision} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => setConditionCounts({ ...safeConditionCounts, revision: Math.max(0, parseInt(e.target.value) || 0) })} 
                className="w-20 text-center" 
              />
              <Button variant="outline" className="text-black cursor-pointer" size="sm" onClick={() => setConditionCounts({ ...safeConditionCounts, revision: safeConditionCounts.revision + 1 })}>+</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lost-count">Lost</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="text-black cursor-pointer" size="sm" onClick={() => setConditionCounts({ ...safeConditionCounts, lost: Math.max(0, safeConditionCounts.lost - 1) })}>-</Button>
              <Input 
                id="lost-count" 
                type="number" 
                min="0" 
                value={safeConditionCounts.lost} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => setConditionCounts({ ...safeConditionCounts, lost: Math.max(0, parseInt(e.target.value) || 0) })} 
                className="w-20 text-center" 
              />
              <Button variant="outline" className="text-black cursor-pointer" size="sm" onClick={() => setConditionCounts({ ...safeConditionCounts, lost: safeConditionCounts.lost + 1 })}>+</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-black cursor-pointer">Cancel</Button>
          <Button variant="outline" onClick={onSave} className="text-black cursor-pointer"><Save className="h-4 w-4 mr-2" />Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionDialog;
