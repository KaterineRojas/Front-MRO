import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Button } from '../../ui/button';
import { Package, Layers, FileText, Archive, ArrowUpDown } from 'lucide-react';
import { ItemsTab } from './tab/ItemsTab';
import { KitsTab } from './tab/KitsTab';
import { TemplatesTab } from './tabs/TemplatesTab';
import { BinsTab } from './tabs/BinsTab';
import { TransactionsTab } from './tabs/TransactionsTab';
import { CreateKitPage } from '../../CreateKitPage';
import { EditTemplatePage } from '../../EditTemplatePage';
import { RecordMovementModal } from './modals/RecordMovementModal';
import { Badge } from '../../ui/badge';
import { TrendingDown, RotateCcw, TrendingUp, Package } from 'lucide-react';

/**
 * InventoryManagerModular - Versión modularizada del gestor de inventario
 * 
 * Arquitectura:
 * - 5 tabs modulares independientes en /components/features/inventory/tabs/
 * - Gestión de estado centralizada en este componente padre
 * - Navegación entre vistas (tabs, create-kit, edit-template)
 * - Props bien definidas para comunicación con tabs
 * 
 * Tabs:
 * 1. ItemsTab: Gestión completa de items con CRUD
 * 2. KitsTab: Gestión de kits con creación desde template
 * 3. TemplatesTab: Gestión de templates de kits
 * 4. BinsTab: Gestión de bins (wrapper de BinManager)
 * 5. TransactionsTab: Historial de movimientos (wrapper de InventoryMovements)
 */

// Interfaces
interface Article {
  id: number;
  imageUrl?: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  type: 'consumable' | 'non-consumable' | 'pending-purchase';
  currentStock: number;
  cost: number;
  binCode: string;
  unit: string;
  supplier: string;
  minStock: number;
  location: string;
  status: string;
  createdAt: string;
}

interface KitItem {
  articleId: number;
  articleBinCode: string;
  articleName: string;
  quantity: number;
}

interface Kit {
  id: number;
  binCode: string;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  imageUrl?: string;
  status: string;
  createdAt: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  createdAt: string;
}

