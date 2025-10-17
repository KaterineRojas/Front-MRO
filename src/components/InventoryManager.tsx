import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { InventoryMovements } from './InventoryMovements';
import { CreateKitPage } from './CreateKitPage';
import { TemplateManager } from './TemplateManager';
import { EditTemplatePage } from './EditTemplatePage';
import { BinManager } from './BinManager';
import { BinSelector } from './BinSelector';
import { Plus, Search, Edit, Trash2, Package, Upload, ArrowUpDown, TrendingUp, TrendingDown, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';

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
    name: 'Aa4 Office Paper',
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
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300',
    sku: 'SKU-004',
    name: 'Electric Drill',
    description: 'Electric Drill with Battery',
    category: 'tools',
    type: 'non-consumable',
    currentStock: 8,
    cost: 250,
    binCode: 'BIN-TOOL-004',
    unit: 'units',
    supplier: 'Tool Masters',
    minStock: 3,
    location: 'Workshop',
    status: 'good-condition',
    createdAt: '2025-01-12'
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
    sku: 'SKU-005',
    name: 'Safety Helmet',
    description: 'Safety Helmet with Chin Strap',
    category: 'safety-equipment',
    type: 'non-consumable',
    currentStock: 25,
    cost: 45,
    binCode: 'BIN-SAFE-005',
    unit: 'units',
    supplier: 'SafetyFirst Co.',
    minStock: 10,
    location: 'Safety Storage',
    status: 'good-condition',
    createdAt: '2025-01-11'
  },
  {
    id: 6,
    imageUrl: 'https://images.unsplash.com/photo-1584949091598-c31daaaa4aa9?w=300',
    sku: 'SKU-006',
    name: 'Wireless Mouse',
    description: 'Ergonomic Wireless Mouse',
    category: 'technology',
    type: 'consumable',
    currentStock: 0,
    cost: 25,
    binCode: 'BIN-TECH-006',
    unit: 'units',
    supplier: 'Tech Accessories Co.',
    minStock: 10,
    location: 'IT Storage',
    status: 'good-condition',
    createdAt: '2025-01-10'
  },
  {
    id: 7,
    imageUrl: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300',
    sku: 'SKU-007',
    name: 'Office Chair',
    description: 'Ergonomic Office Chair with Lumbar Support',
    category: 'furniture',
    type: 'non-consumable',
    currentStock: 0,
    cost: 350,
    binCode: 'BIN-FURN-001',
    unit: 'units',
    supplier: 'Furniture Solutions Ltd.',
    minStock: 2,
    location: 'Warehouse',
    status: 'good-condition',
    createdAt: '2025-01-09'
  },
  {
    id: 8,
    imageUrl: 'https://images.unsplash.com/photo-1611532736570-dea5c63f0dfc?w=300',
    sku: 'SKU-008',
    name: 'Hand Sanitizer',
    description: 'Antibacterial Hand Sanitizer 500ml',
    category: 'cleaning-supplies',
    type: 'consumable',
    currentStock: 0,
    cost: 5.50,
    binCode: 'BIN-CLEAN-001',
    unit: 'bottles',
    supplier: 'Hygiene Supplies Inc.',
    minStock: 50,
    location: 'Storage Room B',
    status: 'good-condition',
    createdAt: '2025-01-08'
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
  },
  {
    id: 3,
    binCode: 'KIT-TECH-001',
    name: 'Presentation Equipment Kit',
    description: 'Complete setup for presentations and meetings',
    category: 'technology',
    items: [
      { articleId: 4, articleBinCode: 'BIN-PROJ-004', articleName: 'Projector Epson', quantity: 1 },
      { articleId: 2, articleBinCode: 'BIN-TECH-002', articleName: 'Laptop Dell Latitude', quantity: 1 },
      { articleId: 3, articleBinCode: 'BIN-USB-003', articleName: 'USB Cable Type-C', quantity: 3 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'good-condition',
    createdAt: '2025-01-17'
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
    { group: 'Other Bins', bins: ['BIN-A-001', 'BIN-A-002', 'BIN-B-001', 'BIN-B-002', 'BIN-C-001', 'BIN-C-002'] }
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

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Items Inventory
                </CardTitle>
                <div className="flex space-x-2">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create new Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingArticle ? 'Edit Item' : 'Create new Item'}</DialogTitle>
                        <DialogDescription>
                          {editingArticle ? 'Update the item information below.' : 'Fill in the details to create a new item in your inventory.'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                              id="sku"
                              value={formData.sku}
                              onChange={(e) => setFormData({...formData, sku: e.target.value})}
                              placeholder="e.g., SKU-001"
                              required
                            />
                          </div>
                          <div>
                            <Label>BIN Code *</Label>
                            <BinSelector
                              value={formData.binCode}
                              onValueChange={(value) => setFormData({...formData, binCode: value})}
                              placeholder="Select bin"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="name">Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="e.g., Aa4 Office Paper"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Detailed description of the item..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as any})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="type">Type *</Label>
                            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as any})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="consumable">Consumable</SelectItem>
                                <SelectItem value="non-consumable">Non-Consumable</SelectItem>
                                <SelectItem value="pending-purchase">Pending Purchase</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="unit">Unit *</Label>
                            <Input
                              id="unit"
                              value={formData.unit}
                              onChange={(e) => setFormData({...formData, unit: e.target.value})}
                              placeholder="e.g., pieces, sheets, units"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cost">Unit Cost *</Label>
                            <Input
                              id="cost"
                              type="number"
                              step="0.01"
                              value={formData.cost}
                              onChange={(e) => setFormData({...formData, cost: e.target.value})}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="minStock">Min Stock *</Label>
                            <Input
                              id="minStock"
                              type="number"
                              value={formData.minStock}
                              onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                              placeholder="0"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="supplier">Supplier *</Label>
                            <Input
                              id="supplier"
                              value={formData.supplier}
                              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                              placeholder="e.g., Office Supplies Inc."
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Article Image</Label>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                            />

                            {formData.imageUrl && (
                              <div className="w-24 h-24 border rounded overflow-hidden">
                                <img
                                  src={formData.imageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stock in Different Bins - Collapsible Section */}
                        {editingArticle && (
                          <div className="border rounded-lg overflow-hidden">
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                              onClick={() => setShowBinStock(!showBinStock)}
                            >
                              <span className="flex items-center">
                                <Package className="h-4 w-4 mr-2" />
                                Stock in Different Bins
                              </span>
                              {showBinStock ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            {showBinStock && (
                              <div className="p-4 bg-muted/30 border-t">
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>BIN Code</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {/* Mock data showing the same SKU in different bins */}
                                      <TableRow>
                                        <TableCell className="font-mono">{editingArticle.binCode}</TableCell>
                                        <TableCell>{editingArticle.location}</TableCell>
                                        <TableCell>{editingArticle.currentStock} {editingArticle.unit}</TableCell>
                                        <TableCell>{getStatusBadge(editingArticle.status)}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-mono">BIN-STORAGE-001</TableCell>
                                        <TableCell>Main Storage</TableCell>
                                        <TableCell>500 {editingArticle.unit}</TableCell>
                                        <TableCell><Badge className="bg-green-600">Good Condition</Badge></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-mono">BIN-BACKUP-002</TableCell>
                                        <TableCell>Backup Storage</TableCell>
                                        <TableCell>250 {editingArticle.unit}</TableCell>
                                        <TableCell><Badge className="bg-green-600">Good Condition</Badge></TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Total stock for SKU {editingArticle.sku}: {editingArticle.currentStock + 500 + 250} {editingArticle.unit}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingArticle ? 'Update Item' : 'Create Item'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by BIN code, name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map((article) => {
                      const totalStock = article.currentStock + 500 + 250 + 75;
                      const stockStatus = getStockStatus(totalStock, article.minStock);
                      return (
                        <React.Fragment key={article.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpandItem(article.id)}
                            >
                              {expandedItems.has(article.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            {article.imageUrl ? (
                              <img 
                                src={article.imageUrl} 
                                alt={article.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{article.sku}</TableCell>
                          <TableCell>{article.name}</TableCell>
                          <TableCell className="max-w-xs truncate" title={article.description}>
                            {article.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {categories.find(cat => cat.value === article.category)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(article.type)}
                              <span className="text-sm capitalize">{article.type.replace('-', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span>{article.currentStock + 500 + 250 + 75} {article.unit}</span>
                                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Min: {article.minStock} {article.unit}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>${article.cost.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(article)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {article.currentStock === 0 && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{article.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteArticle(article.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Stock in Bins Section */}
                        {expandedItems.has(article.id) && (
                          <TableRow>
                            <TableCell colSpan={10} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <h4 className="flex items-center mb-3">
                                  <Package className="h-4 w-4 mr-2" />
                                  Stock Distribution for SKU: {article.sku}
                                </h4>
                                <div className="rounded-md border bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>BIN Code</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Type</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell className="font-mono">{article.binCode}</TableCell>
                                        <TableCell>{article.currentStock} {article.unit}</TableCell>
                                        <TableCell>{getStatusBadge(article.status)}</TableCell>
                                      </TableRow>
                                      {/* Mock additional bin locations */}
                                      <TableRow>
                                        <TableCell className="font-mono">BIN-STORAGE-001</TableCell>
                                        <TableCell>500 {article.unit}</TableCell>
                                        <TableCell><Badge className="bg-green-600">Good Condition</Badge></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-mono">BIN-BACKUP-002</TableCell>
                                        <TableCell>250 {article.unit}</TableCell>
                                        <TableCell><Badge className="bg-green-600">Good Condition</Badge></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-mono">BIN-C-001</TableCell>
                                        <TableCell>75 {article.unit}</TableCell>
                                        <TableCell><Badge className="bg-yellow-600">On Revision</Badge></TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Total stock for this SKU across all bins: {article.currentStock + 500 + 250 + 75} {article.unit}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Kits Inventory
                </CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setViewMode('templates')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Create Kit from Template
                  </Button>
                  <Button onClick={() => setViewMode('create-kit')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Kit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by BIN code, name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>BIN Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKits.map((kit) => {
                      return (
                        <React.Fragment key={kit.id}>
                          <TableRow>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleExpandKit(kit.id)}
                              >
                                {expandedKits.has(kit.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              {kit.imageUrl ? (
                                <img 
                                  src={kit.imageUrl} 
                                  alt={kit.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{kit.binCode}</TableCell>
                            <TableCell>{kit.name}</TableCell>
                            <TableCell className="max-w-xs truncate" title={kit.description}>
                              {kit.description}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {kit.items.length} items
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditKitDialog(kit)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Kit</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{kit.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteKit(kit.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded Items Section */}
                          {expandedKits.has(kit.id) && (
                            <TableRow>
                              <TableCell colSpan={7} className="bg-muted/30 p-0">
                                <div className="p-4">
                                  <h4 className="flex items-center mb-3">
                                    <Package className="h-4 w-4 mr-2" />
                                    Items in this kit
                                  </h4>
                                  <div className="rounded-md border bg-card">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-20">Image</TableHead>
                                          <TableHead>BIN Code</TableHead>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Quantity</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {kit.items.map((item, index) => {
                                          const article = articles.find(a => a.binCode === item.articleBinCode);
                                          return (
                                            <TableRow key={index}>
                                              <TableCell>
                                                <img 
                                                  src={article?.imageUrl || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=50'}
                                                  alt={item.articleName}
                                                  className="w-12 h-12 object-cover rounded"
                                                />
                                              </TableCell>
                                              <TableCell className="font-mono">{item.articleBinCode}</TableCell>
                                              <TableCell>{item.articleName}</TableCell>
                                              <TableCell>
                                                <Badge variant="outline">x{item.quantity}</Badge>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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