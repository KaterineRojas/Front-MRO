import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { BinSelector } from '../../../BinSelector';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../ui/alert-dialog';
import { saveItems } from '../../../../services/itemService'; 

interface Article {
  id: number;
  imageUrl?: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  type: 'consumable' | 'non-consumable';
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

// --- Componente AddItemModal ---

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); 

  // ... (useEffect y handleImageFileChange)
  React.useEffect(() => {
    if (open) { 
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
        setError(null); // Reset
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


  // --- FUNCIÓN PARA EL ERROR ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; 

    setError(null); 
    setIsSubmitting(true);

    try {
      // Para backend
      const itemPayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        minStock: parseInt(formData.minStock || '0'), 
        consumible: formData.type === 'consumable', 
        urlImage: formData.imageUrl || '',
      };
      
      console.log("Payload FINAL a enviar:", itemPayload); 
      
      const response = await saveItems([itemPayload as any]); 
      
      console.log("✅ Artículo guardado con éxito. Respuesta del servidor:", response);

      // (si es exitoso)
      const newArticle: Article = {
          id: editingArticle ? editingArticle.id : (response[0]?.id || Date.now()),
          imageUrl: formData.imageUrl,
          sku: editingArticle ? editingArticle.sku : `SKU-${Date.now()}`,
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error('❌ ERROR CRÍTICO al enviar o en el servicio:', errorMessage);
      setError("An unexpected issue occurred. Please try again.");

    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <>
      {/* -Modal */}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})} disabled={isSubmitting}>
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
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})} disabled={isSubmitting}>
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
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  placeholder="e.g., pieces, sheets, units"
                  required
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingArticle ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Alert */}
      <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-red-600'>Operation Failed</AlertDialogTitle>
            <AlertDialogDescription>
              An unexpected issue occurred. Please try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}