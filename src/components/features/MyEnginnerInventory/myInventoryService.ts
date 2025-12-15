import { API_BASE_URL } from "../requests/services/api";
import { store } from "../../../store/store";

/**
 * My Inventory Service
 * Handles inventory operations for the current engineer
 */

interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  image: string;
  project: string;
  projectCode: string;
  quantity: number;
  sku?: string;
  warehouse?: string;
  warehouseCode?: string;
}

interface KitItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  image?: string;
}

interface Kit {
  id: string;
  kitId: string;
  name: string;
  description: string;
  project: string;
  projectCode: string;
  quantity: number;
  warehouse: string;
  warehouseCode: string;
  items: KitItem[];
}

interface InventoryResponse {
  items: InventoryItem[];
  kits: Kit[];
}

export async function getInventoryEngineer(
  engineerId: string
): Promise<InventoryResponse> {
  try {
    const token = store.getState().auth.accessToken as string;
    const url = `${API_BASE_URL}/engineer-holdings/${engineerId}`;
    console.log(`Fetching inventory for engineer: ${engineerId}`);
    console.log(`API URL: ${url}`);

    const response = await fetch(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // El backend devuelve un DTO (EngineerHoldingsDto)
    const data = await response.json();
    console.log('API Response:', data);

    // Transformar la respuesta de la API al formato esperado
    const items: InventoryItem[] = [];
    const kits: Kit[] = [];

    // Procesar items de todos los almacenes
    if (data.holdingsByWarehouse && Array.isArray(data.holdingsByWarehouse)) {
      data.holdingsByWarehouse.forEach((warehouse: any) => {
        // Procesar items
        if (warehouse.items && Array.isArray(warehouse.items)) {
          warehouse.items.forEach((item: any) => {
            items.push({
              id: `${item.itemId}-${warehouse.warehouse.code}`,
              itemId: item.itemId.toString(),
              name: item.name,
              description: item.description,
              image: item.imageUrl,
              project: item.projectIds?.[0] || 'general expenses',
              projectCode: item.projectIds?.[0] || 'GEN',
              quantity: item.quantity,
              sku: item.sku,
              warehouse: warehouse.warehouse.name,
              warehouseCode: warehouse.warehouse.code
            });
          });
        }

        // Procesar kits
        if (warehouse.kits && Array.isArray(warehouse.kits)) {
          warehouse.kits.forEach((kit: any) => {
            kits.push({
              id: `kit-${kit.kitId}-${warehouse.warehouse.code}`,
              kitId: kit.kitId.toString(),
              name: kit.name,
              description: kit.description,
              project: kit.projectIds?.[0] || 'general expenses',
              projectCode: kit.projectIds?.[0] || 'GEN',
              quantity: kit.quantity,
              warehouse: warehouse.warehouse.name,
              warehouseCode: warehouse.warehouse.code,
              items: kit.items?.map((kitItem: any) => ({
                id: `kit-item-${kitItem.itemId}`,
                sku: kitItem.sku,
                name: kitItem.name,
                description: kitItem.description,
                quantity: kitItem.quantity,
                image: kitItem.imageUrl
              })) || []
            });
          });
        }
      });
    }

    console.log('Transformed items:', items);
    console.log('Transformed kits:', kits);

    return {
      items,
      kits
    };
  } catch (error) {
    console.error("Error fetching engineer inventory:", error);
    return {
      items: [],
      kits: [],
    };
  }
}


/**
 * Transfer inventory items to another engineer
 * @param fromEngineerId - The engineer transferring items
 * @param toEngineerId - The engineer receiving items
 * @param itemIds - IDs of items to transfer
 * @param quantities - Quantities for each item
 * @returns Promise with success status
 */
export async function transferInventory(
  fromEngineerId: string,
  toEngineerId: string,
  itemIds: string[],
  quantities: Record<string, number>
): Promise<{ success: boolean; message: string }> {
  try {
    const token = store.getState().auth.accessToken as string;
    console.log(`Transferring items from ${fromEngineerId} to ${toEngineerId}`);
    console.log('Item IDs:', itemIds);
    console.log('Quantities:', quantities);
    
    const url = `${API_BASE_URL}/engineer-holdings/transfer`;
    const payload = {
      fromEngineerId,
      toEngineerId,
      itemIds,
      quantities
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      message: data.message || `Successfully transferred ${itemIds.length} item(s) to engineer ${toEngineerId}`
    };
  } catch (error: any) {
    console.error('Error transferring inventory:', error);
    return {
      success: false,
      message: error.message || 'Failed to transfer inventory'
    };
  }
}

export type { InventoryItem, Kit, KitItem, InventoryResponse };
//export interface InventoryResponse {
// items: ItemDto[];
//  kits: KitDto[];
//}
