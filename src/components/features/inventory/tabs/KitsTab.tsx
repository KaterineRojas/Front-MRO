import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../ui/alert-dialog';
import { Package, Search, Edit, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import type { Article, Kit } from '../types';
import { CATEGORIES } from '../constants';

interface KitsTabProps {
  kits: Kit[];
  articles: Article[];
  onCreateKit: () => void;
  onEditKit: (kit: Kit) => void;
  onDeleteKit: (id: number) => void;
  onViewTemplates: () => void;
}

export function KitsTab({ kits, articles, onCreateKit, onEditKit, onDeleteKit, onViewTemplates }: KitsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedKits, setExpandedKits] = useState<Set<number>>(new Set());

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
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Kits Inventory
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={onViewTemplates}
            >
              <Package className="h-4 w-4 mr-2" />
              Create Kit from Template
            </Button>
            <Button onClick={onCreateKit}>
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
                            onClick={() => onEditKit(kit)}
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
                                <AlertDialogAction onClick={() => onDeleteKit(kit.id)}>
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
  );
}
