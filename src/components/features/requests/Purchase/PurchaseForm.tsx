import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import { Badge } from '../../../ui/badge';
import { ArrowLeft, Plus, X, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { toast } from 'sonner';
import type { User } from '../../enginner/types';
import { getWarehouses, getProjects, type Warehouse, type Project } from '../../enginner/services';
import { getExistingItems, getDepartments, type ExistingItem, type Department } from './purchaseService';

interface PurchaseFormProps {
  currentUser: User;
  onBack: (() => void) | null;
}

interface PurchaseItem {
  name: string;
  isExisting: boolean;
  quantity: number;
  estimatedCost: number; 
  justification: string;
  link: string;
}
 
interface PurchaseFormData {
  items: PurchaseItem[];
  department: string;
  project: string;
  priority: string;
  selfPurchase: boolean; 
  warehouseId: string;
}

export function PurchaseForm({ currentUser, onBack }: PurchaseFormProps) {
  const [formData, setFormData] = useState<PurchaseFormData>({
    items: [{ name: '', isExisting: false, quantity: 1, estimatedCost: 0, justification: '', link: '' }],
    department: currentUser.department || '',
    project: '',
    priority: 'medium',
    selfPurchase: false,
    warehouseId: ''
  });

  const [itemSearches, setItemSearches] = useState<{ [key: number]: string }>({});
  const [filteredItems, setFilteredItems] = useState<{ [key: number]: ExistingItem[] }>({});
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>({});
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [existingItems, setExistingItems] = useState<ExistingItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Load warehouses, projects, existing items and departments
  useEffect(() => {
    const loadData = async () => {
      try {
        const [whData, projData, itemsData, deptsData] = await Promise.all([
          getWarehouses(),
          getProjects(),
          getExistingItems(),
          getDepartments()
        ]);
        
        setWarehouses(whData);
        setProjects(projData);
        setExistingItems(itemsData);
        setDepartments(deptsData);
        
        if (whData.length > 0 && !formData.warehouseId) {
          setFormData(prev => ({ ...prev, warehouseId: whData[0].id }));
        }
      } catch (error) {
        toast.error('Failed to load form data');
      }
    };
    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownOpen).forEach(key => {
        const index = parseInt(key);
        if (dropdownOpen[index] && dropdownRefs.current[index] && 
            !dropdownRefs.current[index]?.contains(event.target as Node)) {
          setDropdownOpen(prev => ({ ...prev, [index]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleItemSearch = (index: number, value: string) => {
    setItemSearches(prev => ({ ...prev, [index]: value }));
    if (value.length >= 2) {
      const filtered = existingItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(prev => ({ ...prev, [index]: filtered }));
    } else {
      setFilteredItems(prev => ({ ...prev, [index]: existingItems }));
    }
    setDropdownOpen(prev => ({ ...prev, [index]: true }));
  };

  const selectExistingItem = (index: number, item: ExistingItem) => {
    updateItem(index, 'name', item.name);
    setItemSearches(prev => ({ ...prev, [index]: item.name }));
    setDropdownOpen(prev => ({ ...prev, [index]: false }));
  };

  const toggleDropdown = (index: number) => {
    const currentItem = formData.items[index];
    if (currentItem.name && currentItem.isExisting) {
      setDropdownOpen(prev => ({ ...prev, [index]: !prev[index] }));
    } else {
      setDropdownOpen(prev => ({ ...prev, [index]: true }));
    }
  };

  const addNewItem = () => {
    const newIndex = formData.items.length;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', isExisting: false, quantity: 1, estimatedCost: 0, justification: '', link: '' }]
    }));
    setItemSearches(prev => ({ ...prev, [newIndex]: '' }));
    setFilteredItems(prev => ({ ...prev, [newIndex]: existingItems }));
    setDropdownOpen(prev => ({ ...prev, [newIndex]: false }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
      setItemSearches(prev => {
        const newSearches = { ...prev };
        delete newSearches[index];
        return newSearches;
      });
      setFilteredItems(prev => {
        const newFiltered = { ...prev };
        delete newFiltered[index];
        return newFiltered;
      });
    }
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getTotalCost = () => {
    return formData.items.reduce((sum, item) => sum + (item.estimatedCost * item.quantity), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project) {
      toast.error('Please select a project');
      return;
    }
    
    for (const item of formData.items) {
      if (item.link && !validateUrl(item.link)) {
        toast.error(`Invalid URL for item: ${item.name}`);
        return;
      }
    }

    toast.success('Purchase requests will be marked as "Pending review" and will be evaluated by the purchasing department. You will be notified of the status by email.');
    
    setTimeout(() => {
      toast.success('Purchase request submitted successfully');
      if (onBack) onBack();
    }, 2000);
  };

  const handleSelfPurchaseChange = (value: string) => {
    const isSelfPurchase = value === 'self';
    setFormData(prev => ({
      ...prev,
      selfPurchase: isSelfPurchase,
      priority: isSelfPurchase ? 'urgent' : prev.priority
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header estilo Kits: Botón a la izquierda, título a su lado */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Purchase Form</h1>
          <p className="text-sm text-muted-foreground">
            Request the acquisition of new items
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Items to Purchase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.items.map((item, index) => {
              const selectedExistingItem = item.isExisting ? existingItems.find(ei => ei.name === item.name) : null;
              
              return (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Item {index + 1}</h4>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeItem(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Item Type</Label>
                    <RadioGroup 
                      value={item.isExisting ? 'existing' : 'new'} 
                      onValueChange={(value: string) => {
                        const isExisting = value === 'existing';
                        updateItem(index, 'isExisting', isExisting);
                        updateItem(index, 'name', '');
                        setItemSearches(prev => ({ ...prev, [index]: '' }));
                        setDropdownOpen(prev => ({ ...prev, [index]: false }));
                      }}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="existing" id={`existing-${index}`} />
                        <Label htmlFor={`existing-${index}`}>Existing Item</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id={`new-${index}`} />
                        <Label htmlFor={`new-${index}`}>New Item</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {selectedExistingItem && (
                    <div className="md:col-span-2 flex justify-center">
                      <ImageWithFallback
                        src={selectedExistingItem.image}
                        alt={selectedExistingItem.name}
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Label>Item Name</Label>
                    {item.isExisting ? (
                      <div className="space-y-2 relative" ref={(el) => { if (el) dropdownRefs.current[index] = el; }}>
                        <Input
                          placeholder={item.name ? "Click to change selection..." : "Type to search existing items..."}
                          value={itemSearches[index] || ''}
                          onChange={(e) => handleItemSearch(index, e.target.value)}
                          onClick={() => toggleDropdown(index)}
                          readOnly={!!item.name}
                          className={item.name ? "cursor-pointer" : ""}
                        />
                        {dropdownOpen[index] && (
                          <div className="absolute z-10 w-full border rounded-md bg-background shadow-lg max-h-40 overflow-y-auto">
                            {(filteredItems[index] || existingItems).length === 0 ? (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                No items found matching "{itemSearches[index]}"
                              </div>
                            ) : (
                              (filteredItems[index] || existingItems).map((existingItem) => (
                                <button
                                  key={existingItem.id}
                                  type="button"
                                  className={`w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center gap-2 ${
                                    item.name === existingItem.name ? 'bg-accent' : ''
                                  }`}
                                  onClick={() => selectExistingItem(index, existingItem)}
                                >
                                  <ImageWithFallback
                                    src={existingItem.image}
                                    alt={existingItem.name}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                  <span>{existingItem.name}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        placeholder="Enter new item name..."
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        required
                      />
                    )}
                  </div>

                  {/* Quantity: Permitir borrar y escribir directamente */}
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          updateItem(index, 'quantity', 0);
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 1) {
                            updateItem(index, 'quantity', numValue);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '' || item.quantity === 0) {
                          updateItem(index, 'quantity', 1);
                        }
                      }}
                      placeholder="Enter quantity"
                      required
                    />
                  </div>

                  <div>
                    <Label>Estimated Cost (per unit)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.estimatedCost === 0 ? '' : item.estimatedCost}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          updateItem(index, 'estimatedCost', 0);
                        } else {
                          updateItem(index, 'estimatedCost', parseFloat(value) || 0);
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <Label>Total Cost</Label>
                    <Input
                      value={`$${(item.estimatedCost * item.quantity).toFixed(2)}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div>
                    <Label>Reference Link (optional)</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/product"
                      value={item.link}
                      onChange={(e) => updateItem(index, 'link', e.target.value)}
                    />
                    {item.link && !validateUrl(item.link) && (
                      <p className="text-sm text-red-600 mt-1">
                        Invalid URL format
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label>Justification</Label>
                    <Textarea
                      placeholder="Explain why you need this item..."
                      value={item.justification}
                      onChange={(e) => updateItem(index, 'justification', e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            );
            })}
            
            <Button type="button" variant="outline" onClick={addNewItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Item
            </Button>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Estimated Total Cost:</span>
                <span className="text-xl font-bold">${getTotalCost().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(value: string) => setFormData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <div className="flex items-center gap-2">
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'urgent') => setFormData(prev => ({ ...prev, priority: value }))}
                    disabled={formData.selfPurchase}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className={getPriorityColor(formData.priority)}>
                    {getPriorityLabel(formData.priority)}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="project">Project *</Label>
              <Select 
                value={formData.project} 
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, project: value }))}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Purchase Responsibility</Label>
              <RadioGroup 
                value={formData.selfPurchase ? 'self' : 'keeper'} 
                onValueChange={handleSelfPurchaseChange}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="keeper" id="keeper" />
                  <Label htmlFor="keeper">Keeper will make this purchase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="self" id="self" />
                  <Label htmlFor="self">I will make this purchase</Label>
                </div>
              </RadioGroup>
              
              {formData.selfPurchase && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    By selecting this option, priority is automatically changed to "Urgent" and cannot be edited.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label>Warehouse</Label>
              <Select value={formData.warehouseId} onValueChange={(value: string) => setFormData(prev => ({ ...prev, warehouseId: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Submit Purchase Request
          </Button>
        </div>
      </form>
    </div>
  );
}