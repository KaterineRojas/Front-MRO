import { useState, useEffect } from 'react';
import { LevelV2 } from '../../../types/warehouse-v2';
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

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (levelData: Partial<LevelV2>) => void;
  level: LevelV2 | null;
  generatedCode: string;
}

export function LevelModal({ isOpen, onClose, onSave, level, generatedCode }: LevelModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (level) {
      setCode(level.code);
      setName(level.name);
    } else {
      setCode(generatedCode);
      setName('');
    }
  }, [level, generatedCode, isOpen]);

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
          <DialogTitle className="dark:text-gray-100">{level ? 'Edit Level' : 'Add New Level'}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            {level ? 'Update level information' : 'Create a new level in the selected rack'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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