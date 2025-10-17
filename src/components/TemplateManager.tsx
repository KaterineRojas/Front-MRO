import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { createTemplate, updateTemplate, deleteTemplate } from '../store/slices/inventorySlice';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Textarea } from './ui/textarea';
import { Plus, Search, Edit, Trash2, Package, Copy, ChevronDown, ChevronRight } from 'lucide-react';

interface Article {
  id: number;
  binCode: string;
  name: string;
  description: string;
  category: string;
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
  articleDescription: string;
  quantity: number;
  imageUrl?: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  items: KitItem[];
  createdAt: string;
}

interface TemplateManagerProps {
  articles: Article[];
  onCreateKitFromTemplate: (template: Template) => void;
  onEditTemplate: (template: Template) => void;
  onCreateNewTemplate: () => void;
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

export function TemplateManager({ articles, onCreateKitFromTemplate, onEditTemplate, onCreateNewTemplate }: TemplateManagerProps) {
  const dispatch = useAppDispatch();
  const templates = useAppSelector((state) => state.inventory.templates);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedTemplates, setExpandedTemplates] = useState<Set<number>>(new Set());

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    // This function is no longer needed as we use the parent's edit functionality
  };



  const handleDeleteTemplate = (id: number) => {
    dispatch(deleteTemplate(id));
  };

  const handleEdit = (template: Template) => {
    onEditTemplate(template);
  };



  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const handleToggleExpand = (templateId: number) => {
    setExpandedTemplates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Kit Templates
            </CardTitle>
            <Button onClick={onCreateNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates by name or description..."
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
                  <TableHead>Template Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <React.Fragment key={template.id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleExpand(template.id)}
                        >
                          {expandedTemplates.has(template.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{template.description}</TableCell>
                      <TableCell>{template.items.length} items</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCreateKitFromTemplate(template)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Use
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedTemplates.has(template.id) && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/30 p-0">
                          <div className="p-4">
                            <h4 className="flex items-center mb-3">
                              <Package className="h-4 w-4 mr-2" />
                              Items in this template
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
                                  {template.items.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {item.imageUrl ? (
                                          <img 
                                            src={item.imageUrl}
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
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}