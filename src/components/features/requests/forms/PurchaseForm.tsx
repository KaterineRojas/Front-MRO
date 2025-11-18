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

interface PurchaseFormProps {
  currentUser: User;
  onBack: (() => void) | null;
}

interface PurchaseItem {
  name: string;
  isExisting: boolean;
  partNumber: string;
  quantity: number;
  estimatedCost: number;
  justification: string;
  link: string;
}

interface PurchaseFormData {
  items: PurchaseItem[];
  department: string;
  project: string;
  priority: 'low' | 'medium' | 'urgent';
  selfPurchase: boolean;
  warehouseId: string;
}

const departments = [
  'Engineering',
  'Development',
  'Design',
  'Marketing',
  'Sales',
  'Administration'
];

const mockExistingItems = [
  { id: '1', name: 'Mechanical Keyboard RGB', image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmQlMjBnYW1pbmd8ZW58MXx8fHwxNzU5Nzc2MzM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '2', name: 'Proyector Epson PowerLite', image: 'https://images.unsplash.com/photo-1625961332600-f6eac385c6ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0b3IlMjBvZmZpY2UlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzU5MTc4ODkzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '3', name: 'Monitor Samsung 27"', image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMG1vbml0b3IlMjBkaXNwbGF5fGVufDF8fHx8MTc1OTA1ODE5Nnww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '4', name: 'Cable HDMI 2.0', image: 'https://images.unsplash.com/photo-1625738323142-01e6d7906e0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZG1pJTIwY2FibGV8ZW58MXx8fHwxNzU5MDgxODM0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '5', name: 'Teclado mecánico', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXlib2FyZCUyMG1lY2hhbmljYWx8ZW58MXx8fHwxNzU5MDgxODM0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '6', name: 'Mouse inalámbrico', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VzZSUyMHdpcmVsZXNzfGVufDF8fHx8MTc1OTA4MTgzNHww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '7', name: 'Webcam HD', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJjYW18ZW58MXx8fHwxNzU5MDgxODM0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '8', name: 'Auriculares con micrófono', image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbWljcm9waG9uZXxlbnwxfHx8fDE3NTkwODE4MzR8MA&ixlib=rb-4.1.0&q=80&w=1080' }
];

export function PurchaseForm({ currentUser, onBack }: PurchaseFormProps) {
  const [formData, setFormData] = useState<PurchaseFormData>({
    items: [{ name: '', isExisting: false, partNumber: '', quantity: 1, estimatedCost: 0, justification: '', link: '' }],
    department: currentUser.department,
    project: '',
    priority: 'medium',
    selfPurchase: false,
    warehouseId: ''
  });

  const [itemSearches, setItemSearches] = useState<{ [key: number]: string }>({});
  const [filteredItems, setFilteredItems] = useState<{ [key: number]: typeof mockExistingItems }>({});
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>({});
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load warehouses and projects
  useEffect(() => {
    const loadWarehouses = async () => {
      const data = await getWarehouses();
      setWarehouses(data);
      if (data.length > 0 && !formData.warehouseId) {
        setFormData(prev => ({ ...prev, warehouseId: data[0].id }));
      }
    };
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        toast.error('Failed to load projects');
      }
    };
    loadWarehouses();
    loadProjects();
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
      const filtered = mockExistingItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(prev => ({ ...prev, [index]: filtered }));
    } else {
      setFilteredItems(prev => ({ ...prev, [index]: mockExistingItems }));
    }
    setDropdownOpen(prev => ({ ...prev, [index]: true }));
  };

  const selectExistingItem = (index: number, item: typeof mockExistingItems[0]) => {
    updateItem(index, 'name', item.name);
    setItemSearches(prev => ({ ...prev, [index]: item.name }));
    setDropdownOpen(prev => ({ ...prev, [index]: false }));
  };

  const toggleDropdown = (index: number) => {
    const currentItem = formData.items[index];
    if (currentItem.name && currentItem.isExisting) {
      // Si ya hay un item seleccionado, toggle el dropdown
      setDropdownOpen(prev => ({ ...prev, [index]: !prev[index] }));
    } else {
      // Si no hay item seleccionado, abrir dropdown
      setDropdownOpen(prev => ({ ...prev, [index]: true }));
    }
  };



  const addNewItem = () => {
    const newIndex = formData.items.length;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', isExisting: false, partNumber: '', quantity: 1, estimatedCost: 0, justification: '', link: '' }]
    }));
    // Initialize search state for new item
    setItemSearches(prev => ({ ...prev, [newIndex]: '' }));
    setFilteredItems(prev => ({ ...prev, [newIndex]: mockExistingItems }));
    setDropdownOpen(prev => ({ ...prev, [newIndex]: false }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
      // Clean up search states
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
    if (!url) return true; // Optional field
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
    
    // Validate project selection
    if (!formData.project) {
      toast.error('Please select a project');
      return;
    }
    
    // Validate URLs
    for (const item of formData.items) {
      if (item.link && !validateUrl(item.link)) {
        toast.error(`Invalid URL for item: ${item.name}`);
        return;
      }
    }

    // Show submission alert
    toast.success('Purchase requests will be marked as "Pending review" and will be evaluated by the purchasing department. You will be notified of the status by email.');
    
    setTimeout(() => {
      toast.success('Purchase request submitted successfully');
      onBack();
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1>Purchase Form</h1>
          <p className="text-muted-foreground">
            Request the acquisition of new items
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
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

        <Card>
          <CardHeader>
            <CardTitle>Items to Purchase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.items.map((item, index) => {
              const selectedExistingItem = item.isExisting ? mockExistingItems.find(ei => ei.name === item.name) : null;
              
              return (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4>Item {index + 1}</h4>
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
                      onValueChange={(value) => {
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
                            {(filteredItems[index] || mockExistingItems).length === 0 ? (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                No items found matching "{itemSearches[index]}"
                              </div>
                            ) : (
                              (filteredItems[index] || mockExistingItems).map((existingItem) => (
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

                  <div className="md:col-span-2">
                    <Label>Part Number</Label>
                    <Input
                      placeholder="Enter part number..."
                      value={item.partNumber}
                      onChange={(e) => updateItem(index, 'partNumber', e.target.value)}
                      disabled={item.isExisting}
                      required={!item.isExisting}
                    />
                  </div>

                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
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
                      value={item.estimatedCost}
                      onChange={(e) => updateItem(index, 'estimatedCost', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div>
                    <Label>Total Cost</Label>
                    <Input
                      value={`${(item.estimatedCost * item.quantity).toFixed(2)}`}
                      disabled
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
                <span>Estimated Total Cost:</span>
                <span className="text-lg">${getTotalCost().toFixed(2)}</span>
              </div>
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