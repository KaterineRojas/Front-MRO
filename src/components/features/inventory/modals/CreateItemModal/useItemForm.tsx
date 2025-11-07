// src/components/features/inventory/modals/CreateItemModal/useItemForm.ts
import { useState, useEffect } from 'react';
import type { ItemFormData, ApiPayload } from './types';
import { getInitialFormData, readFileAsDataURL } from './itemModalHelpers';
import type { Article } from '../../types';

export function useItemForm(
  editingArticle: Article | null,
  categories: { value: string; label: string }[],
  open: boolean
) {
  const [formData, setFormData] = useState<ItemFormData>(() =>
    getInitialFormData(editingArticle, categories)
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showBinStock, setShowBinStock] = useState(false);
  const [articleBins, setArticleBins] = useState<any[]>(editingArticle?.bins || []);

  // Reset form cuando cambia el artículo o se abre/cierra el modal
  useEffect(() => {
    if (editingArticle) {
      setFormData(getInitialFormData(editingArticle, categories));
      setArticleBins(editingArticle.bins);
    } else {
      setFormData(getInitialFormData(null, categories));
      setArticleBins([]);
    }
    setImageFile(null);
    setShowBinStock(false);
  }, [editingArticle, open, categories]);

  const updateFormData = (updates: Partial<ItemFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleImageChange = async (file: File) => {
    setImageFile(file);
    const dataUrl = await readFileAsDataURL(file);
    updateFormData({ imageUrl: dataUrl });
  };

  const handleImageRemove = () => {
    setImageFile(null);
    updateFormData({ imageUrl: '' });
  };

  const buildPayload = (): ApiPayload => {
    if (editingArticle) {
      return {
        sku: editingArticle.sku,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        consumable: formData.typeUI === 'consumable',
        minStock: parseInt(formData.minStock, 10),
        imageFile: imageFile,
        imageUrl: imageFile ? null : formData.imageUrl,
      };
    }

    return {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      unit: formData.unit,
      consumable: formData.typeUI === 'consumable',
      minStock: parseInt(formData.minStock, 10),
      binCode: formData.binCode,
      imageFile: imageFile,
    };
  };

  return {
    formData,
    imageFile,
    showBinStock,
    articleBins,
    updateFormData,
    setShowBinStock,
    handleImageChange,
    handleImageRemove,
    buildPayload,
  };
}