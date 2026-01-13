import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { ConfirmModal, useConfirmModal, type ModalType } from '../../../../ui/confirm-modal';
import { ErrorType, type AppError } from '../../../enginner/services/errorHandler';
import { createBorrowRequest } from '../borrowService';

// Types
import type { LoanFormProps, LoanFormData } from './types';

// Utils
import {
  buildInitialFormData,
  validateLoanForm,
  createDefaultLoanItem,
} from './utils';

// Hooks
import { useWarehouseData, useCompanyData, useItemManagement } from './hooks';

// Components
import {
  FormHeader,
  OfflineIndicator,
  FormActions,
  ItemsCard,
  DetailsCard,
} from './components';

export function LoanForm({
  cartItems,
  clearCart,
  currentUser,
  onBack,
  onBorrowCreated,
}: LoanFormProps) {
  // Cart warehouse ID
  const cartWarehouseId = cartItems.length > 0 ? cartItems[0].warehouseId : '';
  const cartItemsCount = cartItems.length;
  const isInitialWarehouseFromCart = useRef(!!cartWarehouseId);

  // Form state
  const [formData, setFormData] = useState<LoanFormData>(() =>
    buildInitialFormData(currentUser, cartItems)
  );

  // Offline mode
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

  // Modal state
  const { modalState, showConfirm, hideModal, setModalOpen } = useConfirmModal();

  // Error handler for API calls
  const handleApiError = useCallback(
    (error: AppError, entityName: string, retryFunction?: () => void) => {
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
        onConfirm: () => hideModal(),
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
            },
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
            },
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
            },
          };
          break;

        case ErrorType.NOT_FOUND:
          modalConfig = {
            ...modalConfig,
            title: 'Not Found',
            description: `The requested ${entityName} could not be found. It may have been deleted.`,
            type: 'warning',
            confirmText: 'OK',
            onConfirm: () => hideModal(),
          };
          break;

        case ErrorType.UNAUTHORIZED:
          modalConfig = {
            ...modalConfig,
            title: 'Authentication Required',
            description: 'Your session may have expired. Please log in again.',
            type: 'error',
            confirmText: 'OK',
            onConfirm: () => hideModal(),
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
    },
    [hideModal, showConfirm]
  );

  // Custom hooks
  const { warehouses, catalogItems, loadCatalogItems } = useWarehouseData(
    formData.warehouseId,
    handleApiError
  );

  const companyData = useCompanyData(
    {
      company: formData.company,
      customer: formData.customer,
      project: formData.project,
    },
    handleApiError
  );

  const itemManagement = useItemManagement({
    formData,
    setFormData,
    catalogItems,
    cartItems,
    cartItemsCount,
  });

  // Connection listeners
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
        showCancel: false,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showConfirm]);

  // Set default warehouse
  useEffect(() => {
    if (warehouses.length > 0 && !formData.warehouseId) {
      setFormData((prev) => ({ ...prev, warehouseId: warehouses[0].id }));
    }
  }, [warehouses, formData.warehouseId]);

  // Warehouse change handler
  const handleWarehouseChange = useCallback(
    (newWarehouseId: string) => {
      if (newWarehouseId === formData.warehouseId) return;

      if (!isInitialWarehouseFromCart.current) {
        const hadItems = formData.items.length > 0 && formData.items.some((i) => i.itemId);

        setFormData((prev) => ({
          ...prev,
          warehouseId: newWarehouseId,
          items: [createDefaultLoanItem()],
        }));

        itemManagement.setItemSearches({});
        itemManagement.setDropdownOpen({});
        itemManagement.setFilteredItems({});

        if (hadItems) {
          toast.warning('The list of items was reset because you changed the warehouse.');
        }
      } else {
        isInitialWarehouseFromCart.current = false;
        setFormData((prev) => ({
          ...prev,
          warehouseId: newWarehouseId,
          items: [createDefaultLoanItem()],
        }));

        itemManagement.setItemSearches({});
        itemManagement.setFilteredItems({});

        if (formData.items.length > 0) {
          toast.warning('The list of items was reset because you changed the warehouse.');
        }
      }

      // Load catalog items for new warehouse
      loadCatalogItems(newWarehouseId);
    },
    [formData.warehouseId, formData.items, itemManagement, loadCatalogItems]
  );

  // Form data change handler
  const handleFormDataChange = useCallback((field: keyof LoanFormData, value: string) => {
    setFormData((prev) => {
      // Handle cascading resets for company hierarchy
      if (field === 'company' && prev.company !== value) {
        return { ...prev, company: value, customer: '', project: '', workOrder: '' };
      }
      if (field === 'customer' && prev.customer !== value) {
        return { ...prev, customer: value, project: '', workOrder: '' };
      }
      if (field === 'project' && prev.project !== value) {
        return { ...prev, project: value, workOrder: '' };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  // Work order select handler
  const handleWorkOrderSelect = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, workOrder: value }));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateLoanForm(formData, catalogItems, offlineMode);
      if (!validation.isValid) {
        if (offlineMode) {
          showConfirm({
            title: 'Offline Mode',
            description: validation.errorMessage!,
            type: 'network',
            confirmText: 'OK',
            showCancel: false,
          });
        } else {
          toast.error(validation.errorMessage);
        }
        return;
      }

      // Show confirmation modal
      const itemsCount = formData.items.length;
      const companyInfo = companyData.companies.find((c) => c.name === formData.company)?.name || formData.company;
      const returnDateFormatted = formData.returnDate
        ? new Date(formData.returnDate).toLocaleDateString()
        : 'Not set';

      showConfirm({
        title: 'Requires Loan Request Confirmation',
        description: `Company: ${companyInfo}\nItems: ${itemsCount}\nReturn Date: ${returnDateFormatted}`,
        type: 'warning',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        showCancel: true,
        onConfirm: async () => {
          hideModal();

          // Get employeeId from currentUser prop (already from Redux)
          const requesterId = currentUser?.employeeId || '';

          const payload = {
            requesterId,
            warehouseId: parseInt(formData.warehouseId, 10),
            companyId: formData.company,
            customerId: formData.customer,
            departmentId: formData.department,
            projectId: formData.project,
            workOrderId: formData.workOrder,
            expectedReturnDate: formData.returnDate
              ? new Date(formData.returnDate).toISOString()
              : new Date().toISOString(),
            notes: formData.notes || '',
            address: formData.address || '',
            googleMapsUrl: formData.googleMapsUrl || '',
            zipCode: formData.zipCode || '',
            items: formData.items.map((item) => ({
              itemId: parseInt(item.itemId, 10),
              quantityRequested: item.quantity,
            })),
          };

          const result = await createBorrowRequest(payload);

          if (result.success) {
            toast.success(`Borrow request created: ${result.requestNumber || 'Success'}`);
            clearCart();

            if (onBorrowCreated) {
              await onBorrowCreated();
            }

            if (onBack) onBack();
          } else {
            toast.error(result.message || 'Failed to create borrow request');
          }
        },
      });
    },
    [
      formData,
      catalogItems,
      offlineMode,
      companyData.companies,
      showConfirm,
      hideModal,
      clearCart,
      onBorrowCreated,
      onBack,
    ]
  );

  const hasIncompleteItems = formData.items.some((item) => !item.itemId);

  return (
    <>
      <OfflineIndicator offlineMode={offlineMode} />

      <div className="space-y-6">
        <FormHeader onBack={onBack} cartItemsCount={cartItemsCount} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ItemsCard
              formData={formData}
              warehouses={warehouses}
              catalogItems={catalogItems}
              cartItems={cartItems}
              cartItemsCount={cartItemsCount}
              itemSearches={itemManagement.itemSearches}
              filteredItems={itemManagement.filteredItems}
              dropdownOpen={itemManagement.dropdownOpen}
              dropdownRefs={itemManagement.dropdownRefs}
              itemsContainerRef={itemManagement.itemsContainerRef}
              onWarehouseChange={handleWarehouseChange}
              onItemSearch={itemManagement.handleItemSearch}
              onSelectItem={itemManagement.selectItem}
              onToggleDropdown={itemManagement.toggleDropdown}
              onUpdateItem={itemManagement.updateItem}
              onRemoveItem={itemManagement.removeItem}
              onAddNewItem={itemManagement.addNewItem}
              validateStock={itemManagement.validateStock}
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
              offlineMode={offlineMode}
              onLoadCompanies={companyData.loadCompanies}
              onFormDataChange={handleFormDataChange}
              onWorkOrderSelect={handleWorkOrderSelect}
            />
          </div>

          <FormActions
            onBack={onBack}
            offlineMode={offlineMode}
            hasIncompleteItems={hasIncompleteItems}
          />
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

export default LoanForm;
