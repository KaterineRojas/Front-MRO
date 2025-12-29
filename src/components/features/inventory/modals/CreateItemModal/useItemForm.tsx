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
  const [isConsumable, setIsConsumable] = useState<boolean>(editingArticle?.consumable ?? true);

  // Reset form cuando cambia el artículo o se abre/cierra el modal
  useEffect(() => {
    if (editingArticle) {
      setFormData(getInitialFormData(editingArticle, categories));
      setArticleBins(editingArticle.bins);
      setIsConsumable(editingArticle.consumable ?? true);
    } else {
      setFormData(getInitialFormData(null, categories));
      setArticleBins([]);
      setIsConsumable(true);
    }
    setImageFile(null);
    setShowBinStock(false);
  }, [editingArticle, open]);

  useEffect(() => {
    if (!editingArticle && categories.length > 0) {
      setFormData(prev => ({
        ...prev,
        category: prev.category || categories[0].value,
      }));
    }
  }, [categories, editingArticle]);

  const updateFormData = (updates: Partial<ItemFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (Object.prototype.hasOwnProperty.call(updates, 'typeUI') && updates.typeUI) {
      setIsConsumable(updates.typeUI === 'consumable');
    }
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

  const resolveCategoryForApi = () => {
    const match = categories.find(cat => cat.value === formData.category);
    if (match?.apiValue) {
      return match.apiValue;
    }
    if (editingArticle?.categoryRaw) {
      return editingArticle.categoryRaw;
    }
    return formData.category;
  };

  const buildPayload = (): ApiPayload => {
    const categoryForApi = resolveCategoryForApi();

    if (editingArticle) {
      return {
        sku: editingArticle.sku,
        name: formData.name,
        description: formData.description,
        category: categoryForApi,
        unit: formData.unit,
        consumable: isConsumable,
        minStock: parseInt(formData.minStock, 10),
        imageFile: imageFile,
        imageUrl: imageFile ? null : formData.imageUrl,
      };
    }

    return {
      name: formData.name,
      description: formData.description,
      category: categoryForApi,
      unit: formData.unit,
      consumable: isConsumable,
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