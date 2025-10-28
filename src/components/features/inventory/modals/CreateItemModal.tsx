import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { Package, ChevronDown, ChevronRight } from 'lucide-react';
import type { Article } from '../types';
import { CATEGORIES } from '../constants';
import { BinSelector } from '../components/BinSelector';


// Tipo de datos que la API realmente espera (sin cambios necesarios aquí)
interface ApiPayload {
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  consumable: boolean;
  binCode: string;
  idBinCode: number,
  imageUrl?: string | null;
  imageFile?: File | null;
  sku?: string;
}

interface CreateItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingArticle: Article | null;
  onSubmit: (articleData: ApiPayload) => void;
}

//  Definimos un tipo local para la UI (como 'type' ya no existe en Article)
type ArticleTypeUI = 'consumable' | 'non-consumable' | 'pending-purchase';

export function CreateItemModal({
  open,
  onOpenChange,
  editingArticle,
  onSubmit
}: CreateItemModalProps) {

  // Función auxiliar para convertir el booleano 'consumable' a un string para la UI
  const getUIType = (article: Article | null): ArticleTypeUI => {
    if (article?.consumable === false) return 'non-consumable';
    if (article?.consumable === true) return 'consumable';
    return 'consumable'; // Valor por defecto si no está en edición
  }

  // ⭐ INICIALIZACIÓN DE ESTADO ACTUALIZADA: 
  // Ahora usamos una propiedad local 'typeUI' que maneja el string de la selección.
  const [formData, setFormData] = useState({
    name: editingArticle?.name || '',
    description: editingArticle?.description || '',
    category: editingArticle?.category || ('office-supplies' as Article['category']),
    // Usamos el estado local 'typeUI' para manejar el valor del Select
    typeUI: getUIType(editingArticle),
    binCode: '', // El binCode ya no es una propiedad directa en Article, lo inicializamos vacío
    unit: editingArticle?.unit || '',
    minStock: editingArticle?.minStock.toString() || '',
    imageUrl: editingArticle?.imageUrl || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showBinStock, setShowBinStock] = useState(false);
  // Asumimos que ArticleBin[] no está tipado, si lo está, por favor proporcione ese tipo.
  const [articleBins, setArticleBins] = useState<any[]>(editingArticle?.bins || []);


  useEffect(() => {
    if (editingArticle) {
      setFormData({
        name: editingArticle.name,
        description: editingArticle.description,
        category: editingArticle.category,
        typeUI: getUIType(editingArticle),
        // Asumimos que quieres usar el primer binCode si existe
        binCode: editingArticle.bins?.[0]?.binCode || '',
        unit: editingArticle.unit,
        minStock: editingArticle.minStock.toString(),
        imageUrl: editingArticle.imageUrl || ''
      });
      setArticleBins(editingArticle.bins);
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'office-supplies',
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

  // ⭐ FUNCIÓN DE ENVÍO ACTUALIZADA
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Diferenciar entre creación y edición
    if (editingArticle) {
      // MODO EDICIÓN - Enviar datos para PUT
      const updatePayload = {
        sku: editingArticle.sku, // ✅ Incluir SKU para edición
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        consumable: formData.typeUI === 'consumable',
        minStock: parseInt(formData.minStock, 10),
        imageUrl: formData.imageUrl || null,
      };
      console.log('UPDATE PAYLOAD from Modal:', updatePayload);
      onSubmit(updatePayload);
    } else {
      // MODO CREACIÓN - Enviar datos para POST
      const createPayload = {
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
      console.log('CREATE PAYLOAD from Modal:', createPayload); // ✅ CORREGIDO: ahora usa createPayload
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

  // Se necesitan datos del artículo para mostrar el total en el modo edición.
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

            {/* Campo Name */}
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
            {/* Campo Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                // Corregimos el tipado usando el tipo de Article, que existe
                onValueChange={(value: Article['category']) => setFormData({ ...formData, category: value })}
              >
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
            {/* Campo Type (ahora usa typeUI) */}
            <div>
              <Label htmlFor="typeUI">Type *</Label>
              <Select
                value={formData.typeUI}
                // ✅ Usa el tipo local ArticleTypeUI
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
            {/* Campo Unit */}
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
            {/* Campo Min Stock */}
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

          {/* Article Image - Solo visible en modo creación */}
          {!editingArticle && (
            <div>
              <Label>Article Image</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                />

                {/* Previsualización de imagen */}
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
          )}
          {/* Stock in Different Bins - Solo visible en modo edición (editingArticle) */}
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

                          {/*  <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>*/}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articleBins.map((bin, index) => (
                          <TableRow key={bin.binCode || index}>
                            <TableCell className="font-mono">{bin.binCode || 'N/A'}</TableCell>

                            {/*  <TableCell>{bin.currentStock || 0} {editingArticle.unit}</TableCell>
                             <TableCell>{getStatusBadge(bin.status || 'N/A')}</TableCell>*/}
                          </TableRow>
                        ))}

                        {/* Fila MOCK de ejemplo para bins adicionales */}

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