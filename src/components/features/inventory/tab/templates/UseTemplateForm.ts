import { useState, useMemo } from 'react';
import type { Article, Template, TemplateFormData } from './types';

export function useTemplateForm(
  articles: Article[],
  editingTemplate: Template | null,
  onSave: (data: TemplateFormData) => void
) {
  const [formData, setFormData] = useState<TemplateFormData>(
    editingTemplate ?? {
      name: '',
      description: '',
      category: '',
      items: [],
    }
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.binCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, categoryFilter]);

  const addItemToTemplate = (article: Article) => {
    if (!formData.items.some((item) => item.articleId === article.id)) {
      setFormData({
        ...formData,
        items: [...formData.items, { articleId: article.id, quantity: 1 }],
      });
    }
  };

  const updateItemQuantity = (articleId: string, quantity: number) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.articleId === articleId ? { ...item, quantity } : item
      ),
    });
  };

  const removeItemFromTemplate = (articleId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.articleId !== articleId),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return {
    formData,
    setFormData,
    filteredArticles,
    addItemToTemplate,
    updateItemQuantity,
    removeItemFromTemplate,
    handleSubmit,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
  };
}
