import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import { Textarea } from '../../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { InventoryMovements } from './tab/InventoryMovements';
import { CreateKitPage } from '../../CreateKitPage';
import { TemplateManager } from './tab/TemplateManager';
import { EditTemplatePage } from '../../EditTemplatePage';
import { BinManager } from './tab/BinManager';
import { BinSelector } from '../../BinSelector';
import { Plus, Search, Edit, Trash2, Package, Upload, ArrowUpDown, TrendingUp, TrendingDown, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { AddItemModal } from './modals/AddItemModal';
import { ItemsTab } from './tab/ItemsTab';
import { KitsTab } from './tab/KitsTab';

interface Article {
  id: number;
  imageUrl?: string;
  sku: string;
  name: string;
  description: string;
  category: 'office-supplies' | 'technology' | 'tools' | 'clothing' | 'electronics' | 'furniture' | 'vehicles' | 'safety-equipment' | 'medical-supplies' | 'cleaning-supplies' | 'construction-materials' | 'laboratory-equipment';
  type: 'consumable' | 'non-consumable' | 'pending-purchase';
  currentStock: number;
  cost: number;
  binCode: string;
  unit: string;
  supplier: string;
  minStock: number;
  location: string;
  status: 'good-condition' | 'on-revision' | 'scrap' | 'repaired';
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
  category: 'office-supplies' | 'technology' | 'tools' | 'clothing' | 'electronics' | 'furniture' | 'vehicles' | 'safety-equipment' | 'medical-supplies' | 'cleaning-supplies' | 'construction-materials' | 'laboratory-equipment';
  items: KitItem[];
  imageUrl?: string;
  status: 'good-condition' | 'on-revision' | 'scrap' | 'repaired';
  createdAt: string;
}

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

const mockKits: Kit[] = [
  {
    id: 1,
    binCode: 'KIT-OFFICE-001',
    name: 'Basic Office Starter Kit',
    description: 'Complete office setup kit for new employees',
    category: 'office-supplies',
    items: [
      { articleId: 1, articleBinCode: 'BIN-OFF-001', articleName: 'Office Paper A4', quantity: 5 },
      { articleId: 2, articleBinCode: 'BIN-TECH-002', articleName: 'Laptop Dell Latitude', quantity: 1 },
      { articleId: 3, articleBinCode: 'BIN-USB-003', articleName: 'USB Cable Type-C', quantity: 2 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'good-condition',
    createdAt: '2025-01-15'
  },
  {
    id: 2,
    binCode: 'KIT-SAFETY-001',
    name: 'Personal Safety Kit',
    description: 'Complete personal protective equipment kit',
    category: 'safety-equipment',
    items: [
      { articleId: 5, articleBinCode: 'BIN-SAFE-005', articleName: 'Safety Helmet', quantity: 1 },
      { articleId: 4, articleBinCode: 'BIN-PROJ-004', articleName: 'Projector Epson', quantity: 1 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'good-condition',
    createdAt: '2025-01-16'
  }
];

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  createdAt: string;
}

export function InventoryManager() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [kits, setKits] = useState<Kit[]>(mockKits);
  const [viewMode, setViewMode] = useState<'items' | 'kits' | 'create-kit' | 'templates' | 'edit-template' | 'bins' | 'transactions'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [kitDialogOpen, setKitDialogOpen] = useState(false);
  const [recordMovementOpen, setRecordMovementOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'office-supplies' as Article['category'],
    type: 'consumable' as Article['type'],
    cost: '',
    binCode: '',
    unit: '',
    supplier: '',
    minStock: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [kitFormData, setKitFormData] = useState({
    binCode: '',
    name: '',
    description: '',
    category: 'office-supplies' as Kit['category'],
    items: [] as KitItem[]
  });
  const [movementData, setMovementData] = useState({
    itemType: 'item' as 'item' | 'kit',
    movementType: 'entry' as 'entry' | 'exit' | 'relocation',
    articleSKU: '',
    articleBinCode: '',
    kitBinCode: '',
    quantity: '',
    unitPrice: '',
    status: 'good-condition' as Article['status'],
    newLocation: '',
    notes: ''
  });
  const [priceOption, setPriceOption] = useState(''); // Separate state for price selector
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  const [kitSearchTermMovement, setKitSearchTermMovement] = useState('');
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [expandedKits, setExpandedKits] = useState<Set<number>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showBinStock, setShowBinStock] = useState(false);

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

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      category: 'office-supplies',
      type: 'consumable',
      cost: '',
      binCode: '',
      unit: '',
      supplier: '',
      minStock: '',
      imageUrl: ''
    });
    setImageFile(null);
    setEditingArticle(null);
    setShowBinStock(false);
  };

  const resetKitForm = () => {
    setKitFormData({
      binCode: '',
      name: '',
      description: '',
      category: 'office-supplies',
      items: []
    });
    setEditingKit(null);
  };

  const resetMovementForm = () => {
    setMovementData({
      itemType: 'item',
      movementType: 'entry',
      articleSKU: '',
      articleBinCode: '',
      kitBinCode: '',
      quantity: '',
      unitPrice: '',
      status: 'good-condition',
      newLocation: '',
      notes: ''
    });
    setPriceOption('');
    setArticleSearchTerm('');
    setKitSearchTermMovement('');
    setLocationSearchTerm('');
  };

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      sku: article.sku,
      name: article.name,
      description: article.description,
      category: article.category,
      type: article.type,
      cost: article.cost.toString(),
      binCode: article.binCode,
      unit: article.unit,
      supplier: article.supplier,
      minStock: article.minStock.toString(),
      imageUrl: article.imageUrl || ''
    });
    setDialogOpen(true);
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imageUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newArticle: Article = {
      id: editingArticle ? editingArticle.id : Date.now(),
      imageUrl: formData.imageUrl,
      sku: formData.sku,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      currentStock: editingArticle ? editingArticle.currentStock : 0,
      cost: parseFloat(formData.cost),
      binCode: formData.binCode,
      unit: formData.unit,
      supplier: formData.supplier,
      minStock: parseInt(formData.minStock),
      location: editingArticle ? editingArticle.location : 'Warehouse', // Default location for new items
      status: 'good-condition', // Default status for new items
      createdAt: editingArticle ? editingArticle.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingArticle) {
      setArticles(articles.map(article => 
        article.id === editingArticle.id ? newArticle : article
      ));
    } else {
      setArticles([...articles, newArticle]);
    }

    setDialogOpen(false);
    resetForm();
  };

  const openEditKitDialog = (kit: Kit) => {
    setEditingKit(kit);
    setViewMode('create-kit');
  };
