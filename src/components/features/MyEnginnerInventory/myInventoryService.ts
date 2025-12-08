import { API_BASE_URL } from "../requests/services/api";
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

// Mock data for inventory items
const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-1',
    itemId: 'hammer-001',
    name: 'Hammer',
    description: 'Professional grade hammer',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    project: 'Proyecto Amazonas',
    projectCode: 'AMZ-2024',
    quantity: 4,
    sku: 'HAM-001',
    warehouse: 'Amax',
    warehouseCode: 'AMAX'
  },
  {
    id: 'inv-2',
    itemId: 'hammer-001',
    name: 'Hammer',
    description: 'Professional grade hammer',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    project: 'Proyecto Innova',
    projectCode: 'INN-2024',
    quantity: 6,
    sku: 'HAM-001',
    warehouse: 'Best',
    warehouseCode: 'BEST'
  },
  {
    id: 'inv-3',
    itemId: 'keyboard-001',
    name: 'Mechanical Keyboard RGB',
    description: 'Gaming keyboard with RGB lighting',
    image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 2,
    sku: 'MECH-KB-001',
    warehouse: 'Central',
    warehouseCode: 'CENT'
  },
  {
    id: 'inv-4',
    itemId: 'monitor-001',
    name: 'Samsung 27" Monitor',
    description: 'Full HD display',
    image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 1,
    sku: 'SAM-003',
    warehouse: 'Amax',
    warehouseCode: 'AMAX'
  },
  {
    id: 'inv-5',
    itemId: 'drill-001',
    name: 'Power Drill',
    description: 'Cordless drill with battery',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
    project: 'Proyecto Construcción',
    projectCode: 'CONS-2024',
    quantity: 3,
    sku: 'DRL-001',
    warehouse: 'Best',
    warehouseCode: 'BEST'
  }
];

// Mock data for kits
const mockKits: Kit[] = [
  {
    id: 'kit-1',
    kitId: 'electrical-kit-001',
    name: 'Electrical Maintenance Kit prueba',
    description: 'Complete electrical maintenance toolkit',
    project: 'Proyecto Web',
    projectCode: 'WEB-2024',
    quantity: 2,
    warehouse: 'Central',
    warehouseCode: 'CENT',
    items: [
      { 
        id: 'kit-item-1', 
        sku: 'EL-MC-001', 
        name: 'Digital Multimeter', 
        description: 'Professional multimeter', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581092580497-e7d24e29d284?w=400'
      },
      { 
        id: 'kit-item-2', 
        sku: 'ST-WC-002', 
        name: 'Screwdriver Set', 
        description: '5-piece Phillips set', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'
      },
      { 
        id: 'kit-item-3', 
        sku: 'SE-MC-001', 
        name: 'Safety Glasses', 
        description: 'Clear safety glasses', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1577760258779-e787a1733016?w=400'
      }
    ]
  },
  {
    id: 'kit-2',
    kitId: 'power-tool-kit-001',
    name: 'Power Tools Kit',
    description: 'Complete power tools set for construction',
    project: 'Proyecto Construcción',
    projectCode: 'CONS-2024',
    quantity: 1,
    warehouse: 'Amax',
    warehouseCode: 'AMAX',
    items: [
      { 
        id: 'kit-item-4', 
        sku: 'DR-BC-001', 
        name: 'Cordless Drill', 
        description: '18V cordless drill', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'
      },
      { 
        id: 'kit-item-5', 
        sku: 'SA-BC-002', 
        name: 'Circular Saw', 
        description: '7.25" circular saw', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'
      },
      { 
        id: 'kit-item-6', 
        sku: 'IM-BC-003', 
        name: 'Impact Driver', 
        description: '18V impact driver', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'
      }
    ]
  },
  {
    id: 'kit-3',
    kitId: 'networking-kit-001',
    name: 'Network Installation Kit',
    description: 'Complete networking tools',
    project: 'Proyecto Innova',
    projectCode: 'INN-2024',
    quantity: 1,
    warehouse: 'Best',
    warehouseCode: 'BEST',
    items: [
      { 
        id: 'kit-item-7', 
        sku: 'CR-NC-001', 
        name: 'Cable Crimper', 
        description: 'RJ45 cable crimper', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
      },
      { 
        id: 'kit-item-8', 
        sku: 'CA-NC-002', 
        name: 'Cable Tester', 
        description: 'Network cable tester', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400'
      },
      { 
        id: 'kit-item-9', 
        sku: 'PU-NC-003', 
        name: 'Punch Down Tool', 
        description: 'Professional punch tool', 
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581092580497-e7d24e29d284?w=400'
      }
    ]
  }
];





export async function getInventoryEngineer(
  engineerId: string
): Promise<InventoryResponse> {
  try {
    const url = `${API_BASE_URL}/engineer-holdings/${engineerId}`;
    console.log(`Fetching inventory for engineer: ${engineerId}`);
    console.log(`API URL: ${url}`);

    const response = await fetch(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Si tu API requiere autenticación, agrega aquí el token:
          // "Authorization": `Bearer ${token}`
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
    console.log(`Transferring items from ${fromEngineerId} to ${toEngineerId}`);
    console.log('Item IDs:', itemIds);
    console.log('Quantities:', quantities);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: `Successfully transferred ${itemIds.length} item(s) to engineer ${toEngineerId}`
    };
  } catch (error) {
    console.error('Error transferring inventory:', error);
    return {
      success: false,
      message: 'Failed to transfer inventory'
    };
  }
}

export type { InventoryItem, Kit, KitItem, InventoryResponse };
//export interface InventoryResponse {
// items: ItemDto[];
//  kits: KitDto[];
//}
