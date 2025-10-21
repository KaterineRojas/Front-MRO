import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ArrowUpDown } from 'lucide-react';
import { CreateKitPage } from './modals/CreateKitPage';
import { EditTemplatePage } from './components/EditTemplatePage';
import { RecordMovementModal } from './modals/RecordMovementModal';
import { ItemsTab } from './tabs/ItemsTab';
import { KitsTab } from './tabs/KitsTab';
import { TemplatesTab } from './tabs/TemplatesTab';
import { BinsTab } from './tabs/BinsTab';
import { TransactionsTab } from './tabs/TransactionsTab';
import type { Article, Kit, Template, MovementData } from './types';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  fetchArticles, 
  fetchKits,
  fetchTemplates,
  fetchBins,
  fetchTransactions,
  createArticleAsync,
  updateArticleAsync,
  deleteArticle,
  createKitAsync,
  updateKitAsync,
  deleteKit,
  createTemplateAsync,
  updateTemplateAsync,
  deleteTemplate,
  recordMovementAsync
} from '../../../store/slices/inventorySlice';

export function InventoryManager() {
  const dispatch = useAppDispatch();
  const { articles, kits, templates, bins, transactions, loading, error } = useAppSelector((state) => state.inventory);
  
  const [viewMode, setViewMode] = useState<'items' | 'kits' | 'create-kit' | 'templates' | 'edit-template' | 'bins' | 'transactions'>('items');
  const [recordMovementOpen, setRecordMovementOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchArticles());
    dispatch(fetchKits());
    dispatch(fetchTemplates());
    dispatch(fetchBins());
    dispatch(fetchTransactions());
  }, [dispatch]);


const handleCreateItem = async(articleData: {
  name: string;
  description: string;
  category: string;
  unit: string;
  minStock: number;
  consumable: boolean;
  imageFile?: File | null;
}) => {
  try {
    await dispatch(createArticleAsync(articleData)).unwrap();
    // ✅ Recargar todos los artículos desde el API después de crear
    await dispatch(fetchArticles()).unwrap();
    alert('Item created successfully!');
  } catch (error) {
    console.error('Failed to create article:', error);
    alert('Failed to create item. Please try again.');
  }
};
  const handleUpdateItem = (id: number, articleData: Omit<Article, 'id' | 'createdAt' | 'currentStock' | 'location' | 'status'>) => {
    dispatch(updateArticleAsync({ id, data: articleData }));
  };

  const handleDeleteItem = (id: number) => {
    dispatch(deleteArticle(id));
  };

  const handleCreateKit = () => {
    setEditingKit(null);
    setSelectedTemplate(null);
    setViewMode('create-kit');
  };

  const handleEditKit = (kit: Kit) => {
    setEditingKit(kit);
    setSelectedTemplate(null);
    setViewMode('create-kit');
  };

  const handleDeleteKit = (id: number) => {
    dispatch(deleteKit(id));
  };

  const handleKitSave = (kitData: Omit<Kit, 'id' | 'createdAt'>) => {
    const kitDataWithImage = {
      ...kitData,
      imageUrl: kitData.imageUrl || 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    };

    if (editingKit) {
      dispatch(updateKitAsync({ id: editingKit.id, data: kitDataWithImage }));
    } else {
      dispatch(createKitAsync(kitDataWithImage));
    }

    setViewMode('kits');
    setEditingKit(null);
    setSelectedTemplate(null);
    alert(editingKit ? 'Kit updated successfully!' : 'Kit created successfully!');
  };

  const handleBackToKits = () => {
    setViewMode('kits');
    setEditingKit(null);
    setSelectedTemplate(null);
  };

  const handleCreateKitFromTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setEditingKit(null);
    setViewMode('create-kit');
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setViewMode('edit-template');
  };

  const handleBackToTemplates = () => {
    setViewMode('templates');
    setEditingTemplate(null);
  };

  const handleTemplateSave = (templateData: Omit<Template, 'id' | 'createdAt'>) => {
    if (editingTemplate) {
      dispatch(updateTemplateAsync({ id: editingTemplate.id, data: templateData }));
    } else {
      dispatch(createTemplateAsync(templateData));
    }
    
    setViewMode('templates');
    setEditingTemplate(null);
    alert(editingTemplate ? 'Template updated successfully!' : 'Template created successfully!');
  };

  const handleCreateNewTemplate = () => {
    setEditingTemplate(null);
    setViewMode('edit-template');
  };

  const handleRecordMovement = (movementData: MovementData) => {
    if (movementData.itemType === 'item') {
      let selectedArticle;
      
      if (movementData.movementType === 'entry') {
        selectedArticle = articles.find(article => article.sku === movementData.articleSKU);
      } else {
        selectedArticle = articles.find(article => article.binCode === movementData.articleBinCode);
      }
      
      if (!selectedArticle) return;

      const quantityChange = parseInt(movementData.quantity);
      
      if ((movementData.movementType === 'exit' || movementData.movementType === 'relocation') && quantityChange > selectedArticle.currentStock) {
        alert(`Error: Cannot process ${quantityChange} units. Only ${selectedArticle.currentStock} units available in stock.`);
        return;
      }

      dispatch(recordMovementAsync(movementData));
    } else {
      alert('Kit movement recorded (relocation only)');
    }

    alert('Movement recorded successfully!');
  };

  // Show loading state
  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading inventory data...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button 
            onClick={() => {
              dispatch(fetchArticles());
              dispatch(fetchKits());
              dispatch(fetchTemplates());
              dispatch(fetchBins());
              dispatch(fetchTransactions());
            }}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Special view modes
  if (viewMode === 'create-kit') {
    return (
      <CreateKitPage
        articles={articles}
        editingKit={editingKit}
        fromTemplate={selectedTemplate}
        onBack={handleBackToKits}
        onSave={handleKitSave}
      />
    );
  }

  if (viewMode === 'edit-template') {
    return (
      <EditTemplatePage
        articles={articles}
        editingTemplate={editingTemplate}
        onBack={handleBackToTemplates}
        onSave={handleTemplateSave}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory articles and track stock levels
          </p>
        </div>
        <Button variant="default" onClick={() => setRecordMovementOpen(true)}>
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Record Movement
        </Button>
      </div>

      <Tabs 
        value={viewMode === 'templates' ? 'templates' : viewMode === 'kits' ? 'kits' : viewMode === 'bins' ? 'bins' : viewMode === 'transactions' ? 'transactions' : 'items'} 
        onValueChange={(value) => setViewMode(value as any)} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="bins">Bins</TabsTrigger>
          <TabsTrigger value="transactions">Transaction</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <ItemsTab
            articles={articles}
            onCreateItem={handleCreateItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
        </TabsContent>

        <TabsContent value="kits" className="space-y-4">
          <KitsTab
            kits={kits}
            articles={articles}
            onCreateKit={handleCreateKit}
            onEditKit={handleEditKit}
            onDeleteKit={handleDeleteKit}
            onViewTemplates={() => setViewMode('templates')}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplatesTab
            articles={articles}
            onCreateKitFromTemplate={handleCreateKitFromTemplate}
            onEditTemplate={handleEditTemplate}
            onCreateNewTemplate={handleCreateNewTemplate}
          />
        </TabsContent>

        <TabsContent value="bins" className="space-y-4">
          <BinsTab />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTab />
        </TabsContent>
      </Tabs>

      <RecordMovementModal
        open={recordMovementOpen}
        onOpenChange={setRecordMovementOpen}
        articles={articles}
        kits={kits}
        onRecordMovement={handleRecordMovement}
      />
    </div>
  );
}
