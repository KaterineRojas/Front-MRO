import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../ui/alert-dialog';
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, Package } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { deleteKit } from '@/store/inventorySlice';

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

interface Article {
  id: number;
  binCode: string;
  imageUrl?: string;
}

interface KitsTabProps {
  kits: Kit[];
  articles?: Article[];
  categories: { value: string; label: string }[];
  onCreateKit: () => void;
  onCreateFromTemplate: () => void;
  onEditKit: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
}

export function KitsTab({
  kits,
  articles = [],
  categories,
  onCreateKit,
  onCreateFromTemplate,
  onEditKit,
  onDeleteKit
}: KitsTabProps) {
  // Redux
  const dispatch = useAppDispatch();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedKits, setExpandedKits] = useState<Set<number>>(new Set());

  const handleDeleteKit = (id: number) => {
    dispatch(deleteKit(id));
    onDeleteKit(id);
  };

  const filteredKits = kits.filter(kit => {
    const matchesSearch = kit.binCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || kit.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Kits</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCreateFromTemplate}>
              <Package className="h-4 w-4 mr-2" />
              From Template
            </Button>
            <Button onClick={onCreateKit}>
              <Plus className="h-4 w-4 mr-2" />
              Create Kit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by BIN code, name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
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

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Kit</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKits.map((kit) => {
                const isExpanded = expandedKits.has(kit.id);
                return (
                  <React.Fragment key={kit.id}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleExpandKit(kit.id)}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {kit.imageUrl && (
                            <img
                              src={kit.imageUrl}
                              alt={kit.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{kit.name}</p>
                            <p className="text-sm text-muted-foreground">{kit.binCode}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {categories.find(c => c.value === kit.category)?.label}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{kit.items.length} items</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">
                          {kit.status === 'good-condition' ? 'Good Condition' : kit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditKit(kit)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
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
                                <AlertDialogAction onClick={() => handleDeleteKit(kit.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30 p-0">
                          <div className="p-4">
                            {kit.description && (
                              <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-1">Description</p>
                                <p>{kit.description}</p>
                              </div>
                            )}
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
                                          {article?.imageUrl ? (
                                            <img 
                                              src={article.imageUrl}
                                              alt={item.articleName}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                          ) : (
                                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                              <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                          )}
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
                            <div className="flex gap-4 text-sm mt-3">
                              <div>
                                <span className="text-muted-foreground">Created:</span>
                                <span className="ml-2">{kit.createdAt}</span>
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
    </Card>
  );
}
