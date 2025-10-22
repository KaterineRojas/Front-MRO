
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
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
  formData: {
    binCode: string;
    type: 'good-condition' | 'on-revision' | 'scrap';
    description: string;
  };
  onFormDataChange: (data: {
    binCode: string;
    type: 'good-condition' | 'on-revision' | 'scrap';
    description: string;
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateBinModal({
  open,
  onOpenChange,
  editingBin,
  formData,
  onFormDataChange,
  onSubmit
}: CreateBinModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingBin ? 'Edit Bin' : 'Create New Bin'}</DialogTitle>
          <DialogDescription>
            {editingBin ? 'Update the bin information below.' : 'Fill in the details to create a new bin.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="binCode">BIN Code *</Label>
            <Input
              id="binCode"
              value={formData.binCode}
              onChange={(e) => onFormDataChange({...formData, binCode: e.target.value})}
              placeholder="e.g., BIN-A-001"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'good-condition' | 'on-revision' | 'scrap') => 
                onFormDataChange({...formData, type: value})
              }
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
              onChange={(e) => onFormDataChange({...formData, description: e.target.value})}
              placeholder="Description of this bin..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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