// Mock Data
const mockArticles: Article[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300',
    sku: 'SKU-001',
    name: 'A4 Office Paper',
    description: 'Office Paper A4 - 80gsm',
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
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
    sku: 'SKU-002',
    name: 'Dell Latitude Laptop',
    description: 'Laptop Dell Latitude 5520',
    category: 'technology',
    type: 'non-consumable',
    currentStock: 15,
    cost: 1200,
    binCode: 'BIN-TECH-002',
    unit: 'units',
    supplier: 'Tech Solutions Ltd.',
    minStock: 5,
    location: 'IT Storage',
    status: 'good-condition',
    createdAt: '2025-01-14'
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

const mockKits: Kit[] = [
  {
    id: 1,
    binCode: 'KIT-OFFICE-001',
    name: 'Basic Office Starter Kit',
    description: 'Complete office setup kit for new employees',
    category: 'office-supplies',
    items: [
      { articleId: 1, articleBinCode: 'BIN-OFF-001', articleName: 'Office Paper A4', quantity: 5 },
      { articleId: 2, articleBinCode: 'BIN-TECH-002', articleName: 'Laptop Dell Latitude', quantity: 1 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?w=300',
    status: 'good-condition',
    createdAt: '2025-01-15'
  }
];

export function InventoryManagerModular() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [kits, setKits] = useState<Kit[]>(mockKits);
  const [activeTab, setActiveTab] = useState('items');
  const [viewMode, setViewMode] = useState<'main' | 'create-kit' | 'edit-template'>('main');
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [selectedTemplateForKit, setSelectedTemplateForKit] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [recordMovementOpen, setRecordMovementOpen] = useState(false);

  const categories = [
    { value: 'office-supplies', label: 'Office Supplies' },
    { value: 'technology', label: 'Technology' },
    { value: 'tools', label: 'Tools' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'safety-equipment', label: 'Safety Equipment' },
    { value: 'medical-supplies', label: 'Medical Supplies' },
    { value: 'cleaning-supplies', label: 'Cleaning Supplies' },
    { value: 'construction-materials', label: 'Construction Materials' },
    { value: 'laboratory-equipment', label: 'Laboratory Equipment' }
  ];

  // Article handlers
  const handleArticleUpdate = (updatedArticles: Article[]) => {
    setArticles(updatedArticles);
  };

  const handleArticleDelete = (id: number) => {
    setArticles(articles.filter(article => article.id !== id));
  };

  // Kit handlers
  const handleKitCreate = () => {
    setEditingKit(null);
    setSelectedTemplateForKit(null);
    setViewMode('create-kit');
  };

  const handleKitEdit = (kit: Kit) => {
    setEditingKit(kit);
    setViewMode('create-kit');
  };

  const handleKitDelete = (id: number) => {
    setKits(kits.filter(kit => kit.id !== id));
  };

  const handleKitSave = (kitData: Omit<Kit, 'id' | 'createdAt'>) => {
    const newKit: Kit = {
      id: editingKit ? editingKit.id : Date.now(),
      ...kitData,
      imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?w=300',
      createdAt: editingKit ? editingKit.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingKit) {
      setKits(kits.map(kit => kit.id === editingKit.id ? newKit : kit));
    } else {
      setKits([...kits, newKit]);
    }

    setViewMode('main');
    setEditingKit(null);
    setSelectedTemplateForKit(null);
    alert(editingKit ? 'Kit updated successfully!' : 'Kit created successfully!');
  };

  const handleKitCreateFromTemplate = (template: Template) => {
    setSelectedTemplateForKit(template);
    setEditingKit(null);
    setViewMode('create-kit');
  };

  // Template handlers
  const handleTemplateEdit = (template: Template) => {
    setEditingTemplate(template);
    setViewMode('edit-template');
  };

  const handleTemplateCreate = () => {
    setEditingTemplate(null);
    setViewMode('edit-template');
  };

  const handleTemplateSave = (templateData: Omit<Template, 'id' | 'createdAt'>) => {
    console.log('Saving template:', templateData);
    setViewMode('main');
    setEditingTemplate(null);
    alert(editingTemplate ? 'Template updated successfully!' : 'Template created successfully!');
  };

  const handleBackToMain = () => {
    setViewMode('main');
    setEditingKit(null);
    setSelectedTemplateForKit(null);
    setEditingTemplate(null);
  };

  // Handle Record Movement
  const handleMovementRecorded = (movementData: any) => {
    if (movementData.itemType === 'item') {
      let selectedArticle;
      
      if (movementData.movementType === 'entry') {
        // For entry, find by SKU
        selectedArticle = articles.find(article => article.sku === movementData.articleSKU);
      } else {
        // For exit/relocation, find by bin code
        selectedArticle = articles.find(article => article.binCode === movementData.articleBinCode);
      }
      
      if (!selectedArticle) return;

      const quantityChange = parseInt(movementData.quantity);
      
      // Validate quantity for exit and relocation
      if ((movementData.movementType === 'exit' || movementData.movementType === 'relocation') && quantityChange > selectedArticle.currentStock) {
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

      setArticles(articles.map(article =>
        (movementData.movementType === 'entry' ? article.sku === movementData.articleSKU : article.binCode === movementData.articleBinCode)
          ? { 
              ...article, 
              currentStock: Math.max(0, newStock),
              location: movementData.newLocation || article.location
            }
          : article
      ));
    } else {
      // Kit relocation - just update location for now
      alert('Kit movement recorded (relocation only)');
    }

    alert('Movement recorded successfully!');
  };

  // Helper functions
  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (current <= min) return { label: 'Low Stock', variant: 'outline' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'good-condition':
      return <Badge className="bg-green-600">Good Condition</Badge>;
    case 'on-revision':
      return <Badge className="bg-yellow-600">On Revision</Badge>;
    case 'scrap':
      return <Badge variant="destructive">Scrap</Badge>;
    case 'repaired':
      return <Badge className="bg-blue-600">Repaired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'consumable':
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    case 'non-consumable':
      return <RotateCcw className="h-4 w-4 text-blue-600" />;
    case 'pending-purchase':
      return <TrendingUp className="h-4 w-4 text-orange-600" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

  // Render special views
  if (viewMode === 'create-kit') {
    return (
      <CreateKitPage
        articles={articles}
        editingKit={editingKit}
        fromTemplate={selectedTemplateForKit}
        onBack={handleBackToMain}
        onSave={handleKitSave}
      />
    );
  }

  if (viewMode === 'edit-template') {
    return (
      <EditTemplatePage
        articles={articles}
        editingTemplate={editingTemplate}
        onBack={handleBackToMain}
        onSave={handleTemplateSave}
      />
    );
  }

  // Main view with tabs
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory items, kits, templates, bins and transactions
          </p>
        </div>
        <Button variant="default" onClick={() => setRecordMovementOpen(true)}>
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Record Movement
        </Button>
      </div>

      {/* Record Movement Modal */}
      <RecordMovementModal
        open={recordMovementOpen}
        onOpenChange={setRecordMovementOpen}
        articles={articles}
        kits={kits}
        onMovementRecorded={handleMovementRecorded}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="items" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Items</span>
          </TabsTrigger>
          <TabsTrigger value="kits" className="flex items-center space-x-2">
            <Layers className="h-4 w-4" />
            <span>Kits</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="bins" className="flex items-center space-x-2">
            <Archive className="h-4 w-4" />
            <span>Bins</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4" />
            <span>Transaction</span>
          </TabsTrigger>
        </TabsList>

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

        <TabsContent value="kits">
          <KitsTab
            kits={kits}
            articles={articles}
            categories={categories}
            onCreateKit={handleKitCreate}
            onCreateFromTemplate={() => setActiveTab('templates')}
            onEditKit={handleKitEdit}
            onDeleteKit={handleKitDelete}
          />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab
            onCreateKitFromTemplate={handleKitCreateFromTemplate}
            onEditTemplate={handleTemplateEdit}
            onCreateNewTemplate={handleTemplateCreate}
          />
        </TabsContent>

        <TabsContent value="bins">
          <BinsTab articles={articles} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
