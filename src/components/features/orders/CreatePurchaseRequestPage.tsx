import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar as CalendarIcon, Plus, Trash2, ArrowLeft, Package, Search } from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { format } from 'date-fns';
import { Button as Button2 } from '../inventory/components/Button';
import { ArticleSelector } from './components/ArticleSelector'
import { NewRequestItem } from './types/purchase'
import { RequestSummary } from './components/RequestSummary'
import { RequestDetailsForm } from './components/RequestDetailsForm'
import {RequestFormData} from './types/purchase'


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

export const getCategoryVariant = (category: string, isDarkMode: boolean): any => {
  const cat = category.toLowerCase();
  
  // Use the 'isDarkMode' argument instead of the hook
  if (cat.includes('office') || cat.includes('computer')) return isDarkMode ? 'brand' : 'brand-soft';
  if (cat.includes('tech') || cat.includes('paper')) return isDarkMode ? 'info' : 'info-soft';
  if (cat.includes('furniture')) return isDarkMode ? 'warning' : 'warning-soft';
  if (cat.includes('safety') || cat.includes('maintenance')) return isDarkMode ? 'emerald' : 'emerald-soft';
  if (cat.includes('tool') || cat.includes('hard')) return isDarkMode ? 'neutral' : 'neutral-soft';
  
  return 'secondary';
};


export function CreatePurchaseRequestPage({ onBack, onSave }: CreatePurchaseRequestPageProps) {
  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState<RequestFormData>({
    requestedBy: '',
    department: '',
    project: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    expectedDate: ''
  });


  const [currentItem, setCurrentItem] = useState({
    articleCode: '',
    quantity: '',
    estimatedCost: '',
    purchaseUrl: '',
  });

  const filteredArticles = mockArticles.filter(article =>
    article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const selectedArticle = mockArticles.find(a => a.code === currentItem.articleCode);

  const handleAddItem = (itemData: NewRequestItem) => {
    const totalCost = itemData.quantity * itemData.estimatedCost;

    const newItem: PurchaseRequestItem = {
      id: Date.now(),
      articleCode: itemData.articleCode,
      articleDescription: itemData.description || '',
      quantity: itemData.quantity,
      unit: itemData.unit || 'pcs',
      estimatedCost: itemData.estimatedCost,
      totalCost: totalCost,
      purchaseUrl: itemData.purchaseUrl,
      imageUrl: itemData.imageUrl || ''
    };

    setItems((prevItems) => [...prevItems, newItem]);
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
          <Button2 variant="primary" onClick={onBack} className="mb-2">
            <ArrowLeft className='h-4 w-4 m-1' /> Back to Purchase Request
          </Button2>
          <h1>Create Purchase Request</h1>
          <p className="text-muted-foreground">
            Add items to your purchase request
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Add Items */}
        <ArticleSelector
          articles={filteredArticles}
          onAddItem={handleAddItem}
        />

        {/* RIGHT COL: Form & Summary */}
        <div className=" space-y-6">

          {/* Step 1: Who is requesting? */}
          <RequestDetailsForm
            formData={formData}
            setFormData={setFormData}
          />

          {/* Step 2: What are they requesting? */}
          <RequestSummary
            items={items}
            onRemoveItem={handleRemoveItem}
            onSubmit={handleSubmit}
          />

        </div>


      </div>
    </div>
  );
}
