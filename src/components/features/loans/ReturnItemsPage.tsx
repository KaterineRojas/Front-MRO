import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { ArrowLeft, Package, CheckCircle, AlertTriangle, Save, Camera, Upload, X, History, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

interface LoanItem {
  id: number;
  articleBinCode: string;
  articleName: string;
  articleDescription: string;
  articleType: 'consumable' | 'non-consumable';
  quantity: number;
  unit: string;
  returnedQuantity?: number;
  status: 'pending' | 'active' | 'returned' | 'partial' | 'lost' | 'damaged';
  imageUrl?: string;
}

interface LoanRequest {
  id: number;
  requestNumber: string;
  borrower: string;
  borrowerEmail: string;
  department: string;
  project: string;
  requestedLoanDate: string;
  expectedReturnDate: string;
  status: 'pending-approval' | 'approved' | 'packed' | 'pending-to-return' | 'returned' | 'completed' | 'rejected' | 'processed' | 'ready-for-packing' | 'delivered' | 'inactive';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  requestedBy: string;
  approvedBy?: string;
  processedBy?: string;
  createdAt: string;
  items: LoanItem[];
}

interface ReturnItem {
  id: number;
  selected: boolean;
  returnQuantityGood: number;
  returnQuantityDefective: number;
  notes: string;
}

interface PartialReturnRecord {
  id: number;
  returnDate: string;
  returnedBy: string;
  returnedItems: {
    itemId: number;
    articleBinCode: string;
    articleName: string;
    quantityGood: number;
    quantityDefective: number;
    notes: string;
    imageUrl?: string;
    isKit?: boolean;
  }[];
  generalNotes: string;
  processedBy: string;
  isKit?: boolean;
}

interface ReturnItemsPageProps {
  request: LoanRequest;
  onBack: () => void;
  onReturnConfirmed: (request: LoanRequest, returnItems: ReturnItem[]) => void;
}

export function ReturnItemsPage({ request, onBack, onReturnConfirmed }: ReturnItemsPageProps) {
  const [returnItems, setReturnItems] = useState<Record<number, ReturnItem>>(
    request.items.reduce((acc, item) => {
      const availableQuantity = item.quantity - (item.returnedQuantity || 0);
      acc[item.id] = {
        id: item.id,
        selected: false,
        returnQuantityGood: availableQuantity,
        returnQuantityDefective: 0,
        notes: ''
      };
      return acc;
    }, {} as Record<number, ReturnItem>)
  );

  const [generalNotes, setGeneralNotes] = useState('');
  const [returnedBy, setReturnedBy] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<File | null>(null);
  const [keepKit, setKeepKit] = useState(true); // For kit orders: maintain kit or break kit
  
  // Helper function to check if request is a kit order
  const isKitOrder = (req: LoanRequest): boolean => {
    return req.requestNumber.startsWith('KIT-');
  };
  
  // Mock data for partial return history
  const [partialReturnHistory] = useState<PartialReturnRecord[]>([
    {
      id: 1,
      returnDate: '2025-01-20',
      returnedBy: 'Emma Davis',
      isKit: false,
      returnedItems: [
        {
          itemId: 1,
          articleBinCode: 'BIN-TECH-002',
          articleName: 'Dell Latitude Laptop',
          quantityGood: 1,
          quantityDefective: 0,
          notes: 'Laptop returned in good condition',
          imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
          isKit: false
        }
      ],
      generalNotes: 'Partial return - keeping one laptop for extended use',
      processedBy: 'John Smith'
    },
    {
      id: 2,
      returnDate: '2025-01-18',
      returnedBy: 'Emma Davis',
      isKit: false,
      returnedItems: [
        {
          itemId: 11,
          articleBinCode: 'BIN-TECH-009',
          articleName: 'Wireless Mouse',
          quantityGood: 2,
          quantityDefective: 1,
          notes: 'One mouse has faulty left click',
          imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
          isKit: false
        }
      ],
      generalNotes: 'Returned wireless mice, one needs repair',
      processedBy: 'John Smith'
    },
    {
      id: 3,
      returnDate: '2025-01-15',
      returnedBy: 'Ana Martinez',
      isKit: true,
      returnedItems: [
        {
          itemId: 2,
          articleBinCode: 'KIT-TECH-001',
          articleName: 'Presentation Equipment Kit',
          quantityGood: 1,
          quantityDefective: 0,
          notes: 'Complete kit returned - all items in good condition',
          imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=300',
          isKit: true
        }
      ],
      generalNotes: 'Kit returned as complete unit (Maintain Kit option selected)',
      processedBy: 'John Smith'
    },
    {
      id: 4,
      returnDate: '2025-01-12',
      returnedBy: 'Carlos Rodriguez',
      isKit: true,
      returnedItems: [
        {
          itemId: 21,
          articleBinCode: 'BIN-TECH-012',
          articleName: 'Digital Stylus',
          quantityGood: 2,
          quantityDefective: 1,
          notes: 'Part of kit - returned individually',
          imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300',
          isKit: false
        },
        {
          itemId: 22,
          articleBinCode: 'BIN-OFFICE-020',
          articleName: 'Color Calibration Tool',
          quantityGood: 1,
          quantityDefective: 0,
          notes: 'Part of kit - returned individually',
          imageUrl: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=300',
          isKit: false
        }
      ],
      generalNotes: 'Kit broken down and items returned individually (Break Kit option selected)',
      processedBy: 'John Smith'
    }
  ]);

  const handleItemToggle = (itemId: number) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selected: !prev[itemId].selected
      }
    }));
  };

  const handleQuantityGoodChange = (itemId: number, quantity: number) => {
    const item = request.items.find(i => i.id === itemId);
    if (!item) return;

    const availableQuantity = item.quantity - (item.returnedQuantity || 0);
    const currentDefective = returnItems[itemId].returnQuantityDefective;
    const maxGood = availableQuantity - currentDefective;
    const validQuantity = Math.max(0, Math.min(quantity, maxGood));

    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        returnQuantityGood: validQuantity
      }
    }));
  };

  const handleQuantityDefectiveChange = (itemId: number, quantity: number) => {
    const item = request.items.find(i => i.id === itemId);
    if (!item) return;

    const availableQuantity = item.quantity - (item.returnedQuantity || 0);
    const currentGood = returnItems[itemId].returnQuantityGood;
    const maxDefective = availableQuantity - currentGood;
    const validQuantity = Math.max(0, Math.min(quantity, maxDefective));

    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        returnQuantityDefective: validQuantity
      }
    }));
  };



  const handleNotesChange = (itemId: number, notes: string) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  const handleSelectAll = () => {
    const hasUnselected = Object.values(returnItems).some(item => !item.selected);
    setReturnItems(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        updated[parseInt(key)].selected = hasUnselected;
      });
      return updated;
    });
  };

  const handleConfirmReturn = () => {
    const selectedItems = Object.values(returnItems).filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      alert('Please select at least one item to return.');
      return;
    }

    if (!returnedBy.trim()) {
      alert('Please enter who is returning the items.');
      return;
    }

    // Validate that selected items have total quantity > 0
    const invalidItems = selectedItems.filter(item => 
      (item.returnQuantityGood + item.returnQuantityDefective) <= 0
    );
    if (invalidItems.length > 0) {
      alert('All selected items must have a total return quantity (good + defective) greater than 0.');
      return;
    }

    // Validate quantity limits
    for (const returnItem of selectedItems) {
      const originalItem = request.items.find(i => i.id === returnItem.id);
      if (originalItem) {
        const availableQuantity = originalItem.quantity - (originalItem.returnedQuantity || 0);
        const totalReturning = returnItem.returnQuantityGood + returnItem.returnQuantityDefective;
        
        if (totalReturning > availableQuantity) {
          alert(`Item ${originalItem.articleBinCode}: Total return quantity (${totalReturning}) exceeds available quantity (${availableQuantity})`);
          return;
        }
      }
    }

    onReturnConfirmed(request, selectedItems);
  };

  const getTotalQuantity = (itemId: number) => {
    const returnItem = returnItems[itemId];
    return returnItem.returnQuantityGood + returnItem.returnQuantityDefective;
  };

  const getAvailableQuantity = (item: LoanItem) => {
    return item.quantity - (item.returnedQuantity || 0);
  };

  const selectedCount = Object.values(returnItems).filter(item => item.selected).length;
  const totalItems = request.items.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Request Orders
          </Button>
          <div>
            <h1>Return Items - {request.requestNumber}</h1>
            <p className="text-muted-foreground">
              Manage returns and view partial return history for {request.borrower}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="return-items" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="return-items">Return Items</TabsTrigger>
          <TabsTrigger value="partial-history">Partial Return History</TabsTrigger>
        </TabsList>

        <TabsContent value="return-items" className="space-y-6">
          {/* Request Information */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Request Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Borrower</Label>
              <p className="font-medium">{request.borrower}</p>
              <p className="text-sm text-muted-foreground">{request.borrowerEmail}</p>
            </div>
            <div>
              <Label>Department</Label>
              <p>{request.department}</p>
            </div>
            <div>
              <Label>Project</Label>
              <p>{request.project}</p>
            </div>
            <div>
              <Label>Loan Date</Label>
              <p>{request.requestedLoanDate}</p>
            </div>
            <div>
              <Label>Expected Return Date</Label>
              <p>{request.expectedReturnDate}</p>
            </div>
            <div>
              <Label>Priority</Label>
              <Badge variant={request.priority === 'urgent' ? 'destructive' : 'outline'}>
                {request.priority.toUpperCase()}
              </Badge>
            </div>
            <div>
              <Label>Kit Order</Label>
              <Badge variant={isKitOrder(request) ? "default" : "outline"} className={isKitOrder(request) ? "bg-blue-600" : ""}>
                {isKitOrder(request) ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items to Return */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle>Items to Return ({selectedCount}/{totalItems} selected)</CardTitle>
              <Button variant="outline" onClick={handleSelectAll}>
                {Object.values(returnItems).every(item => item.selected) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            {/* Kit Return Options - Now inside Items to Return section */}
            {isKitOrder(request) && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <Label className="flex items-center mb-3">
                  <Package className="h-4 w-4 mr-2" />
                  Kit Return Options
                </Label>
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="keep-kit"
                      name="kit-option"
                      checked={keepKit}
                      onChange={() => setKeepKit(true)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="keep-kit" className="cursor-pointer text-sm">
                      <span className="font-medium">Maintain Kit</span>
                      <span className="text-muted-foreground ml-1">(Return all items together)</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="break-kit"
                      name="kit-option"
                      checked={!keepKit}
                      onChange={() => setKeepKit(false)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="break-kit" className="cursor-pointer text-sm">
                      <span className="font-medium">Break Kit</span>
                      <span className="text-muted-foreground ml-1">(Return items individually)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {request.items.map((item) => {
              const returnItem = returnItems[item.id];
              const availableQuantity = getAvailableQuantity(item);
              
              return (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={returnItem.selected}
                      onCheckedChange={() => handleItemToggle(item.id)}
                      className="mt-1"
                    />
                    <ImageWithFallback
                      src={item.imageUrl || ''}
                      alt={item.articleName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 space-y-3">
                      {/* Item Info */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-sm">BIN Code</Label>
                          <p className="font-mono">{item.articleBinCode}</p>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm">Name & Description</Label>
                          <p className="font-medium">{item.articleName}</p>
                          <p className="text-sm text-muted-foreground">{item.articleDescription}</p>
                        </div>
                        <div>
                          <Label className="text-sm">Available to Return</Label>
                          <p>{availableQuantity} {item.unit}</p>
                        </div>
                      </div>

                      {/* Return Controls */}
                      {returnItem.selected && (
                        <div className="space-y-4 pt-3 border-t">
                          {/* Quantity Controls */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">Return quantity in Good condition</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max={availableQuantity - returnItem.returnQuantityDefective}
                                  value={returnItem.returnQuantityGood}
                                  onChange={(e) => handleQuantityGoodChange(item.id, parseInt(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">
                                  {item.unit}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm">Return quantity on Defective condition</Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max={availableQuantity - returnItem.returnQuantityGood}
                                  value={returnItem.returnQuantityDefective}
                                  onChange={(e) => handleQuantityDefectiveChange(item.id, parseInt(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">
                                  {item.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Total and validation */}
                          <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <span className="text-sm">
                              Total returning: {getTotalQuantity(item.id)} of {availableQuantity} {item.unit}
                            </span>
                            {getTotalQuantity(item.id) === availableQuantity && (
                              <Badge className="bg-green-600">Complete Return</Badge>
                            )}
                            {getTotalQuantity(item.id) > availableQuantity && (
                              <Badge variant="destructive">Exceeds Available</Badge>
                            )}
                          </div>

                          {/* Notes */}
                          <div>
                            <Label className="text-sm">Item Notes (optional)</Label>
                            <Textarea
                              value={returnItem.notes}
                              onChange={(e) => handleNotesChange(item.id, e.target.value)}
                              placeholder="Any specific notes about this item..."
                              rows={3}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Return Information */}
      <Card>
        <CardHeader>
          <CardTitle>Return Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="returnedBy">Returned By *</Label>
            <Input
              id="returnedBy"
              value={returnedBy}
              onChange={(e) => setReturnedBy(e.target.value)}
              placeholder="Enter name of person returning items"
            />
          </div>
          <div>
            <Label htmlFor="generalNotes">General Notes (optional)</Label>
            <Textarea
              id="generalNotes"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Any general notes about this return..."
              rows={3}
            />
          </div>
          
          {/* Group Photo */}
          <div>
            <Label htmlFor="groupPhoto">Group Photo (optional)</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0] || null;
                      setGroupPhoto(file);
                    };
                    input.click();
                  }}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose from Gallery
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0] || null;
                      setGroupPhoto(file);
                    };
                    input.click();
                  }}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                {groupPhoto && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGroupPhoto(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {groupPhoto && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(groupPhoto)}
                    alt="Group photo preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {selectedCount > 0 ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{selectedCount} item{selectedCount !== 1 ? 's' : ''} selected for return</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span>No items selected for return</span>
            </>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleConfirmReturn} disabled={selectedCount === 0}>
            <Save className="h-4 w-4 mr-2" />
            Confirm Return ({selectedCount} items)
          </Button>
          </div>
        </div>
        </TabsContent>

        <TabsContent value="partial-history" className="space-y-6">
          {/* Request Information for History Tab */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Borrower</Label>
                  <p className="font-medium">{request.borrower}</p>
                  <p className="text-sm text-muted-foreground">{request.borrowerEmail}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p>{request.department}</p>
                </div>
                <div>
                  <Label>Project</Label>
                  <p>{request.project}</p>
                </div>
                <div>
                  <Label>Loan Date</Label>
                  <p>{request.requestedLoanDate}</p>
                </div>
                <div>
                  <Label>Expected Return Date</Label>
                  <p>{request.expectedReturnDate}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={request.priority === 'urgent' ? 'destructive' : 'outline'}>
                    {request.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>Order Type</Label>
                  <Badge variant={isKitOrder(request) ? "default" : "outline"} className="bg-blue-600">
                    {isKitOrder(request) ? 'Kit Order' : 'Individual Items'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partial Return History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Partial Return History ({partialReturnHistory.length} returns)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partialReturnHistory.length > 0 ? (
                <div className="space-y-4">
                  {partialReturnHistory.map((returnRecord) => (
                    <div key={returnRecord.id} className="border rounded-lg p-4 space-y-4">
                      {/* Return Header */}
                      <div className="flex items-center justify-between pb-3 border-b">
                        <div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">Return #{returnRecord.id}</span>
                            <Badge className="bg-green-600">Completed</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Returned on {returnRecord.returnDate} by {returnRecord.returnedBy}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Processed by: {returnRecord.processedBy}</p>
                        </div>
                      </div>

                      {/* Returned Items */}
                      <div>
                        <Label className="text-sm font-medium">Items Returned</Label>
                        <div className="mt-2 space-y-2">
                          {returnRecord.returnedItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-muted rounded-md">
                              <div className="flex items-center space-x-2">
                                <ImageWithFallback
                                  src={item.imageUrl || ''}
                                  alt={item.articleName}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <p className="font-mono text-sm">{item.articleBinCode}</p>
                                  <p className="text-sm font-medium">{item.articleName}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Good Condition</p>
                                <p className="font-medium">{item.quantityGood} units</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Defective</p>
                                <p className="font-medium">{item.quantityDefective} units</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Returned</p>
                                <p className="font-medium">{item.quantityGood + item.quantityDefective} units</p>
                              </div>
                              {item.notes && (
                                <div className="md:col-span-4">
                                  <p className="text-sm text-muted-foreground">Notes: {item.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* General Notes */}
                      {returnRecord.generalNotes && (
                        <div>
                          <Label className="text-sm font-medium">General Notes</Label>
                          <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded-md">
                            {returnRecord.generalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2" />
                  <p>No partial returns recorded for this request</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {request.items.map((item) => {
                  const returnedQuantity = item.returnedQuantity || 0;
                  const remainingQuantity = item.quantity - returnedQuantity;
                  const returnPercentage = (returnedQuantity / item.quantity) * 100;
                  
                  return (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-md">
                      <div className="flex items-center space-x-2">
                        <ImageWithFallback
                          src={item.imageUrl || ''}
                          alt={item.articleName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-mono text-sm">{item.articleBinCode}</p>
                          <p className="text-sm font-medium">{item.articleName}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Originally Borrowed</p>
                        <p className="font-medium">{item.quantity} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Already Returned</p>
                        <p className="font-medium">{returnedQuantity} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining to Return</p>
                        <p className="font-medium">{remainingQuantity} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Return Progress</p>
                        <div className="flex items-center space-x-2">
                          {returnedQuantity > 0 && (
                            <Badge variant={remainingQuantity === 0 ? "default" : "outline"} className={remainingQuantity === 0 ? "bg-green-600" : ""}>
                              {returnPercentage.toFixed(0)}% returned
                            </Badge>
                          )}
                          {returnedQuantity === 0 && (
                            <Badge variant="outline">Not returned yet</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}