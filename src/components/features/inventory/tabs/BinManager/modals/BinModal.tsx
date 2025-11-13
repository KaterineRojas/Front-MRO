import { useEffect, useState } from 'react';
import { BinV2 } from '../../../types/warehouse-v2';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Textarea } from '../../../../ui/textarea';
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
}

export function BinModal({ isOpen, onClose, onSave, bin, generatedCode }: BinModalProps) {
  const [formData, setFormData] = useState({
    code: generatedCode,
    description: '',
  });

  useEffect(() => {
    if (bin) {
      setFormData({
        code: bin.code,
        description: bin.description,
      });
    } else {
      setFormData({
        code: generatedCode,
        description: '',
      });
    }
  }, [bin, generatedCode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="dark:text-gray-200">Bin Code</Label>
              <Input
                id="code"
                value={formData.code}
                disabled
                className="bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Auto-generated based on location</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="dark:text-gray-200">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter bin description..."
                rows={3}
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