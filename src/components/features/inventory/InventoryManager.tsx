import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowUpDown } from 'lucide-react';

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setArticles,
  updateArticle,
  deleteArticle,
  setKits,
  addKit,
  updateKit,
  deleteKit,
  setSelectedView,
  setSelectedTemplate,
} from '@/store/inventorySlice';

// Components
import { ItemsTab } from './tab/items/ItemsTab';
import { KitsTab } from './tab/kits/KitsTab';
import { TemplateManager } from './tab/templates/TemplateManager';
import { BinManager } from './tab/bins/BinManager';
import { InventoryMovements } from './tab/transactions/InventoryMovements';
import { CreateKitPage } from '../../CreateKitPage';
import { RecordMovementModal } from './modals/RecordMovementModal';

// Types
import type { Article, Kit, Template, ViewMode } from './types/inventory';
import type { TemplateFormData, CreateTemplateRequest, UpdateTemplateRequest } from './tab/templates/types';

// Utils & Constants
import { getStockStatus, getStatusBadge, getTypeIcon } from './utils/badges';
import { CATEGORIES } from './constants/categories';
import { EditTemplatePage } from './tab/templates/EditTemplatePage';

// Services
import { createTemplate, updateTemplate } from '@/services/templateService';
import { fetchTemplates } from '@/store/inventorySlice';
import { getCategories, type Category } from '@/services/inventarioService';

// Mock Data - TODO: Replace with API calls
const mockArticles: Article[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300',
    sku: 'SKU-001',
    name: 'A4 nnnOffice Paper',
    description: 'ooffice Paper A4 - 80gsm',
    category: 'office-supplies',
    type: 'consumable',
    currentStock: 2500,
    cost: 0.02,
    binCode: 'BIN-OFF-001',
    unit: 'sheets',
    supplier: 'Office Supplies Inc.',
    minStock: 500,
    location: 'Storage Room A',
    status: 'good-condition',
    createdAt: '2025-01-15'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300',
    sku: 'SKU-003',
    name: 'USB Type-C Cable',
    description: 'USB Cable Type-C 2m',
    category: 'technology',
    type: 'consumable',
    currentStock: 50,
    cost: 15,
    binCode: 'BIN-USB-003',
    unit: 'units',
    supplier: 'Cable Corp.',
    minStock: 20,
    location: 'IT Storage',
    status: 'good-condition',
    createdAt: '2025-01-13'
  }
];



