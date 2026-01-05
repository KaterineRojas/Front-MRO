import React, { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button as Button2 } from '../inventory/components/Button';
import { ArticleSelector } from './components/ArticleSelector';
import { RequestSummary } from './components/RequestSummary';
import { RequestDetailsForm } from './components/RequestDetailsForm';
import { ErrorBoundary } from './common/ErrorBoundary';
import { useActiveItems } from './hooks/useActiveItems';
import { Item, RequestFormData, PurchaseRequestItem } from './types/purchaseType';

interface CreatePurchaseRequestPageProps {
  onBack: () => void;
  onSave: (request: any) => void;
}

export function CreatePurchaseRequestPage({ onBack, onSave }: CreatePurchaseRequestPageProps) {
  const { items: apiItems, loading, error, refreshItems } = useActiveItems();

  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const [formData, setFormData] = useState<RequestFormData>({
    requestedBy: '', department: '', project: '', priority: 'medium', notes: '', expectedDate: ''
  });
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | undefined>();

  const handleAddItem = (item: Item, quantity: number, estimatedCost: number, purchaseUrl: string) => {
    
    const newItem: PurchaseRequestItem = {
      ...item, // Spreads id, sku, name, description, category, etc.
      requestQuantity: quantity,
      estimatedCost: estimatedCost,
      totalCost: quantity * estimatedCost,
      purchaseUrl: purchaseUrl
    };

    setItems((prevItems) => [...prevItems, newItem]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Please add items');
    
    const purchaseRequest = {
      ...formData,
      expectedDelivery: expectedDeliveryDate ? format(expectedDeliveryDate, 'yyyy-MM-dd') : undefined,
      items,
      totalOrderValue: items.reduce((sum, i) => sum + i.totalCost, 0),
      createdAt: new Date().toISOString()
    };
    console.log(purchaseRequest);
    
    // onSave(purchaseRequest);
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (error) return <div className="h-96 flex flex-col items-center justify-center text-red-600"><AlertCircle /><p>{error}</p><button onClick={refreshItems}>Retry</button></div>;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div>
            <Button2 variant="primary" onClick={onBack} className="mb-2"><ArrowLeft className='h-4 w-4 mr-1' /> Back</Button2>
            <h1>Create Purchase Request</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <ArticleSelector 
            items={apiItems} 
            onAddItem={handleAddItem} 
          />

          <div className="space-y-6">
            <RequestDetailsForm formData={formData} setFormData={setFormData} />
            <RequestSummary items={items} onRemoveItem={handleRemoveItem} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}