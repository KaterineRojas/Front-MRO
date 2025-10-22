import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../ui/alert-dialog';
import { Package, Search, Edit, Trash2, Plus, ChevronDown, ChevronRight, TrendingDown, RotateCcw, TrendingUp } from 'lucide-react';
import { CreateItemModal } from '../modals/CreateItemModal';
import type { Article } from '../types';
import { CATEGORIES } from '../constants';

interface ItemsTabProps {
  articles: Article[];
  onCreateItem: (articleData: {
    name: string;
    description: string;
    category: string;
    unit: string;
    minStock: number;
    consumable: boolean;
    binCode: string;
    imageFile?: File | null;
  }) => void;
  onUpdateItem: (id: number, articleData: {
    name: string;
    description: string;
    category: string;
    unit: string;
    minStock: number;
    consumable: boolean;
    imageUrl?: string | null;
    sku: string;
  }) => void;
  onDeleteItem: (id: number) => void;
}

export function ItemsTab({ articles, onCreateItem, onUpdateItem, onDeleteItem }: ItemsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         // ✅ CAMBIO 1: Buscar en todos los bins
                         article.bins.some(bin => bin.binCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (current <= min) return { label: 'Low Stock', variant: 'outline' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  // ✅ CAMBIO 2: Nueva función para mapear el status del bin
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
    // ✅ CAMBIO 3: Simplificado para usar boolean consumable
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

  const handleSubmit = (articleData: Omit<Article, 'id' | 'createdAt' | 'bins' | 'quantityAvailable' | 'quantityOnLoan' | 'quantityReserved' | 'totalPhysical'>) => {
    if (editingArticle) {
      onUpdateItem(editingArticle.id, articleData);
    } else {
      onCreateItem(articleData);
    }
    setEditingArticle(null);
  };

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
              Create new Item
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
                {CATEGORIES.map((cat) => (
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
                <TableHead>Available</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => {
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
                          {CATEGORIES.find(cat => cat.value === article.category)?.label}
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
                            {/* Mostrar totalPhysical real */}
                            <span>{totalStock} {article.unit}</span>
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: {article.minStock} {article.unit}
                          </div>
                          {/* Mostrar info adicional del API */}
                          {article.quantityOnLoan > 0 && (
                            <div className="text-xs text-blue-500">
                              On Loan: {article.quantityOnLoan}
                            </div>
                          )}
                          {article.quantityReserved > 0 && (
                            <div className="text-xs text-orange-500">
                              Reserved: {article.quantityReserved}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {/*  Mostrar quantityAvailable en vez de cost */}
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
                          {/* Permitir borrar solo si totalPhysical es 0 */}
                          {totalStock === 0 && (
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

                    {/* Sección de bins expandida - COMPLETAMENTE REFACTORIZADA */}
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
                                        <TableCell>{bin.quantity} {article.unit}</TableCell>
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
                              <div className="flex gap-4 text-xs">
                                <span>Available: {article.quantityAvailable}</span>
                                <span>On Loan: {article.quantityOnLoan}</span>
                                <span>Reserved: {article.quantityReserved}</span>
                              </div>
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

      <CreateItemModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingArticle={editingArticle}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}