export function InventoryManager() {
  // Redux
  const dispatch = useAppDispatch();
  const articles = useAppSelector((state) => state.inventory.articles);
  const kits = useAppSelector((state) => state.inventory.kits);
  const viewMode = useAppSelector((state) => state.inventory.selectedView);
  const selectedTemplateFromStore = useAppSelector((state) => state.inventory.selectedTemplate);

  // Local State (UI-only state)
  const [recordMovementOpen, setRecordMovementOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Initialize mock data and load categories on mount
  useEffect(() => {
    if (articles.length === 0) {
      dispatch(setArticles(mockArticles));
    }
    // Kits are now loaded from API via fetchKits() in KitsTab

    // Load categories from API
    async function loadCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories(CATEGORIES);
      }
    }

    loadCategories();
  }, [dispatch]);

  // Article Handlers
  const handleArticleUpdate = (updatedArticles: Article[]) => {
    dispatch(setArticles(updatedArticles));
  };

  const handleArticleDelete = (id: number) => {
    dispatch(deleteArticle(id));
  };

  // Kit Handlers
  const handleKitCreate = () => {
    setEditingKit(null);
    dispatch(setSelectedTemplate(null));
    dispatch(setSelectedView('create-kit'));
  };

  const handleKitEdit = (kit: Kit) => {
    setEditingKit(kit);
    dispatch(setSelectedView('create-kit'));
  };

  const handleKitDelete = (id: number) => {
    dispatch(deleteKit(id));
  };

  const handleKitSave = (kitData: Omit<Kit, 'id' | 'createdAt'>) => {
    const newKit: Kit = {
      id: editingKit ? editingKit.id : Date.now(),
      ...kitData,
      imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      createdAt: editingKit ? editingKit.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingKit) {
      dispatch(updateKit(newKit));
    } else {
      dispatch(addKit(newKit));
    }

    dispatch(setSelectedView('kits'));
    setEditingKit(null);
    dispatch(setSelectedTemplate(null));
    alert(editingKit ? 'Kit updated successfully!' : 'Kit created successfully!');
  };

  const handleBackToKits = () => {
    dispatch(setSelectedView('kits'));
    setEditingKit(null);
    dispatch(setSelectedTemplate(null));
  };

  // Template Handlers
  const handleCreateKitFromTemplate = (template: Template) => {
    dispatch(setSelectedTemplate(template));
    dispatch(setSelectedView('create-kit'));
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    dispatch(setSelectedView('edit-template'));
  };

  const handleBackToTemplates = () => {
    dispatch(setSelectedView('templates'));
    setEditingTemplate(null);
  };

  const handleTemplateSave = async (templateData: TemplateFormData) => {
    try {
      // Check if we're creating or updating
      const isEditing = editingTemplate && editingTemplate.id > 0;

      if (isEditing) {
        // Transform TemplateFormData to UpdateTemplateRequest format
        const updateData: UpdateTemplateRequest = {
          templateName: templateData.name,
          description: templateData.description || '',
          isActive: true,
          items: templateData.items.map(item => ({
            id: item.articleId,
            quantity: item.quantity,
          })),
        };

        await updateTemplate(editingTemplate.id, updateData);
        alert('Template updated successfully!');
      } else {
        // Transform TemplateFormData to CreateTemplateRequest format
        const createData: CreateTemplateRequest = {
          templateName: templateData.name,
          description: templateData.description || '',
          items: templateData.items.map(item => ({
            itemId: item.articleId,
            quantity: item.quantity,
          })),
        };

        await createTemplate(createData);
        alert('Template created successfully!');
      }

      // Reload templates from the server
      dispatch(fetchTemplates());

      // Return to templates view
      dispatch(setSelectedView('templates'));
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateNewTemplate = () => {
    setEditingTemplate({
      id: 0,
      name: '',
      description: '',
      items: [],
      createdAt: new Date().toISOString(),
    });
    dispatch(setSelectedView('edit-template'));
  };


  // Movement Handler
  const handleMovementRecorded = (movementData: any) => {
    if (movementData.itemType === 'item') {
      let selectedArticle;

      if (movementData.movementType === 'entry') {
        selectedArticle = articles.find(article => article.sku === movementData.articleSKU);
      } else {
        selectedArticle = articles.find(article => article.binCode === movementData.articleBinCode);
      }

      if (!selectedArticle) return;

      const quantityChange = parseInt(movementData.quantity);

      // Validate quantity for exit and relocation
      if ((movementData.movementType === 'exit' || movementData.movementType === 'relocation') &&
          quantityChange > selectedArticle.currentStock) {
        alert(`Error: Cannot process ${quantityChange} units. Only ${selectedArticle.currentStock} units available in stock.`);
        return;
      }

      let newStock = selectedArticle.currentStock;

      switch (movementData.movementType) {
        case 'entry':
          newStock += quantityChange;
          break;
        case 'exit':
          newStock -= quantityChange;
          break;
        case 'relocation':
          // For relocation, stock doesn't change, just location
          break;
      }

      const updatedArticle = {
        ...selectedArticle,
        currentStock: Math.max(0, newStock),
        location: movementData.newLocation || selectedArticle.location
      };

      dispatch(updateArticle(updatedArticle));
    } else {
      // Kit relocation
      alert('Kit movement recorded (relocation only)');
    }

    alert('Movement recorded successfully!');
  };

  // Special View Modes
  if (viewMode === 'create-kit') {
    return (
      <CreateKitPage
        editingKit={editingKit}
        fromTemplate={selectedTemplateFromStore}
        onBack={handleBackToKits}
        onSave={handleKitSave}
      />
    );
  }

  if (viewMode === 'edit-template') {
    return (
      <EditTemplatePage
        editingTemplate={editingTemplate}
        onBack={handleBackToTemplates}
        onSave={handleTemplateSave}
      />
    );
  }

  // Main View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory articles and track stock levels
          </p>
        </div>

        {/* Record Movement Button */}
        <Dialog open={recordMovementOpen} onOpenChange={setRecordMovementOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Record Movement
            </Button>
          </DialogTrigger>
          <RecordMovementModal
            open={recordMovementOpen}
            onOpenChange={setRecordMovementOpen}
            articles={articles}
            kits={kits}
            onMovementRecorded={handleMovementRecorded}
          />
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs
        value={
          viewMode === 'templates' ? 'templates' :
          viewMode === 'kits' ? 'kits' :
          viewMode === 'bins' ? 'bins' :
          viewMode === 'transactions' ? 'transactions' :
          'items'
        }
        onValueChange={(value) => dispatch(setSelectedView(value as ViewMode))}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="bins">Bins</TabsTrigger>
          <TabsTrigger value="transactions">Transaction</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items">
          <ItemsTab
            articles={articles}
            categories={categories}
            onArticleUpdate={handleArticleUpdate}
            onArticleDelete={handleArticleDelete}
            getStockStatus={getStockStatus}
            getStatusBadge={getStatusBadge}
            getTypeIcon={getTypeIcon}
          />
        </TabsContent>

        {/* Kits Tab */}
        <TabsContent value="kits">
          <KitsTab
            articles={articles}
            categories={categories}
            onCreateKit={handleKitCreate}
            onCreateFromTemplate={() => dispatch(setSelectedView('templates'))}
            onEditKit={handleKitEdit}
            onDeleteKit={handleKitDelete}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <TemplateManager
            articles={articles}
            categories={categories}
            onCreateKitFromTemplate={handleCreateKitFromTemplate}
            onEditTemplate={handleEditTemplate}
            onCreateNewTemplate={handleCreateNewTemplate}
          />
        </TabsContent>

        {/* Bins Tab */}
        <TabsContent value="bins" className="space-y-4">
          <BinManager />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <InventoryMovements />
        </TabsContent>
      </Tabs>
    </div>
  );
}
