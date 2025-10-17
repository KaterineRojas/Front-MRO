import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { BinSelector } from '../components/BinSelector';
import { Package, ChevronDown, ChevronRight } from 'lucide-react';
import type { Article } from '../types';
import { CATEGORIES } from '../constants';

interface CreateItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingArticle: Article | null;
  onSubmit: (articleData: Omit<Article, 'id' | 'createdAt' | 'currentStock' | 'location' | 'status'>) => void;
}

export function CreateItemModal({
  open,
  onOpenChange,
  editingArticle,
  onSubmit
}: CreateItemModalProps) {
  const [formData, setFormData] = useState({
    sku: editingArticle?.sku || '',
    name: editingArticle?.name || '',
    description: editingArticle?.description || '',
    category: editingArticle?.category || ('office-supplies' as Article['category']),
    type: editingArticle?.type || ('consumable' as Article['type']),
    cost: editingArticle?.cost.toString() || '',
    binCode: editingArticle?.binCode || '',
    unit: editingArticle?.unit || '',
    supplier: editingArticle?.supplier || '',
    minStock: editingArticle?.minStock.toString() || '',
    imageUrl: editingArticle?.imageUrl || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showBinStock, setShowBinStock] = useState(false);

  React.useEffect(() => {
    if (editingArticle) {
      setFormData({
        sku: editingArticle.sku,
        name: editingArticle.name,
        description: editingArticle.description,
        category: editingArticle.category,
        type: editingArticle.type,
        cost: editingArticle.cost.toString(),
        binCode: editingArticle.binCode,
        unit: editingArticle.unit,
        supplier: editingArticle.supplier,
        minStock: editingArticle.minStock.toString(),
        imageUrl: editingArticle.imageUrl || ''
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: 'office-supplies',
        type: 'consumable',
        cost: '',
        binCode: '',
        unit: '',
        supplier: '',
        minStock: '',
        imageUrl: ''
      });
    }
    setImageFile(null);
    setShowBinStock(false);
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
    
    onSubmit({
      imageUrl: formData.imageUrl,
      sku: formData.sku,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      cost: parseFloat(formData.cost),
      binCode: formData.binCode,
      unit: formData.unit,
      supplier: formData.supplier,
      minStock: parseInt(formData.minStock)
    });

    onOpenChange(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good-condition':
        return <Badge className="bg-green-600">Good Condition</Badge>;
      case 'on-revision':
        return <Badge className="bg-yellow-600">On Revision</Badge>;
      case 'scrap':
        return <Badge variant="destructive">Scrap</Badge>;
      case 'repaired':
        return <Badge className="bg-blue-600">Repaired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingArticle ? 'Edit Item' : 'Create new Item'}</DialogTitle>
          <DialogDescription>
            {editingArticle ? 'Update the item information below.' : 'Fill in the details to create a new item in your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder="e.g., SKU-001"
                required
              />
            </div>
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
                placeholder="e.g., Aa4 Office Paper"
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
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as any})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as any})}>
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
              <Label htmlFor="cost">Unit Cost *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="e.g., Office Supplies Inc."
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
                <div className="w-24 h-24 border rounded overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stock in Different Bins - Collapsible Section */}
          {editingArticle && (
            <div className="border rounded-lg overflow-hidden">
              <Button
                type="button"
                variant="ghost"
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                onClick={() => setShowBinStock(!showBinStock)}
              >
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Stock in Different Bins
                </span>
                {showBinStock ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              {showBinStock && (
                <div className="p-4 bg-muted/30 border-t">
                  <div className="rounded-md border bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>BIN Code</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Mock data showing the same SKU in different bins */}
                        <TableRow>
                          <TableCell className="font-mono">{editingArticle.binCode}</TableCell>
                          <TableCell>{editingArticle.location}</TableCell>
                          <TableCell>{editingArticle.currentStock} {editingArticle.unit}</TableCell>
                          <TableCell>{getStatusBadge(editingArticle.status)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">BIN-STORAGE-001</TableCell>
                          <TableCell>Main Storage</TableCell>
                          <TableCell>500 {editingArticle.unit}</TableCell>
                          <TableCell><Badge className="bg-green-600">Good Condition</Badge></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">BIN-BACKUP-002</TableCell>
                          <TableCell>Backup Storage</TableCell>
                          <TableCell>250 {editingArticle.unit}</TableCell>
                          <TableCell><Badge className="bg-green-600">Good Condition</Badge></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total stock for SKU {editingArticle.sku}: {editingArticle.currentStock + 500 + 250} {editingArticle.unit}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
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
