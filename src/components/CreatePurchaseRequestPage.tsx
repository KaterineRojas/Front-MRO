import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon, Plus, Trash2, ArrowLeft, Package, Search } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { format } from 'date-fns';

interface Article {
  code: string;
  description: string;
  unit: string;
  cost: number;
  supplier: string;
  imageUrl: string;
  category: string;
}

interface PurchaseRequestItem {
  id: number;
  articleCode: string;
  articleDescription: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  totalCost: number;
  purchaseUrl: string;
  imageUrl: string;
}

const mockArticles: Article[] = [
  { code: 'OFF-001', description: 'Office PPaper A4 - 80gsm', unit: 'sheets', cost: 0.02, supplier: 'Office Supplies Inc.', imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300', category: 'Office Supplies' },
  { code: 'OFF-002', description: 'Printer Toner HP LaserJet', unit: 'units', cost: 50.00, supplier: 'Office Supplies Inc.', imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300', category: 'Office Supplies' },
  { code: 'USB-003', description: 'USB Cable Type-C 2m', unit: 'units', cost: 8.99, supplier: 'Cable Masters', imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300', category: 'Technology' },
  { code: 'PROJ-004', description: 'Projector Epson EB-X41', unit: 'units', cost: 450.00, supplier: 'AV Equipment Co.', imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300', category: 'Technology' },
  { code: 'PROJ-005', description: 'Projection Screen 100 inch', unit: 'units', cost: 450.00, supplier: 'AV Equipment Co.', imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=300', category: 'Technology' },
  { code: 'TECH-002', description: 'Laptop Dell Latitude 5520', unit: 'units', cost: 1200.00, supplier: 'Tech Solutions Ltd.', imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300', category: 'Technology' },
  { code: 'TECH-003', description: 'Wireless Mouse Logitech MX Master', unit: 'units', cost: 99.00, supplier: 'Tech Solutions Ltd.', imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300', category: 'Technology' },
  { code: 'TECH-004', description: 'USB-C Hub Multiport Adapter', unit: 'units', cost: 49.00, supplier: 'Tech Solutions Ltd.', imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300', category: 'Technology' },
  { code: 'TOOL-005', description: 'Electric Drill with Battery', unit: 'units', cost: 250.00, supplier: 'Tool Masters', imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300', category: 'Tools' },
  { code: 'SAFE-006', description: 'Safety Helmet with Chin Strap', unit: 'units', cost: 45.00, supplier: 'SafetyFirst Co.', imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300', category: 'Safety Equipment' },
];

interface CreatePurchaseRequestPageProps {
  onBack: () => void;
  onSave: (request: any) => void;
}

export function CreatePurchaseRequestPage({ onBack, onSave }: CreatePurchaseRequestPageProps) {
  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    requestedBy: '',
    department: '',
    project: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: ''
  });

  const [currentItem, setCurrentItem] = useState({
    articleCode: '',
    quantity: '',
    estimatedCost: '',
    purchaseUrl: ''
  });

  const filteredArticles = mockArticles.filter(article =>
    article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedArticle = mockArticles.find(a => a.code === currentItem.articleCode);

  const handleAddItem = () => {
    if (!currentItem.articleCode || !currentItem.quantity) {
      alert('Please select an article and enter quantity');
      return;
    }

    const article = mockArticles.find(a => a.code === currentItem.articleCode);
    if (!article) return;

    const quantity = parseInt(currentItem.quantity);
    const estimatedCost = parseFloat(currentItem.estimatedCost) || article.cost;
    const totalCost = quantity * estimatedCost;

    const newItem: PurchaseRequestItem = {
      id: Date.now(),
      articleCode: article.code,
      articleDescription: article.description,
      quantity,
      unit: article.unit,
      estimatedCost,
      totalCost,
      purchaseUrl: currentItem.purchaseUrl,
      imageUrl: article.imageUrl
    };

    setItems([...items, newItem]);
    setCurrentItem({
      articleCode: '',
      quantity: '',
      estimatedCost: '',
      purchaseUrl: ''
    });
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Please add at least one item to the request');
      return;
    }

    if (!formData.requestedBy || !formData.department || !formData.project) {
      alert('Please fill in all required fields');
      return;
    }

    const totalOrderValue = items.reduce((sum, item) => sum + item.totalCost, 0);

    const purchaseRequest = {
      ...formData,
      expectedDelivery: expectedDeliveryDate ? format(expectedDeliveryDate, 'yyyy-MM-dd') : undefined,
      items,
      totalOrderValue,
      createdAt: new Date().toISOString()
    };

    onSave(purchaseRequest);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Requests
          </Button>
          <h1>Create Purchase Request</h1>
          <p className="text-muted-foreground">
            Add items to your purchase request
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Add Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Add Items to Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Article Selection with Search and Images */}
            <div>
              <Label>Select Article *</Label>
              <div className="relative mb-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code, name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                {filteredArticles.map((article) => (
                  <div
                    key={article.code}
                    className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      currentItem.articleCode === article.code ? 'bg-muted border-l-4 border-primary' : ''
                    }`}
                    onClick={() => {
                      setCurrentItem({
                        ...currentItem,
                        articleCode: article.code,
                        estimatedCost: article.cost.toString()
                      });
                    }}
                  >
                    <ImageWithFallback 
                      src={article.imageUrl}
                      alt={article.description}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{article.code}</p>
                      <p className="text-sm text-muted-foreground">{article.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        <span className="text-xs text-muted-foreground">${article.cost.toFixed(2)}/{article.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Details */}
            {selectedArticle && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedCost">Unit Cost *</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentItem.estimatedCost}
                      onChange={(e) => setCurrentItem({...currentItem, estimatedCost: e.target.value})}
                      placeholder={selectedArticle.cost.toString()}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="purchaseUrl">Purchase URL (optional)</Label>
                  <Input
                    id="purchaseUrl"
                    value={currentItem.purchaseUrl}
                    onChange={(e) => setCurrentItem({...currentItem, purchaseUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                {currentItem.quantity && currentItem.estimatedCost && (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded">
                    <span className="font-medium">Total for this item:</span>
                    <span className="font-medium">
                      ${(parseInt(currentItem.quantity) * parseFloat(currentItem.estimatedCost)).toFixed(2)}
                    </span>
                  </div>
                )}

                <Button onClick={handleAddItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right side - Request Details & Items List */}
        <div className="space-y-6">
          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="requestedBy">Requested By *</Label>
                <Input
                  id="requestedBy"
                  value={formData.requestedBy}
                  onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g., IT"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="project">Project *</Label>
                <Input
                  id="project"
                  value={formData.project}
                  onChange={(e) => setFormData({...formData, project: e.target.value})}
                  placeholder="Project name"
                  required
                />
              </div>

              <div>
                <Label>Expected Delivery Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDeliveryDate ? format(expectedDeliveryDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expectedDeliveryDate}
                      onSelect={setExpectedDeliveryDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items in Request */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Items in Request ({items.length})</CardTitle>
                <Badge variant="secondary" className="text-base">
                  Total: ${totalAmount.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No items added yet</p>
                  <p className="text-sm">Select articles from the left to add them</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <ImageWithFallback 
                        src={item.imageUrl}
                        alt={item.articleDescription}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.articleCode}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.articleDescription}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.quantity} {item.unit}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ${item.estimatedCost.toFixed(2)} ea = ${item.totalCost.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            size="lg"
            disabled={items.length === 0}
          >
            Submit Purchase Request
          </Button>
        </div>
      </div>
    </div>
  );
}
