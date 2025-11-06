import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../ui/table';
import { Badge } from '../../../../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../../ui/alert-dialog';
import { Package, Search, Edit, Trash2, Plus, ChevronDown, ChevronRight, TrendingDown, RotateCcw } from 'lucide-react';
import { CreateItemModal, ApiPayload } from '../../modals/CreateItemModal';
import type { Article } from '../../types';
import { getCategories } from '../../services/inventoryApi';


type CreateArticleData = Pick<ApiPayload, 'name' | 'description' | 'category' | 'unit' | 'minStock' | 'consumable' | 'binCode' | 'imageFile'>;
type UpdateArticleData = Pick<ApiPayload, 'name' | 'description' | 'category' | 'unit' | 'minStock' | 'consumable' | 'imageUrl' | 'imageFile' | 'sku'>;


interface ItemsTabProps {
  articles: Article[];
  onCreateItem: (articleData: CreateArticleData) => void; 
  onUpdateItem: (id: number, articleData: UpdateArticleData) => void; 
  onDeleteItem: (id: number) => void;
}

export function ItemsTab({ articles, onCreateItem, onUpdateItem, onDeleteItem }: ItemsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'with-stock' | 'empty'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('❌ Error cargando categorías:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);


  // Función helper mejorada para formatear categorías
  const formatCategory = (category: string) => {
    if (!category) return 'Uncategorized';
    const found = categories.find(cat => {
      const normalizedCat = cat.value.toLowerCase().replace(/[-_]/g, '');
      const normalizedCategory = category.toLowerCase().replace(/[-_]/g, '');
      return normalizedCat === normalizedCategory;
    });

    if (found) {
      return found.label;
    }

    // Si no se encuentra, formatear manualmente
    return category
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2') 
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const hasAnyStock = (article: Article) => {
    return article.totalPhysical > 0 ||
      article.quantityAvailable > 0 ||
      article.quantityOnLoan > 0 ||
      article.quantityReserved > 0;
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.bins.some(bin => bin.binCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'with-stock' && hasAnyStock(article)) ||
      (stockFilter === 'empty' && !hasAnyStock(article));

    return matchesSearch && matchesCategory && matchesStock;
  });

  const articlesWithStock = articles.filter(hasAnyStock).length;
  const emptyArticles = articles.filter(a => !hasAnyStock(a)).length;

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (current <= min) return { label: 'Low Stock', variant: 'outline' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const getBinStatusBadge = (binPurpose: string) => {
    switch (binPurpose) {
      case 'GoodCondition':
        return <Badge className="bg-green-600">Good Condition</Badge>;
      case 'OnRevision':
        return <Badge className="bg-yellow-600">On Revision</Badge>;
      case 'Scrap':
        return <Badge variant="destructive">Scrap</Badge>;
      default:
        return <Badge variant="outline">{binPurpose}</Badge>;
    }
  };

  const getTypeIcon = (consumable: boolean) => {
    if (consumable) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <RotateCcw className="h-4 w-4 text-blue-600" />;
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

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setDialogOpen(true);
  };

  // 2. Función handleSubmit corregida para manejar ApiPayload
  const handleSubmit = (articleData: ApiPayload) => {
    if (editingArticle) {
      // MODO EDICIÓN: Creamos un objeto que solo contenga las propiedades que onUpdateItem espera
      const updateData: UpdateArticleData = {
        name: articleData.name,
        description: articleData.description,
        category: articleData.category,
        unit: articleData.unit,
        minStock: articleData.minStock,
        consumable: articleData.consumable,
        sku: articleData.sku!, // El modal debe garantizar que SKU existe en edición
        imageUrl: articleData.imageUrl,
        imageFile: articleData.imageFile,
      };

      onUpdateItem(editingArticle.id, updateData);

    } else {
      // MODO CREACIÓN: Creamos un objeto que solo contenga las propiedades que onCreateItem espera
      const createData: CreateArticleData = {
        name: articleData.name,
        description: articleData.description,
        category: articleData.category,
        unit: articleData.unit,
        minStock: articleData.minStock,
        consumable: articleData.consumable,
        binCode: articleData.binCode!, // El modal debe garantizar que binCode existe en creación
        imageFile: articleData.imageFile,
      };

      onCreateItem(createData);
    }
    setEditingArticle(null);
    setDialogOpen(false); // Cierra el modal después de la operación (aunque el modal también lo hace)
  };

  const renderArticlesTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Image</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredArticles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No items found
              </TableCell>
            </TableRow>
          ) : (
            filteredArticles.map((article) => {
              const totalStock = article.totalPhysical;
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
                      {article.imageUrl && !imageErrors.has(article.id) ? (
                        <img
                          src={article.imageUrl}
                          alt={article.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={() => {
                            console.error('Failed to load image:', article.imageUrl);
                            setImageErrors(prev => new Set(prev).add(article.id));
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{article.sku}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-col">
                        <span className="font-medium">{article.name}</span>
                        <span className="text-xs text-muted-foreground truncate" title={article.description}>
                          {article.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatCategory(article.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(article.consumable)}
                        <span className="text-sm capitalize">
                          {article.consumable ? 'Consumable' : 'Non-Consumable'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span>{totalStock} {article.unit}</span>
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min: {article.minStock} {article.unit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{article.quantityAvailable}</span>
                        <span className="text-xs text-muted-foreground">{article.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(article)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {totalStock === 0 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
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
                                <AlertDialogAction onClick={() => onDeleteItem(article.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

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
                                {article.bins.length > 0 ? (
                                  article.bins.map((bin) => (
                                    <TableRow key={bin.binId}>
                                      <TableCell className="font-mono">{bin.binCode}</TableCell>
                                      <TableCell>
                                        <div className="flex flex-col">
                                          <span>{bin.quantity} {article.unit}</span>
                                          {bin.binPurpose === 'GoodCondition' && (
                                            <div className="text-[11px] text-muted-foreground mt-1 space-y-[1px]">
                                              <div>Available: {article.quantityAvailable} {article.unit}</div>
                                              <div>On Loan: {article.quantityOnLoan} {article.unit}</div>
                                              <div>Reserved: {article.quantityReserved} {article.unit}</div>
                                            </div>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>{getBinStatusBadge(bin.binPurpose)}</TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                      No bins assigned to this item
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Total stock for this SKU across all bins: {article.totalPhysical} {article.unit}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Items Inventory
          </CardTitle>
          <div className="flex space-x-2">
            <Button onClick={() => {
              setEditingArticle(null);
              setDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Register new Item
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={categoriesLoading}>
              <SelectTrigger>
                <SelectValue placeholder={categoriesLoading ? "Loading..." : "All Categories"} />
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

        <Tabs value={stockFilter} onValueChange={(value: any) => setStockFilter(value as 'all' | 'with-stock' | 'empty')} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Items ({articles.length})
            </TabsTrigger>
            <TabsTrigger value="with-stock">
              With Stock ({articlesWithStock})
            </TabsTrigger>
            <TabsTrigger value="empty">
              Empty ({emptyArticles})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {renderArticlesTable()}
      </CardContent>

      <CreateItemModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingArticle={editingArticle}
        onSubmit={handleSubmit} 
        categories={categories}
        categoriesLoading={categoriesLoading}
      />
    </Card>
  );
}