import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { getCategories } from '../../../../inventory/services/inventoryApi';
import { createArticleApi } from '../../../../inventory/services/inventoryApi';
import { getCatalogItemsByWarehouse, type CatalogItem, type Warehouse } from '../../../services/sharedServices';
import type { Article } from '../../../../inventory/types';
import type { PurchaseItem, PurchaseFormData, ItemSearches, DropdownState, FilteredItems } from '../types';
import type { ApiPayload } from '../../../../inventory/modals/CreateItemModal/CreateItemModal';

interface UseNewItemModalReturn {
  newItemModalOpen: boolean;
  setNewItemModalOpen: (open: boolean) => void;
  pendingNewItemIndex: number | null;
  inventoryCategories: { value: string; label: string; apiValue?: string }[];
  inventoryCategoriesLoading: boolean;
  creatingInventoryItem: boolean;
  handleCreateItemModalOpenChange: (open: boolean) => void;
  handleNewInventoryItemSubmit: (articleData: ApiPayload) => void;
  initiateNewItemCreation: (
    index: number,
    currentItem: PurchaseItem,
    currentSearch: string,
    callbacks: {
      applyItemTypeToggle: (index: number, isExisting: boolean) => void;
      showConfirm: (config: any) => void;
      hideModal: () => void;
    }
  ) => void;
  setCatalogItems: React.Dispatch<React.SetStateAction<CatalogItem[]>>;
}

interface UseNewItemModalParams {
  formData: PurchaseFormData;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseFormData>>;
  setItemSearches: React.Dispatch<React.SetStateAction<ItemSearches>>;
  setDropdownOpen: React.Dispatch<React.SetStateAction<DropdownState>>;
  setFilteredItems: React.Dispatch<React.SetStateAction<FilteredItems>>;
  warehouses: Warehouse[];
  warehouseId: string;
}

