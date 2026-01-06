import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Switch } from '../../../ui/switch';
import { ArrowLeft, Plus, X, AlertTriangle, Calendar, ClipboardList, Building, User, FolderOpen, Hash, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { toast } from 'sonner';
import type { User as UserType } from '../../enginner/types';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { submitPurchaseRequest } from '../../../../store/slices/purchaseSlice';
import { ConfirmModal, useConfirmModal } from '../../../ui/confirm-modal';
import {
  getWarehouses,
  getCatalogItemsByWarehouse,
  getCompanies,
  getCustomersByCompany,
  getProjectsByCustomer,
  getWorkOrdersByProject,
  type Warehouse,
  type CatalogItem,
  type Company,
  type Customer,
  type Project,
  type WorkOrder
} from '../services/sharedServices';
import { type PurchaseRequest, type CreatePurchaseRequestPayload } from './purchaseService';

interface PurchaseFormProps {
  currentUser: UserType;
  onBack: (() => void) | null;
  initialRequest?: PurchaseRequest | null;
}

interface PurchaseItem {
  name: string;
  isExisting: boolean;
  quantity: number;
  estimatedCost: number;
  link: string;
}

interface PurchaseFormData {
  items: PurchaseItem[];
  department: string;
  project: string;
  selfPurchase: boolean; 
  warehouseId: string;
  purchaseReason: string;
  expectedDeliveryDate: string;
  clientBilled: 'yes' | 'no';
  company: string;
  customer: string;
  projectReference: string;
  workOrder: string;
  justification: string;
  address: string;
  googleMapsUrl: string;
  zipCode: string;
}

const createDefaultPurchaseItem = (): PurchaseItem => ({
  name: '',
  isExisting: true,
  quantity: 1,
  estimatedCost: 0,
  link: ''
});

const buildInitialFormData = (
  user: UserType,
  request?: PurchaseRequest | null
): PurchaseFormData => ({
  items: request
    ? request.items.map((item) => ({
        name: item.name,
        isExisting: true,
        quantity: item.quantity,
        estimatedCost: item.estimatedCost ?? 0,
        link: item.productUrl ?? ''
      }))
    : [createDefaultPurchaseItem()],
  department: request?.departmentId || user.departmentId || user.department || '',
  project: request?.projectName || '',
  selfPurchase: request?.selfPurchase ?? false,
  warehouseId: request?.warehouseId ? String(request.warehouseId) : '',
  purchaseReason: request?.reasonId !== undefined ? String(request.reasonId) : '',
  expectedDeliveryDate: request?.expectedDeliveryDate ?? '',
  clientBilled: request?.clientBilled ? 'yes' : 'no',
  company: request?.companyId ?? '',
  customer: request?.customerId ?? '',
  projectReference: '',
  workOrder: request?.workOrderId ?? '',
  justification: request?.notes || '',
  address: '',
  googleMapsUrl: '',
  zipCode: ''
});

const buildInitialItemSearches = (request?: PurchaseRequest | null) => {
  const searches: { [key: number]: string } = {};
  if (!request) return searches;
  request.items.forEach((item, index) => {
    searches[index] = item.name;
  });
  return searches;
};

export function PurchaseForm({ currentUser, onBack, initialRequest }: PurchaseFormProps) {
  const [formData, setFormData] = useState<PurchaseFormData>(() => buildInitialFormData(currentUser, initialRequest));

  const [itemSearches, setItemSearches] = useState<{ [key: number]: string }>(() => buildInitialItemSearches(initialRequest));
  const [filteredItems, setFilteredItems] = useState<{ [key: number]: CatalogItem[] }>({});
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>({});
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const previousPurchaseReasonRef = useRef<string>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);
  const isEditing = Boolean(initialRequest);
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(state => state.purchase.submitting);
  const authUser = useAppSelector(state => state.auth.user);
  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();
  const submitLabel = isEditing
    ? (submitting ? 'Saving changes...' : 'Save Changes')
    : (submitting ? 'Submitting...' : 'Submit Purchase Request');
  // Load warehouses on mount
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const whData = await getWarehouses();
        setWarehouses(whData);

        if (whData.length > 0) {
          setFormData(prev => {
            if (prev.warehouseId) {
              return prev;
            }
            return { ...prev, warehouseId: whData[0].id };
          });
        }
      } catch (error) {
        toast.error('Failed to load warehouses');
      }
    };

    void loadWarehouses();
  }, []);

  useEffect(() => {
    if (!formData.warehouseId) {
      setCatalogItems([]);
      setFilteredItems({});
      return;
    }

    const loadCatalogItems = async () => {
      try {
        const items = await getCatalogItemsByWarehouse(formData.warehouseId);
        setCatalogItems(items);
      } catch (error) {
        toast.error('Failed to load items for the selected warehouse');
      }
    };

    void loadCatalogItems();
  }, [formData.warehouseId]);

  useEffect(() => {
    // Keep dropdown options aligned with current catalog selections
    const nextFiltered: { [key: number]: CatalogItem[] } = {};

    formData.items.forEach((item, index) => {
      if (!item.isExisting) {
        return;
      }

      const selectedNames = formData.items
        .map((it, idx) => (idx !== index && it.isExisting ? it.name : null))
        .filter((name): name is string => Boolean(name));

      nextFiltered[index] = catalogItems.filter(ci => !selectedNames.includes(ci.name));
    });

    setFilteredItems(nextFiltered);
  }, [catalogItems, formData.items]);

  const loadCompanies = React.useCallback(async () => {
    if (companiesLoaded || loadingCompanies) return;
    setLoadingCompanies(true);
    try {
      const companyData = await getCompanies();
      setCompanies(companyData);
      setCompaniesLoaded(true);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  }, [companiesLoaded, loadingCompanies]);

  useEffect(() => {
    if (formData.company && !companiesLoaded) {
      void loadCompanies();
    }
  }, [formData.company, companiesLoaded, loadCompanies]);

  useEffect(() => {
    setCustomers([]);
    setProjects([]);
    setWorkOrders([]);

    if (!formData.company) {
      setLoadingCustomers(false);
      return;
    }

    let isActive = true;
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const customerData = await getCustomersByCompany(formData.company);
        if (isActive) {
          setCustomers(customerData);
        }
      } catch (error) {
        if (isActive) {
          toast.error('Failed to load customers');
        }
      } finally {
        if (isActive) {
          setLoadingCustomers(false);
        }
      }
    };

    void fetchCustomers();

    return () => {
      isActive = false;
    };
  }, [formData.company]);

  useEffect(() => {
    setProjects([]);
    setWorkOrders([]);

    if (!formData.customer || !formData.company) {
      setLoadingProjects(false);
      return;
    }

    let isActive = true;
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const projectData = await getProjectsByCustomer(formData.company, formData.customer);
        if (isActive) {
          setProjects(projectData);
        }
      } catch (error) {
        if (isActive) {
          toast.error('Failed to load projects');
        }
      } finally {
        if (isActive) {
          setLoadingProjects(false);
        }
      }
    };

    void fetchProjects();

    return () => {
      isActive = false;
    };
  }, [formData.company, formData.customer]);

  useEffect(() => {
    setWorkOrders([]);

    if (!formData.project || !formData.company || !formData.customer) {
      setLoadingWorkOrders(false);
      return;
    }

    let isActive = true;
    const fetchWorkOrders = async () => {
      setLoadingWorkOrders(true);
      try {
        const workOrderData = await getWorkOrdersByProject(formData.company, formData.customer, formData.project);
        if (isActive) {
          setWorkOrders(workOrderData);
        }
      } catch (error) {
        if (isActive) {
          toast.error('Failed to load work orders');
        }
      } finally {
        if (isActive) {
          setLoadingWorkOrders(false);
        }
      }
    };

    void fetchWorkOrders();

    return () => {
      isActive = false;
    };
  }, [formData.company, formData.customer, formData.project]);

  useEffect(() => {
    setFormData(buildInitialFormData(currentUser, initialRequest));
    setItemSearches(buildInitialItemSearches(initialRequest));
    const initialReason = initialRequest?.reasonId ?? (initialRequest as any)?.reason;
    previousPurchaseReasonRef.current = initialReason && initialReason !== 'urgent'
      ? String(initialReason)
      : '';
    setDropdownOpen({});
    setCustomers([]);
    setProjects([]);
    setWorkOrders([]);
  }, [initialRequest, currentUser]);

  // Close dropdown when clicking outside
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

  const handleItemSearch = (index: number, value: string) => {
    if (!formData.warehouseId) {
      toast.error('Select a warehouse first.');
      return;
    }

    setItemSearches(prev => ({ ...prev, [index]: value }));

    const selectedNames = formData.items
      .map((item, idx) => (idx !== index && item.isExisting ? item.name : null))
      .filter((name): name is string => Boolean(name));

    const baseItems = catalogItems.filter(item => !selectedNames.includes(item.name));

    const filtered =
      value.length >= 2
        ? baseItems.filter(item =>
            item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.sku.toLowerCase().includes(value.toLowerCase()) ||
            item.description.toLowerCase().includes(value.toLowerCase())
          )
        : baseItems;

    setFilteredItems(prev => ({ ...prev, [index]: filtered }));
    setDropdownOpen(prev => ({ ...prev, [index]: true }));
  };

  const selectExistingItem = (index: number, item: CatalogItem) => {
    updateItem(index, 'name', item.name);
    setItemSearches(prev => ({ ...prev, [index]: item.name }));
    setDropdownOpen(prev => ({ ...prev, [index]: false }));
  };

  const toggleDropdown = (index: number) => {
    if (!formData.warehouseId) {
      toast.error('Select a warehouse first.');
      return;
    }

    const currentItem = formData.items[index];
    if (!currentItem.isExisting) {
      return;
    }

    const selectedNames = formData.items
      .map((item, idx) => (idx !== index && item.isExisting ? item.name : null))
      .filter((name): name is string => Boolean(name));

    const baseItems = catalogItems.filter(item => !selectedNames.includes(item.name));

    setFilteredItems(prev => ({ ...prev, [index]: baseItems }));
    setDropdownOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const addNewItem = () => {
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
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
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
    }
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getTotalCost = () => {
    return formData.items.reduce((sum, item) => sum + (item.estimatedCost * item.quantity), 0);
  };

  const submitPurchase = async (payload: CreatePurchaseRequestPayload) => {
    try {
      await dispatch(submitPurchaseRequest(payload)).unwrap();
      toast.success(isEditing ? 'Purchase request updated successfully' : 'Purchase request submitted successfully');
      if (onBack) onBack();
    } catch (error) {
      const message = typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : 'Failed to submit purchase request';
      toast.error(message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    const reasonMap: Record<string, 0 | 1 | 2> = {
      'low-stock': 0,
      'urgent': 1,
      'new-project': 2
    };

    const reasonValue = reasonMap[formData.purchaseReason];
    if (typeof reasonValue === 'undefined') {
      toast.error('Invalid purchase reason');
      return;
    }

    const totalCost = getTotalCost();
    const payloadItems: CreatePurchaseRequestPayload['items'] = [];

    for (const item of formData.items) {
      const catalogMatch = catalogItems.find(ci => ci.name === item.name);
      const numericItemId = catalogMatch ? Number(catalogMatch.id) : 0;

      if (item.isExisting && (!catalogMatch || Number.isNaN(numericItemId))) {
        toast.error(`Unable to determine catalog item for ${item.name}`);
        return;
      }

      payloadItems.push({
        itemId: Number.isNaN(numericItemId) ? 0 : numericItemId,
        quantity: item.quantity,
        productUrl: item.link || undefined
      });
    }

    const selectedCustomer = customers.find(customer => customer.name === formData.customer);
    const selectedProject = projects.find(project => project.name === formData.project);

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
  };

  const handleSelfPurchaseChange = (value: string) => {
    const isSelfPurchase = value === 'self';
    setFormData(prev => {
      if (isSelfPurchase) {
        if (prev.purchaseReason && prev.purchaseReason !== 'urgent') {
          previousPurchaseReasonRef.current = prev.purchaseReason;
        }
        return {
          ...prev,
          selfPurchase: true,
          purchaseReason: 'urgent'
        };
      }

      const restoredReason =
        prev.purchaseReason === 'urgent'
          ? previousPurchaseReasonRef.current || ''
          : prev.purchaseReason;

      return {
        ...prev,
        selfPurchase: false,
        purchaseReason: restoredReason
      };
    });
  };

  const handleClientBilledToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      clientBilled: checked ? 'yes' : 'no'
    }));
  };

  const handleItemTypeToggle = (index: number, isExisting: boolean) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
            ? {
                ...item,
                isExisting,
                name: ''
              }
          : item
      )
    }));

    setItemSearches(prev => ({ ...prev, [index]: '' }));
    setDropdownOpen(prev => ({ ...prev, [index]: false }));
    setFilteredItems(prev => {
      const next = { ...prev };
      if (isExisting) {
        const selectedNames = formData.items
          .map((item, idx) => (idx !== index && item.isExisting ? item.name : null))
          .filter((name): name is string => Boolean(name));
        next[index] = catalogItems.filter(item => !selectedNames.includes(item.name));
      } else {
        delete next[index];
      }
      return next;
    });
  };

  const handlePurchaseReasonChange = (value: string) => {
    setFormData(prev => {
      if (!prev.selfPurchase) {
        previousPurchaseReasonRef.current = value;
        return { ...prev, purchaseReason: value };
      }

      return prev;
    });
  };

  const handleWarehouseChange = (value: string) => {
    if (formData.warehouseId === value) {
      return;
    }

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
  };

  const handleCompanyChange = (value: string) => {
    setFormData(prev => {
      if (prev.company === value) return prev;
      return {
        ...prev,
        company: value,
        customer: '',
        project: '',
        workOrder: ''
      };
    });
  };

  const handleCustomerChange = (value: string) => {
    setFormData(prev => {
      if (prev.customer === value) return prev;
      return {
        ...prev,
        customer: value,
        project: '',
        workOrder: ''
      };
    });
  };

  const handleProjectChange = (value: string) => {
    setFormData(prev => {
      if (prev.project === value) return prev;
      return {
        ...prev,
        project: value,
        workOrder: ''
      };
    });
  };

  const handleWorkOrderChange = (value: string) => {
    setFormData(prev => {
      if (prev.workOrder === value) return prev;
      return { ...prev, workOrder: value };
    });
  };

  return (
    <>
      <div className="space-y-6">
      {/* Header estilo Kits: Botón a la izquierda, título a su lado */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Purchase Form</h1>
          <p className="text-sm text-muted-foreground">
            Request the acquisition of new items
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="flex flex-col h-[calc(100vh-16rem)]">
            <CardHeader>
              <CardTitle>Items to Purchase</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div>
                <Label>Warehouse</Label>
                <Select value={formData.warehouseId} onValueChange={handleWarehouseChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.code ? `${warehouse.name} (${warehouse.code})` : warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {formData.items.map((item, index) => {
                  const selectedExistingItem = item.isExisting ? catalogItems.find(ci => ci.name === item.name) : null;

                  return (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">Item {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase text-muted-foreground">New</span>
                            <Switch
                              checked={item.isExisting}
                              onCheckedChange={(checked: boolean) => handleItemTypeToggle(index, checked)}
                              aria-label="Toggle item type"
                            />
                            <span className="text-xs uppercase text-muted-foreground">Existing</span>
                          </div>
                        </div>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-4">
                          <div className="flex items-center gap-3">
                            {selectedExistingItem && (
                              <ImageWithFallback
                                src={selectedExistingItem.image}
                                alt={selectedExistingItem.name}
                                className="h-16 w-16 rounded object-cover border"
                              />
                            )}
                            <div className="flex-1">
                              <Label>Item Name</Label>
                              {item.isExisting ? (
                                <div className="space-y-2 relative" ref={(el) => { if (el) dropdownRefs.current[index] = el; }}>
                                  <Input
                                    placeholder={item.name ? "Click to change selection..." : "Type to search existing items..."}
                                    value={itemSearches[index] || ''}
                                    onChange={(e) => handleItemSearch(index, e.target.value)}
                                    onClick={() => toggleDropdown(index)}
                                    readOnly={!!item.name}
                                    className={item.name ? "cursor-pointer" : ""}
                                  />
                                  {dropdownOpen[index] && (
                                    <div className="absolute z-10 w-full border rounded-md bg-background shadow-lg max-h-40 overflow-y-auto">
                                      {(filteredItems[index] || catalogItems).length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                          No items found matching "{itemSearches[index]}"
                                        </div>
                                      ) : (
                                        (filteredItems[index] || catalogItems).map((catalogItem) => (
                                          <button
                                            key={catalogItem.id}
                                            type="button"
                                            className={`w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center gap-2 ${
                                              item.name === catalogItem.name ? 'bg-accent' : ''
                                            }`}
                                            onClick={() => selectExistingItem(index, catalogItem)}
                                          >
                                            <ImageWithFallback
                                              src={catalogItem.image}
                                              alt={catalogItem.name}
                                              className="w-8 h-8 object-cover rounded"
                                            />
                                            <span>{catalogItem.name}</span>
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Input
                                  placeholder="Enter new item name..."
                                  value={item.name}
                                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                                  required
                                />
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg bg-card/60 p-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="flex flex-col gap-2">
                                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Quantity</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity === 0 ? '' : item.quantity}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                      updateItem(index, 'quantity', 0);
                                    } else {
                                      const numValue = parseInt(value);
                                      if (!isNaN(numValue) && numValue >= 1) {
                                        updateItem(index, 'quantity', numValue);
                                      }
                                    }
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value === '' || item.quantity === 0) {
                                      updateItem(index, 'quantity', 1);
                                    }
                                  }}
                                  placeholder="Enter quantity"
                                  required
                                />
                              </div>

                              <div className="flex flex-col gap-2">
                                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Estimated Cost (per unit)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={item.estimatedCost === 0 ? '' : item.estimatedCost}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                      updateItem(index, 'estimatedCost', 0);
                                    } else {
                                      updateItem(index, 'estimatedCost', parseFloat(value) || 0);
                                    }
                                  }}
                                  required
                                />
                              </div>

                              <div className="flex flex-col gap-2">
                                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Total Cost</Label>
                                <div className="flex h-10 items-center justify-center rounded-md border bg-muted px-3 text-sm font-semibold">
                                  {`$${(item.estimatedCost * item.quantity).toFixed(2)}`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Label>Reference Link (optional)</Label>
                          <Input
                            type="url"
                            placeholder="https://example.com/product"
                            value={item.link}
                            onChange={(e) => updateItem(index, 'link', e.target.value)}
                          />
                          {item.link && !validateUrl(item.link) && (
                            <p className="text-sm text-destructive mt-1">
                              Invalid URL format
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button type="button" variant="outline" onClick={addNewItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Estimated Total Cost:</span>
                  <span className="text-xl font-bold">${getTotalCost().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-[calc(100vh-16rem)]">
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-6 pr-1">
              <div>
                <Label className="text-sm font-medium text-foreground">Purchase Responsibility</Label>
                <div className="mt-3 flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formData.selfPurchase ? 'I will make this purchase' : 'Keeper will make this purchase'}
                    </p>
                    <p className="text-xs text-muted-foreground">Toggle to decide who completes the purchase.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase text-muted-foreground">Keeper</span>
                    <Switch
                      checked={formData.selfPurchase}
                      onCheckedChange={(checked: boolean) => handleSelfPurchaseChange(checked ? 'self' : 'keeper')}
                      aria-label="Toggle purchase responsibility"
                    />
                    <span className="text-xs uppercase text-muted-foreground">Self</span>
                  </div>
                </div>
                {formData.selfPurchase && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      By selecting this option, the reason is automatically set to "Urgent" and cannot be edited.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="h-4 w-4" />
                    Expected Delivery Date
                  </div>
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <Label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Hash className="h-4 w-4" />
                    Client Billed
                  </div>
                </Label>
                <div className="mt-3 flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formData.clientBilled === 'yes' ? 'Client will be billed' : 'Client will not be billed'}
                    </p>
                    <p className="text-xs text-muted-foreground">Toggle to set client billing for this request.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase text-muted-foreground">No</span>
                    <Switch
                      checked={formData.clientBilled === 'yes'}
                      onCheckedChange={handleClientBilledToggle}
                      aria-label="Toggle client billed"
                    />
                    <span className="text-xs uppercase text-muted-foreground">Yes</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>
                  <div className="flex items-center gap-2 mb-1.5">
                    <ClipboardList className="h-4 w-4" />
                    Purchase Reason
                  </div>
                </Label>
                <Select
                  value={formData.purchaseReason}
                  onValueChange={handlePurchaseReasonChange}
                  disabled={formData.selfPurchase}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low-stock">Low stock</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="new-project">New project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building className="h-4 w-4" />
                    Company *
                    {loadingCompanies && (
                      <span className="text-xs text-muted-foreground">(Loading...)</span>
                    )}
                  </div>
                </Label>
                <Select
                  value={formData.company}
                  onValueChange={handleCompanyChange}
                  onOpenChange={(open: boolean) => {
                    if (open && !companiesLoaded) {
                      void loadCompanies();
                    }
                  }}
                >
                  <SelectTrigger id="company">
                    <SelectValue
                      placeholder={
                        loadingCompanies
                          ? 'Loading companies...'
                          : 'Select a company'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCompanies ? (
                      <SelectItem value="_loading" disabled>
                        Loading companies...
                      </SelectItem>
                    ) : (
                      <>
                        {!companiesLoaded && (
                          <SelectItem value="_prefetch" disabled>
                            Click to load companies...
                          </SelectItem>
                        )}
                        {companies.map((company) => (
                          <SelectItem key={company.name} value={company.name}>
                            {company.name}
                          </SelectItem>
                        ))}
                        {companiesLoaded && companies.length === 0 && (
                          <SelectItem value="_no_companies" disabled>
                            No companies available
                          </SelectItem>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer">
                  <div className="flex items-center gap-2 mb-1.5">
                    <User className="h-4 w-4" />
                    Customer *
                    {loadingCustomers && (
                      <span className="text-xs text-muted-foreground">(Loading...)</span>
                    )}
                  </div>
                </Label>
                <Select
                  value={formData.customer}
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger
                    id="customer"
                    disabled={!formData.company || loadingCustomers}
                  >
                    <SelectValue
                      placeholder={
                        !formData.company
                          ? 'Select a company first'
                          : loadingCustomers
                            ? 'Loading customers...'
                            : 'Select a customer'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCustomers ? (
                      <SelectItem value="_loading" disabled>
                        Loading customers...
                      </SelectItem>
                    ) : customers.length > 0 ? (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.name}>
                          {customer.name}
                          {customer.code ? ` (${customer.code})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_no_customers" disabled>
                        {formData.company ? 'No customers available' : 'Select a company first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="project">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FolderOpen className="h-4 w-4" />
                    Project *
                    {loadingProjects && (
                      <span className="text-xs text-muted-foreground">(Loading...)</span>
                    )}
                  </div>
                </Label>
                <Select value={formData.project} onValueChange={handleProjectChange}>
                  <SelectTrigger
                    id="project"
                    disabled={!formData.customer || loadingProjects}
                  >
                    <SelectValue
                      placeholder={
                        !formData.customer
                          ? 'Select a customer first'
                          : loadingProjects
                            ? 'Loading projects...'
                            : 'Select a project'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProjects ? (
                      <SelectItem value="_loading" disabled>
                        Loading projects...
                      </SelectItem>
                    ) : projects.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.name}>
                          {project.name}
                          {project.code ? ` (${project.code})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_no_projects" disabled>
                        {formData.customer ? 'No projects available' : 'Select a customer first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="workOrder">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Hash className="h-4 w-4" />
                    Work Order #
                    {loadingWorkOrders && (
                      <span className="text-xs text-muted-foreground">(Loading...)</span>
                    )}
                  </div>
                </Label>
                <Select value={formData.workOrder} onValueChange={handleWorkOrderChange}>
                  <SelectTrigger
                    id="workOrder"
                    disabled={!formData.project || loadingWorkOrders}
                  >
                    <SelectValue
                      placeholder={
                        !formData.project
                          ? 'Select a project first'
                          : loadingWorkOrders
                            ? 'Loading work orders...'
                            : 'Select a work order'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingWorkOrders ? (
                      <SelectItem value="_loading" disabled>
                        Loading work orders...
                      </SelectItem>
                    ) : workOrders.length > 0 ? (
                      workOrders.map((wo) => (
                        <SelectItem key={wo.id ?? wo.wo} value={wo.wo}>
                          <span className="flex flex-col gap-0.5">
                            <span className="font-medium">{wo.wo}</span>
                            {wo.serviceDesc && (
                              <span className="text-xs text-muted-foreground">{wo.serviceDesc}</span>
                            )}
                          </span>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_no_workorders" disabled>
                        {formData.project ? 'No work orders available' : 'Select a project first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter delivery address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="location">Location URL (optional)</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter Google Maps link or location URL"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                />
                {formData.googleMapsUrl && !validateUrl(formData.googleMapsUrl) && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
                )}
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code (optional)</Label>
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="Enter ZIP code (max 6 characters)"
                  value={formData.zipCode}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 6);
                    setFormData(prev => ({ ...prev, zipCode: value }));
                  }}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.zipCode.length}/6</p>
              </div>

              <div>
                <Label htmlFor="justification">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="h-4 w-4" />
                    Justification
                  </div>
                </Label>
                <Textarea
                  id="justification"
                  placeholder="Explain why this purchase is needed..."
                  value={formData.justification}
                  onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitLabel}
          </Button>
        </div>
        </form>
      </div>

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