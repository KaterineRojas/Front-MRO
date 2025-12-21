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
  status: 'good-condition' | 'on-revision' | 'scrap' | 'repaired';
  createdAt: string;
}

interface KitItem {
  articleId: number;
  articleBinCode: string;
  articleName: string;
  quantity: number;
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  createdAt: string;
}

interface EditTemplatePageProps {
  articles: Article[];
  editingTemplate?: Template | null;
  onBack: () => void;
  onSave: (templateData: Omit<Template, 'id' | 'createdAt'>) => void;
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

export function EditTemplatePage({ articles, editingTemplate, onBack, onSave }: EditTemplatePageProps) {
  const [formData, setFormData] = useState({
    name: editingTemplate?.name || '',
    description: editingTemplate?.description || '',
    category: editingTemplate?.category || 'office-supplies',
    items: editingTemplate?.items || []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.binCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addItemToTemplate = (article: Article) => {
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
      removeItemFromTemplate(articleId);
      return;
    }
    
    const updatedItems = formData.items.map(item =>
      item.articleId === articleId ? { ...item, quantity } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItemFromTemplate = (articleId: number) => {
    const updatedItems = formData.items.filter(item => item.articleId !== articleId);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      // Note: Use a toast or modal instead of alert() in production apps
      console.error('Please add at least one item to the template');
      return;
    }
    onSave(formData);
  };

  const pageTitle = editingTemplate ? 'Edit Template' : 'Create New Template';

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-background pb-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {editingTemplate 
                ? 'Update the template information and items below'
                : 'Create a reusable template for kits'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Basic Office Setup"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Template description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                {/* CORRECTION: Explicitly type 'value' as string */}
                <Select 
                  value={formData.category} 
                  onValueChange={(value: string) => setFormData({...formData, category: value})}
                >
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

              <div className="pt-4">
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Items Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-indigo-600" />
              Available Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="space-y-4 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU, name, description or BIN code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              {/* This Select is fine because setCategoryFilter is typed via useState<string> */}
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
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => {
                  const isInTemplate = formData.items.some(item => item.articleId === article.id);
                  return (
                    <div key={article.id} className="flex items-center space-x-3 p-3 border dark:border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                        {article.imageUrl ? (
                          <img
                            src={article.imageUrl}
                            alt={article.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/48x48/F3F4F6/9CA3AF?text=NoImg' }}
                          />
                        ) : (
                          <Package className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{article.sku}</p>
                        <p className="text-xs text-muted-foreground truncate">{article.name}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {isInTemplate ? (
                          <Badge className="bg-green-500 hover:bg-green-600 cursor-default">
                            Added
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            onClick={() => addItemToTemplate(article)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No articles found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Items */}
      {formData.items.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Template Items ({formData.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.items.map((item) => {
                const article = articles.find(a => a.id === item.articleId);
                return (
                  <div key={item.articleId} className="flex items-center space-x-3 p-4 border dark:border-border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-white flex-shrink-0 flex items-center justify-center border">
                      {article?.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={item.articleName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/48x48/F3F4F6/9CA3AF?text=NoImg' }}
                        />
                      ) : (
                        <Package className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{article?.sku || 'SKU N/A'}</p>
                      <p className="text-sm text-gray-600">{item.articleName}</p>
                      <p className="text-xs text-muted-foreground truncate">{article?.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`quantity-${item.articleId}`} className="text-sm">Qty:</Label>
                      <Input
                        id={`quantity-${item.articleId}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.articleId, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => removeItemFromTemplate(item.articleId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
