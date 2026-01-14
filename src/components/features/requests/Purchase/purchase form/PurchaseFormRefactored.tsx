import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { submitPurchaseRequest } from '../../../../../store/slices/purchaseSlice';
import { ConfirmModal, useConfirmModal } from '../../../../ui/confirm-modal';
import { CreateItemModal, type ApiPayload } from '../../../inventory/modals/CreateItemModal/CreateItemModal';
import { updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { getCatalogItemsByWarehouse, type CatalogItem } from '../../services/sharedServices';
import { type CreatePurchaseRequestPayload } from '../purchaseService';

// Types
import type { 
  PurchaseFormProps, 
  PurchaseFormData, 
  PurchaseItem,
  ItemSearches,
  DropdownState,
  FilteredItems,
  CartSnapshot 
} from './types';

// Utils
import {
  buildInitialFormData,
  buildInitialItemSearches,
  createDefaultPurchaseItem,
  mapCartItemToPurchaseItem,
  validateUrl,
  calculateTotalCost,
  REASON_MAP
} from './utils';

// Hooks
import { useWarehouseData, useCompanyData } from './hooks';

// Components
import { ItemsCard, DetailsCard, FormHeader, FormActions } from './components';

export function PurchaseForm({ 
  currentUser, 
  onBack, 
  initialRequest, 
  cartItems, 
  cartSnapshot, 
  clearCart 
}: PurchaseFormProps) {
  // Form state
  const [formData, setFormData] = useState<PurchaseFormData>(() => 
    buildInitialFormData(currentUser, initialRequest, cartItems, cartSnapshot)
  );
  const [itemSearches, setItemSearches] = useState<ItemSearches>(() => 
    buildInitialItemSearches(initialRequest, cartItems, cartSnapshot)
  );
  const [filteredItems, setFilteredItems] = useState<FilteredItems>({});
  const [dropdownOpen, setDropdownOpen] = useState<DropdownState>({});
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const previousPurchaseReasonRef = useRef<string>('');
  const snapshotAppliedRef = useRef(false);

  // New item modal state
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [pendingNewItemIndex, setPendingNewItemIndex] = useState<number | null>(null);
  const [pendingItemSnapshot, setPendingItemSnapshot] = useState<PurchaseItem | null>(null);
  const [pendingItemSearchSnapshot, setPendingItemSearchSnapshot] = useState<string>('');
  const createItemModalSubmittedRef = useRef(false);
  const inventoryCategoriesLoadedRef = useRef(false);
  const [inventoryCategories, setInventoryCategories] = useState<{ value: string; label: string; apiValue?: string }[]>([]);
  const [inventoryCategoriesLoading, setInventoryCategoriesLoading] = useState(false);
  const [creatingInventoryItem, setCreatingInventoryItem] = useState(false);

  // Redux
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(state => state.purchase.submitting);
  const authUser = useAppSelector(state => state.auth.user);
  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();

  // Custom hooks
  const { warehouses, catalogItems: initialCatalogItems } = useWarehouseData(formData.warehouseId);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  
  const companyData = useCompanyData({
    company: formData.company,
    customer: formData.customer,
    project: formData.project
  });

  // Sync catalog items from hook
  useEffect(() => {
    setCatalogItems(initialCatalogItems);
  }, [initialCatalogItems]);

  // Derived values
  const isEditing = Boolean(initialRequest);
  const cartItemsCount = cartItems?.length ?? 0;
  const submitLabel = isEditing
    ? (submitting ? 'Saving changes...' : 'Save Changes')
    : (submitting ? 'Submitting...' : 'Submit Purchase Request');

  // Set default warehouse
  useEffect(() => {
    if (warehouses.length > 0 && !formData.warehouseId) {
      setFormData(prev => ({ ...prev, warehouseId: warehouses[0].id }));
    }
  }, [warehouses, formData.warehouseId]);

  // Apply cart snapshot
  useEffect(() => {
    if (initialRequest || snapshotAppliedRef.current) return;

    const applySnapshot = (snapshot: CartSnapshot): boolean => {
      if (!snapshot?.items?.length) return false;

      setFormData(prev => ({
        ...prev,
        items: snapshot.items.map(mapCartItemToPurchaseItem),
        warehouseId: snapshot.warehouseId ? String(snapshot.warehouseId) : prev.warehouseId
      }));

      setItemSearches(() => {
        const searches: ItemSearches = {};
        snapshot.items.forEach((ci, index) => {
          searches[index] = ci.item.name;
        });
        return searches;
      });

      snapshotAppliedRef.current = true;
      return true;
    };

    if (cartSnapshot && applySnapshot(cartSnapshot)) {
      sessionStorage.removeItem('purchaseCartSnapshot');
      return;
    }

    if (cartItems?.length) {
      const snapshotFromItems: CartSnapshot = {
        items: cartItems,
        warehouseId: cartItems[0]?.warehouseId ?? ''
      };
      if (applySnapshot(snapshotFromItems)) {
        sessionStorage.removeItem('purchaseCartSnapshot');
        return;
      }
    }

    const snapshotRaw = sessionStorage.getItem('purchaseCartSnapshot');
    if (snapshotRaw) {
      try {
        const parsed = JSON.parse(snapshotRaw) as CartSnapshot;
        applySnapshot(parsed);
      } catch (error) {
        console.error('Failed to parse purchaseCartSnapshot', error);
      } finally {
        sessionStorage.removeItem('purchaseCartSnapshot');
      }
    }
  }, [initialRequest, cartSnapshot, cartItems]);

  // Update filtered items when catalog or selections change
  useEffect(() => {
    const nextFiltered: FilteredItems = {};
    formData.items.forEach((item, index) => {
      if (!item.isExisting) return;
      const selectedNames = formData.items
        .map((it, idx) => (idx !== index && it.isExisting ? it.name : null))
        .filter((name): name is string => Boolean(name));
      nextFiltered[index] = catalogItems.filter(ci => !selectedNames.includes(ci.name));
    });
    setFilteredItems(nextFiltered);
  }, [catalogItems, formData.items]);

  // Close dropdown on outside click
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

  // Reset form when editing an existing request
  useEffect(() => {
    if (!initialRequest) return;

    setFormData(buildInitialFormData(currentUser, initialRequest));
    setItemSearches(buildInitialItemSearches(initialRequest));
    const initialReason = initialRequest?.reasonId ?? (initialRequest as any)?.reason;
    previousPurchaseReasonRef.current = initialReason && initialReason !== 'urgent'
      ? String(initialReason)
      : '';
    setDropdownOpen({});
  }, [initialRequest, currentUser]);

  // Item handlers
  const handleItemSearch = useCallback((index: number, value: string) => {
    if (!formData.warehouseId) {
      toast.error('Select a warehouse first.');
      return;
    }

    setItemSearches(prev => ({ ...prev, [index]: value }));

    const selectedNames = formData.items
      .map((item, idx) => (idx !== index && item.isExisting ? item.name : null))
      .filter((name): name is string => Boolean(name));

    const baseItems = catalogItems.filter(item => !selectedNames.includes(item.name));

    const filtered = value.length >= 2
      ? baseItems.filter(item =>
          item.name.toLowerCase().includes(value.toLowerCase()) ||
          item.sku.toLowerCase().includes(value.toLowerCase()) ||
          item.description.toLowerCase().includes(value.toLowerCase())
        )
      : baseItems;

    setFilteredItems(prev => ({ ...prev, [index]: filtered }));
    setDropdownOpen(prev => ({ ...prev, [index]: true }));
  }, [formData.warehouseId, formData.items, catalogItems]);

  const selectExistingItem = useCallback((index: number, item: CatalogItem) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === index ? { ...it, name: item.name } : it)
    }));
    setItemSearches(prev => ({ ...prev, [index]: item.name }));
    setDropdownOpen(prev => ({ ...prev, [index]: false }));
  }, []);

  const toggleDropdown = useCallback((index: number) => {
    if (!formData.warehouseId) {
      toast.error('Select a warehouse first.');
      return;
    }

    const currentItem = formData.items[index];
    if (!currentItem.isExisting) return;

    const selectedNames = formData.items
      .map((item, idx) => (idx !== index && item.isExisting ? item.name : null))
      .filter((name): name is string => Boolean(name));

    const baseItems = catalogItems.filter(item => !selectedNames.includes(item.name));

    setFilteredItems(prev => ({ ...prev, [index]: baseItems }));
    setDropdownOpen(prev => ({ ...prev, [index]: !prev[index] }));
  }, [formData.warehouseId, formData.items, catalogItems]);

  const addNewItem = useCallback(() => {
    const newIndex = formData.items.length;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, createDefaultPurchaseItem()]
    }));
    setItemSearches(prev => ({ ...prev, [newIndex]: '' }));
    const selectedNames = formData.items
      .map(item => (item.isExisting ? item.name : null))
      .filter((name): name is string => Boolean(name));
    const availableItems = catalogItems.filter(item => !selectedNames.includes(item.name));
    setFilteredItems(prev => ({ ...prev, [newIndex]: availableItems }));
    setDropdownOpen(prev => ({ ...prev, [newIndex]: false }));
  }, [formData.items, catalogItems]);

  const removeItem = useCallback((index: number) => {
    if (formData.items.length <= 1) return;
    
    if (index < cartItemsCount) {
      const cartItemId = cartItems?.[index]?.item.id;
      if (cartItemId) {
        dispatch(removeFromCart(cartItemId));
      }
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
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
  }, [formData.items.length, cartItemsCount, cartItems, dispatch]);

  const updateItem = useCallback((index: number, field: keyof PurchaseItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));

    if (index < cartItemsCount && field === 'quantity') {
      const cartItemId = cartItems?.[index]?.item.id;
      if (cartItemId) {
        dispatch(updateCartItem({ itemId: cartItemId, quantity: value }));
      }
    }
  }, [cartItemsCount, cartItems, dispatch]);

  // Warehouse change handler
  const handleWarehouseChange = useCallback((value: string) => {
    if (formData.warehouseId === value) return;

    const hadSelections = formData.items.some(item => item.name);

    setFormData(prev => ({
      ...prev,
      warehouseId: value,
      items: [createDefaultPurchaseItem()]
    }));
    setItemSearches({ 0: '' });
    setDropdownOpen({});
    setFilteredItems({});

    if (hadSelections) {
      toast.warning('The list of items was reset because you changed the warehouse.');
    }
  }, [formData.warehouseId, formData.items]);

  // Item type toggle helpers
  const applyItemTypeToggle = useCallback((index: number, isExisting: boolean) => {
    let updatedItems: PurchaseItem[] = [];

    setFormData(prev => {
      updatedItems = prev.items.map((item, i) =>
        i === index
          ? { ...item, isExisting, name: '', createdItemId: undefined }
          : item
      );
      return { ...prev, items: updatedItems };
    });

    setItemSearches(prev => ({ ...prev, [index]: '' }));
    setDropdownOpen(prev => ({ ...prev, [index]: false }));
    setFilteredItems(prev => {
      const next = { ...prev };
      if (isExisting) {
        const selectedNames = updatedItems
          .map((item, idx) => (idx !== index && item.isExisting ? item.name : null))
          .filter((name): name is string => Boolean(name));
        next[index] = catalogItems.filter(item => !selectedNames.includes(item.name));
      } else {
        delete next[index];
      }
      return next;
    });
  }, [catalogItems]);

  const ensureInventoryCategories = useCallback(async () => {
    if (inventoryCategoriesLoadedRef.current || inventoryCategoriesLoading) return;
    
    setInventoryCategoriesLoading(true);
    try {
      const { getCategories } = await import('../../../inventory/services/inventoryApi');
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

  const restoreItemFromSnapshot = useCallback(() => {
    if (pendingNewItemIndex === null || !pendingItemSnapshot) return;

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

    setDropdownOpen(prev => ({ ...prev, [pendingNewItemIndex]: false }));

    setPendingNewItemIndex(null);
    setPendingItemSnapshot(null);
    setPendingItemSearchSnapshot('');
  }, [pendingNewItemIndex, pendingItemSnapshot, pendingItemSearchSnapshot]);

  const handleItemTypeToggle = useCallback((index: number, isExisting: boolean) => {
    if (creatingInventoryItem) {
      toast.info('Finish the current item registration before continuing.');
      return;
    }

    if (!isExisting) {
      if (newItemModalOpen) {
        toast.info('Finish the current new item setup first.');
        return;
      }

      const currentItem = formData.items[index];
      setPendingItemSnapshot({ ...currentItem });
      setPendingItemSearchSnapshot(itemSearches[index] ?? currentItem.name ?? '');
      
      showConfirm({
        title: 'Create a new inventory item?',
        description: 'Switching to New will register this purchase as a brand-new inventory item shared across all warehouses. Make sure the item is not already in the catalog before continuing.',
        type: 'warning',
        confirmText: 'Continue',
        cancelText: 'Keep existing',
        onConfirm: () => {
          hideModal();
          setPendingNewItemIndex(index);
          createItemModalSubmittedRef.current = false;
          applyItemTypeToggle(index, isExisting);
          void ensureInventoryCategories();
          setNewItemModalOpen(true);
        }
      });
      return;
    }

    applyItemTypeToggle(index, isExisting);
    setPendingNewItemIndex(null);
    setPendingItemSnapshot(null);
    setPendingItemSearchSnapshot('');
  }, [creatingInventoryItem, newItemModalOpen, formData.items, itemSearches, showConfirm, hideModal, applyItemTypeToggle, ensureInventoryCategories]);

  const handleCreateItemModalOpenChange = useCallback((open: boolean) => {
    setNewItemModalOpen(open);
    if (!open && !createItemModalSubmittedRef.current) {
      restoreItemFromSnapshot();
    }
    if (!open) {
      createItemModalSubmittedRef.current = false;
    }
  }, [restoreItemFromSnapshot]);

  const handleNewInventoryItemSubmit = useCallback(async (articleData: ApiPayload) => {
    if (pendingNewItemIndex === null) return;

    createItemModalSubmittedRef.current = true;
    setCreatingInventoryItem(true);

    try {
      const { createArticleApi } = await import('../../../inventory/services/inventoryApi');
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

      // Refresh catalog items
      if (formData.warehouseId) {
        try {
          const refreshedItems = await getCatalogItemsByWarehouse(formData.warehouseId, true);
          setCatalogItems(refreshedItems);
        } catch (refreshError) {
          console.error('Failed to refresh catalog items:', refreshError);
        }
      }

      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, idx) =>
          idx === pendingNewItemIndex
            ? { ...item, isExisting: true, name: createdArticle.name, createdItemId: createdArticle.id }
            : item
        )
      }));

      setItemSearches(prev => ({ ...prev, [pendingNewItemIndex]: createdArticle.name }));
      setDropdownOpen(prev => ({ ...prev, [pendingNewItemIndex]: false }));
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
  }, [pendingNewItemIndex, formData.warehouseId, restoreItemFromSnapshot]);

  // Form field handlers
  const handleSelfPurchaseChange = useCallback((value: string) => {
    const isSelfPurchase = value === 'self';
    setFormData(prev => {
      if (isSelfPurchase) {
        if (prev.purchaseReason && prev.purchaseReason !== 'urgent') {
          previousPurchaseReasonRef.current = prev.purchaseReason;
        }
        return { ...prev, selfPurchase: true, purchaseReason: 'urgent' };
      }

      const restoredReason = prev.purchaseReason === 'urgent'
        ? previousPurchaseReasonRef.current || ''
        : prev.purchaseReason;

      return { ...prev, selfPurchase: false, purchaseReason: restoredReason };
    });
  }, []);

  const handleClientBilledToggle = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, clientBilled: checked ? 'yes' : 'no' }));
  }, []);

  const handlePurchaseReasonChange = useCallback((value: string) => {
    setFormData(prev => {
      if (!prev.selfPurchase) {
        previousPurchaseReasonRef.current = value;
        return { ...prev, purchaseReason: value };
      }
      return prev;
    });
  }, []);

  const handleCompanyChange = useCallback((value: string) => {
    setFormData(prev => {
      if (prev.company === value) return prev;
      return { ...prev, company: value, customer: '', project: '', workOrder: '' };
    });
  }, []);

  const handleCustomerChange = useCallback((value: string) => {
    setFormData(prev => {
      if (prev.customer === value) return prev;
      return { ...prev, customer: value, project: '', workOrder: '' };
    });
  }, []);

  const handleProjectChange = useCallback((value: string) => {
    setFormData(prev => {
      if (prev.project === value) return prev;
      return { ...prev, project: value, workOrder: '' };
    });
  }, []);

  const handleWorkOrderChange = useCallback((value: string) => {
    setFormData(prev => {
      if (prev.workOrder === value) return prev;
      return { ...prev, workOrder: value };
    });
  }, []);

  const handleFormDataChange = useCallback((field: keyof PurchaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const getTotalCost = useCallback(() => calculateTotalCost(formData.items), [formData.items]);

  // Submit handler
  const submitPurchase = useCallback(async (payload: CreatePurchaseRequestPayload) => {
    try {
      await dispatch(submitPurchaseRequest(payload)).unwrap();
      toast.success(isEditing ? 'Purchase request updated successfully' : 'Purchase request submitted successfully');
      if (!isEditing && clearCart) {
        clearCart();
      }
      if (onBack) onBack();
    } catch (error) {
      const message = typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : 'Failed to submit purchase request';
      toast.error(message);
    }
  }, [dispatch, isEditing, clearCart, onBack]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.department) {
      toast.error('Please provide the department');
      return;
    }

    if (!formData.warehouseId) {
      toast.error('Please select a warehouse');
      return;
    }

    const selectedWarehouse = warehouses.find(wh => wh.id === formData.warehouseId);
    if (!selectedWarehouse) {
      toast.error('Selected warehouse is no longer available');
      return;
    }

    if (!formData.project) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.purchaseReason) {
      toast.error('Please select a purchase reason');
      return;
    }

    for (const item of formData.items) {
      if (!item.name) {
        toast.error('Please complete all item names before submitting');
        return;
      }

      if (item.link && !validateUrl(item.link)) {
        toast.error(`Invalid URL for item: ${item.name}`);
        return;
      }
    }

    if (formData.googleMapsUrl && !validateUrl(formData.googleMapsUrl)) {
      toast.error('Please enter a valid location URL');
      return;
    }

    if (!formData.company) {
      toast.error('Please select a company');
      return;
    }

    if (!formData.customer) {
      toast.error('Please select a customer');
      return;
    }

    if (!formData.expectedDeliveryDate) {
      toast.error('Please select an expected delivery date');
      return;
    }

    const requesterId = authUser?.employeeId || currentUser.employeeId || '';
    if (!requesterId) {
      toast.error('Requester information is missing');
      return;
    }

    const warehouseIdNumber = Number(formData.warehouseId);
    if (Number.isNaN(warehouseIdNumber)) {
      toast.error('Selected warehouse is invalid');
      return;
    }

    const reasonValue = REASON_MAP[formData.purchaseReason];
    if (typeof reasonValue === 'undefined') {
      toast.error('Invalid purchase reason');
      return;
    }

    const totalCost = getTotalCost();
    const payloadItems: CreatePurchaseRequestPayload['items'] = [];

    for (const item of formData.items) {
      const catalogMatch = catalogItems.find(ci => ci.name === item.name);
      const numericCatalogId = catalogMatch ? Number(catalogMatch.id) : NaN;

      let resolvedItemId: number;
      if (item.isExisting) {
        if (!catalogMatch || Number.isNaN(numericCatalogId)) {
          toast.error(`Unable to determine catalog item for ${item.name}`);
          return;
        }
        resolvedItemId = numericCatalogId;
      } else if (typeof item.createdItemId === 'number' && Number.isFinite(item.createdItemId)) {
        resolvedItemId = item.createdItemId;
      } else {
        resolvedItemId = 0;
      }

      payloadItems.push({
        itemId: resolvedItemId,
        quantity: item.quantity,
        productUrl: item.link || undefined
      });
    }

    const selectedCustomer = companyData.customers.find(customer => customer.name === formData.customer);
    const selectedProject = companyData.projects.find(project => project.name === formData.project);

    const payload: CreatePurchaseRequestPayload = {
      requesterId,
      clientBilled: formData.clientBilled === 'yes',
      companyId: formData.company,
      customerId: selectedCustomer?.id?.toString() ?? formData.customer,
      departmentId: formData.department,
      projectId: selectedProject?.id ?? formData.project,
      workOrderId: formData.workOrder,
      address: formData.address || '',
      googleMapsUrl: formData.googleMapsUrl || '',
      zipCode: formData.zipCode || '',
      reason: reasonValue,
      selfPurchase: formData.selfPurchase,
      notes: formData.justification,
      expectedDeliveryDate: new Date(formData.expectedDeliveryDate).toISOString(),
      estimatedTotalCost: totalCost,
      warehouseId: warehouseIdNumber,
      items: payloadItems
    };

    const warehouseLabel = selectedWarehouse.name ?? selectedWarehouse.code ?? selectedWarehouse.id;
    const companyLabel = payload.companyId;
    const customerLabel = selectedCustomer?.name ?? payload.customerId;
    const projectLabel = selectedProject?.name ?? payload.projectId;
    const itemsCount = payload.items.length;
    const descriptionLines = [
      `Warehouse: ${warehouseLabel}`,
      `Company: ${companyLabel}`,
      `Customer: ${customerLabel}`,
      `Project: ${projectLabel}`,
      `Items: ${itemsCount}`,
      `Estimated total: ${totalCost.toFixed(2)}`
    ].join('\n');

    showConfirm({
      title: 'Submit purchase request?',
      description: descriptionLines,
      type: 'warning',
      confirmText: isEditing ? 'Save' : 'Submit',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: () => {
        hideModal();
        void submitPurchase(payload);
      }
    });
  }, [formData, warehouses, authUser, currentUser, catalogItems, companyData, getTotalCost, showConfirm, hideModal, isEditing, submitPurchase]);

  // Render user not available state
  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">User information not available</p>
          <Button variant="outline" onClick={onBack ?? undefined} className="mt-4">
            ← Back to Requests
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <FormHeader onBack={onBack} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ItemsCard
              formData={formData}
              warehouses={warehouses}
              catalogItems={catalogItems}
              itemSearches={itemSearches}
              filteredItems={filteredItems}
              dropdownOpen={dropdownOpen}
              dropdownRefs={dropdownRefs}
              onWarehouseChange={handleWarehouseChange}
              onItemSearch={handleItemSearch}
              onSelectExistingItem={selectExistingItem}
              onToggleDropdown={toggleDropdown}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              onAddNewItem={addNewItem}
              onItemTypeToggle={handleItemTypeToggle}
              getTotalCost={getTotalCost}
            />

            <DetailsCard
              formData={formData}
              companies={companyData.companies}
              customers={companyData.customers}
              projects={companyData.projects}
              workOrders={companyData.workOrders}
              loadingCompanies={companyData.loadingCompanies}
              loadingCustomers={companyData.loadingCustomers}
              loadingProjects={companyData.loadingProjects}
              loadingWorkOrders={companyData.loadingWorkOrders}
              companiesLoaded={companyData.companiesLoaded}
              onLoadCompanies={companyData.loadCompanies}
              onSelfPurchaseChange={handleSelfPurchaseChange}
              onClientBilledToggle={handleClientBilledToggle}
              onPurchaseReasonChange={handlePurchaseReasonChange}
              onCompanyChange={handleCompanyChange}
              onCustomerChange={handleCustomerChange}
              onProjectChange={handleProjectChange}
              onWorkOrderChange={handleWorkOrderChange}
              onFormDataChange={handleFormDataChange}
            />
          </div>

          <FormActions
            onBack={onBack}
            submitting={submitting}
            submitLabel={submitLabel}
          />
        </form>
      </div>

      <CreateItemModal
        open={newItemModalOpen}
        onOpenChange={handleCreateItemModalOpenChange}
        editingArticle={null}
        onSubmit={handleNewInventoryItemSubmit}
        categories={inventoryCategories}
        categoriesLoading={inventoryCategoriesLoading}
      />

      <ConfirmModal
        open={modalState.open}
        onOpenChange={setModalOpen}
        title={modalState.title}
        description={modalState.description}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        showCancel={modalState.showCancel}
        retryable={modalState.retryable}
      />
    </>
  );
}

export default PurchaseForm;
