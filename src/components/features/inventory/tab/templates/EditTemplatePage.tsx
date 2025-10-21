import { useState, useEffect } from 'react';
import { Button } from '@/components/features/ui/button'
import { Card } from '@/components/features/ui/card';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/features/ui/alert';
import { TemplateForm } from './TemplateForm';
import { ArticlesList } from './ArticlesList';
import { SelectedItemsList } from './SelectedItemsList';
import { UseTemplateForm } from './UseTemplateForm';
import type { EditTemplatePageProps } from './types';
import type { Article } from './types';
import { getItems } from '@/services/inventarioService';

export function EditTemplatePage({ editingTemplate, onBack, onSave }: EditTemplatePageProps) {
  // State for loading items from API
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items from API on mount
  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true);
        setError(null);
        const items = await getItems();
        setArticles(items);
      } catch (err) {
        console.error('Error loading items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load items');
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  const {
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
  } = UseTemplateForm(articles, editingTemplate, onSave);

  // Check if we're editing an existing template (id > 0) or creating a new one (id === 0 or null)
  const isEditing = editingTemplate && editingTemplate.id > 0;
  const pageTitle = isEditing ? 'Edit Template' : 'Create New Template';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
            <p className="text-muted-foreground text-sm">
              {isEditing
                ? 'Update the template information and items below.'
                : 'Create a reusable template for kits.'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading items...</span>
        </div>
      ) : (
        <>
          {/* Articles List + Selected Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ArticlesList
              articles={filteredArticles}
              formData={formData}
              addItemToTemplate={addItemToTemplate}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />

            <Card>
              <SelectedItemsList
                formData={formData}
                articles={articles}
                updateItemQuantity={updateItemQuantity}
                removeItemFromTemplate={removeItemFromTemplate}
              />
            </Card>
          </div>

          {/* Template Form */}
          <TemplateForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            editing={!!isEditing}
          />
        </>
      )}
    </div>
  );
}
