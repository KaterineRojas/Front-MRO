import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './features/ui/card';
import { Button } from './features/ui/button';
import { Input } from './features/ui/input';
import { Label } from './features/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './features/ui/select';
import { Textarea } from './features/ui/textarea';
import { Badge } from './features/ui/badge';
import { Alert, AlertDescription } from './features/ui/alert';
import { ArrowLeft, Search, Plus, X, Package, Loader2, AlertCircle } from 'lucide-react';
import type { Article, Kit, KitItem, Template } from './features/inventory/types/inventory';
import { getItems } from '@/services/inventarioService';
import { createKit, type CreateKitRequest } from '@/services/kitsService';

interface CreateKitPageProps {
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

export function CreateKitPage({ editingKit, fromTemplate, onBack, onSave }: CreateKitPageProps) {
  // State for loading items from API
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    binCode: editingKit?.binCode || (fromTemplate ? '' : ''),
    name: editingKit?.name || (fromTemplate ? fromTemplate.name : ''),
    description: editingKit?.description || (fromTemplate ? fromTemplate.description : ''),
    items: editingKit?.items || (fromTemplate ? fromTemplate.items : []),
    status: editingKit?.status || 'good-condition' as const
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  const filteredArticles = articles.filter(article => {
    const matchesSearch = (article.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (article.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (article.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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
        articleSku: article.sku,
        articleName: article.name,
        imageUrl: article.imageUrl,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please add at least one item to the kit');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // If editing an existing kit, use the old onSave callback
      if (editingKit) {
        onSave({ ...formData, category: 'office-supplies' });
        return;
      }

      // For new kits, use the API
      const kitRequest: CreateKitRequest = {
        binCode: formData.binCode,
        name: formData.name,
        description: formData.description,
        items: formData.items.map(item => ({
          itemId: item.articleId,
          quantity: item.quantity
        }))
      };

      const createdKit = await createKit(kitRequest);
      alert('Kit created successfully!');
      onBack();
    } catch (err) {
      console.error('Error creating kit:', err);
      setError(err instanceof Error ? err.message : 'Failed to create kit');
    } finally {
      setSubmitting(false);
    }
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
          {/* Available Items + Selected Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      placeholder="Search by SKU, name or description..."
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
                          <p className="text-sm font-medium truncate">{article.sku}</p>
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

            {/* Selected Items */}
            <Card>
              <CardHeader>
                <CardTitle>Kit Items ({formData.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No items added yet. Select items from the left to add them to your kit.
                    </p>
                  ) : (
                    formData.items.map((item) => (
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
                          <p className="text-sm font-medium">{item.articleSku}</p>
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
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingKit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>{editingKit ? 'Update Kit' : 'Create Kit'}</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}