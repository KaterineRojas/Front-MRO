import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../ui/dialog';
import { Tabs, TabsContent } from '../../../../ui/tabs';
import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import { Textarea } from '../../../../ui/textarea';
import { Button } from '../../../../ui/button';
import { Save } from 'lucide-react';
import type { Article, Kit } from '../../types';
import type { TransactionFormData, PurchaseRequest, DamagedRequest, StockCorrectionRequest, WarehouseTransferRequest } from './types';
import { MOCK_TRANSACTION_DATA, type TransactionTypesResponse } from './transactionTypes';
import { HelpTab } from './HelpTab';
import {
  createPurchaseApi,
  createDamagedApi,
  createStockCorrectionApi,
  createWarehouseTransferApi,
  // getValidDestinationBins // Temporalmente desactivado - pendiente nueva lógica de bins
} from '../../services/inventoryApi';
import { checkItemOccupation, getAvailableBins } from '../../services/binsService';

// Función temporal mock mientras se migra a la nueva lógica de bins
const getValidDestinationBins = async (_itemId: number, _fromBinId: number): Promise<any[]> => {
  console.warn('⚠️ getValidDestinationBins temporalmente desactivado - pendiente migración a nueva lógica');
  return [];
};

interface RecordMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articles: Article[];
  kits?: Kit[]; // Optional list of kits
  warehouseId?: number; // Warehouse ID for fetching available bins (default: 1)
  onRecordTransaction: (transaction: TransactionFormData) => void;
  onSuccess?: () => void; // Callback to refresh data after successful transaction
}

// Transaction types for Items
const ITEM_TRANSACTION_OPTIONS = [
  {
    value: 'entry-purchase',
    label: 'Entry - Purchase',
    transactionType: 0,
    transactionSubType: 0,
    showFromBin: false,
    showToBin: true
  },
  {
    value: 'exit-damaged',
    label: 'Exit - Damaged',
    transactionType: 1,
    transactionSubType: 1,
    showFromBin: true,
    showToBin: false
  },
  {
    value: 'adjustment-correction',
    label: 'Adjustment - Correction Stock',
    transactionType: 3,
    transactionSubType: 0,
    showFromBin: true,
    showToBin: false
  },
  {
    value: 'relocation-transfer',
    label: 'Transfer - Relocation',
    transactionType: 2,
    transactionSubType: 0,
    showFromBin: true,
    showToBin: true
  }
] as const;

