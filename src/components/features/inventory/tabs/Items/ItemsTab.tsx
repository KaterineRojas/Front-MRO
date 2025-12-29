// src/components/features/inventory/tabs/Items/ItemsTab.tsx
import  { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Package, Plus } from 'lucide-react';
import { CreateItemModal, ApiPayload } from '../../modals/CreateItemModal/CreateItemModal';
import { ItemsFilters } from './ItemsFilters';
import { ItemsTable } from './ItemsTable';
import { useItemsFilters } from './useItemsFilters';
import { calculateItemsCount } from './itemsHelpers';
import { getCategories } from '../../services/inventoryApi';
import type { ItemsTabProps, CreateArticleData, UpdateArticleData } from './types';
import type { Article } from '../../types';

export function ItemsTab({ articles, onCreateItem, onUpdateItem, onDeleteItem }: ItemsTabProps) {
  const [stockFilter, setStockFilter] = useState<'all' | 'with-stock' | 'empty'>('with-stock');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Custom hook para filtros y expansión
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    expandedItems,
    filteredArticles,
    handleToggleExpandItem,
  } = useItemsFilters(articles, stockFilter);

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const itemsCount = calculateItemsCount(articles);

  const handleImageError = (id: number) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setDialogOpen(true);
  };

  const handleSubmit = (articleData: ApiPayload) => {
    if (editingArticle) {
      const updateData: UpdateArticleData = {
        name: articleData.name,
        description: articleData.description,
        category: articleData.category,
        unit: articleData.unit,
        minStock: articleData.minStock,
        consumable: articleData.consumable,
        sku: articleData.sku!,
        imageUrl: articleData.imageUrl,
        imageFile: articleData.imageFile,
      };

      onUpdateItem(editingArticle.id, updateData);
    } else {
      const createData: CreateArticleData = {
        name: articleData.name,
        description: articleData.description,
        category: articleData.category,
        unit: articleData.unit,
        minStock: articleData.minStock,
        consumable: articleData.consumable,
        binCode: articleData.binCode!,
        imageFile: articleData.imageFile,
      };

      onCreateItem(createData);
    }
    setEditingArticle(null);
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Items Inventory
          </CardTitle>
          <Button onClick={() => {
            setEditingArticle(null);
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Register new Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ItemsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          categories={categories}
          categoriesLoading={categoriesLoading}
          itemsCount={itemsCount}
        />

        <ItemsTable
          articles={filteredArticles}
          expandedItems={expandedItems}
          imageErrors={imageErrors}
          categories={categories}
          onToggleExpand={handleToggleExpandItem}
          onEditItem={openEditDialog}
          onDeleteItem={onDeleteItem}
          onImageError={handleImageError}
        />
      </CardContent>

      <CreateItemModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingArticle={editingArticle}
        onSubmit={handleSubmit}
        categories={categories}
        categoriesLoading={categoriesLoading}
      />
    </Card>
  );
}