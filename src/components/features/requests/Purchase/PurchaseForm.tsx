import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Switch } from '../../../ui/switch';
import { ArrowLeft, Plus, X, AlertTriangle, Calendar, ClipboardList, Building, User, FolderOpen, Hash, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { toast } from 'sonner';
import type { User as UserType } from '../../enginner/types';
import { getWarehouses, getProjects, type Warehouse, type Project } from '../../enginner/services';
import { getExistingItems, type ExistingItem, type PurchaseRequest } from './purchaseService';

interface PurchaseFormProps {
  currentUser: UserType;
  onBack: (() => void) | null;
  initialRequest?: PurchaseRequest | null;
}

interface PurchaseItem {
  name: string;
  isExisting: boolean;
  quantity: number;
  estimatedCost: number;
  link: string;
}

interface PurchaseFormData {
  items: PurchaseItem[];
  department: string;
  project: string;
  selfPurchase: boolean; 
  warehouseId: string;
  purchaseReason: string;
  expectedDeliveryDate: string;
  clientBilled: 'yes' | 'no';
  company: string;
  customer: string;
  projectReference: string;
  workOrder: string;
  justification: string;
}

const createDefaultPurchaseItem = (): PurchaseItem => ({
  name: '',
  isExisting: true,
  quantity: 1,
  estimatedCost: 0,
  link: ''
});

const buildInitialFormData = (
  user: UserType,
  request?: PurchaseRequest | null
): PurchaseFormData => ({
  items: request
    ? request.items.map((item) => ({
        name: item.name,
        isExisting: true,
        quantity: item.quantity,
        estimatedCost: item.estimatedCost ?? 0,
        link: item.productUrl ?? ''
      }))
    : [createDefaultPurchaseItem()],
  department: request?.department || user.departmentId || user.department || '',
  project: request?.project || '',
  selfPurchase: request?.selfPurchase ?? false,
  warehouseId: request?.warehouseId || '',
  purchaseReason: request?.reason || '',
  expectedDeliveryDate: '',
  clientBilled: 'no',
  company: '',
  customer: '',
  projectReference: '',
  workOrder: '',
  justification: request?.notes || ''
});

const buildInitialItemSearches = (request?: PurchaseRequest | null) => {
  const searches: { [key: number]: string } = {};
  if (!request) return searches;
  request.items.forEach((item, index) => {
    searches[index] = item.name;
  });
  return searches;
};

export function PurchaseForm({ currentUser, onBack, initialRequest }: PurchaseFormProps) {
  const [formData, setFormData] = useState<PurchaseFormData>(() => buildInitialFormData(currentUser, initialRequest));

  const [itemSearches, setItemSearches] = useState<{ [key: number]: string }>(() => buildInitialItemSearches(initialRequest));
  const [filteredItems, setFilteredItems] = useState<{ [key: number]: ExistingItem[] }>({});
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>({});
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const previousPurchaseReasonRef = useRef<string>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [existingItems, setExistingItems] = useState<ExistingItem[]>([]);
  const isEditing = Boolean(initialRequest);
  // Load warehouses, projects, existing items and departments
  useEffect(() => {
    const loadData = async () => {
      try {
        const [whData, projData, itemsData] = await Promise.all([
          getWarehouses(),
          getProjects(),
          getExistingItems()
        ]);
        
        setWarehouses(whData);
        setProjects(projData);
        setExistingItems(itemsData);
        
        if (whData.length > 0 && !formData.warehouseId) {
          setFormData(prev => ({ ...prev, warehouseId: whData[0].id }));
        }
      } catch (error) {
        toast.error('Failed to load form data');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setFormData(buildInitialFormData(currentUser, initialRequest));
    setItemSearches(buildInitialItemSearches(initialRequest));
    previousPurchaseReasonRef.current = initialRequest && initialRequest.reason !== 'urgent'
      ? initialRequest.reason
      : '';
    setDropdownOpen({});
  }, [initialRequest, currentUser]);

  useEffect(() => {
    if (!initialRequest) {
      setFilteredItems({});
      return;
    }

    const mapped: { [key: number]: ExistingItem[] } = {};
    initialRequest.items.forEach((_, index) => {
      mapped[index] = existingItems;
    });
    setFilteredItems(mapped);
  }, [initialRequest, existingItems]);

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
      items: [...prev.items, createDefaultPurchaseItem()]
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

    if (isEditing) {
      toast.success('Purchase request changes will be reviewed by the purchasing department. You will be notified by email.');
    } else {
      toast.success('Purchase requests will be marked as "Pending review" and will be evaluated by the purchasing department. You will be notified of the status by email.');
    }

    setTimeout(() => {
      toast.success(isEditing ? 'Purchase request updated successfully' : 'Purchase request submitted successfully');
      if (onBack) onBack();
    }, 2000);
  };

  const handleSelfPurchaseChange = (value: string) => {
    const isSelfPurchase = value === 'self';
    setFormData(prev => {
      if (isSelfPurchase) {
        if (prev.purchaseReason && prev.purchaseReason !== 'urgent') {
          previousPurchaseReasonRef.current = prev.purchaseReason;
        }
        return {
          ...prev,
          selfPurchase: true,
          purchaseReason: 'urgent'
        };
      }

      const restoredReason =
        prev.purchaseReason === 'urgent'
          ? previousPurchaseReasonRef.current || ''
          : prev.purchaseReason;

      return {
        ...prev,
        selfPurchase: false,
        purchaseReason: restoredReason
      };
    });
  };

  const handleClientBilledToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      clientBilled: checked ? 'yes' : 'no'
    }));
  };

  const handleItemTypeToggle = (index: number, isExisting: boolean) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
            ? {
                ...item,
                isExisting,
                name: ''
              }
          : item
      )
    }));

    setItemSearches(prev => ({ ...prev, [index]: '' }));
    setDropdownOpen(prev => ({ ...prev, [index]: false }));
    setFilteredItems(prev => {
      const next = { ...prev };
      if (isExisting) {
        next[index] = existingItems;
      } else {
        delete next[index];
      }
      return next;
    });
  };

  const handlePurchaseReasonChange = (value: string) => {
    setFormData(prev => {
      if (!prev.selfPurchase) {
        previousPurchaseReasonRef.current = value;
        return { ...prev, purchaseReason: value };
      }

      return prev;
    });
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="flex flex-col h-[calc(100vh-16rem)]">
            <CardHeader>
              <CardTitle>Items to Purchase</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
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

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {formData.items.map((item, index) => {
                  const selectedExistingItem = item.isExisting ? existingItems.find(ei => ei.name === item.name) : null;

                  return (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">Item {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase text-muted-foreground">New</span>
                            <Switch
                              checked={item.isExisting}
                              onCheckedChange={(checked: boolean) => handleItemTypeToggle(index, checked)}
                              aria-label="Toggle item type"
                            />
                            <span className="text-xs uppercase text-muted-foreground">Existing</span>
                          </div>
                        </div>
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
                        <div className="md:col-span-2 space-y-4">
                          <div className="flex items-center gap-3">
                            {selectedExistingItem && (
                              <ImageWithFallback
                                src={selectedExistingItem.image}
                                alt={selectedExistingItem.name}
                                className="h-16 w-16 rounded object-cover border"
                              />
                            )}
                            <div className="flex-1">
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
                          </div>

                          <div className="rounded-lg bg-card/60 p-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="flex flex-col gap-2">
                                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Quantity</Label>
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

                              <div className="flex flex-col gap-2">
                                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Estimated Cost (per unit)</Label>
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

                              <div className="flex flex-col gap-2">
                                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Total Cost</Label>
                                <div className="flex h-10 items-center justify-center rounded-md border bg-muted px-3 text-sm font-semibold">
                                  {`$${(item.estimatedCost * item.quantity).toFixed(2)}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Label>Reference Link (optional)</Label>
                          <Input
                            type="url"
                            placeholder="https://example.com/product"
                            value={item.link}
                            onChange={(e) => updateItem(index, 'link', e.target.value)}
                          />
                          {item.link && !validateUrl(item.link) && (
                            <p className="text-sm text-destructive mt-1">
                              Invalid URL format
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

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

          <Card className="flex flex-col h-[calc(100vh-16rem)]">
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <Label className="text-sm font-medium text-foreground">Purchase Responsibility</Label>
                <div className="mt-3 flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formData.selfPurchase ? 'I will make this purchase' : 'Keeper will make this purchase'}
                    </p>
                    <p className="text-xs text-muted-foreground">Toggle to decide who completes the purchase.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase text-muted-foreground">Keeper</span>
                    <Switch
                      checked={formData.selfPurchase}
                      onCheckedChange={(checked: boolean) => handleSelfPurchaseChange(checked ? 'self' : 'keeper')}
                      aria-label="Toggle purchase responsibility"
                    />
                    <span className="text-xs uppercase text-muted-foreground">Self</span>
                  </div>
                </div>
                {formData.selfPurchase && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      By selecting this option, the reason is automatically set to "Urgent" and cannot be edited.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="h-4 w-4" />
                    Expected Delivery Date
                  </div>
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <Label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Hash className="h-4 w-4" />
                    Client Billed
                  </div>
                </Label>
                <div className="mt-3 flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formData.clientBilled === 'yes' ? 'Client will be billed' : 'Client will not be billed'}
                    </p>
                    <p className="text-xs text-muted-foreground">Toggle to set client billing for this request.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase text-muted-foreground">No</span>
                    <Switch
                      checked={formData.clientBilled === 'yes'}
                      onCheckedChange={handleClientBilledToggle}
                      aria-label="Toggle client billed"
                    />
                    <span className="text-xs uppercase text-muted-foreground">Yes</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <ClipboardList className="h-4 w-4" />
                    Purchase Reason
                  </div>
                </Label>
                <Select
                  value={formData.purchaseReason}
                  onValueChange={handlePurchaseReasonChange}
                  disabled={formData.selfPurchase}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low-stock">Low stock</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="new-project">New project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building className="h-4 w-4" />
                    Company
                  </div>
                </Label>
                <Input
                  placeholder="Enter company name"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>

              <div>
                <Label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <User className="h-4 w-4" />
                    Customer
                  </div>
                </Label>
                <Input
                  placeholder="Enter customer name"
                  value={formData.customer}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="project">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FolderOpen className="h-4 w-4" />
                    Project *
                  </div>
                </Label>
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
                <Label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Hash className="h-4 w-4" />
                    Work Order #
                  </div>
                </Label>
                <Input
                  placeholder="Enter WO number"
                  value={formData.workOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, workOrder: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="justification">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="h-4 w-4" />
                    Justification
                  </div>
                </Label>
                <Textarea
                  id="justification"
                  placeholder="Explain why this purchase is needed..."
                  value={formData.justification}
                  onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                  required
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

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