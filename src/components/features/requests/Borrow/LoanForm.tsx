import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../../ui/hover-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Badge } from '../../../ui/badge';
import { ArrowLeft, Plus, Minus, X, Calendar, Package, Building, User, FolderOpen, Hash, WifiOff } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { toast } from 'sonner';
import type { CartItem } from '../../enginner/types';
import type { User as UserType } from '../../enginner/types';
import { ConfirmModal, useConfirmModal, type ModalType } from '../../../ui/confirm-modal';
import { ErrorType, type AppError } from '../../../features/enginner/services/errorHandler';
import { store } from '../../../../store/store';
import { createBorrowRequest } from './borrowService';
import { updateCartItem, removeFromCart } from '../../enginner/store/slices/cartSlice';
import {
  getWarehouses,
  getCatalogItemsByWarehouse,
  getCompanies,
  getCustomersByCompany,
  getProjectsByCustomer,
  getWorkOrdersByProject,
  type Warehouse,
  type CatalogItem,
  type Project,
  type Company,
  type Customer,
  type WorkOrder
} from '../services/sharedServices';

interface LoanFormProps {
  cartItems: CartItem[];
  clearCart: () => void;
  currentUser: UserType;
  onBack: (() => void) | null;
  onBorrowCreated?: () => Promise<void>;
}

interface LoanFormData {
  items: { itemId: string; itemName: string; quantity: number }[];
  department: string;
  returnDate: string;
  notes: string;
  warehouseId: string;
  company: string;
  customer: string;
  project: string;
  workOrder: string;
  address: string;
  googleMapsUrl: string;
  zipCode: string;
}

