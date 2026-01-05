import React, { useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button as Button2 } from '../inventory/components/Button';
import { ArticleSelector } from './components/ArticleSelector';
import { RequestSummary } from './components/RequestSummary';
import { RequestDetailsForm } from './components/RequestDetailsForm';
import { ErrorBoundary } from './common/ErrorBoundary';
import { useActiveItems } from './hooks/useActiveItems';
import { Item, RequestFormData, PurchaseRequestItem, CreatePurchaseRequestPayload } from './types/purchaseType';
import { createPurchaseRequest } from './services/purchaseService'; 
import {authService} from '../../../services/authService'

interface CreatePurchaseRequestPageProps {
  onBack: () => void;
  onSave: () => void;
}

export function CreatePurchaseRequestPage({ onBack, onSave }: CreatePurchaseRequestPageProps) {
  const { items: apiItems, loading, error, refreshItems } = useActiveItems();
  const [creatingRequest, setCreatingRequest] = useState(false);
  

  const [items, setItems] = useState<PurchaseRequestItem[]>([]);

  const INITIAL_FORM_STATE: RequestFormData = {
    requestedBy: '',
    department: '',
    project: '',
    priority: 'medium',
    notes: '',
    expectedDate: ''
};

  const [formData, setFormData] = useState<RequestFormData>(INITIAL_FORM_STATE);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Please add items');

    try {
        setCreatingRequest(true)
        const totalValue = items.reduce((sum, i) => sum + i.totalCost, 0);

        const backendItems = items.map(item => ({
            itemId: item.id, 
            quantity: item.requestQuantity
        }));

        const payload: CreatePurchaseRequestPayload = {
            requesterId: authService.getUser()?.employeeId || 'Not provided', // TODO: Get from Auth Context/Login?
            companyId: "AMAXST-USs", // TODO: Get from Auth?
            customerId: "AMAXST",    // TODO: Hardcoded or from Form?
            
            departmentId: authService.getUser()?.departmentId?.toString() || "Not provided",
            projectId: "General Expenses",       // Selected in Form? or where from
            
            // "reason" is a number. Let's default to 0 (Standard) for now??.
            reason: 0, 
            
            notes: formData.notes, 

            workOrderId: "FVC00000022", // TODO: Where does this come from?
            expectedDeliveryDate: formData.expectedDate,
            warehouseId: 1,             // from redux : user info, make it not harcoded
            
            clientBilled: false,
            selfPurchase: false,
            estimatedTotalCost: totalValue,
            items: backendItems
        };

        console.log("Submitting Payload:", payload);

        await createPurchaseRequest(payload);
        
        alert('Request sent successfully!');

        setItems([]); 
        setFormData(INITIAL_FORM_STATE);
        setExpectedDeliveryDate(undefined);

        onBack(); 
        onSave();

    } catch (err: any) {
        console.error(err);
        alert(err.message || 'Error sending request');
    }finally{
      setCreatingRequest(false)
    }
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
            <RequestSummary items={items} onRemoveItem={handleRemoveItem} onSubmit={handleSubmit} isLoading={creatingRequest} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}