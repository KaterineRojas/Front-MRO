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
import { getItems, getCategories, type Category } from '@/services/inventarioService';
import { createKit, getKitCategories, type CreateKitRequest, type KitCategory } from '@/services/kitsService';

interface CreateKitPageProps {
  editingKit?: Kit | null;
  fromTemplate?: Template | null;
  usingAsTemplate?: boolean;
  onBack: () => void;
  onSave: (kitData: Omit<Kit, 'id' | 'createdAt'>) => void;
}

export function CreateKitPage({ editingKit, fromTemplate, usingAsTemplate = false, onBack, onSave }: CreateKitPageProps) {
  // State for loading items from API
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [kitCategories, setKitCategories] = useState<KitCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: number | undefined;
    items: KitItem[];
    status: 'good-condition' | 'needs-repair' | 'damaged';
  }>({
    name: editingKit?.name || (fromTemplate ? fromTemplate.name : ''),
    description: editingKit?.description || (fromTemplate ? fromTemplate.description : ''),
    category: undefined,
    items: editingKit?.items || (fromTemplate ? fromTemplate.items : []),
    status: editingKit?.status || 'good-condition' as const
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Load items and categories from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [items, cats, kitCats] = await Promise.all([
          getItems(),
          getCategories(),
          getKitCategories()
        ]);
        console.log('Kit categories received:', kitCats);
        setArticles(items);
        setCategories(cats);
        setKitCategories(kitCats);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Normalize category for comparison (matches API format transformation)
  const normalizeCategory = (cat: string | undefined) =>
    cat ? cat.toLowerCase().replace(/\s+/g, '-') : '';

  const filteredArticles = articles.filter(article => {
    const matchesSearch = (article.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (article.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (article.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' ||
      normalizeCategory(article.category as string) === categoryFilter;
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

    if (!editingKit && formData.category === undefined) {
      alert('Please select a category for the kit');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // If editing an existing kit (not using as template), use the old onSave callback
      if (editingKit && !usingAsTemplate) {
        onSave({ ...formData, binCode: editingKit.binCode || '', category: 'office-supplies' });
        return;
      }

      // For new kits, use the API
      const kitRequest: CreateKitRequest = {
        name: formData.name,
        description: formData.description,
        category: formData.category!, // Non-null assertion safe due to validation above
        items: formData.items.map(item => ({
          itemId: item.articleId,
          quantity: item.quantity
        }))
      };

      const createdKit = await createKit(kitRequest);
      alert('Kit registered successfully!');
      onBack();
    } catch (err) {
      console.error('Error creating kit:', err);
      setError(err instanceof Error ? err.message : 'Failed to register kit');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine if we're using a kit as template or editing existing
  const isEditingExisting = editingKit && !usingAsTemplate;

  const pageTitle = isEditingExisting
    ? 'Edit Kit'
    : fromTemplate
      ? `Register Kit from Template: ${fromTemplate.name}`
      : usingAsTemplate && editingKit
        ? `New kit based on "${editingKit.name}"`
        : 'Register New Kit';

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
              {isEditingExisting
                ? 'Update the kit information and items below'
                : fromTemplate
                  ? 'Customize the template and create your kit'
                  : usingAsTemplate && editingKit
                    ? `Creating a new kit using "${editingKit.name}" as a template. All items have been preloaded - customize as needed.`
                    : 'Create a new kit by grouping multiple items together. BIN assignment will be done when building the kit.'
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
                  <Select
                    value={formData.category !== undefined ? formData.category.toString() : undefined}
                    onValueChange={(value) => setFormData({...formData, category: parseInt(value)})}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {kitCategories
                        .filter(cat => cat && cat.id !== undefined)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditingExisting ? 'Updating...' : usingAsTemplate ? 'Creating new kit...' : 'Registering...'}
                      </>
                    ) : (
                      <>{isEditingExisting ? 'Update Kit' : usingAsTemplate ? 'Create New Kit' : 'Register Kit'}</>
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