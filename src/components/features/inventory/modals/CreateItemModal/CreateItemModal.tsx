// src/components/features/inventory/modals/CreateItemModal/CreateItemModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../ui/dialog';
import { Button } from '../../../../ui/button';
import { Package } from 'lucide-react';
import { ItemBasicInfoSection } from './ItemBasicInfoSection';
import { ItemClassificationSection } from './ItemClassificationSection';
import { ItemStockSettingsSection } from './ItemStockSettingsSection';
import { ItemImageSection } from './ItemImageSection';
import { ItemBinDistribution } from './ItemBinDistribution';
import { useItemForm } from './useItemForm';
import type { CreateItemModalProps } from './types';

export function CreateItemModal({
  open,
  onOpenChange,
  editingArticle,
  onSubmit,
  categories,
  categoriesLoading,
}: CreateItemModalProps) {
  const {
    formData,
    imageFile,
    articleBins,
    updateFormData,
    handleImageChange,
    handleImageRemove,
    buildPayload,
  } = useItemForm(editingArticle, categories, open);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    console.log(editingArticle ? 'UPDATE PAYLOAD' : 'CREATE PAYLOAD', payload);
    onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 mt-1">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6" />
            {editingArticle ? 'Edit Item' : 'Register New Item'}
          </DialogTitle>
          <DialogDescription>
            {editingArticle
              ? 'Update the item information below.'
              : 'Fill in the details to create a new item in your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <ItemBasicInfoSection formData={formData} onFormDataChange={updateFormData} />

            <ItemClassificationSection
              formData={formData}
              categories={categories}
              categoriesLoading={categoriesLoading}
              onFormDataChange={updateFormData}
            />

            <ItemStockSettingsSection formData={formData} onFormDataChange={updateFormData} />

            <ItemImageSection
              imageUrl={formData.imageUrl}
              imageFile={imageFile}
              editingArticle={editingArticle}
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
            />

            {editingArticle && (
              <ItemBinDistribution article={editingArticle} bins={articleBins} />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t mt-3 flex-shrink-0 bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[96px]"
            >
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

// Re-export types for backwards compatibility
export type { ApiPayload } from './types';