//**********************************kit */
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
//****************************************************************** */
  // Article handlers
  const handleArticleUpdate = (updatedArticles: Article[]) => {
    setArticles(updatedArticles);
  };
 const handleArticleDelete = (id: number) => {
    setArticles(articles.filter(article => article.id !== id));
  };


  const handleKitSave = (kitData: Omit<Kit, 'id' | 'createdAt'>) => {
    const newKit: Kit = {
      id: editingKit ? editingKit.id : Date.now(),
      ...kitData,
      imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      createdAt: editingKit ? editingKit.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingKit) {
      setKits(kits.map(kit => 
        kit.id === editingKit.id ? newKit : kit
      ));
    } else {
      setKits([...kits, newKit]);
    }

    setViewMode('kits');
    setEditingKit(null);
    setSelectedTemplate(null);
    alert(editingKit ? 'Kit updated successfully!' : 'Kit created successfully!');
  };

  const handleCreateKitFromTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setViewMode('create-kit');
  };

  const handleBackToKits = () => {
    setViewMode('kits');
    setEditingKit(null);
    setSelectedTemplate(null);
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
    // This would typically save to the backend
    console.log('Saving template:', templateData);
    setViewMode('templates');
    setEditingTemplate(null);
    alert(editingTemplate ? 'Template updated successfully!' : 'Template created successfully!');
  };

  const handleCreateNewTemplate = () => {
    setEditingTemplate(null);
    setViewMode('edit-template');
  };

  const addKitItem = () => {
    setKitFormData(prev => ({
      ...prev,
      items: [...prev.items, { articleId: 0, articleBinCode: '', articleName: '', quantity: 1 }]
    }));
  };

  const updateKitItem = (index: number, field: keyof KitItem, value: string | number) => {
    const updatedItems = [...kitFormData.items];
    if (field === 'articleBinCode') {
      const article = articles.find(a => a.binCode === value);
      if (article) {
        updatedItems[index] = {
          ...updatedItems[index],
          articleId: article.id,
          articleBinCode: article.binCode,
          articleName: article.name
        };
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    setKitFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeKitItem = (index: number) => {
    setKitFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleToggleExpandKit = (kitId: number) => {
    setExpandedKits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(kitId)) {
        newSet.delete(kitId);
      } else {
        newSet.add(kitId);
      }
      return newSet;
    });
  };

  const handleToggleExpandItem = (itemId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    setRecordMovementOpen(false);
    resetMovementForm();
    alert('Movement recorded successfully!');
  };

  const deleteArticle = (id: number) => {
    setArticles(articles.filter(article => article.id !== id));
  };

  const deleteKit = (id: number) => {
    setKits(kits.filter(kit => kit.id !== id));
  };

  // For entry mode, find article by SKU, for exit/relocation find by bin code
  const selectedArticle = movementData.movementType === 'entry' 
    ? articles.find(article => article.sku === movementData.articleSKU)
    : articles.find(article => article.binCode === movementData.articleBinCode);
  
  const selectedKitForMovement = kits.find(kit => kit.binCode === movementData.kitBinCode);
  
  const filteredArticlesForMovement = articles.filter(article => 
    article.sku.toLowerCase().includes(articleSearchTerm.toLowerCase()) ||
    article.binCode.toLowerCase().includes(articleSearchTerm.toLowerCase()) ||
    article.name.toLowerCase().includes(articleSearchTerm.toLowerCase())
  );
  
  const filteredKitsForMovement = kits.filter(kit =>
    kit.binCode.toLowerCase().includes(kitSearchTermMovement.toLowerCase()) ||
    kit.name.toLowerCase().includes(kitSearchTermMovement.toLowerCase())
  );
  
  // Mock bin locations
  const binLocations = [
    { group: 'Current Item Bin', bins: selectedArticle ? [selectedArticle.binCode] : [] },
    { group: 'Other Bins', bins: ['BIN-A-010', 'BIN-A-002', 'BIN-B-001', 'BIN-B-002', 'BIN-C-001', 'BIN-C-002'] }
  ];

  // Filter bin locations based on search term
  const filteredBinLocations = binLocations.map(group => ({
    ...group,
    bins: group.bins.filter(bin => 
      bin.toLowerCase().includes(locationSearchTerm.toLowerCase())
    )
  })).filter(group => group.bins.length > 0);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.binCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredKits = kits.filter(kit => {
    const matchesSearch = kit.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || kit.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  // Handle special views
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
        <Dialog open={recordMovementOpen} onOpenChange={setRecordMovementOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Record Movement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Inventory Movement</DialogTitle>
              <DialogDescription>
                Record stock movements for items or kits in your inventory
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRecordMovement} className="space-y-5">
              {/* Item Type Selection */}
              <div>
                <Label>Select Type *</Label>
                <Select 
                  value={movementData.itemType} 
                  onValueChange={(value: 'item' | 'kit') => {
                    setMovementData({
                      ...movementData, 
                      itemType: value,
                      movementType: value === 'kit' ? 'relocation' : movementData.movementType,
                      articleSKU: '',
                      articleBinCode: '',
                      kitBinCode: ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="item">Item</SelectItem>
                    <SelectItem value="kit">Kit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Movement Type */}
              <div>
                <Label>Movement Type *</Label>
                <Select 
                  value={movementData.movementType} 
                  onValueChange={(value: 'entry' | 'exit' | 'relocation') => setMovementData({...movementData, movementType: value, articleSKU: '', articleBinCode: ''})}
                  disabled={movementData.itemType === 'kit'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Stock Entry</SelectItem>
                    <SelectItem value="exit">Stock Exit</SelectItem>
                    <SelectItem value="relocation">Relocation</SelectItem>
                  </SelectContent>
                </Select>
                {movementData.itemType === 'kit' && (
                  <p className="text-xs text-muted-foreground mt-1">Kits can only be relocated</p>
                )}
              </div>

              {/* Article or Kit Selection */}
              {movementData.itemType === 'item' ? (
                <>
                  {/* For Stock Entry, show SKU selector */}
                  {movementData.movementType === 'entry' ? (
                    <div>
                      <Label>Select Article *</Label>
                      <Select 
                        value={movementData.articleSKU} 
                        onValueChange={(value) => {
                          setMovementData({...movementData, articleSKU: value});
                          setArticleSearchTerm('');
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Search and select an article" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 sticky top-0 bg-background z-10">
                            <Input
                              placeholder="Search by SKU or name..."
                              value={articleSearchTerm}
                              onChange={(e) => setArticleSearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="mb-2"
                            />
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {filteredArticlesForMovement.length > 0 ? (
                              filteredArticlesForMovement.map((article) => (
                                <SelectItem key={article.id} value={article.sku}>
                                  <div className="flex items-center space-x-3 py-1">
                                    <img 
                                      src={article.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50'}
                                      alt={article.name}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                    <div>
                                      <p className="font-medium">{article.sku}</p>
                                      <p className="text-sm text-muted-foreground">{article.name}</p>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                No articles found
                              </div>
                            )}
                          </div>
                        </SelectContent>
                      </Select>

                      {selectedArticle && (
                        <div className="mt-3 p-4 bg-muted rounded-lg border">
                          <div className="flex items-center space-x-3 mb-3">
                            <img 
                              src={selectedArticle.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100'}
                              alt={selectedArticle.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{selectedArticle.name}</p>
                              <p className="text-sm text-muted-foreground">{selectedArticle.description}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Current Stock:</span>
                              <span className="ml-2 font-medium">{selectedArticle.currentStock} {selectedArticle.unit}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2 font-medium">{selectedArticle.location}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* For Stock Exit or Relocation, show SKU selector first, then BIN selector */
                    <>
                      <div>
                        <Label>Select Article *</Label>
                        <Select 
                          value={movementData.articleSKU} 
                          onValueChange={(value) => {
                            setMovementData({...movementData, articleSKU: value, articleBinCode: ''});
                            setArticleSearchTerm('');
                          }}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Search and select an article" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2 sticky top-0 bg-background z-10">
                              <Input
                                placeholder="Search by SKU or name..."
                                value={articleSearchTerm}
                                onChange={(e) => setArticleSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="mb-2"
                              />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                              {filteredArticlesForMovement.length > 0 ? (
                                filteredArticlesForMovement.map((article) => (
                                  <SelectItem key={article.id} value={article.sku}>
                                    <div className="flex items-center space-x-3 py-1">
                                      <img 
                                        src={article.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50'}
                                        alt={article.name}
                                        className="w-10 h-10 object-cover rounded"
                                      />
                                      <div>
                                        <p className="font-medium">{article.sku}</p>
                                        <p className="text-sm text-muted-foreground">{article.name}</p>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                  No articles found
                                </div>
                              )}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* BIN Selector - only show if article is selected */}
                      {movementData.articleSKU && (
                        <div>
                          <Label>Select BIN Code *</Label>
                          <Select 
                            value={movementData.articleBinCode} 
                            onValueChange={(value) => {
                              setMovementData({...movementData, articleBinCode: value});
                            }}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select which BIN to use" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Mock bins for the selected SKU */}
                              {articles.filter(a => a.sku === movementData.articleSKU).map((article) => (
                                <SelectItem key={article.id} value={article.binCode}>
                                  <div className="flex items-center justify-between space-x-4 py-1">
                                    <span className="font-mono">{article.binCode}</span>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-muted-foreground">{article.currentStock} {article.unit}</span>
                                      <Badge className="bg-green-600">Good Condition</Badge>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                              {/* Mock additional bins for the same SKU */}
                              <SelectItem value="BIN-STORAGE-001">
                                <div className="flex items-center justify-between space-x-4 py-1">
                                  <span className="font-mono">BIN-STORAGE-001</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">500 units</span>
                                    <Badge className="bg-green-600">Good Condition</Badge>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="BIN-BACKUP-002">
                                <div className="flex items-center justify-between space-x-4 py-1">
                                  <span className="font-mono">BIN-BACKUP-002</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">250 units</span>
                                    <Badge className="bg-green-600">Good Condition</Badge>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="BIN-C-001">
                                <div className="flex items-center justify-between space-x-4 py-1">
                                  <span className="font-mono">BIN-C-001</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">75 units</span>
                                    <Badge className="bg-yellow-600">On Revision</Badge>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {selectedArticle && (
                        <div className="mt-3 p-4 bg-muted rounded-lg border">
                          <div className="flex items-center space-x-3 mb-3">
                            <img 
                              src={selectedArticle.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100'}
                              alt={selectedArticle.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{selectedArticle.name}</p>
                              <p className="text-sm text-muted-foreground">{selectedArticle.description}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Current Stock:</span>
                              <span className="ml-2 font-medium">{selectedArticle.currentStock} {selectedArticle.unit}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2 font-medium">{selectedArticle.location}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div>
                  <Label>Select Kit *</Label>
                  <Select 
                    value={movementData.kitBinCode} 
                    onValueChange={(value) => {
                      setMovementData({...movementData, kitBinCode: value});
                      setKitSearchTermMovement('');
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Search and select a kit" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 sticky top-0 bg-background z-10">
                        <Input
                          placeholder="Search by BIN code or name..."
                          value={kitSearchTermMovement}
                          onChange={(e) => setKitSearchTermMovement(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="mb-2"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {filteredKitsForMovement.length > 0 ? (
                          filteredKitsForMovement.map((kit) => (
                            <SelectItem key={kit.id} value={kit.binCode}>
                              <div className="flex flex-col py-1">
                                <p className="font-medium">{kit.binCode}</p>
                                <p className="text-sm text-muted-foreground">{kit.name}</p>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No kits found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>

                  {selectedKitForMovement && (
                    <div className="mt-3 p-4 bg-muted rounded-lg border">
                      <p className="font-medium mb-3">{selectedKitForMovement.name}</p>
                      <Label className="text-sm mb-2 block">Items in this Kit ({selectedKitForMovement.items.length})</Label>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {selectedKitForMovement.items.map((item, index) => {
                          // Find the article to get the image
                          const article = articles.find(a => a.binCode === item.articleBinCode);
                          return (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-card rounded border">
                              <img 
                                src={article?.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50'}
                                alt={item.articleName}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.articleName}</p>
                                <p className="text-xs text-muted-foreground">{item.articleBinCode}</p>
                              </div>
                              <Badge variant="outline">x{item.quantity}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity - Only for Items, not for Kits */}
              {movementData.itemType === 'item' && (
                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedArticle && (movementData.movementType === 'exit' || movementData.movementType === 'relocation') ? selectedArticle.currentStock : undefined}
                    value={movementData.quantity}
                    onChange={(e) => setMovementData({...movementData, quantity: e.target.value})}
                    placeholder="Enter quantity"
                    required
                  />
                  {selectedArticle && (movementData.movementType === 'exit' || movementData.movementType === 'relocation') && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: {selectedArticle.currentStock} {selectedArticle.unit}
                    </p>
                  )}
                </div>
              )}

              {/* Unit Price - Only for Stock Entry */}
              {movementData.itemType === 'item' && movementData.movementType === 'entry' && selectedArticle && (
                <div>
                  <Label>Unit Price *</Label>
                  <Select 
                    value={priceOption} 
                    onValueChange={(value) => {
                      setPriceOption(value);
                      if (value === 'custom') {
                        setMovementData({...movementData, unitPrice: ''});
                      } else {
                        // Extract the actual price from the value
                        const price = value.split('-')[2];
                        setMovementData({...movementData, unitPrice: price});
                      }
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select or enter unit price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={`price-current-${selectedArticle.cost}`}>
                        ${selectedArticle.cost.toFixed(2)} (Current Price)
                      </SelectItem>
                      <SelectItem value={`price-discount10-${(selectedArticle.cost * 0.9).toFixed(4)}`}>
                        ${(selectedArticle.cost * 0.9).toFixed(2)} (10% Discount)
                      </SelectItem>
                      <SelectItem value={`price-discount15-${(selectedArticle.cost * 0.85).toFixed(4)}`}>
                        ${(selectedArticle.cost * 0.85).toFixed(2)} (15% Discount)
                      </SelectItem>
                      <SelectItem value={`price-increase10-${(selectedArticle.cost * 1.1).toFixed(4)}`}>
                        ${(selectedArticle.cost * 1.1).toFixed(2)} (10% Increase)
                      </SelectItem>
                      <SelectItem value="custom">Custom Price</SelectItem>
                    </SelectContent>
                  </Select>
                  {priceOption === 'custom' && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={movementData.unitPrice}
                      onChange={(e) => setMovementData({...movementData, unitPrice: e.target.value})}
                      placeholder="Enter custom unit price"
                      className="mt-2"
                      required
                    />
                  )}
                  {movementData.unitPrice && movementData.quantity && !isNaN(parseFloat(movementData.unitPrice)) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Total: ${(parseFloat(movementData.unitPrice) * parseInt(movementData.quantity)).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* New Location (for entry and relocation) */}
              {(movementData.movementType === 'entry' || movementData.movementType === 'relocation') && (
                <div>
                  <Label>New Location *</Label>
                  <BinSelector
                    value={movementData.newLocation}
                    onValueChange={(value) => setMovementData({...movementData, newLocation: value})}
                    placeholder="Select new location"
                    currentBin={selectedArticle?.binCode}
                    required
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={movementData.notes}
                  onChange={(e) => setMovementData({...movementData, notes: e.target.value})}
                  placeholder="Additional notes about this movement..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setRecordMovementOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Movement</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={viewMode === 'templates' ? 'templates' : viewMode === 'kits' ? 'kits' : viewMode === 'bins' ? 'bins' : viewMode === 'transactions' ? 'transactions' : 'items'} onValueChange={(value) => setViewMode(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="items">Items</TabsTrigger>
          
          <TabsTrigger value="kits">Kits</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="bins">Bins</TabsTrigger>
         
          <TabsTrigger value="transactions">Transaction</TabsTrigger>
          
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

        <TabsContent value="templates" className="space-y-4">
          <TemplateManager 
            articles={articles}
            onCreateKitFromTemplate={handleCreateKitFromTemplate}
            onEditTemplate={handleEditTemplate}
            onCreateNewTemplate={handleCreateNewTemplate}
          />
        </TabsContent>

        <TabsContent value="bins" className="space-y-4">
          <BinManager />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <InventoryMovements />
        </TabsContent>
      </Tabs>
    </div>
  );
}