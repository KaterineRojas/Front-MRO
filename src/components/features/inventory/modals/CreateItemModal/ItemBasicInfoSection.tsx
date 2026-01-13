import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';
import { Textarea } from '../../../../ui/textarea';
import { FileText, Tag } from 'lucide-react';
import type { ItemBasicInfoProps } from './types';

export function ItemBasicInfoSection({ formData, onFormDataChange }: ItemBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b dark:border-gray-700">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Basic Information</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2">
            <Tag className="h-3 w-3" />
            Item Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ name: e.target.value })}
            placeholder="e.g., A4 Office Paper, Wrench Set, etc."
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Detailed description of the item, specifications, notes..."
            rows={3}
            className="mt-1.5 resize-none"
          />
        </div>
      </div>
    </div>
  );
}