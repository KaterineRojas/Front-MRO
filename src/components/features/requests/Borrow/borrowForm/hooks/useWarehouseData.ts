import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getWarehouses,
  getCatalogItemsByWarehouse,
  type Warehouse,
  type CatalogItem,
} from '../../../services/sharedServices';
import type { AppError } from '../../../../enginner/services/errorHandler';

interface UseWarehouseDataReturn {
  warehouses: Warehouse[];
  catalogItems: CatalogItem[];
  loading: boolean;
  loadCatalogItems: (warehouseId: string) => Promise<void>;
}

/**
 * Hook for managing warehouse and catalog item data
 */
export function useWarehouseData(
  initialWarehouseId?: string,
  onError?: (error: AppError, entityName: string, retry?: () => void) => void
): UseWarehouseDataReturn {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load warehouses on mount
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const data = await getWarehouses();
        setWarehouses(data);
      } catch (error) {
        if (onError) {
          onError(error as AppError, 'warehouses', loadWarehouses);
        } else {
          toast.error('Failed to load warehouses');
        }
      }
    };
    loadWarehouses();
  }, []);

  // Load catalog items when warehouse changes
  useEffect(() => {
    if (initialWarehouseId) {
      loadCatalogItems(initialWarehouseId);
    }
  }, [initialWarehouseId]);

  const loadCatalogItems = async (warehouseId: string) => {
    if (!warehouseId) return;
    
    setLoading(true);
    try {
      const items = await getCatalogItemsByWarehouse(warehouseId, false);
      setCatalogItems(items);
    } catch (error) {
      toast.error('Failed to load catalog items');
    } finally {
      setLoading(false);
    }
  };

  return {
    warehouses,
    catalogItems,
    loading,
    loadCatalogItems,
  };
}
