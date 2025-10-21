import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/features/ui/card';
import { Input } from '@/components/features/ui/input';
import { Label } from '@/components/features/ui/label';
import { Textarea } from '@/components/features/ui/textarea';
import { Button } from '@/components/features/ui/button';
import type { TemplateFormProps } from './types';


// TEMPLATE INFORMATION TABLE
export function TemplateForm({ formData, setFormData, handleSubmit, editing }: TemplateFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Basic Office Setup"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Template description..."
              rows={3}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              {editing ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
