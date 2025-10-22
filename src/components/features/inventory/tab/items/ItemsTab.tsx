import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Plus, Package } from 'lucide-react';
import { AddItemModal } from '../../modals/AddItemModal';
import { useAppDispatch } from '@/store/hooks';
import { addArticle, updateArticle, deleteArticle } from '@/store/inventorySlice';
import { ItemFilters } from './ItemFilters';
import { ItemTable } from './ItemTable';
import { UseItemFilters } from './UseItemFilters';
import type { ItemsTabProps, Article } from './types';

export function ItemsTab({
  articles,
  categories,
  onArticleUpdate,
  onArticleDelete,
  getStockStatus,
  getStatusBadge,
  getTypeIcon,
}: ItemsTabProps) {
  // Redux
  const dispatch = useAppDispatch();

  // Local state for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Custom hook for filters and state
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    expandedItems,
    filteredArticles,
    handleToggleExpandItem,
  } = UseItemFilters(articles);

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setDialogOpen(true);
  };

  const handleArticleSubmit = (article: Article) => {
    if (editingArticle) {
      dispatch(updateArticle(article));
      onArticleUpdate(articles.map((a) => (a.id === editingArticle.id ? article : a)));
    } else {
      dispatch(addArticle(article));
      onArticleUpdate([...articles, article]);
    }
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id: number) => {
    dispatch(deleteArticle(id));
    onArticleDelete(id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-2xl font-bold">
              <Package className="h-6 w-6 mr-2" />
              Items
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage individual inventory items and stock levels
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <AddItemModal
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingArticle(null);
          }}
          editingArticle={editingArticle}
          articles={articles}
          categories={categories}
          onSubmit={handleArticleSubmit}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <ItemFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />

        <ItemTable
          articles={filteredArticles}
          categories={categories}
          expandedItems={expandedItems}
          onToggleExpand={handleToggleExpandItem}
          onEditArticle={openEditDialog}
          onDeleteArticle={handleDeleteArticle}
          getStockStatus={getStockStatus}
          getStatusBadge={getStatusBadge}
          getTypeIcon={getTypeIcon}
        />
      </CardContent>
    </Card>
  );
}
