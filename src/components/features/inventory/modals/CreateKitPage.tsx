import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { Badge } from '../../../ui/badge';
import { ArrowLeft, Search, Plus, X, Package } from 'lucide-react';

interface Article {
  id: number;
  binCode: string;
  name: string;
  description: string;
  category: 'office-supplies' | 'technology' | 'tools' | 'clothing' | 'electronics' | 'furniture' | 'vehicles' | 'safety-equipment' | 'medical-supplies' | 'cleaning-supplies' | 'construction-materials' | 'laboratory-equipment';
  type: 'consumable' | 'non-consumable' | 'pending-purchase';
  unit: string;
  cost: number;
  supplier: string;
  currentStock: number;
  minStock: number;
  location: string;
  imageUrl?: string;
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

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  createdAt: string;
}

interface CreateKitPageProps {
  articles: Article[];
  editingKit?: Kit | null;
  fromTemplate?: Template | null;
  onBack: () => void;
  onSave: (kitData: Omit<Kit, 'id' | 'createdAt'>) => void;
}

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
  { value: 'laboratory-equipment', label: 'Laboratory Equipment' },
];

export function CreateKitPage({ articles, editingKit, fromTemplate, onBack, onSave }: CreateKitPageProps) {
  const [formData, setFormData] = useState({
    binCode: editingKit?.binCode || (fromTemplate ? '' : ''),
    name: editingKit?.name || (fromTemplate ? fromTemplate.name : ''),
    description: editingKit?.description || (fromTemplate ? fromTemplate.description : ''),
    category: editingKit?.category || (fromTemplate ? fromTemplate.category as any : 'office-supplies'),
    items: editingKit?.items || (fromTemplate ? fromTemplate.items : []),
    status: editingKit?.status || 'good-condition' as const,
    quantity: 1
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addItemToKit = (article: Article) => {
    const existingItemIndex = formData.items.findIndex(item => item.articleId === article.id);
    
    if (existingItemIndex >= 0) {
      // If item already exists, increase quantity
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      setFormData({ ...formData, items: updatedItems });
    } else {
      // Add new item
      const newItem: KitItem = {
        articleId: article.id,
        articleBinCode: article.binCode,
        articleName: article.name,
        quantity: 1
      };
      setFormData({ ...formData, items: [...formData.items, newItem] });
    }
  };

  const updateItemQuantity = (articleId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromKit(articleId);
      return;
    }
    
    const updatedItems = formData.items.map(item =>
      item.articleId === articleId ? { ...item, quantity } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItemFromKit = (articleId: number) => {
    const updatedItems = formData.items.filter(item => item.articleId !== articleId);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please add at least one item to the kit');
      return;
    }
    onSave(formData);
  };

  const pageTitle = editingKit 
    ? 'Edit Kit' 
    : fromTemplate 
      ? `Create Kit from Template: ${fromTemplate.name}` 
      : 'Create New Kit';

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-background pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Kits
          </Button>
          <div>
            <h1>{pageTitle}</h1>
            <p className="text-muted-foreground">
              {editingKit 
                ? 'Update the kit information and items below'
                : fromTemplate
                  ? 'Customize the template and create your kit'
                  : 'Create a new kit by grouping multiple items together'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kit Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Kit Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="binCode">BIN Code *</Label>
                <Input
                  id="binCode"
                  value={formData.binCode}
                  onChange={(e) => setFormData({...formData, binCode: e.target.value})}
                  placeholder="e.g., KIT-OFF-001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Office Starter Kit"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed description of the kit..."
                  rows={3}
                />
              </div>

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
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  placeholder="1"
                  required
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  {editingKit ? 'Update Kit' : 'Create Kit'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Items Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Available Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="space-y-4 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by BIN code, name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
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

            {/* Items List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredArticles.map((article) => {
                const isInKit = formData.items.some(item => item.articleId === article.id);
                return (
                  <div key={article.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{article.binCode}</p>
                      <p className="text-sm text-muted-foreground truncate">{article.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{article.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {isInKit ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Added
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addItemToKit(article)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Items */}
      {formData.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kit Items ({formData.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.items.map((item) => (
                <div key={item.articleId} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.articleName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.articleBinCode}</p>
                    <p className="text-sm text-muted-foreground">{item.articleName}</p>
                    <p className="text-xs text-muted-foreground">
                      {articles.find(a => a.id === item.articleId)?.description || ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`quantity-${item.articleId}`} className="text-sm">Qty:</Label>
                    <Input
                      id={`quantity-${item.articleId}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(item.articleId, parseInt(e.target.value) || 1)}
                      className="w-16"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItemFromKit(item.articleId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}