const formatWorkOrderDate = (value?: string) => {
  if (!value) return 'No date provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Validates if a string is a valid URL
 */
const isValidUrl = (urlString: string): boolean => {
  if (!urlString) return true; // Empty URL is valid (optional field)
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};


export function LoanForm({ cartItems, clearCart, currentUser, onBack, onBorrowCreated }: LoanFormProps) {
  // Redux dispatch for syncing cart
  const dispatch = useDispatch();

  // Obtener el warehouse ID del carrito si existe
  const cartWarehouseId = cartItems.length > 0 ? cartItems[0].warehouseId : '';

  const [formData, setFormData] = useState<LoanFormData>({
    items: cartItems.map(item => ({
      itemId: item.item.id,
      itemName: item.item.name,
      quantity: item.quantity
    })),
    department: currentUser.department || '',
    returnDate: '',
    notes: '',
    warehouseId: cartWarehouseId || '',
    company: '',
    customer: '',
    project: '',
    workOrder: '',
    address: '',
    googleMapsUrl: '',
    zipCode: ''
  });

  const [cartItemsCount] = useState(cartItems.length);
  const [itemSearches, setItemSearches] = useState<{ [key: number]: string }>(() => {
    // Inicializar con los nombres de los items del carrito
    const searches: { [key: number]: string } = {};
    cartItems.forEach((item, index) => {
      searches[index] = item.item.name;
    });
    return searches;
  });
  const [filteredItems, setFilteredItems] = useState<{ [key: number]: CatalogItem[] }>({});
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>({});
  const isInitialWarehouseFromCart = useRef(!!cartWarehouseId);
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const recomputeFilteredItems = (itemsList: { itemId: string }[]) => {
    const selectedItemIds = itemsList
      .map(i => i.itemId)
      .filter(id => id !== '');

    const updatedFiltered: { [key: number]: CatalogItem[] } = {};

    itemsList.forEach((_, index) => {
      updatedFiltered[index] = catalogItems.filter(
        ci => !selectedItemIds.includes(ci.id)
      );
    });

    return updatedFiltered;
  };

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Project Details states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrderDetails, setSelectedWorkOrderDetails] = useState<WorkOrder | null>(null);
  const [workOrderModalOpen, setWorkOrderModalOpen] = useState(false);

  // Loading states
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);

  // Track if data has been loaded
  const [companiesLoaded, setCompaniesLoaded] = useState(false);

  // Quantity editing state
  const [editingQuantityIndex, setEditingQuantityIndex] = useState<number | null>(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState<string>('');

  // Error handling
  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

  // Connection listener (Omitido por concisión, es igual al original)
  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setOfflineMode(true);
      showConfirm({
        title: 'Connection Lost',
        description: 'You appear to be offline. Some features may not work properly.',
        type: 'network',
        confirmText: 'OK',
        showCancel: false
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Error handler helper (Omitido por concisión, es igual al original)
  const handleApiError = (error: AppError, entityName: string, retryFunction?: () => void) => {
    let modalConfig: {
      title: string;
      description: string;
      type: ModalType;
      confirmText: string;
      showCancel: boolean;
      retryable: boolean;
      onConfirm?: () => void;
    } = {
      title: 'Error Loading Data',
      description: `Failed to load ${entityName}. ${error.message}`,
      type: 'error',
      confirmText: 'OK',
      showCancel: false,
      retryable: false,
      onConfirm: () => hideModal()
    };

    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        modalConfig = {
          ...modalConfig,
          title: 'Network Error',
          description: 'Unable to connect to the server. Please check your internet connection.',
          type: 'network',
          confirmText: 'Retry',
          showCancel: true,
          retryable: true,
          onConfirm: () => {
            hideModal();
            if (retryFunction) retryFunction();
          }
        };
        break;

      case ErrorType.TIMEOUT_ERROR:
        modalConfig = {
          ...modalConfig,
          title: 'Request Timeout',
          description: 'The server is taking too long to respond. Would you like to try again?',
          type: 'warning',
          confirmText: 'Retry',
          showCancel: true,
          retryable: true,
          onConfirm: () => {
            hideModal();
            if (retryFunction) retryFunction();
          }
        };
        break;

      case ErrorType.BACKEND_ERROR:
        modalConfig = {
          ...modalConfig,
          title: 'Server Error',
          description: `The server encountered an error loading ${entityName}. Please try again later.`,
          type: 'error',
          confirmText: 'Retry',
          showCancel: true,
          retryable: true,
          onConfirm: () => {
            hideModal();
            if (retryFunction) retryFunction();
          }
        };
        break;

      case ErrorType.NOT_FOUND:
        modalConfig = {
          ...modalConfig,
          title: 'Not Found',
          description: `The requested ${entityName} could not be found. It may have been deleted.`,
          type: 'warning',
          confirmText: 'OK',
          onConfirm: () => hideModal()
        };
        break;

      case ErrorType.UNAUTHORIZED:
        modalConfig = {
          ...modalConfig,
          title: 'Authentication Required',
          description: 'Your session may have expired. Please log in again.',
          type: 'error',
          confirmText: 'OK',
          onConfirm: () => hideModal()
        };
        break;

      default:
        if (error.retryable && retryFunction) {
          modalConfig.confirmText = 'Retry';
          modalConfig.showCancel = true;
          modalConfig.retryable = true;
          modalConfig.onConfirm = () => {
            hideModal();
            retryFunction();
          };
        }
    }

    showConfirm(modalConfig);
  };

  // Load initial data (only warehouses)
  useEffect(() => {
    const loadInitialData = async () => {
      // Load warehouses - estos sí se necesitan para los items
      try {
        const warehouseData = await getWarehouses();
        setWarehouses(warehouseData);
        if (warehouseData.length > 0 && !formData.warehouseId) {
          // Asigna el primer warehouse por defecto si no hay uno seleccionado
          setFormData(prev => ({ ...prev, warehouseId: warehouseData[0].id }));
        }
      } catch (error: any) {
        handleApiError(error, 'warehouses');
      }
    };
    loadInitialData();
  }, []);

  // Load companies function (Carga Perezosa)
  const loadCompanies = async () => {
    // If already loaded or currently loading, don't reload
    if (companiesLoaded || loadingCompanies) return;

    setLoadingCompanies(true);
    try {
      const companyData = await getCompanies();
      setCompanies(companyData);
      setCompaniesLoaded(true);
      setLoadingCompanies(false);
    } catch (error: any) {
      setLoadingCompanies(false);
      handleApiError(error, 'companies', loadCompanies);
    }
  };

  // Load customers when company changes (Carga en Cascada)
  useEffect(() => {
    if (!formData.company) {
      setCustomers([]);
      setProjects([]);
      setWorkOrders([]);
      setFormData(prev => ({
        ...prev,
        customer: '',
        project: '',
        workOrder: ''
      }));
      return;
    }

    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const customerData = await getCustomersByCompany(formData.company);
        setCustomers(customerData);
        setLoadingCustomers(false);

        setFormData(prev => ({
          ...prev,
          customer: '',
          project: '',
          workOrder: ''
        }));
        setProjects([]);
        setWorkOrders([]);
      } catch (error: any) {
        setLoadingCustomers(false);
        handleApiError(error, 'customers', () => loadCustomers());
      }
    };

    loadCustomers();
  }, [formData.company]);

  // Load projects when customer changes (Carga en Cascada)
  useEffect(() => {
    if (!formData.customer) {
      setProjects([]);
      setWorkOrders([]);
      setFormData(prev => ({
        ...prev,
        project: '',
        workOrder: ''
      }));
      return;
    }

    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const projectData = await getProjectsByCustomer(formData.company, formData.customer);
        setProjects(projectData);
        setLoadingProjects(false);

        setFormData(prev => ({
          ...prev,
          project: '',
          workOrder: ''
        }));
        setWorkOrders([]);
      } catch (error: any) {
        setLoadingProjects(false);
        handleApiError(error, 'projects', () => loadProjects());
      }
    };

    loadProjects();
  }, [formData.customer]);

  // Load work orders when project changes (Carga en Cascada)
  useEffect(() => {
    if (!formData.project) {
      setWorkOrders([]);
      setFormData(prev => ({
        ...prev,
        workOrder: ''
      }));
      return;
    }

    const loadWorkOrders = async () => {
      setLoadingWorkOrders(true);
      try {
        const workOrderData = await getWorkOrdersByProject(formData.company, formData.customer, formData.project);
        setWorkOrders(workOrderData);
        setLoadingWorkOrders(false);

        setFormData(prev => ({
          ...prev,
          workOrder: ''
        }));
      } catch (error: any) {
        setLoadingWorkOrders(false);
        handleApiError(error, 'work orders', () => loadWorkOrders());
      }
    }; loadWorkOrders();
  }, [formData.project]);

  // Load catalog items when warehouse changes
  useEffect(() => {
    const loadItems = async () => {
      if (formData.warehouseId) {
        try {
          const items = await getCatalogItemsByWarehouse(formData.warehouseId);
          setCatalogItems(items);
          // Initialize filtered items for all indexes
          const newFilteredItems: { [key: number]: CatalogItem[] } = {};
          // Usamos el tamaño actual de formData.items, que puede ser 0 o 1 si se reseteó
          const selectedIds = formData.items.map(i => i.itemId).filter(id => id !== '');

          formData.items.forEach((_, index) => {
            newFilteredItems[index] = items.filter(ci => !selectedIds.includes(ci.id));
          });

          setFilteredItems(newFilteredItems);
        } catch (error: any) {
          toast.error('Failed to load catalog items');
        }
      }
    };
    loadItems();
  }, [formData.warehouseId]);

  // Close dropdown when clicking outside (Omitido por concisión, es igual al original)
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
    const selectedItemIds = formData.items
      .map(i => i.itemId)
      .filter(id => id !== '');
    if (!formData.warehouseId) {
      toast.error("Select a warehouse first.");
      return;
    }

    setItemSearches(prev => ({ ...prev, [index]: value }));

    if (value.length >= 2) {
      const filtered = catalogItems
        .filter(item =>
          item.name.toLowerCase().includes(value.toLowerCase()) ||
          item.description.toLowerCase().includes(value.toLowerCase())
        )
        .filter(item => !selectedItemIds.includes(item.id));
      setFilteredItems(prev => ({ ...prev, [index]: filtered }));
    } else {
      // Si no hay búsqueda, mostrar todos los items excepto los ya seleccionados
      const allAvailable = catalogItems.filter(item => !selectedItemIds.includes(item.id));
      setFilteredItems(prev => ({ ...prev, [index]: allAvailable }));
    }

    setDropdownOpen(prev => ({ ...prev, [index]: true }));
  };

  const selectItem = (index: number, item: CatalogItem) => {
    updateItem(index, 'itemId', item.id);
    const updatedSelected = formData.items.map((it, idx) =>
      idx === index ? item.id : it.itemId
    ).filter(id => id !== '');


    const newFiltered = Object.keys(filteredItems).reduce((acc, key) => {
      const idx = parseInt(key);
      acc[idx] = catalogItems.filter(ci => !updatedSelected.includes(ci.id));
      return acc;
    }, {} as { [key: number]: CatalogItem[] });

    setFilteredItems(newFiltered);


    const newItemsList = formData.items.map((it, idx) =>
      idx === index ? { ...it, itemId: item.id, itemName: item.name } : it
    );

    setFilteredItems(recomputeFilteredItems(newItemsList));

    updateItem(index, 'itemName', item.name);
    setItemSearches(prev => ({ ...prev, [index]: item.name }));
    setDropdownOpen(prev => ({ ...prev, [index]: false }));
  };

  const toggleDropdown = (index: number) => {
    if (!formData.warehouseId) {
      toast.error("Select a warehouse first.");
      return;
    }

    const currentItem = formData.items[index];
    if (currentItem.itemId) {
      setDropdownOpen(prev => ({ ...prev, [index]: !prev[index] }));
    } else {
      // Initialize filteredItems[index] with all catalog items when opening for the first time
      if (!filteredItems[index]) {
        const selectedIds = formData.items.map(i => i.itemId).filter(id => id !== '');
        const filtered = catalogItems.filter(ci => !selectedIds.includes(ci.id));
        setFilteredItems(prev => ({ ...prev, [index]: filtered }));
      }
      setDropdownOpen(prev => ({ ...prev, [index]: true }));
    }
  };

  const addNewItem = () => {
    const newIndex = formData.items.length;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', itemName: '', quantity: 1 }]
    }));
    setItemSearches(prev => ({ ...prev, [newIndex]: '' }));
    setDropdownOpen(prev => ({ ...prev, [newIndex]: false }));

    // Scroll to the new item after render
    setTimeout(() => {
      if (itemsContainerRef.current) {
        itemsContainerRef.current.scrollTop = itemsContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  const removeItem = (index: number) => {
    // Sync with Redux cart if this is a cart item (index < cartItemsCount)
    if (index < cartItemsCount) {
      const cartItem = cartItems[index];
      if (cartItem) {
        dispatch(removeFromCart(cartItem.item.id));
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
    const newItemsList = formData.items.filter((_, i) => i !== index);
    const selectedIds = newItemsList.map(it => it.itemId).filter(id => id !== '');

    const newFiltered = Object.keys(filteredItems).reduce((acc, key) => {
      const idx = parseInt(key);
      acc[idx] = catalogItems.filter(ci => !selectedIds.includes(ci.id));
      return acc;
    }, {} as { [key: number]: CatalogItem[] });

    setFilteredItems(newFiltered);

  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        items: prev.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      };

      // Sync with Redux cart if this is a cart item (index < cartItemsCount)
      if (index < cartItemsCount && field === 'quantity') {
        const cartItem = cartItems[index];
        if (cartItem) {
          dispatch(updateCartItem({
            itemId: cartItem.item.id,
            quantity: value
          }));
        }
      }

      return updated;
    });
  };

  const validateStock = (itemId: string, quantity: number) => {
    const item = catalogItems.find(i => i.id === itemId);
    return item ? quantity <= item.availableQuantity : false;
  };

  const handleQuantityEdit = (index: number, currentQuantity: number) => {
    setEditingQuantityIndex(index);
    setEditingQuantityValue(currentQuantity.toString());
  };

  const handleQuantityInputChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setEditingQuantityValue(numValue.toString());
  };

  const handleQuantityInputBlur = (index: number) => {
    const item = formData.items[index];
    const maxQuantity = catalogItems.find(ci => ci.id === item.itemId)?.availableQuantity || 999;
    const newQuantity = Math.max(1, Math.min(parseInt(editingQuantityValue) || 1, maxQuantity));
    updateItem(index, 'quantity', newQuantity);
    setEditingQuantityIndex(null);
    setEditingQuantityValue('');
  };

  const handleQuantityInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      handleQuantityInputBlur(index);
    } else if (e.key === 'Escape') {
      setEditingQuantityIndex(null);
      setEditingQuantityValue('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if offline
    if (offlineMode) {
      showConfirm({
        title: 'Offline Mode',
        description: 'You cannot submit requests while offline. Please check your connection.',
        type: 'network',
        confirmText: 'OK',
        showCancel: false
      });
      return;
    }

    // Validate location URL if provided
    if (formData.googleMapsUrl && !isValidUrl(formData.googleMapsUrl)) {
      toast.error('Please enter a valid URL for the location');
      return;
    }

    // Validate zipCode length
    if (formData.zipCode && formData.zipCode.length > 6) {
      toast.error('ZIP code cannot exceed 6 characters');
      return;
    }

    // Validate required fields
    if (!formData.project) {
      toast.error('Please select a project');
      return;
    }

    if (!formData.workOrder) {
      toast.error('Please select a work order');
      return;
    }

    // Validate stock for all items
    for (const item of formData.items) {
      if (!item.itemId) {
        toast.error('Please select all items before submitting.');
        return;
      }
      if (!validateStock(item.itemId, item.quantity)) {
        toast.error(`Insufficient stock for ${item.itemName}`);
        return;
      }
    }

    // Show confirmation modal
    const itemsCount = formData.items.length;
    const companyInfo = companies.find(c => c.name === formData.company)?.name || formData.company;
    const returnDateFormatted = formData.returnDate ? new Date(formData.returnDate).toLocaleDateString() : 'Not set';

    showConfirm({
      title: '¿Confirmar envío de solicitud de préstamo?',
      description: `Company: ${companyInfo}\nItems: ${itemsCount}\nReturn Date: ${returnDateFormatted}`,
      type: 'warning',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        hideModal();
        // Get employeeId from authSlice store
        const authUser = (store.getState() as any).auth?.user;
        const requesterId = authUser?.employeeId || '';

        console.log('Auth user from store:', authUser);
        console.log('RequesterId being sent:', requesterId);

        const payload = {
          requesterId: requesterId,
          warehouseId: parseInt(formData.warehouseId, 10),
          companyId: formData.company,
          customerId: formData.customer,
          departmentId: formData.department,
          projectId: formData.project,
          workOrderId: formData.workOrder,
          expectedReturnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : new Date().toISOString(),
          notes: formData.notes || '',
          address: formData.address || '',
          googleMapsUrl: formData.googleMapsUrl || '',
          zipCode: formData.zipCode || '',
          items: formData.items.map(item => ({
            itemId: parseInt(item.itemId, 10),
            quantityRequested: item.quantity
          }))
        };

        // Call API
        const result = await createBorrowRequest(payload);

        if (result.success) {
          toast.success(`Borrow request created: ${result.requestNumber || 'Success'}`);
          clearCart();

          // Reload borrow requests if callback provided
          if (onBorrowCreated) {
            await onBorrowCreated();
          }

          if (onBack) onBack();
        } else {
          toast.error(result.message || 'Failed to create borrow request');
        }
      }
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <>
      {/* Offline indicator */}
      {offlineMode && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-orange-600" />
          <span className="text-sm text-orange-800">
            You are currently offline. Some features may be limited.
          </span>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>

          <div>
            <h1 className="text-2xl font-bold">Borrow Form</h1>
            <p className="text-sm text-muted-foreground">
              {cartItemsCount > 0 ? 'Complete the details of your borrow request' : 'Create a new borrow request'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Items Selection */}
            <Card className="flex flex-col h-[calc(100vh-16rem)]">
              <CardHeader>
                <CardTitle>Items to Request</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div>
                  <Label htmlFor="warehouse">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Package className="h-4 w-4" />
                      Warehouse
                    </div>
                  </Label>
                  <Select
                    value={formData.warehouseId}
                    onValueChange={(newWarehouseId: string) => {

                      // LÓGICA DE RESETEO DE ITEMS AL CAMBIAR DE WAREHOUSE
                      // No resetear si este es el warehouse inicial del carrito
                      if (newWarehouseId !== formData.warehouseId && !isInitialWarehouseFromCart.current) {

                        setFormData(prev => ({
                          ...prev,
                          warehouseId: newWarehouseId,
                          // Vaciar la lista de ítems y dejar solo un ítem vacío para empezar de nuevo
                          items: [{ itemId: '', itemName: '', quantity: 1 }]
                        }));

                        // Resetear los estados de búsqueda de ítems
                        setItemSearches({});
                        setFilteredItems({});

                        // Notificación al usuario si había ítems antes
                        if (formData.items.length > 0) {
                          toast.warning('The list of items was reset because you changed the warehouse.');
                        }
                      } else if (newWarehouseId !== formData.warehouseId) {
                        // Si fue warehouse inicial del carrito pero ahora se está cambiando
                        isInitialWarehouseFromCart.current = false;
                        setFormData(prev => ({
                          ...prev,
                          warehouseId: newWarehouseId,
                          // Vaciar la lista de ítems y dejar solo un ítem vacío para empezar de nuevo
                          items: [{ itemId: '', itemName: '', quantity: 1 }]
                        }));

                        // Resetear los estados de búsqueda de ítems
                        setItemSearches({});
                        setFilteredItems({});

                        // Notificación al usuario
                        if (formData.items.length > 0) {
                          toast.warning('The list of items was reset because you changed the warehouse.');
                        }
                      } else {
                        // Solo actualiza el ID si es necesario (aunque el Select ya lo maneja)
                        setFormData(prev => ({ ...prev, warehouseId: newWarehouseId }));
                        if (isInitialWarehouseFromCart.current) {
                          isInitialWarehouseFromCart.current = false;
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name} ({wh.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto space-y-3 -mx-6 px-6" ref={itemsContainerRef}>
                  {formData.items.map((item, index) => {
                    const selectedItemData = item.itemId ? catalogItems.find(i => i.id === item.itemId) : null;
                    const isFromCartItem = index < cartItemsCount;
                    const itemImage = isFromCartItem && cartItems[index] ? cartItems[index].item.image : selectedItemData?.image;
                    const maxQuantity = selectedItemData ? selectedItemData.availableQuantity : 999;

                    return (
                      <div key={index} className="flex gap-4 p-3 rounded-lg border bg-card">
                        {itemImage && (
                          <ImageWithFallback
                            src={itemImage}
                            alt={item.itemName}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{item.itemName}</h4>
                              {isFromCartItem ? (
                                <p className="text-xs text-muted-foreground">
                                  {cartItems[index]?.item.sku || 'N/A'}
                                </p>
                              ) : (
                                <div className="space-y-2" ref={(el) => { if (el) dropdownRefs.current[index] = el; }}>
                                  <Input
                                    placeholder={item.itemId ? "Click to change selection..." : "Type to search items..."}
                                    value={itemSearches[index] || ''}
                                    onChange={(e) => handleItemSearch(index, e.target.value)}
                                    onClick={() => toggleDropdown(index)}
                                    readOnly={!!item.itemId}
                                    className={`text-xs ${item.itemId ? "cursor-pointer" : ""}`}
                                  />
                                  {dropdownOpen[index] && (
                                    <div className="fixed z-50 border rounded-md bg-background shadow-xl max-h-80 overflow-y-auto"
                                      style={{
                                        width: dropdownRefs.current[index]?.offsetWidth || '100%',
                                        top: (dropdownRefs.current[index]?.getBoundingClientRect().top ?? 0) - 10,
                                        left: dropdownRefs.current[index]?.getBoundingClientRect().left,
                                        transform: 'translateY(-100%)',
                                      }}>
                                      {(filteredItems[index] || catalogItems).length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                          No items available
                                        </div>
                                      ) : (
                                        (filteredItems[index] || catalogItems).map((mockItem) => (
                                          <button
                                            key={mockItem.id}
                                            type="button"
                                            className={`w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center gap-2 ${item.itemId === mockItem.id ? 'bg-accent' : ''
                                              }`}
                                            onClick={() => selectItem(index, mockItem)}
                                          >
                                            <ImageWithFallback
                                              src={mockItem.image}
                                              alt={mockItem.name}
                                              className="w-8 h-8 object-cover rounded"
                                            />
                                            <span>{mockItem.name} (Available: {mockItem.availableQuantity})</span>
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeItem(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              {editingQuantityIndex === index ? (
                                <Input
                                  type="number"
                                  min="1"
                                  max={maxQuantity}
                                  value={editingQuantityValue}
                                  onChange={(e) => handleQuantityInputChange(e.target.value)}
                                  onBlur={() => handleQuantityInputBlur(index)}
                                  onKeyDown={(e) => handleQuantityInputKeyDown(e, index)}
                                  autoFocus
                                  className="text-sm font-medium w-8 text-center h-7 p-1"
                                />
                              ) : (
                                <span
                                  className="text-sm font-medium w-8 text-center cursor-pointer hover:bg-accent rounded px-1 py-0.5"
                                  onClick={() => handleQuantityEdit(index, item.quantity)}
                                >
                                  {item.quantity}
                                </span>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateItem(index, 'quantity', Math.min(item.quantity + 1, maxQuantity))}
                                disabled={item.quantity >= maxQuantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.itemId && !validateStock(item.itemId, item.quantity) && (
                                <Badge variant="destructive" className="text-xs">Insufficient stock</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Max: {maxQuantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button type="button" variant="outline" onClick={addNewItem} disabled={!formData.warehouseId} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                {!formData.warehouseId && (
                  <p className="text-sm text-muted-foreground">Select a Warehouse to add items.</p>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Project Details */}
            <Card className="flex flex-col h-[calc(100vh-16rem)]">
              <CardHeader>
                <CardTitle>Borrow Details</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto space-y-4">
                <div>
                  <Label htmlFor="department">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Package className="h-4 w-4" />
                      Department *
                    </div>
                  </Label>
                  <div className="flex items-center gap-2 p-2 border border-input rounded-md bg-muted">
                    <Badge variant="secondary">{currentUser.department}</Badge>
                    <span className="text-sm text-muted-foreground">(Fixed)</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="returnDate">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="h-4 w-4" />
                      Return Date
                    </div>
                  </Label>
                  <div className="relative">
                    <Input
                      id="returnDate"
                      type="date"
                      min={getMinDate()}
                      value={formData.returnDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Building className="h-4 w-4" />
                      Company *
                      {loadingCompanies && <span className="text-xs text-muted-foreground">(Loading...)</span>}
                    </div>
                  </Label>
                  <Select
                    value={formData.company}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, company: value }))}
                    disabled={loadingCompanies || offlineMode}
                    onOpenChange={(open: boolean) => {
                      if (open && !companiesLoaded && !offlineMode) {
                        loadCompanies();
                      }
                    }}
                  >
                    <SelectTrigger id="company">
                      <SelectValue placeholder={
                        offlineMode ? "Offline - Cannot load companies" :
                          loadingCompanies ? "Loading companies..." :
                            "Select a company"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {!companiesLoaded && !loadingCompanies && (
                        <SelectItem value="_loading" disabled>
                          Click to load companies...
                        </SelectItem>
                      )}
                      {companies.map((company) => (
                        <SelectItem key={company.name} value={company.name}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customer">
                    <div className="flex items-center gap-2 mb-1.5">
                      <User className="h-4 w-4" />
                      Customer *
                      {loadingCustomers && <span className="text-xs text-muted-foreground">(Loading...)</span>}
                    </div>
                  </Label>
                  <Select
                    value={formData.customer}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, customer: value }))}
                    disabled={!formData.company || loadingCustomers || offlineMode}
                  >
                    <SelectTrigger id="customer">
                      <SelectValue placeholder={
                        offlineMode ? "Offline" :
                          formData.company ? "Select a customer" :
                            "Select company first"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.name}>
                          {customer.name} {customer.code && `(${customer.code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FolderOpen className="h-4 w-4" />
                      Project *
                      {loadingProjects && <span className="text-xs text-muted-foreground">(Loading...)</span>}
                    </div>
                  </Label>
                  <Select
                    value={formData.project}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, project: value }))}
                    disabled={!formData.customer || loadingProjects || offlineMode}
                  >
                    <SelectTrigger id="project">
                      <SelectValue placeholder={
                        offlineMode ? "Offline" :
                          formData.customer ? "Select a project" :
                            "Select customer first"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.name}>
                          {project.name} ({project.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workOrder">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Hash className="h-4 w-4" />
                      Work Order # *
                      {loadingWorkOrders && <span className="text-xs text-muted-foreground">(Loading...)</span>}
                    </div>
                  </Label>
                  <Select
                    value={formData.workOrder}
                    onValueChange={(value: string) => {
                      setFormData(prev => ({ ...prev, workOrder: value }));
                      const details = workOrders.find(wo => wo.wo === value);
                      if (details) {
                        setSelectedWorkOrderDetails(details);
                        setWorkOrderModalOpen(true);
                      }
                    }}
                    disabled={!formData.project || loadingWorkOrders || offlineMode}
                  >
                    <SelectTrigger id="workOrder">
                      <SelectValue placeholder={
                        offlineMode ? "Offline" :
                          formData.project ? "Select work order" :
                            "Select project first"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {workOrders.map((wo) => (
                        <HoverCard key={wo.id ?? wo.wo} openDelay={150} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <SelectItem
                              value={wo.wo}
                              className="flex flex-col items-start gap-0.5"
                            >
                              <span className="font-medium">{wo.wo}</span>
                              {wo.serviceDesc && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {wo.serviceDesc}
                                </span>
                              )}
                            </SelectItem>
                          </HoverCardTrigger>
                          <HoverCardContent className="space-y-2 text-sm">
                            <div>
                              <p className="font-semibold">{wo.wo}</p>
                              {wo.serviceDesc && (
                                <p className="text-xs text-muted-foreground">{wo.serviceDesc}</p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="text-muted-foreground">Start</p>
                                <p>{formatWorkOrderDate(wo.startDate)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">End</p>
                                <p>{formatWorkOrderDate(wo.endDate)}</p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
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
                  {formData.googleMapsUrl && !isValidUrl(formData.googleMapsUrl) && (
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
                  <Label htmlFor="notes">Additional Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional information about the borrow request..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={offlineMode || formData.items.some(item => !item.itemId)}>
              {offlineMode ? (
                <>
                  <WifiOff className="mr-2 h-4 w-4" />
                  Cannot Submit (Offline)
                </>
              ) : (
                'Submit Borrow Request'
              )}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={workOrderModalOpen && !!selectedWorkOrderDetails} onOpenChange={setWorkOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>
              Review the information for the selected work order.
            </DialogDescription>
          </DialogHeader>
          {selectedWorkOrderDetails && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Work Order</p>
                <p className="font-semibold">{selectedWorkOrderDetails.wo}</p>
              </div>
              {selectedWorkOrderDetails.serviceDesc && (
                <div>
                  <p className="text-muted-foreground text-xs">Description</p>
                  <p>{selectedWorkOrderDetails.serviceDesc}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">Start Date</p>
                  <p>{formatWorkOrderDate(selectedWorkOrderDetails.startDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">End Date</p>
                  <p>{formatWorkOrderDate(selectedWorkOrderDetails.endDate)}</p>
                </div>
              </div>
              {selectedWorkOrderDetails.status && (
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className="uppercase tracking-wide text-sm">{selectedWorkOrderDetails.status}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setWorkOrderModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error/Confirm Modal */}
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