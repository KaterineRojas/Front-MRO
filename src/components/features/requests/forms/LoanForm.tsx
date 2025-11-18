import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Badge } from '../../../ui/badge';
import { ArrowLeft, Plus, Minus, X, Calendar, Package } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import  { toast } from 'sonner';
import type { CartItem } from '../../enginner/types';
import type { User } from '../../enginner/types';
import { getWarehouses, getCatalogItemsByWarehouse, getProjects, type Warehouse, type CatalogItem, type Project } from '../../enginner/services';

interface LoanFormProps {
  cartItems: CartItem[];
  clearCart: () => void;
  currentUser: User;
  onBack: (() => void) | null;
}

interface LoanFormData {
  items: { itemId: string; itemName: string; quantity: number }[];
  department: string;
  project: string;
  returnDate: string;
  notes: string;
  warehouseId: string;
}

const departments = [
  'Ingeniería',
  'Desarrollo',
  'Diseño',
  'Marketing',
  'Ventas',
  'Administración'
];

export function LoanForm({ cartItems, clearCart, currentUser, onBack }: LoanFormProps) {
  const [formData, setFormData] = useState<LoanFormData>({
    items: cartItems.map(item => ({
      itemId: item.item.id,
      itemName: item.item.name,
      quantity: item.quantity
    })),
    department: currentUser.department,
    project: '',
    returnDate: '',
    notes: '',
    warehouseId: ''
  });

  const [cartItemsCount] = useState(cartItems.length);
  const [itemSearches, setItemSearches] = useState<{ [key: number]: string }>({});
  const [filteredItems, setFilteredItems] = useState<{ [key: number]: CatalogItem[] }>({});
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
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

  // Load catalog items when warehouse changes
  useEffect(() => {
    const loadItems = async () => {
      if (formData.warehouseId) {
        const items = await getCatalogItemsByWarehouse(formData.warehouseId);
        setCatalogItems(items);
        // Initialize filtered items for all indexes
        const newFilteredItems: { [key: number]: CatalogItem[] } = {};
        formData.items.forEach((_, index) => {
          newFilteredItems[index] = items;
        });
        setFilteredItems(newFilteredItems);
      }
    };
    loadItems();
  }, [formData.warehouseId]);

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
      const filtered = catalogItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(prev => ({ ...prev, [index]: filtered }));
    } else {
      setFilteredItems(prev => ({ ...prev, [index]: catalogItems }));
    }
    setDropdownOpen(prev => ({ ...prev, [index]: true }));
  };

  const selectItem = (index: number, item: CatalogItem) => {
    updateItem(index, 'itemId', item.id);
    updateItem(index, 'itemName', item.name);
    setItemSearches(prev => ({ ...prev, [index]: item.name }));
    setDropdownOpen(prev => ({ ...prev, [index]: false }));
  };

  const toggleDropdown = (index: number) => {
    const currentItem = formData.items[index];
    if (currentItem.itemId) {
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
      items: [...prev.items, { itemId: '', itemName: '', quantity: 1 }]
    }));
    // Initialize search state for new item
    setItemSearches(prev => ({ ...prev, [newIndex]: '' }));
    setFilteredItems(prev => ({ ...prev, [newIndex]: catalogItems }));
    setDropdownOpen(prev => ({ ...prev, [newIndex]: false }));
  };

  const removeItem = (index: number) => {
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
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateStock = (itemId: string, quantity: number) => {
    const item = catalogItems.find(i => i.id === itemId);
    return item ? quantity <= item.availableQuantity : false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate project selection
    if (!formData.project) {
      toast.error('Please select a project');
      return;
    }
    
    // Validate stock for all items
    for (const item of formData.items) {
      if (item.itemId && !validateStock(item.itemId, item.quantity)) {
        toast.error(`Insufficient stock for ${item.itemName}`);
        return;
      }
    }

    // Simulate submission
    toast.success('Borrow request submitted successfully');
    clearCart();
    onBack();
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1>Borrow Form</h1>
          <p className="text-muted-foreground">
            {cartItemsCount > 0 ? 'Complete the details of your borrow request' : 'Create a new borrow request'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Borrow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="warehouse">
                <div className="flex items-center gap-2 mb-1.5">
                  <Package className="h-4 w-4" />
                  Warehouse
                </div>
              </Label>
              <Select 
                value={formData.warehouseId} 
                onValueChange={(value: string) => {
                  setFormData(prev => ({ ...prev, warehouseId: value }));
                  // Clear selected items when warehouse changes
                  setFormData(prev => ({ 
                    ...prev, 
                    items: prev.items.map((item, index) => 
                      index < cartItemsCount ? item : { itemId: '', itemName: '', quantity: 1 }
                    ) 
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value: string) => setFormData(prev => ({ ...prev, department: value }))}>
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
                <Label htmlFor="returnDate">Return Date</Label>
                <div className="relative">
                  <Input
                    id="returnDate"
                    type="date"
                    min={getMinDate()}
                    value={formData.returnDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional information about the borrow request..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items to Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => {
              const selectedItemData = item.itemId ? catalogItems.find(i => i.id === item.itemId) : null;
              const isFromCartItem = index < cartItemsCount;
              const itemImage = isFromCartItem && cartItems[index] ? cartItems[index].item.image : selectedItemData?.image;
              
              const maxQuantity = selectedItemData ? selectedItemData.availableQuantity : 999;
              
              return (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                {itemImage && (
                  <ImageWithFallback
                    src={itemImage}
                    alt={item.itemName}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <Label>Item</Label>
                      {isFromCartItem ? (
                        <Input value={item.itemName} disabled />
                      ) : (
                        <div className="space-y-2 relative" ref={(el) => { if (el) dropdownRefs.current[index] = el; }}>
                          <Input
                            placeholder={item.itemId ? "Click to change selection..." : "Type to search items..."}
                            value={itemSearches[index] || ''}
                            onChange={(e) => handleItemSearch(index, e.target.value)}
                            onClick={() => toggleDropdown(index)}
                            readOnly={!!item.itemId}
                            className={item.itemId ? "cursor-pointer" : ""}
                          />
                          {dropdownOpen[index] && (
                            <div className="absolute z-10 w-full border rounded-md bg-background shadow-lg max-h-40 overflow-y-auto">
                              {(filteredItems[index] || catalogItems).length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  No items found matching "{itemSearches[index]}"
                                </div>
                              ) : (
                                (filteredItems[index] || catalogItems).map((mockItem) => (
                                  <button
                                    key={mockItem.id}
                                    type="button"
                                    className={`w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center gap-2 ${
                                      item.itemId === mockItem.id ? 'bg-accent' : ''
                                    }`}
                                    onClick={() => selectItem(index, mockItem)}
                                  >
                                    <ImageWithFallback
                                      src={mockItem.image}
                                      alt={mockItem.name}
                                      className="w-8 h-8 object-cover rounded"
                                    />
                                    <span>{mockItem.name} (Available: {mockItem.availableQuantity})</span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={maxQuantity}
                          value={item.quantity}
                          onChange={(e) => {
                            const newVal = parseInt(e.target.value) || 1;
                            updateItem(index, 'quantity', Math.min(newVal, maxQuantity));
                          }}
                          className="w-20 text-center"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => updateItem(index, 'quantity', Math.min(item.quantity + 1, maxQuantity))}
                          disabled={item.quantity >= maxQuantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-end">
                      {item.itemId && !validateStock(item.itemId, item.quantity) && (
                        <Badge variant="destructive">Insufficient stock</Badge>
                      )}
                      {!isFromCartItem && (
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
                  </div>
                </div>
              </div>
            );
            })}
            
            <Button type="button" variant="outline" onClick={addNewItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Submit Borrow Request
          </Button>
        </div>
      </form>
    </div>
  );
}