// Transaction types for Kits (only Relocation and Adjustment)
const KIT_TRANSACTION_OPTIONS = [
  {
    value: 'relocation-kit',
    label: 'Relocation - Kit Transfer',
    transactionType: 2,
    transactionSubType: 0,
    showFromBin: true,
    showToBin: true
  },
  {
    value: 'adjustment-kit',
    label: 'Adjustment - Kit Stock',
    transactionType: 3,
    transactionSubType: 0,
    showFromBin: false,
    showToBin: true
  }
] as const;

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
  kits = [],
  warehouseId = 1,
  onRecordTransaction,
  onSuccess
}: RecordMovementModalProps) {
  const [transactionData] = useState<TransactionTypesResponse>(MOCK_TRANSACTION_DATA);
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);
  const [entityType, setEntityType] = useState<'item' | 'kit'>('item'); // New state for entity type
  const [selectedTransactionOption, setSelectedTransactionOption] = useState<string>('entry-purchase');
  const [activeTab, setActiveTab] = useState('transaction');
  const [allBins, setAllBins] = useState<{ id: number; fullCode: string; name: string }[]>([]);
  const [validDestinationBins, setValidDestinationBins] = useState<{ binId: number; binCode: string; binPurpose: string; description: string }[]>([]);

  // Get transaction options based on entity type
  const TRANSACTION_OPTIONS = entityType === 'item' ? ITEM_TRANSACTION_OPTIONS : KIT_TRANSACTION_OPTIONS;

  // Get current transaction option details
  const currentOption = TRANSACTION_OPTIONS.find(opt => opt.value === selectedTransactionOption) || TRANSACTION_OPTIONS[0];

  // Determine if bins should be shown based on current option
  const showFromBin = currentOption.showFromBin;
  const showToBin = currentOption.showToBin;

  // Get bins for selected item or kit
  const selectedArticle = articles.find(a => a.id === formData.itemId);
  const selectedKit = kits.find(k => k.id === formData.kitId);
  const fromBins = selectedArticle?.bins || [];

  // Effect to fetch available bins based on transaction type and entity type
  useEffect(() => {
    const loadAvailableBins = async () => {
      if (entityType === 'kit' || currentOption.transactionType === 0) { // Kit or Entry
        try {
          const bins = await getAvailableBins(warehouseId, true); // warehouseId, isActive=true
          setAllBins(bins.map(bin => ({
            id: bin.id,
            fullCode: bin.binCode,
            name: bin.description
          })));
        } catch (error) {
          console.error('Failed to load available bins:', error);
          // Fallback to collecting bins from articles (formato antiguo)
          const bins = new Set<{ id: number; fullCode: string; name: string }>();
          articles.forEach(article => {
            article.bins.forEach(bin => {
              bins.add({
                id: bin.binId,
                fullCode: bin.binCode,
                name: bin.binCode // En formato antiguo no tenemos name, usamos code
              });
            });
          });
          setAllBins(Array.from(bins));
        }
      } else {
        // For other transaction types, collect bins from articles
        const bins = new Set<{ id: number; fullCode: string; name: string }>();
        articles.forEach(article => {
          article.bins.forEach(bin => {
            bins.add({
              id: bin.binId,
              fullCode: bin.binCode,
              name: bin.binCode // En formato antiguo no tenemos name, usamos code
            });
          });
        });
        setAllBins(Array.from(bins));
      }
    };

    loadAvailableBins();
  }, [articles, currentOption.transactionType, entityType, warehouseId]);

  // Auto-select fromBin for Kit relocations
  useEffect(() => {
    if (entityType === 'kit' && formData.kitId && selectedKit && showFromBin) {
      // For kits, we need to find the bin ID from the binCode
      // Since we don't have direct access to bin mapping, we'll search in allBins
      const kitBin = allBins.find(bin => bin.fullCode === selectedKit.binCode);
      if (kitBin) {
        setFormData(prev => ({ ...prev, fromBinId: kitBin.id }));
      }
    }
  }, [entityType, formData.kitId, selectedKit, showFromBin, allBins]);

  // Auto-select bin for Entry (Purchase) transactions when item is selected
  useEffect(() => {
    const checkAndAutoSelectBin = async () => {
      // Solo ejecutar para transacciones de tipo Entry (Purchase) cuando se selecciona un item
      if (entityType === 'item' && currentOption.value === 'entry-purchase' && formData.itemId > 0) {
        try {
          console.log(`🔍 Checking occupation for item ${formData.itemId}...`);
          const occupation = await checkItemOccupation(formData.itemId);
          
          if (occupation && occupation.isOccupied && occupation.occupiedBin) {
            // Item has a bin assigned, auto-select it
            const binId = occupation.occupiedBin.id;
            setFormData(prev => ({ ...prev, toBinId: binId }));
            console.log(`✅ Auto-selected bin ${occupation.occupiedBin.binCode} (ID: ${binId}) for item ${formData.itemId}`);

            // Load just this bin for display in the dropdown
            setAllBins([{
              id: occupation.occupiedBin.id,
              fullCode: occupation.occupiedBin.binCode, // binCode ya viene en formato jerárquico (WH01-ZA-R01-L01-B01)
              name: occupation.occupiedBin.description
            }]);
          } else {
            // Item doesn't have a bin assigned yet, load available bins
            console.log(`ℹ️ Item ${formData.itemId} does not have a bin assigned (isOccupied: ${occupation?.isOccupied}), loading available bins...`);
            setFormData(prev => ({ ...prev, toBinId: undefined }));

            try {
              const bins = await getAvailableBins(warehouseId, true); // warehouseId, isActive=true
              setAllBins(bins.map(bin => ({
                id: bin.id,
                fullCode: bin.binCode, // binCode ya viene transformado desde el servicio (fullCode del API)
                name: bin.description // description ya viene transformado desde el servicio (name del API)
              })));
              console.log(`✅ Loaded ${bins.length} available bins`);
            } catch (error) {
              console.error('⚠️ Failed to load available bins:', error);
              setAllBins([]);
            }
          }
        } catch (error) {
          console.error('❌ Failed to check item occupation:', error);
          setFormData(prev => ({ ...prev, toBinId: undefined }));
        }
      }
    };

    checkAndAutoSelectBin();
  }, [formData.itemId, currentOption.value, entityType, warehouseId]);

  // Reset form when entity type changes
  useEffect(() => {
    // Reset form data and transaction option when switching between item and kit
    setFormData(initialFormData);
    if (entityType === 'item') {
      setSelectedTransactionOption('entry-purchase');
    } else {
      setSelectedTransactionOption('relocation-kit');
    }
  }, [entityType]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setEntityType('item');
      setSelectedTransactionOption('entry-purchase');
      setActiveTab('transaction');
      setValidDestinationBins([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validation
    if (entityType === 'item' && formData.itemId === 0) {
      alert('Please select an item');
      return;
    }

    if (entityType === 'kit' && !formData.kitId) {
      alert('Please select a kit');
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

    // Update formData with current transaction type and subtype
    const updatedFormData: TransactionFormData = {
      ...formData,
      transactionType: currentOption.transactionType,
      transactionSubType: currentOption.transactionSubType
    };

    // Handle Item transactions
    if (entityType === 'item') {
      try {
        // Purchase transaction (Entry - Purchase)
        if (currentOption.value === 'entry-purchase') {
          const purchaseData: PurchaseRequest = {
            itemId: updatedFormData.itemId,
            binId: updatedFormData.toBinId!,
            quantity: updatedFormData.quantity,
            unitCost: 0, // Default value since field is not in the form
            notes: updatedFormData.notes
          };

          await createPurchaseApi(purchaseData);
          alert('Purchase transaction created successfully!');
        }

        // Damaged transaction (Exit - Damaged)
        else if (currentOption.value === 'exit-damaged') {
          const damagedData: DamagedRequest = {
            itemId: updatedFormData.itemId,
            binId: updatedFormData.fromBinId!,
            quantity: updatedFormData.quantity,
            damageDescription: updatedFormData.notes || 'Damaged item',
            notes: updatedFormData.notes
          };

          await createDamagedApi(damagedData);
          alert('Damaged transaction created successfully!');
        }

        // Stock correction transaction (Adjustment - Correction Stock)
        else if (currentOption.value === 'adjustment-correction') {
          const correctionData: StockCorrectionRequest = {
            itemId: updatedFormData.itemId,
            binId: updatedFormData.fromBinId!,
            quantity: updatedFormData.quantity,
            notes: updatedFormData.notes || ''
          };

          await createStockCorrectionApi(correctionData);
          alert('Stock correction created successfully!');
        }

        // Warehouse transfer transaction (Relocation - Warehouse Transfer)
        else if (currentOption.value === 'relocation-transfer') {
          const transferData: WarehouseTransferRequest = {
            itemId: updatedFormData.itemId,
            fromBinId: updatedFormData.fromBinId!,
            toBinId: updatedFormData.toBinId!,
            quantity: updatedFormData.quantity,
            notes: updatedFormData.notes
          };

          await createWarehouseTransferApi(transferData);
          alert('Warehouse transfer created successfully!');
        }

        // Call success callback to refresh data
        if (onSuccess) {
          onSuccess();
        }

        // Reset form and close modal
        setFormData(initialFormData);
        setSelectedTransactionOption('entry-purchase');
        setValidDestinationBins([]);
        onOpenChange(false);
      } catch (error) {
        // Extract backend error message
        const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction. Please try again.';
        alert(errorMessage);
      }
      return;
    }

    // Call the parent handler for Kit transactions
    onRecordTransaction(updatedFormData);

    // Call success callback to refresh data
    if (onSuccess) {
      onSuccess();
    }

    // Reset form and close modal
    setFormData(initialFormData);
    setSelectedTransactionOption('entry-purchase');
    setValidDestinationBins([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setSelectedTransactionOption('entry-purchase');
    setValidDestinationBins([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="mb-4 flex-shrink-0">
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>
            Record inventory movements and transactions for items in the warehouse
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            <TabsTrigger value="help">
              <BookOpen className="h-4 w-4 mr-2" />
              Help
            </TabsTrigger>
          </TabsList> */}

          <TabsContent value="transaction" className="space-y-4 mt-4">
            {/* Entity Type Selector (Item or Kit) */}
            <div className="space-y-2">
              <Label htmlFor="entityType">Transaction For *</Label>
              <Select
                value={entityType}
                onValueChange={(value: 'item' | 'kit') => {
                  setEntityType(value);
                  setFormData(initialFormData);
                  setValidDestinationBins([]);
                }}
              >
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="item">Item</SelectItem>
                  {/*<SelectItem value="kit">Kit</SelectItem>*/}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Select
                value={selectedTransactionOption}
                onValueChange={(value: string) => {
                  setSelectedTransactionOption(value);
                  // Reset bin selections when changing transaction type
                  setFormData(prev => ({
                    ...prev,
                    fromBinId: undefined,
                    toBinId: undefined
                  }));
                  setValidDestinationBins([]);
                }}
              >
                <SelectTrigger id="transactionType">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Selection - Show only when entityType is 'item' */}
            {entityType === 'item' && (
              <div className="space-y-2">
                <Label htmlFor="item">Item *</Label>
                <Select
                  value={formData.itemId > 0 ? formData.itemId.toString() : ''}
                  onValueChange={(value: string) => {
                    setFormData(prev => ({
                      ...prev,
                      itemId: parseInt(value),
                      fromBinId: undefined,
                      toBinId: undefined
                    }));
                    setValidDestinationBins([]);
                  }}
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
            )}

            {/* Kit Selection - Show only when entityType is 'kit' */}
            {entityType === 'kit' && (
              <div className="space-y-2">
                <Label htmlFor="kit">Kit *</Label>
                <Select
                  value={formData.kitId ? formData.kitId.toString() : ''}
                  onValueChange={(value: string) => setFormData(prev => ({
                    ...prev,
                    kitId: parseInt(value),
                    fromBinId: undefined
                  }))}
                >
                  <SelectTrigger id="kit">
                    <SelectValue placeholder="Select a kit" />
                  </SelectTrigger>
                  <SelectContent>
                    {kits.map(kit => (
                      <SelectItem key={`kit-${kit.id}`} value={kit.id.toString()}>
                        {kit.sku} - {kit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                {entityType === 'item' ? (
                  <Select
                    value={formData.fromBinId?.toString() || ''}
                    onValueChange={async (value: string) => {
                      const fromBinId = parseInt(value);
                      setFormData(prev => ({ ...prev, fromBinId, toBinId: undefined }));

                      // If this is a warehouse transfer, fetch valid destination bins
                      if (currentOption.value === 'relocation-transfer' && formData.itemId) {
                        try {
                          const destinations = await getValidDestinationBins(formData.itemId, fromBinId);
                          setValidDestinationBins(destinations);
                        } catch (error) {
                          console.error('Failed to load valid destination bins:', error);
                          setValidDestinationBins([]);
                        }
                      }
                    }}
                    disabled={!formData.itemId}
                  >
                    <SelectTrigger id="fromBin">
                      <SelectValue placeholder={formData.itemId ? "Select source bin" : "Select an item first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {fromBins.map((bin, index) => (
                        <SelectItem key={`from-bin-${bin.binId}-${index}`} value={bin.binId.toString()}>
                          {bin.binCode} - Qty: {bin.quantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="fromBin"
                    value={selectedKit?.binCode || ''}
                    disabled
                    placeholder={selectedKit ? selectedKit.binCode : "Select a kit first"}
                  />
                )}
              </div>
            )}

            {/* To Bin - Conditional */}
            {showToBin && (
              <div className="space-y-2">
                <Label htmlFor="toBin">To Bin *</Label>
                <Select
                  value={formData.toBinId ? formData.toBinId.toString() : ''}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, toBinId: parseInt(value) }))}
                  disabled={currentOption.value === 'relocation-transfer' && !formData.fromBinId}
                >
                  <SelectTrigger id="toBin">
                    <SelectValue placeholder={
                      currentOption.value === 'relocation-transfer' && !formData.fromBinId
                        ? "Select from bin first"
                        : "Select destination bin"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {currentOption.value === 'relocation-transfer' && validDestinationBins.length > 0 ? (
                      // For warehouse transfers, use valid destination bins
                      validDestinationBins.map((bin, index) => (
                        <SelectItem key={`to-bin-${bin.binId}-${index}`} value={bin.binId.toString()}>
                          {bin.binCode} - {bin.description}
                        </SelectItem>
                      ))
                    ) : currentOption.value !== 'relocation-transfer' ? (
                      // For other transactions, use all bins
                      allBins.map((bin, index) => (
                        <SelectItem key={`to-bin-${bin.id}-${index}`} value={bin.id.toString()}>
                          {bin.fullCode} - {bin.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No valid destination bins</SelectItem>
                    )}
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
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes or observations..."
                rows={3}
                autoComplete="off"
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}