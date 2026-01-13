import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';

interface Bin {
  id: number;
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}

interface CreateBinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBin: Bin | null;
  bins: Bin[];
  onSubmit: (bin: Omit<Bin, 'id'>, isEdit: boolean, editingBinId?: number) => void;
}

export function CreateBinModal({
  open,
  onOpenChange,
  editingBin,
  bins,
  onSubmit
}: CreateBinModalProps) {
  const [formData, setFormData] = useState<{
    binCode: string;
    type: 'good-condition' | 'on-revision' | 'scrap';
    description: string;
  }>({
    binCode: editingBin?.binCode || '',
    type: editingBin?.type || 'good-condition',
    description: editingBin?.description || ''
  });

  // Update formData when editingBin changes
  React.useEffect(() => {
    if (editingBin) {
      setFormData({
        binCode: editingBin.binCode,
        type: editingBin.type,
        description: editingBin.description
      });
    } else {
      setFormData({
        binCode: '',
        type: 'good-condition',
        description: ''
      });
    }
  }, [editingBin, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate bin code
    const isDuplicate = bins.some(bin => 
      bin.binCode.toLowerCase() === formData.binCode.toLowerCase() && 
      bin.id !== editingBin?.id
    );
    
    if (isDuplicate) {
      alert(`Error: BIN Code "${formData.binCode}" already exists. Please use a different code.`);
      return;
    }
    
    onSubmit(formData, !!editingBin, editingBin?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingBin ? 'Edit Bin' : 'Create New Bin'}</DialogTitle>
          <DialogDescription>
            {editingBin ? 'Update the bin information below.' : 'Fill in the details to create a new bin.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="binCode">BIN Code *</Label>
            <Input
              id="binCode"
              value={formData.binCode}
              onChange={(e) => setFormData({...formData, binCode: e.target.value})}
              placeholder="e.g., BIN-OFF-001"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'good-condition' | 'on-revision' | 'scrap') => setFormData({...formData, type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good-condition">Good Condition</SelectItem>
                <SelectItem value="on-revision">On Revision</SelectItem>
                <SelectItem value="scrap">Scrap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description of this bin..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingBin ? 'Update Bin' : 'Create Bin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