export function useNewItemModal({
  formData,
  setFormData,
  setItemSearches,
  setDropdownOpen,
  setFilteredItems,
  warehouses,
  warehouseId
}: UseNewItemModalParams): UseNewItemModalReturn {
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [pendingNewItemIndex, setPendingNewItemIndex] = useState<number | null>(null);
  const [pendingItemSnapshot, setPendingItemSnapshot] = useState<PurchaseItem | null>(null);
  const [pendingItemSearchSnapshot, setPendingItemSearchSnapshot] = useState<string>('');
  const [inventoryCategories, setInventoryCategories] = useState<{ value: string; label: string; apiValue?: string }[]>([]);
  const [inventoryCategoriesLoading, setInventoryCategoriesLoading] = useState(false);
  const [creatingInventoryItem, setCreatingInventoryItem] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  
  const createItemModalSubmittedRef = useRef(false);
  const inventoryCategoriesLoadedRef = useRef(false);

  const mapArticleToCatalogItem = useCallback((article: Article): CatalogItem | null => {
    if (!warehouseId) {
      return null;
    }
    const warehouse = warehouses.find(wh => wh.id === warehouseId);
    return {
      id: article.id.toString(),
      name: article.name,
      sku: article.sku,
      description: article.description || '',
      image: article.imageUrl || '',
      category: article.category || 'General',
      availableQuantity: article.quantityAvailable ?? 0,
      totalQuantity: article.totalPhysical ?? article.quantityAvailable ?? 0,
      warehouseId: warehouseId,
      warehouseName: warehouse?.name ?? `Warehouse ${warehouseId}`,
    };
  }, [warehouseId, warehouses]);

  const restoreItemFromSnapshot = useCallback(() => {
    if (pendingNewItemIndex === null || !pendingItemSnapshot) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === pendingNewItemIndex ? { ...pendingItemSnapshot } : item
      )
    }));

    setItemSearches(prev => ({
      ...prev,
      [pendingNewItemIndex]: pendingItemSearchSnapshot
    }));

    setDropdownOpen(prev => ({
      ...prev,
      [pendingNewItemIndex]: false
    }));

    setPendingNewItemIndex(null);
    setPendingItemSnapshot(null);
    setPendingItemSearchSnapshot('');
  }, [pendingNewItemIndex, pendingItemSnapshot, pendingItemSearchSnapshot, setFormData, setItemSearches, setDropdownOpen]);

  const ensureInventoryCategories = useCallback(async () => {
    if (inventoryCategoriesLoadedRef.current || inventoryCategoriesLoading) {
      return;
    }
    setInventoryCategoriesLoading(true);
    try {
      const categoriesResult = await getCategories();
      setInventoryCategories(categoriesResult);
      inventoryCategoriesLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading inventory categories:', error);
      toast.error('Failed to load inventory categories');
    } finally {
      setInventoryCategoriesLoading(false);
    }
  }, [inventoryCategoriesLoading]);

  const handleCreateItemModalOpenChange = useCallback((open: boolean) => {
    setNewItemModalOpen(open);
    if (!open) {
      if (!createItemModalSubmittedRef.current) {
        restoreItemFromSnapshot();
      }
      createItemModalSubmittedRef.current = false;
    }
  }, [restoreItemFromSnapshot]);

  const processNewInventoryItem = useCallback(async (articleData: ApiPayload) => {
    if (pendingNewItemIndex === null) {
      return;
    }

    setCreatingInventoryItem(true);
    try {
      const createdArticle = await createArticleApi({
        name: articleData.name,
        description: articleData.description,
        category: articleData.category,
        unit: articleData.unit,
        minStock: articleData.minStock,
        consumable: articleData.consumable,
        binCode: articleData.binCode ?? '',
        imageFile: articleData.imageFile ?? undefined,
      });

      let catalogUpdated = false;
      if (warehouseId) {
        try {
          const refreshedItems = await getCatalogItemsByWarehouse(warehouseId, true);
          setCatalogItems(refreshedItems);
          catalogUpdated = true;
        } catch (refreshError) {
          console.error('Failed to refresh catalog items:', refreshError);
        }
      }

      if (!catalogUpdated) {
        const mappedItem = mapArticleToCatalogItem(createdArticle);
        if (mappedItem) {
          setCatalogItems(prev => {
            const exists = prev.some(item => item.id === mappedItem.id);
            if (exists) {
              return prev.map(item => (item.id === mappedItem.id ? mappedItem : item));
            }
            return [...prev, mappedItem];
          });
        }
      }

      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, idx) =>
          idx === pendingNewItemIndex
            ? {
                ...item,
                isExisting: true,
                name: createdArticle.name,
                createdItemId: createdArticle.id,
              }
            : item
        )
      }));

      setItemSearches(prev => ({
        ...prev,
        [pendingNewItemIndex]: createdArticle.name
      }));

      setDropdownOpen(prev => ({
        ...prev,
        [pendingNewItemIndex]: false
      }));

      setFilteredItems(prev => {
        const next = { ...prev };
        delete next[pendingNewItemIndex];
        return next;
      });

      toast.success('Inventory item registered successfully.');

      setPendingNewItemIndex(null);
      setPendingItemSnapshot(null);
      setPendingItemSearchSnapshot('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to register the new item.';
      toast.error(message);
      restoreItemFromSnapshot();
    } finally {
      createItemModalSubmittedRef.current = false;
      setCreatingInventoryItem(false);
    }
  }, [warehouseId, mapArticleToCatalogItem, pendingNewItemIndex, restoreItemFromSnapshot, setFormData, setItemSearches, setDropdownOpen, setFilteredItems]);

  const handleNewInventoryItemSubmit = useCallback((articleData: ApiPayload) => {
    createItemModalSubmittedRef.current = true;
    void processNewInventoryItem(articleData);
  }, [processNewInventoryItem]);

  const initiateNewItemCreation = useCallback((
    index: number,
    currentItem: PurchaseItem,
    currentSearch: string,
    callbacks: {
      applyItemTypeToggle: (index: number, isExisting: boolean) => void;
      showConfirm: (config: any) => void;
      hideModal: () => void;
    }
  ) => {
    if (creatingInventoryItem) {
      toast.info('Finish the current item registration before continuing.');
      return;
    }

    if (newItemModalOpen) {
      toast.info('Finish the current new item setup first.');
      return;
    }

    setPendingItemSnapshot({ ...currentItem });
    setPendingItemSearchSnapshot(currentSearch);
    
    callbacks.showConfirm({
      title: 'Create a new inventory item?',
      description:
        'Switching to New will register this purchase as a brand-new inventory item shared across all warehouses. Make sure the item is not already in the catalog before continuing.',
      type: 'warning',
      confirmText: 'Continue',
      cancelText: 'Keep existing',
      onConfirm: () => {
        callbacks.hideModal();
        setPendingNewItemIndex(index);
        createItemModalSubmittedRef.current = false;
        callbacks.applyItemTypeToggle(index, false);
        void ensureInventoryCategories();
        setNewItemModalOpen(true);
      }
    });
  }, [creatingInventoryItem, newItemModalOpen, ensureInventoryCategories]);

  return {
    newItemModalOpen,
    setNewItemModalOpen,
    pendingNewItemIndex,
    inventoryCategories,
    inventoryCategoriesLoading,
    creatingInventoryItem,
    handleCreateItemModalOpenChange,
    handleNewInventoryItemSubmit,
    initiateNewItemCreation,
    setCatalogItems
  };
}
