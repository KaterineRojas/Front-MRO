import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { BinSelector } from '../components/BinSelector';

interface Article {
  id: number;
  imageUrl?: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  type: 'consumable' | 'non-consumable' | 'pending-purchase';
  currentStock: number;
  cost: number;
  binCode: string;
  unit: string;
  supplier: string;
  minStock: number;
  location: string;
  status: string;
  createdAt: string;
}

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingArticle: Article | null;
  articles: Article[];
  categories: { value: string; label: string }[];
  onSubmit: (article: Article) => void;
}

export function AddItemModal({
  open,
  onOpenChange,
  editingArticle,
  articles,
  categories,
  onSubmit
}: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: editingArticle?.name || '',
    description: editingArticle?.description || '',
    category: editingArticle?.category || 'office-supplies',
    type: (editingArticle?.type || 'consumable') as 'consumable' | 'non-consumable' | 'pending-purchase',
    binCode: editingArticle?.binCode || '',
    unit: editingArticle?.unit || '',
    minStock: editingArticle?.minStock?.toString() || '',
    imageUrl: editingArticle?.imageUrl || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Update formData when editingArticle changes
  React.useEffect(() => {
    if (editingArticle) {
      setFormData({
        name: editingArticle.name,
        description: editingArticle.description,
        category: editingArticle.category,
        type: editingArticle.type,
        binCode: editingArticle.binCode,
        unit: editingArticle.unit,
        minStock: editingArticle.minStock.toString(),
        imageUrl: editingArticle.imageUrl || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'office-supplies',
        type: 'consumable',
        binCode: '',
        unit: '',
        minStock: '',
        imageUrl: ''
      });
      setImageFile(null);
    }
  }, [editingArticle, open]);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imageUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate SKU automatically if creating new article
    const generateSKU = () => {
      const prefix = 'SKU';
      const maxId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) : 0;
      return `${prefix}-${String(maxId + 1).padStart(3, '0')}`;
    };
    
    const newArticle: Article = {
      id: editingArticle ? editingArticle.id : Date.now(),
      imageUrl: formData.imageUrl,
      sku: editingArticle ? editingArticle.sku : generateSKU(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      currentStock: editingArticle ? editingArticle.currentStock : 0,
      cost: editingArticle ? editingArticle.cost : 0,
      binCode: formData.binCode,
      unit: formData.unit,
      supplier: editingArticle ? editingArticle.supplier : 'N/A',
      minStock: parseInt(formData.minStock),
      location: editingArticle ? editingArticle.location : 'Warehouse',
      status: 'good-condition',
      createdAt: editingArticle ? editingArticle.createdAt : new Date().toISOString().split('T')[0]
    };

    onSubmit(newArticle);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingArticle ? 'Edit Item' : 'Create New Item'}</DialogTitle>
          <DialogDescription>
            {editingArticle ? 'Update item details' : 'Add a new item to your inventory'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>BIN Code *</Label>
              <BinSelector
                value={formData.binCode}
                onValueChange={(value) => setFormData({...formData, binCode: value})}
                placeholder="Select bin"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., A4 Office Paper"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed description of the item..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value: string) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="non-consumable">Non-Consumable</SelectItem>
                  <SelectItem value="pending-purchase">Pending Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="e.g., pieces, sheets, units"
                required
              />
            </div>
            <div>
              <Label htmlFor="minStock">Min Stock *</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <Label>Article Image</Label>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
              {formData.imageUrl && (
                <div className="w-24 h-24 border dark:border-border rounded overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingArticle ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
