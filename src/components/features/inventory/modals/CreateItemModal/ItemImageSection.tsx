// src/components/features/inventory/modals/CreateItemModal/ItemImageSection.tsx
import React from 'react';
import { Label } from '../../../../ui/label';
import { Image as ImageIcon, X } from 'lucide-react';
import type { ItemImageSectionProps } from './types';

export function ItemImageSection({
  imageUrl,
  imageFile,
  editingArticle,
  onImageChange,
  onImageRemove,
}: ItemImageSectionProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <ImageIcon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Item Image</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-4">
          {/* Image Preview */}
          {imageUrl ? (
            <div className="relative w-32 h-32 border-2 border-dashed border-primary/20 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={onImageRemove}
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
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {editingArticle && !imageFile && imageUrl && (
              <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200 dark:border-blue-900">
                Current image will be kept. Upload a new one to replace it.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}