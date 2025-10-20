import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Plus, Search, Edit, Trash2, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import { Article } from '../types/inventory'; // tu interfaz
import { getItems } from '../../../../services/inventarioService'; // nueva función API
import { AddItemModal } from '../modals/AddItemModal';


export function ItemsManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // 🛰️ Cargar artículos desde backend
  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const data = await getItems(); // <-- llamada al backend
        setArticles(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los artículos.');
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  // 🔍 Filtros
  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      article.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.binCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 🧮 Helpers
  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { label: 'Sin stock', variant: 'destructive' as const };
    if (current <= min) return { label: 'Bajo stock', variant: 'outline' as const };
    return { label: 'En stock', variant: 'default' as const };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good-condition':
        return <Badge className="bg-green-600">En buen estado</Badge>;
      case 'on-revision':
        return <Badge className="bg-yellow-600">En revisión</Badge>;
      case 'scrap':
        return <Badge variant="destructive">Desecho</Badge>;
      case 'repaired':
        return <Badge className="bg-blue-600">Reparado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleToggleExpandItem = (itemId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  // 🧭 UI Render
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground">
        Cargando artículos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-10">{error}</div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Inventario de Artículos
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear nuevo
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Buscador y Filtros */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por SKU, nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="office-supplies">Office Supplies</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                {/* etc... */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredArticles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    No hay artículos disponibles.
                  </TableCell>
                </TableRow>
              )}

              {filteredArticles.map(article => {
                const stockStatus = getStockStatus(article.currentStock, article.minStock);
                return (
                  <React.Fragment key={article.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleExpandItem(article.id)}
                        >
                          {expandedItems.has(article.id)
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />}
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
                      <TableCell className="max-w-xs truncate">{article.description}</TableCell>
                      <TableCell><Badge variant="outline">{article.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{article.currentStock} {article.unit}</span>
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>${article.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar artículo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Seguro que deseas eliminar "{article.name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expandido */}
                    {expandedItems.has(article.id) && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/30 p-0">
                          <div className="p-4">
                            <h4 className="flex items-center mb-3">
                              <Package className="h-4 w-4 mr-2" />
                              Detalle de stock
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Ubicación: {article.location} | Estado: {getStatusBadge(article.status)}
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
  );
}
