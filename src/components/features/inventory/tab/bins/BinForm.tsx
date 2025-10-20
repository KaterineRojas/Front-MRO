import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Button } from '../../../ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../../ui/select';
import type { BinFormProps } from './types';

export function BinForm({ formData, setFormData, handleSubmit, editingBin, onCancel }: BinFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingBin ? 'Edit Bin' : 'Create New Bin'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="binCode">BIN Code *</Label>
            <Input
              id="binCode"
              value={formData.binCode}
              onChange={(e) => setFormData({ ...formData, binCode: e.target.value })}
              placeholder="e.g., BIN-OFF-001"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'good-condition' | 'on-revision' | 'scrap') =>
                setFormData({ ...formData, type: value })
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description of this bin..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{editingBin ? 'Update Bin' : 'Create Bin'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
