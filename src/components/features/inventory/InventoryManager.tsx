import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ArrowUpDown } from 'lucide-react';
import { CreateKitPage } from './modals/CreateKitPage';
import { EditTemplatePage } from './components/EditTemplatePage';
import { RecordMovementModal } from './modals/RecordMovement/RecordMovementModal';
import { ItemsTab } from './tabs/ItemsTab';
import { KitsTab } from './tabs/Kits/KitsTab';
import { TemplatesTab } from './tabs/TemplatesTab';
import { BinsTab } from './tabs/BinsTab';
import { TransactionsTab } from './tabs/transactions/TransactionsTab';
import type { Article, Kit, Template } from './types';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchArticles,
  fetchKits,
  fetchTemplates,
  fetchBins,
  fetchTransactions,
  createArticleAsync,
  updateArticleAsync,
  deleteArticleAsync,
  createKitAsync,
  updateKitAsync,
  deleteKit,
  createTemplateAsync,
  updateTemplateAsync,
  deleteTemplate,
  recordMovementAsync
} from '../../../store/slices/inventorySlice';
import type { MovementData } from './modals/RecordMovement/types';

export function InventoryManager() {
  const dispatch = useAppDispatch();
  const { articles, kits, templates, bins, transactions, loading, error } = useAppSelector((state) => state.inventory);
  const [usingKitAsTemplate, setUsingKitAsTemplate] = useState(false);
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


  const handleCreateItem = async (articleData: {
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
      //   Recargar todos los artículos desde el API después de crear
      await dispatch(fetchArticles()).unwrap();
      alert('Item created successfully!');
    } catch (error) {
      console.error('Failed to create article:', error);
      alert('Failed to create item. Please try again.');
    }
  };
  const handleUpdateItem = async (id: number, articleData: {
    name: string;
    description: string;
    category: string;
    unit: string;
    minStock: number;
    consumable: boolean;
    imageUrl?: string | null;
    sku: string;
  }) => {
    try {
      await dispatch(updateArticleAsync({ id, data: articleData })).unwrap();
      //   CRÍTICO: Recargar datos DESPUÉS de que se complete el update
      await dispatch(fetchArticles()).unwrap();
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Failed to update article:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = (id: number) => {
    dispatch(deleteArticleAsync(id));
  };

  const handleCreateKit = () => {
    setEditingKit(null);
    setSelectedTemplate(null);
    setViewMode('create-kit');
  };

  const handleEditKit = (kit: Kit) => {
    setEditingKit(kit);
    setSelectedTemplate(null);
    setUsingKitAsTemplate(false);
    setViewMode('create-kit');
  };

  const handleDeleteKit = (id: number) => {
    dispatch(deleteKit(id));
  };

const handleKitSave = (kitData: Omit<Kit, 'id' | 'createdAt'>) => {
  console.log('🔵 handleKitSave called with:', kitData);
  console.log('🔵 editingKit:', editingKit);
  console.log('🔵 usingKitAsTemplate:', usingKitAsTemplate);

  const kitDataWithImage = {
    ...kitData,
    imageUrl: kitData.imageUrl || 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  };

  // ✅ CORREGIDO: Verificar tanto el ID como el flag usingKitAsTemplate
  if (editingKit && editingKit.id !== 0 && !usingKitAsTemplate) {
    // MODO EDICIÓN - actualizar kit existente
    console.log('🟡 Updating existing kit with ID:', editingKit.id);
    dispatch(updateKitAsync({ id: editingKit.id, data: kitDataWithImage }));
    alert('Kit updated successfully!');
  } else {
    // MODO CREACIÓN (nuevo o copia) - crear nuevo kit
    console.log('🟢 Creating new kit');
    dispatch(createKitAsync(kitDataWithImage));
    alert('Kit created successfully!');
  }

  setViewMode('kits');
  setEditingKit(null);
  setSelectedTemplate(null);
  setUsingKitAsTemplate(false); 
};

 const handleBackToKits = () => {
  setViewMode('kits');
  setEditingKit(null);
  setSelectedTemplate(null);
  setUsingKitAsTemplate(false); 
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

const handleRecordMovement = async (movementData: MovementData) => {
  console.log('📤 ========== RECORD MOVEMENT ==========');
  console.log('📤 Movement Data Received:', movementData);


  if (movementData.itemType === 'item') {
    const selectedArticle = articles.find(article => article.id === movementData.articleId);

    if (!selectedArticle) {
      alert('Error: Article not found');
      return;
    }

    console.log('📤 Selected Article:', selectedArticle);

    // Validación para exit/relocation
    if (movementData.movementType === 'exit' || movementData.movementType === 'relocation') {
      const selectedBin = selectedArticle.bins?.find(bin => bin.binId === movementData.articleBinId);
      
      if (!selectedBin) {
        alert('Error: Selected BIN not found');
        return;
      }

      const quantityToMove = parseInt(movementData.quantity);
      
      if (quantityToMove > selectedBin.quantity) {
        alert(`Error: Cannot process ${quantityToMove} units. Only ${selectedBin.quantity} units available in BIN ${selectedBin.binCode}.`);
        return;
      }

      console.log('📤 Selected BIN:', selectedBin);
      console.log('📤 Quantity to move:', quantityToMove);
    }

    // Validación para entry
    if (movementData.movementType === 'entry') {
      if (!movementData.newLocationBinId || movementData.newLocationBinId === 0) {
        alert('Error: Please select a destination BIN');
        return;
      }
      
      if (!movementData.quantity || parseInt(movementData.quantity) <= 0) {
        alert('Error: Please enter a valid quantity');
        return;
      }

      console.log('📤 Entry validation passed');
    }

    // Validación para relocation
    if (movementData.movementType === 'relocation') {
      if (!movementData.newLocationBinId || movementData.newLocationBinId === 0) {
        alert('Error: Please select a destination BIN');
        return;
      }

      if (movementData.articleBinId === movementData.newLocationBinId) {
        alert('Error: Cannot relocate to the same BIN');
        return;
      }

      console.log('📤 Relocation validation passed');
    }

    try {
      // ✅ Dispatch al thunk que llama a recordMovementApi
      console.log('📤 Dispatching recordMovementAsync...');
      await dispatch(recordMovementAsync(movementData)).unwrap();
      
      // ✅ Recargar datos después del movimiento
      await dispatch(fetchArticles()).unwrap();
      await dispatch(fetchTransactions()).unwrap();
      
      alert('Movement recorded successfully!');
      console.log('✅ Movement recorded and data refreshed');
    } catch (error) {
      console.error('❌ Failed to record movement:', error);
      alert('Failed to record movement. Please try again.');
    }

  } else if (movementData.itemType === 'kit') {
    // Kit movement (solo relocation)
    if (movementData.movementType !== 'relocation') {
      alert('Error: Kits can only be relocated');
      return;
    }

    if (!movementData.newLocationBinId || movementData.newLocationBinId === 0) {
      alert('Error: Please select a destination BIN');
      return;
    }

    try {
      console.log('📦 Recording kit relocation:', movementData);
      await dispatch(recordMovementAsync(movementData)).unwrap();
      
      // Recargar kits después del movimiento
      await dispatch(fetchKits()).unwrap();
      await dispatch(fetchTransactions()).unwrap();
      
      alert('Kit relocation recorded successfully!');
      console.log('✅ Kit movement recorded');
    } catch (error) {
      console.error('❌ Failed to record kit movement:', error);
      alert('Failed to record kit movement. Please try again.');
    }
  }
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

if (viewMode === 'create-kit') {
  return (
    <CreateKitPage
      articles={articles}
      editingKit={editingKit}
      fromTemplate={selectedTemplate}
      usingAsTemplate={usingKitAsTemplate} 
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
         <TabsList className="w-full !flex !flex-row">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
          {/*<TabsTrigger value="templates">Templates</TabsTrigger>*/}
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
            articles={articles}
            categories={[]}
            onCreateKit={handleCreateKit}
            onCreateFromTemplate={() => setViewMode('templates')}
            onEditKit={handleEditKit}
            onUseAsTemplate={(kit) => {
              console.log('🟢 Creating new kit from template:', kit);
              setEditingKit({
                ...kit,
                id: 0,
                binCode: '',
                quantity: 0,
                name: `${kit.name} (Copy)`,
              });
              setUsingKitAsTemplate(true);
              setViewMode('create-kit');
            }}
            onDeleteKit={handleDeleteKit}
          />
        </TabsContent>
{/*
        <TabsContent value="templates" className="space-y-4">
          <TemplatesTab
            articles={articles}
            onCreateKitFromTemplate={handleCreateKitFromTemplate}
            onEditTemplate={handleEditTemplate}
            onCreateNewTemplate={handleCreateNewTemplate}
          />
        </TabsContent>
        */}

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