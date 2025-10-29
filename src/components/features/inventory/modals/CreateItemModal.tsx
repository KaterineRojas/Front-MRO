import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { Package, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { Article } from '../types';

interface ApiPayload {
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  consumable: boolean;
  binCode?: string;
  idBinCode?: number;
  imageUrl?: string | null;
  imageFile?: File | null;
  sku?: string;
}

interface CreateItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingArticle: Article | null;
  onSubmit: (articleData: ApiPayload) => void;
  categories: { value: string; label: string }[];
  categoriesLoading: boolean;
}

type ArticleTypeUI = 'consumable' | 'non-consumable' | 'pending-purchase';

export function CreateItemModal({
  open,
  onOpenChange,
  editingArticle,
  onSubmit,
  categories,
  categoriesLoading 
}: CreateItemModalProps) {

  const getUIType = (article: Article | null): ArticleTypeUI => {
    if (article?.consumable === false) return 'non-consumable';
    if (article?.consumable === true) return 'consumable';
    return 'consumable';
  }

  const [formData, setFormData] = useState({
    name: editingArticle?.name || '',
    description: editingArticle?.description || '',
    category: editingArticle?.category || (categories[0]?.value || 'other'),
    typeUI: getUIType(editingArticle),
    binCode: '',
    unit: editingArticle?.unit || '',
    minStock: editingArticle?.minStock.toString() || '',
    imageUrl: editingArticle?.imageUrl || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showBinStock, setShowBinStock] = useState(false);
  const [articleBins, setArticleBins] = useState<any[]>(editingArticle?.bins || []);

  useEffect(() => {
    if (editingArticle) {
      setFormData({
        name: editingArticle.name,
        description: editingArticle.description,
        category: editingArticle.category,
        typeUI: getUIType(editingArticle),
        binCode: editingArticle.bins?.[0]?.binCode || '',
        unit: editingArticle.unit,
        minStock: editingArticle.minStock.toString(),
        imageUrl: editingArticle.imageUrl || ''
      });
      setArticleBins(editingArticle.bins);
    } else {
      const defaultCategory = categories.length > 0 ? categories[0].value : 'other';

      setFormData({
        name: '',
        description: '',
        category: defaultCategory,
        typeUI: 'consumable',
        binCode: '',
        unit: '',
        minStock: '',
        imageUrl: ''
      });
      setArticleBins([]);
    }
    setImageFile(null);
    setShowBinStock(false);
  }, [editingArticle, open, categories]);

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

  // ✅ NUEVA FUNCIÓN: Eliminar imagen
  const handleRemoveImage = () => {
    setImageFile(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingArticle) {
      // ✅ MODO EDICIÓN - Incluir imageFile si hay una nueva imagen
      const updatePayload: ApiPayload = {
        sku: editingArticle.sku,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        consumable: formData.typeUI === 'consumable',
        minStock: parseInt(formData.minStock, 10),
        imageFile: imageFile, // ✅ Nueva imagen si existe
        imageUrl: imageFile ? null : formData.imageUrl, // ✅ Mantener URL existente si no hay nueva imagen
      };
      console.log('UPDATE PAYLOAD from Modal:', updatePayload);
      onSubmit(updatePayload);
    } else {
      // MODO CREACIÓN
      const createPayload: ApiPayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        consumable: formData.typeUI === 'consumable',
        minStock: parseInt(formData.minStock, 10),
        binCode: formData.binCode,
        idBinCode: formData.idBinCode,
        imageFile: imageFile,
      };
      console.log('CREATE PAYLOAD from Modal:', createPayload);
      onSubmit(createPayload);
    }
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

  const totalStock = articleBins.reduce((sum, bin) => sum + (bin.currentStock || 0), 0) + (editingArticle?.quantityAvailable || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingArticle ? 'Edit Item' : 'Register new Item'}</DialogTitle>
          <DialogDescription>
            {editingArticle ? 'Update the item information below.' : 'Fill in the details to create a new item in your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the item..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
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
              <Label htmlFor="typeUI">Type *</Label>
              <Select
                value={formData.typeUI}
                onValueChange={(value: ArticleTypeUI) => setFormData({ ...formData, typeUI: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="non-consumable">Non-Consumable</SelectItem>
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
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* ✅ CAMPO DE IMAGEN - Ahora visible tanto en creación como en edición */}
          <div>
            <Label>Article Image {editingArticle && '(Optional - Upload to change)'}</Label>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
              
              {/* Previsualización de imagen */}
              {formData.imageUrl && (
                <div className="relative w-24 h-24 border rounded overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* ✅ Botón para eliminar imagen */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {/* ✅ Mensaje informativo en modo edición */}
              {editingArticle && !imageFile && formData.imageUrl && (
                <p className="text-xs text-muted-foreground">
                  Current image will be kept. Upload a new one to replace it.
                </p>
              )}
            </div>
          </div>

          {/* Stock en diferentes bins - Solo en modo edición */}
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
                  Stock in Different Bins ({articleBins.length} Bins)
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articleBins.map((bin, index) => (
                          <TableRow key={bin.binCode || index}>
                            <TableCell className="font-mono">{bin.binCode || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total Physical Stock for SKU {editingArticle.sku}: {totalStock} {editingArticle.unit}
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