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
      <div className="flex items-center gap-2 pb-1 border-b">
        <ImageIcon className="h-3 w-3 text-primary" />
        <h3 className="font-semibold text-xs">Item Image</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-4">
          {/* Image Preview */}
          {imageUrl ? (
            <div className="relative w-28 h-28 border border-dashed border-primary/20 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={onImageRemove}
                className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors shadow"
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="w-28 h-28 border border-dashed border-muted-foreground/25 rounded-md flex items-center justify-center bg-muted/30 flex-shrink-0">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}

          {/* Upload Input */}
          <div className="flex-1 space-y-2">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="border border-dashed rounded-md p-3 hover:border-primary/50 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium">Click to upload image</p>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG up to 10MB</p>
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