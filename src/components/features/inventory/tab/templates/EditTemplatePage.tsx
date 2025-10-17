import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { TemplateForm } from './TemplateForm';
import { ArticlesList } from './ArticlesList';
import { SelectedItemsList } from './SelectedItemsList';
import { useTemplateForm } from './useTemplateForm';
import type { EditTemplatePageProps } from './types';

export function EditTemplatePage({ articles, editingTemplate, onBack, onSave }: EditTemplatePageProps) {
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
  } = useTemplateForm(articles, editingTemplate, onSave);

  const pageTitle = editingTemplate ? 'Edit Template' : 'Create New Template';

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
              {editingTemplate
                ? 'Update the template information and items below.'
                : 'Create a reusable template for kits.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form + Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemplateForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          editing={!!editingTemplate}
        />

        <ArticlesList
          articles={filteredArticles}
          formData={formData}
          addItemToTemplate={addItemToTemplate}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />
      </div>

      {/* Selected Items */}
      {formData.items.length > 0 && (
        <Card>
          <SelectedItemsList
            formData={formData}
            articles={articles}
            updateItemQuantity={updateItemQuantity}
            removeItemFromTemplate={removeItemFromTemplate}
          />
        </Card>
      )}
    </div>
  );
}
