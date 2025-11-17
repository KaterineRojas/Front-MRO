import  { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ArrowUpDown } from 'lucide-react';
import { CreateKitPage } from './pages/CreateKitPage';
import { RecordMovementModal } from './modals/RecordMovement/RecordMovementModal';
import { ItemsTab } from './tabs/Items/ItemsTab';
import { KitsTab } from './tabs/Kits/KitsTab';
import { BinManagerTab } from './tabs/BinManager/BinManagerTab';
import { TransactionsTab } from './tabs/transactions/TransactionsTab';
import { LoadingOverlay } from '../../ui/loading-overlay';
import type { Kit, MovementData as ApiMovementData } from './types';
import type { MovementData, MovementType } from './modals/RecordMovement/types';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchArticles,
  fetchKits,
  fetchBins,
  fetchTransactions,
  createArticleAsync,
  updateArticleAsync,
  deleteArticleAsync,
  createKitAsync,
  updateKitAsync,
  deleteKit,
  recordMovementAsync
} from '../../../store/slices/inventorySlice';

export function InventoryManager() {
  const dispatch = useAppDispatch();
  const { articles, kits, error } = useAppSelector((state) => state.inventory);
  const [viewMode, setViewMode] = useState<'items' | 'kits' | 'create-kit' | 'bin-manager' | 'transactions'>('items');
  const [recordMovementOpen, setRecordMovementOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchArticles());
    dispatch(fetchKits());
    dispatch(fetchBins());
    dispatch(fetchTransactions());
  }, [dispatch]);


  const handleCreateItem = async (articleData: {
    name: string;
    description: string;
    category: string;
    unit: string;
    minStock: number;
    consumable: boolean;
    binCode?: string;
    imageFile?: File | null;
  }) => {
    try {
      setIsCreatingItem(true);
      // Add required fields for createArticleAsync
      const payload = {
        ...articleData,
        bins: [],
        sku: '',
        quantityAvailable: 0,
        quantityOnLoan: 0,
        quantityReserved: 0,
        totalPhysical: 0,
        cost: 0,
        status: true,
        createdAt: new Date().toISOString(),
        currentStock: 0,
      };
      await dispatch(createArticleAsync(payload)).unwrap();
      //   Recargar todos los artículos desde el API después de crear
      await dispatch(fetchArticles()).unwrap();
      alert('Item created successfully!');
    } catch (error) {
      console.error('Failed to create article:', error);
      alert('Failed to create item. Please try again.');
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleUpdateItem = async (id: number, articleData: {
    name: string;
    description: string;
    category: string;
    unit: string;
    minStock: number;
    consumable: boolean;
    imageUrl?: string | null;
    imageFile?: File | null;
    sku: string;
  }) => {
    try {
      setIsCreatingItem(true);
      await dispatch(updateArticleAsync({ id, data: articleData })).unwrap();
      //   CRÍTICO: Recargar datos DESPUÉS de que se complete el update
      await dispatch(fetchArticles()).unwrap();
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Failed to update article:', error);
      alert('Failed to update item. Please try again.');
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleDeleteItem = (id: number) => {
    dispatch(deleteArticleAsync(id));
  };

  const handleCreateKit = () => {
    setEditingKit(null);
    setViewMode('create-kit');
  };

  const handleEditKit = (kit: Kit) => {
    setEditingKit(kit);
    setViewMode('create-kit');
  };

  const handleDeleteKit = (id: number) => {
    dispatch(deleteKit(id));
  };

  const handleKitSave = (kitData: Omit<Kit, 'id' | 'createdAt'>) => {
    console.log('🔵 handleKitSave called with:', kitData);
    console.log('🔵 editingKit:', editingKit);

    // Map category to number if needed (for CreateKitRequest)
    // For createKitAsync, use CreateKitRequest type
    const kitDataForCreate = {
      name: kitData.name,
      description: kitData.description,
      category: typeof kitData.category === 'number' ? kitData.category : 0,
      items: kitData.items.map(item => ({
        itemId: item.articleId,
        quantity: item.quantity,
      })),
    };
    // For updateKitAsync, use Partial<Kit> (keep items as KitItem[])
    const kitDataForUpdate = {
      ...kitData,
      category: kitData.category ? String(kitData.category) : '',
    };
    if (editingKit && editingKit.id !== 0) {
      // MODO EDICIÓN - actualizar kit existente
      dispatch(updateKitAsync({ id: editingKit.id, data: kitDataForUpdate }));
      alert('Kit updated successfully!');
    } else {
      // MODO CREACIÓN - crear nuevo kit
      dispatch(createKitAsync(kitDataForCreate));
      alert('Kit created successfully!');
    }

    setViewMode('kits');
    setEditingKit(null);
  };

  const handleBackToKits = () => {
    setViewMode('kits');
    setEditingKit(null);
  };

  const handleRecordMovement = async (movementData: MovementData) => {
    console.log('📤 ========== RECORD MOVEMENT ==========');
    console.log('📤 Movement Data Received:', movementData);


  if (movementData.itemType === 'item') {
      const selectedArticle = articles.find(article => article.id === movementData.articleId);

      if (!selectedArticle) {
        alert('Error: Article not found');
        return;
      }

      console.log('📤 Selected Article:', selectedArticle);

      // Validación para exit/relocation
      if (movementData.movementType === 'exit' || movementData.movementType === 'relocation') {
        const selectedBin = selectedArticle.bins?.find(bin => bin.binId === movementData.articleBinId);

        if (!selectedBin) {
          alert('Error: Selected BIN not found');
          return;
        }

        const quantityToMove = parseInt(movementData.quantity);

        if (quantityToMove > selectedBin.quantity) {
          alert(`Error: Cannot process ${quantityToMove} units. Only ${selectedBin.quantity} units available in BIN ${selectedBin.binCode}.`);
          return;
        }

        console.log('📤 Selected BIN:', selectedBin);
        console.log('📤 Quantity to move:', quantityToMove);
      }

      // Validación para entry
      if (movementData.movementType === 'entry') {
        if (!movementData.newLocationBinId || movementData.newLocationBinId === 0) {
          alert('Error: Please select a destination BIN');
          return;
        }

        if (!movementData.quantity || parseInt(movementData.quantity) <= 0) {
          alert('Error: Please enter a valid quantity');
          return;
        }

        console.log('📤 Entry validation passed');
      }

      // Validación para relocation
      if (movementData.movementType === 'relocation') {
        if (!movementData.newLocationBinId || movementData.newLocationBinId === 0) {
          alert('Error: Please select a destination BIN');
          return;
        }

        if (movementData.articleBinId === movementData.newLocationBinId) {
          alert('Error: Cannot relocate to the same BIN');
          return;
        }

        console.log('📤 Relocation validation passed');
      }

      try {
        // ✅ Dispatch al thunk que llama a recordMovementApi
        console.log('📤 Dispatching recordMovementAsync...');
        // Map movementData to correct type for recordMovementAsync
        const allowedTypes: MovementType[] = ['entry', 'exit', 'relocation'];
        if (!allowedTypes.includes(movementData.movementType)) {
          // Do not dispatch if movementType is not allowed
          alert('Invalid movement type.');
          return;
        }
        
        // Map to ApiMovementData with required fields
        const selectedArticle = articles.find(article => article.id === movementData.articleId);
        const selectedBin = selectedArticle?.bins?.find(bin => bin.binId === movementData.articleBinId);
        
        const mappedMovement: ApiMovementData = {
          itemType: movementData.itemType,
          movementType: movementData.movementType as 'entry' | 'exit' | 'relocation',
          articleSKU: selectedArticle?.sku || '',
          articleBinCode: selectedBin?.binCode || '',
          kitBinCode: movementData.kitBinCode,
          quantity: movementData.quantity,
          unitPrice: '0',
          status: selectedArticle?.status || true,
          newLocation: '',
          notes: movementData.notes,
        };
        await dispatch(recordMovementAsync(mappedMovement)).unwrap();

        // ✅ Recargar datos después del movimiento
        await dispatch(fetchArticles()).unwrap();
        await dispatch(fetchTransactions()).unwrap();

        alert('Movement recorded successfully!');
        console.log('✅ Movement recorded and data refreshed');
      } catch (error) {
        console.error('❌ Failed to record movement:', error);
        alert('Failed to record movement. Please try again.');
      }

    } else if (movementData.itemType === 'kit') {
      // Kit movement (solo relocation)
      if (movementData.movementType !== 'relocation') {
        alert('Error: Kits can only be relocated');
        return;
      }

      if (!movementData.newLocationBinId || movementData.newLocationBinId === 0) {
        alert('Error: Please select a destination BIN');
        return;
      }

      try {
        const allowedTypes: MovementType[] = ['entry', 'exit', 'relocation'];
        const mappedMovement: ApiMovementData = {
          itemType: movementData.itemType,
          movementType: allowedTypes.includes(movementData.movementType) ? (movementData.movementType as 'entry' | 'exit' | 'relocation') : 'relocation',
          articleSKU: '',
          articleBinCode: '',
          kitBinCode: movementData.kitBinCode,
          quantity: movementData.quantity,
          unitPrice: '0',
          status: true,
          newLocation: '',
          notes: movementData.notes,
        };
        await dispatch(recordMovementAsync(mappedMovement)).unwrap();
        await dispatch(fetchKits()).unwrap();
        await dispatch(fetchTransactions()).unwrap();
        alert('Kit relocation recorded successfully!');
      } catch (error) {
        console.error('❌ Failed to record kit movement:', error);
        alert('Failed to record kit movement. Please try again.');
      }
    }
  };

  // // Show loading state
  // if (loading && articles.length === 0) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <p className="text-muted-foreground">Loading inventory data...</p>
  //     </div>
  //   );
  // }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button
            onClick={() => {
              dispatch(fetchArticles());
              dispatch(fetchKits());
              dispatch(fetchBins());
              dispatch(fetchTransactions());
            }}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === 'create-kit') {
    // Remove articles prop, as CreateKitPage does not accept it
    return (
      <CreateKitPage
        editingKit={editingKit}
        onBack={handleBackToKits}
        onSave={handleKitSave}
      />
    );
  }


  return (
    <LoadingOverlay
      isLoading={isCreatingItem}
      message={isCreatingItem ? "Uploading image..." : "Loading..."}
      variant="minimal"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage your inventory articles and track stock levels
            </p>
          </div>
          <Button variant="default" onClick={() => setRecordMovementOpen(true)}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Record Movement
          </Button>
        </div>

        <Tabs
          value={viewMode}
          onValueChange={(value: 'items' | 'kits' | 'create-kit' | 'bin-manager' | 'transactions') => setViewMode(value)}
          className="w-full"
        >
          <TabsList className="w-full !grid !grid-cols-4 gap-1">
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="kits">Kits</TabsTrigger>
            <TabsTrigger value="bin-manager">Bin Manager</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <ItemsTab
              articles={articles}
              onCreateItem={handleCreateItem as any}
              onUpdateItem={handleUpdateItem as any}
              onDeleteItem={handleDeleteItem}
            />
          </TabsContent>

          <TabsContent value="kits" className="space-y-4">
            {/* KitsTab expects Article2[] for articles, but we have Article[]; pass empty array for now */}
            <KitsTab
              articles={[]}
              categories={[]}
              onCreateKit={handleCreateKit}
              onEditKit={handleEditKit as any}
              onUseAsTemplate={(kit: any) => {
                setEditingKit({
                  ...kit,
                  id: 0,
                  binCode: '',
                  quantity: 0,
                  name: `${kit.name} (Copy)`,
                });
                setViewMode('create-kit');
              }}
              onDeleteKit={handleDeleteKit}
            />
          </TabsContent>

          <TabsContent value="bin-manager" className="space-y-4">
            <BinManagerTab />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <TransactionsTab />
          </TabsContent>
        </Tabs>

        <RecordMovementModal
          open={recordMovementOpen}
          onOpenChange={setRecordMovementOpen}
          articles={articles}
          kits={kits}
          onRecordTransaction={handleRecordMovement as any}
          onSuccess={() => {
            // Refresh data after successful transaction
            dispatch(fetchArticles());
            dispatch(fetchKits());
            dispatch(fetchTransactions());
          }}
        />
      </div>
    </LoadingOverlay>
  );
}