import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { Package, ChevronDown, ChevronRight, X, FileText, Tag, Layers, Box, Image as ImageIcon, TrendingDown, RotateCcw } from 'lucide-react';
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6" />
            {editingArticle ? 'Edit Item' : 'Register New Item'}
          </DialogTitle>
          <DialogDescription>
            {editingArticle ? 'Update the item information below.' : 'Fill in the details to create a new item in your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the item, specifications, notes..."
                  rows={3}
                  className="mt-1.5 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Classification Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Classification</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className="mt-1.5">
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
                <Label htmlFor="typeUI" className="flex items-center gap-2">
                  {formData.typeUI === 'consumable' ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}
                  Item Type *
                </Label>
                <Select
                  value={formData.typeUI}
                  onValueChange={(value: ArticleTypeUI) => setFormData({ ...formData, typeUI: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumable">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-3 w-3" />
                        Consumable
                      </div>
                    </SelectItem>
                    <SelectItem value="non-consumable">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-3 w-3" />
                        Non-Consumable
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Stock Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Box className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Stock Settings</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit" className="flex items-center gap-2">
                  <Box className="h-3 w-3" />
                  Unit of Measure *
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., pieces, sheets, kg, liters"
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="minStock" className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  Minimum Stock Level *
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="0"
                  required
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">Alert when stock falls below this level</p>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <ImageIcon className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Item Image</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                {formData.imageUrl ? (
                  <div className="relative w-32 h-32 border-2 border-dashed border-primary/20 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 hover:bg-destructive/90 transition-colors shadow-lg"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/30 flex-shrink-0">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}

                {/* Upload Input */}
                <div className="flex-1 space-y-2">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Click to upload image</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'none' }}
                  />

                  {editingArticle && !imageFile && formData.imageUrl && (
                    <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200 dark:border-blue-900">
                      Current image will be kept. Upload a new one to replace it.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stock Distribution - Only in Edit Mode */}
          {editingArticle && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-muted/30">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                  onClick={() => setShowBinStock(!showBinStock)}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Package className="h-4 w-4" />
                    Stock Distribution Across Bins
                    <Badge variant="secondary">{articleBins.length} Bins</Badge>
                  </span>
                  {showBinStock ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                {showBinStock && (
                  <div className="p-4 border-t">
                    <div className="rounded-md border bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>BIN Code</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {articleBins.length > 0 ? (
                            articleBins.map((bin, index) => (
                              <TableRow key={bin.binCode || index}>
                                <TableCell className="font-mono">{bin.binCode || 'N/A'}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell className="text-center text-muted-foreground py-4">
                                No bins assigned yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-3 p-3 bg-primary/5 rounded-md border border-primary/10">
                      <p className="text-sm font-medium">
                        Total Physical Stock: <span className="text-primary">{totalStock} {editingArticle.unit}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        SKU: {editingArticle.sku}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-w-[100px]">
              Cancel
            </Button>
            <Button type="submit" className="min-w-[100px]">
              {editingArticle ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}