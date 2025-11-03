import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../ui/tabs';
import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Textarea } from '../../../../ui/textarea';
import { Button } from '../../../../ui/button';
import { BookOpen, Save } from 'lucide-react';
import type { Article } from '../../types';
import type { TransactionFormData, PurchaseRequest } from './types';
import { MOCK_TRANSACTION_DATA, type TransactionTypesResponse } from './transactionTypes';
import { HelpTab } from './HelpTab';
import { checkItemOccupation, checkKitOccupation, getAvailableBins } from '../../services/binsService';
import { createPurchaseApi } from '../../services/inventoryApi';

interface RecordMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articles: Article[];
  onRecordTransaction: (transaction: TransactionFormData) => void;
  onSuccess?: () => void; // Callback to refresh data after successful transaction
}

const initialFormData: TransactionFormData = {
  transactionType: 0,
  transactionSubType: 0,
  itemId: 0,
  quantity: 0,
  fromBinId: undefined,
  toBinId: undefined,
  notes: '',
  transactionDate: undefined,
  unitCost: 0
};

export function RecordMovementModal({
  open,
  onOpenChange,
  articles,
  onRecordTransaction,
  onSuccess
}: RecordMovementModalProps) {
  const [transactionData, setTransactionData] = useState<TransactionTypesResponse>(MOCK_TRANSACTION_DATA);
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState('transaction');
  const [allBins, setAllBins] = useState<{ id: number; code: string; purpose: string }[]>([]);

  // Mock user role - In production, this would come from auth context
  const isAdmin = true; // Change to false to hide date/time picker

  // Get filtered sub-types based on selected transaction type
  const filteredSubTypes = transactionData.subTypes.filter(
    subType => subType.category === transactionData.types.find(t => t.value === formData.transactionType)?.name
  );

  // Get bins for selected item
  const selectedArticle = articles.find(a => a.id === formData.itemId);
  const fromBins = selectedArticle?.bins || [];

  // Effect to fetch available bins for Entry transactions
  useEffect(() => {
    const loadAvailableBins = async () => {
      if (formData.transactionType === 0) { // Entry
        try {
          const bins = await getAvailableBins(0, true); // binPurpose=0 (GoodCondition), isActive=true
          setAllBins(bins.map(bin => ({
            id: bin.id,
            code: bin.binCode,
            purpose: bin.type
          })));
        } catch (error) {
          console.error('Failed to load available bins:', error);
          // Fallback to collecting bins from articles
          const bins = new Set<{ id: number; code: string; purpose: string }>();
          articles.forEach(article => {
            article.bins.forEach(bin => {
              if (bin.binPurpose === 'GoodCondition') {
                bins.add({
                  id: bin.binId,
                  code: bin.binCode,
                  purpose: bin.binPurpose
                });
              }
            });
          });
          setAllBins(Array.from(bins));
        }
      } else {
        // For other transaction types, collect bins from articles
        const bins = new Set<{ id: number; code: string; purpose: string }>();
        articles.forEach(article => {
          article.bins.forEach(bin => {
            bins.add({
              id: bin.binId,
              code: bin.binCode,
              purpose: bin.binPurpose
            });
          });
        });
        setAllBins(Array.from(bins));
      }
    };

    loadAvailableBins();
  }, [articles, formData.transactionType]);

  // Auto-select bin for Entry transactions when item is selected
  useEffect(() => {
    const checkAndAutoSelectBin = async () => {
      if (formData.transactionType === 0 && formData.itemId > 0) { // Entry and item selected
        try {
          const occupation = await checkItemOccupation(formData.itemId);
          if (occupation && occupation.isOccupied) {
            // Item has a bin assigned, auto-select it
            const binId = occupation.occupiedBin.id;
            setFormData(prev => ({ ...prev, toBinId: binId }));
            console.log(`Auto-selected bin ${occupation.occupiedBin.binCode} for item ${formData.itemId}`);

            // Load just this bin for display
            setAllBins([{
              id: occupation.occupiedBin.id,
              code: occupation.occupiedBin.binCode,
              purpose: occupation.occupiedBin.binPurposeDisplay
            }]);
          } else {
            // Item doesn't have a bin, load available bins
            console.log(`Item ${formData.itemId} is not occupied, loading available bins...`);
            setFormData(prev => ({ ...prev, toBinId: undefined }));

            try {
              const bins = await getAvailableBins(0, true); // binPurpose=0 (GoodCondition), isActive=true
              setAllBins(bins.map(bin => ({
                id: bin.id,
                code: bin.binCode,
                purpose: bin.type
              })));
              console.log(`Loaded ${bins.length} available bins`);
            } catch (error) {
              console.error('Failed to load available bins:', error);
            }
          }
        } catch (error) {
          console.error('Failed to check item occupation:', error);
        }
      }
    };

    checkAndAutoSelectBin();
  }, [formData.itemId, formData.transactionType]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setActiveTab('transaction');
    }
  }, [open]);

  // Reset sub-type when transaction type changes
  useEffect(() => {
    if (filteredSubTypes.length > 0 && !filteredSubTypes.find(st => st.value === formData.transactionSubType)) {
      setFormData(prev => ({ ...prev, transactionSubType: filteredSubTypes[0].value }));
    }
  }, [formData.transactionType, filteredSubTypes]);

  // Determine if From Bin should be shown
  const showFromBin = formData.transactionType === 1 || formData.transactionType === 2; // Exit or Transfer

  // Determine if To Bin should be shown
  const showToBin = formData.transactionType === 0 || formData.transactionType === 2; // Entry or Transfer

  // Check if current transaction is a Purchase
  const isPurchase = formData.transactionType === 0 && formData.transactionSubType === 0;

  const handleSubmit = async () => {
    // Validation
    if (formData.itemId === 0) {
      alert('Please select an item');
      return;
    }

    if (formData.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (showFromBin && !formData.fromBinId) {
      alert('Please select a source bin');
      return;
    }

    if (showToBin && !formData.toBinId) {
      alert('Please select a destination bin');
      return;
    }

    // Purchase-specific handling
    if (isPurchase) {
      // Call Purchase API
      try {
        const purchaseData: PurchaseRequest = {
          itemId: formData.itemId,
          binId: formData.toBinId!,
          quantity: formData.quantity,
          unitCost: 0, // Default value since field is not in the form
          notes: formData.notes
        };

        await createPurchaseApi(purchaseData);
        alert('Purchase transaction created successfully!');

        // Call success callback to refresh data
        if (onSuccess) {
          onSuccess();
        }

        // Reset form and close modal
        setFormData(initialFormData);
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to create purchase:', error);
        alert('Failed to create purchase transaction. Please try again.');
      }
      return;
    }

    // Call the parent handler for non-Purchase transactions
    onRecordTransaction(formData);

    // Call success callback to refresh data
    if (onSuccess) {
      onSuccess();
    }

    // Reset form and close modal
    setFormData(initialFormData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>
            Record inventory movements and transactions for items in the warehouse
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            <TabsTrigger value="help">
              <BookOpen className="h-4 w-4 mr-2" />
              Help
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transaction" className="space-y-4 mt-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Select
                value={formData.transactionType.toString()}
                onValueChange={(value: string) => setFormData(prev => ({
                  ...prev,
                  transactionType: parseInt(value),
                  fromBinId: undefined,
                  toBinId: undefined
                }))}
              >
                <SelectTrigger id="transactionType">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionData.types.map(type => (
                    <SelectItem key={`type-${type.value}`} value={type.value.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Sub-Type */}
            <div className="space-y-2">
              <Label htmlFor="transactionSubType">Transaction Sub-Type *</Label>
              <Select
                value={formData.transactionSubType.toString()}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, transactionSubType: parseInt(value) }))}
              >
                <SelectTrigger id="transactionSubType">
                  <SelectValue placeholder="Select sub-type" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubTypes.map(subType => (
                    <SelectItem key={`subtype-${subType.value}`} value={subType.value.toString()}>
                      {subType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Selection */}
            <div className="space-y-2">
              <Label htmlFor="item">Item *</Label>
              <Select
                value={formData.itemId > 0 ? formData.itemId.toString() : ''}
                onValueChange={(value: string) => setFormData(prev => ({
                  ...prev,
                  itemId: parseInt(value),
                  fromBinId: undefined
                }))}
              >
                <SelectTrigger id="item">
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {articles.map(article => (
                    <SelectItem key={`item-${article.id}`} value={article.id.toString()}>
                      {article.sku} - {article.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="1"
                value={formData.quantity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                placeholder="Enter quantity"
              />
            </div>

            {/* From Bin - Conditional */}
            {showFromBin && (
              <div className="space-y-2">
                <Label htmlFor="fromBin">From Bin *</Label>
                <Select
                  value={formData.fromBinId?.toString() || ''}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, fromBinId: parseInt(value) }))}
                  disabled={!formData.itemId}
                >
                  <SelectTrigger id="fromBin">
                    <SelectValue placeholder={formData.itemId ? "Select source bin" : "Select an item first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {fromBins.map((bin, index) => (
                      <SelectItem key={`from-bin-${bin.binId}-${index}`} value={bin.binId.toString()}>
                        {bin.binCode} ({bin.binPurpose}) - Qty: {bin.quantity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* To Bin - Conditional */}
            {showToBin && (
              <div className="space-y-2">
                <Label htmlFor="toBin">To Bin *</Label>
                <Select
                  value={formData.toBinId ? formData.toBinId.toString() : ''}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, toBinId: parseInt(value) }))}
                >
                  <SelectTrigger id="toBin">
                    <SelectValue placeholder="Select destination bin" />
                  </SelectTrigger>
                  <SelectContent>
                    {allBins.map((bin, index) => (
                      <SelectItem key={`to-bin-${bin.id}-${index}`} value={bin.id.toString()}>
                        {bin.code} ({bin.purpose})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Purchase-specific fields */}
            {/* {isPurchase && (
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitCost || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter unit cost"
                />
              </div>
            )} */}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes or observations..."
                rows={3}
              />
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Transaction
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="help">
            <HelpTab transactionData={transactionData} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}