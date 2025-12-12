import { API_URL } from "../../../../url";
import { store } from "../../../../store/store";


// Types
export interface Transfer {
  id: string;
  type: 'outgoing' | 'incoming';
  fromUser?: string;
  toUser?: string;
  fromUserId?: string;
  toUserId?: string;
  items: TransferItem[];
  notes: string;
  requestDate: string;
  status: 'pending' | 'completed' | 'rejected';
  transferPhoto?: string;
  imageUrl?: string;
  warehouseName?: string;
}

export interface TransferItem {
  itemId: string;
  itemName: string;
  code?: string;
  quantity: number;
  image: string;
  description?: string;
  warehouse?: string;
  warehouseCode?: string;
}

export interface InventoryItem {
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

export interface User {
  id: string;
  name: string;
  department: string;
  avatar: string;
}



// Transfer API Functions

export async function getTransfersIncoming(): Promise<Transfer[]> {
  try {
    const token = store.getState().auth.accessToken as string;
    const recipientId = getCurrentUserId();
    
    const url = `${API_URL}/transfer-requests?recipientId=${recipientId}&status=Pending&pageNumber=1&pageSize=20`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching incoming transfers:', errorText);
      throw new Error(`Error al obtener transferencias: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    if (!responseData.data) {
      return [];
    }

    if (!Array.isArray(responseData.data)) {
      return [];
    }

    const transfers: Transfer[] = responseData.data.map((item: any) => {
      const type = 'incoming';
      return {
        id: item.requestNumber,
        type: type,
        fromUser: item.senderName,
        toUser: item.recipientName,
        fromUserId: item.senderId,
        toUserId: item.recipientId,
        items: Array(item.totalItems).fill(null).map((_, idx) => ({
          itemId: `item-${idx}`,
          itemName: `Item ${idx + 1}`,
          code: '',
          quantity: 1,
          image: '',
          description: '',
          warehouse: item.warehouseName,
          warehouseCode: ''
        })),
        notes: '',
        requestDate: item.createdAt,
        status: mapBackendStatusToLocal(item.status),
        transferPhoto: undefined,
        warehouseName: item.warehouseName,
      };
    });

    return transfers;
  } catch (error) {
    console.error('Error in getTransfersIncoming:', error);
    throw error;
  }
}

/**
 * Get outgoing transfers (sent by current user)
 */
export async function getTransfersOutgoing(): Promise<Transfer[]> {
  try {
    const token = store.getState().auth.accessToken as string;
    const senderId = getCurrentUserId();
    
    const url = `${API_URL}/transfer-requests?senderId=${senderId}&status=PENDING&pageNumber=1&pageSize=20`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching outgoing transfers:', errorText);
      throw new Error(`Error al obtener transferencias: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    if (!responseData.data) {
      return [];
    }

    if (!Array.isArray(responseData.data)) {
      return [];
    }

    const transfers: Transfer[] = responseData.data.map((item: any) => {
      const type = 'outgoing';
      return {
        id: item.requestNumber,
        type: type,
        fromUser: item.senderName,
        toUser: item.recipientName,
        fromUserId: item.senderId,
        toUserId: item.recipientId,
        items: Array(item.totalItems).fill(null).map((_, idx) => ({
          itemId: `item-${idx}`,
          itemName: `Item ${idx + 1}`,
          code: '',
          quantity: 1,
          image: '',
          description: '',
          warehouse: item.warehouseName,
          warehouseCode: ''
        })),
        notes: '',
        requestDate: item.createdAt,
        status: mapBackendStatusToLocal(item.status),
        transferPhoto: undefined,
        warehouseName: item.warehouseName,
      };
    });

    return transfers;
  } catch (error) {
    console.error('Error in getTransfersOutgoing:', error);
    throw error;
  }
}

/**
 * Get a specific transfer by ID
 */
export async function getTransferId(transferId: string): Promise<Transfer> {
  try {
    const token = store.getState().auth.accessToken as string;
    const url = `${API_URL}/transfer-requests/${transferId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener transferencia: ${response.statusText}`);
    }

    const responseData = await response.json();

    const currentUserId = getCurrentUserId();
    const type = responseData.senderId === currentUserId ? 'outgoing' : 'incoming';
    
    const transfer: Transfer = {
      id: responseData.requestNumber,
      type: type,
      fromUser: responseData.senderName || responseData.senderId,
      toUser: responseData.recipientName || responseData.recipientId,
      fromUserId: responseData.senderId,
      toUserId: responseData.recipientId,
      items: responseData.items.map((item: any) => ({
        itemId: item.itemId.toString(),
        itemName: item.name,
        code: item.sku,
        quantity: item.quantity,
        image: item.imageUrl || '',
        description: item.description || '',
        warehouse: responseData.warehouse?.name || '',
        warehouseCode: responseData.warehouse?.code || ''
      })),
      notes: responseData.notes || '',
      requestDate: responseData.createdAt,
      status: mapBackendStatusToLocal(responseData.status),
      transferPhoto: responseData.imageUrl || undefined,
      imageUrl: responseData.imageUrl || undefined,
      warehouseName: responseData.warehouseName || responseData.warehouse?.name || '',
    };

    return transfer;
  } catch (error) {
    console.error('Error fetching transfer details:', error);
    throw error;
  }
}

/**
 * Mapear estado del backend al estado local
 */
function mapBackendStatusToLocal(backendStatus: string): 'pending' | 'completed' | 'rejected' {
  const statusMap: Record<string, 'pending' | 'completed' | 'rejected'> = {
    'Pending': 'pending',
    'Completed': 'completed',
    'Rejected': 'rejected',
  };
  return statusMap[backendStatus] || 'pending';
}

/**
 * Obtener ID del usuario actualmente logueado desde userSlice (engineer module)
 */
function getCurrentUserId(): string {
  try {
    const state = store.getState();
    // Obtener del engineerUser slice (userSlice)
    const userId = (state as any).engineerUser?.currentUser?.id;
    
    if (!userId) {
      const localStorageId = localStorage.getItem('userId');
      return localStorageId || '';
    }
    
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    const fallbackId = localStorage.getItem('userId') || '';
    return fallbackId;
  }
}





/**
 * Get inventory items for a specific engineer and warehouse
 * Based on getInventoryEngineer but with warehouseId filter
 */
export async function getInventoryTransfer(
  engineerId: string,
  warehouseId: string
): Promise<InventoryItem[]> {
  try {
    const token = store.getState().auth.accessToken as string;
    const url = `${API_URL}/engineer-holdings/${engineerId}?warehouseId=${warehouseId}`;
    console.log(`Fetching transfer inventory for engineer: ${engineerId}, warehouse: ${warehouseId}`);
    console.log(`API URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Transfer Inventory API Response:', data);

    // Procesar la respuesta: puede venir como array directo o dentro de holdingsByWarehouse
    const items: InventoryItem[] = [];

    // Si la respuesta es un array directo de items
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        items.push({
          id: `${item.itemId}-${item.warehouseCode || warehouseId}`,
          itemId: item.itemId.toString(),
          name: item.name,
          description: item.description,
          image: item.imageUrl || '',
          project: item.projectIds?.[0] || 'general expenses',
          projectCode: item.projectCode || 'GEN',
          quantity: item.quantity,
          sku: item.sku,
          warehouse: item.warehouseName || '',
          warehouseCode: item.warehouseCode || warehouseId,
        });
      });
    } 
    // Si la respuesta viene con estructura holdingsByWarehouse
    else if (data.holdingsByWarehouse && Array.isArray(data.holdingsByWarehouse)) {
      data.holdingsByWarehouse.forEach((warehouse: any) => {
        if (warehouse.items && Array.isArray(warehouse.items)) {
          warehouse.items.forEach((item: any) => {
            items.push({
              id: `${item.itemId}-${warehouse.warehouse.code}`,
              itemId: item.itemId.toString(),
              name: item.name,
              description: item.description,
              image: item.imageUrl || '',
              project: item.projectIds?.[0] || 'general expenses',
              projectCode: item.projectCode || 'GEN',
              quantity: item.quantity,
              sku: item.sku,
              warehouse: warehouse.warehouse.name,
              warehouseCode: warehouse.warehouse.code,
            });
          });
        }
      });
    }

    return items;
  } catch (error) {
    console.error('Error fetching transfer inventory:', error);
    throw error;
  }
}

/**
 * Create a new transfer - Connect to real API
 */
export async function createTransfer(data: {
  targetEngineerId: string;
  items: { id: string; quantity: number }[];
  photo: string;
  notes?: string;
}): Promise<{ success: boolean; transferId: string }> {
  try {
    const token = store.getState().auth.accessToken as string;
    // Get current user ID from Redux
    const senderId = getCurrentUserId();
    
    if (!senderId) {
      throw new Error('Unable to get current user ID');
    }

    // Prepare the API payload
    const payload = {
      senderId: senderId,
      recipientId: data.targetEngineerId,
      warehouseId: 1, // TODO: Get from form state if needed
      projectId: '', // TODO: Get from form if needed
      imageUrl: data.photo,
      notes: data.notes || '',
      items: data.items.map(item => ({
        itemId: parseInt(item.id) || 0, // Convert to number if needed
        quantity: item.quantity
      }))
    };

    const url = `${API_URL}/transfer-requests`;
    console.log('Creating transfer to URL:', url);
    console.log('Transfer payload:', payload);

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
      console.error('API Error response:', errorData);
      throw new Error(`Error creating transfer: ${response.status} - ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Transfer created successfully:', responseData);

    // Assuming the API returns the request number or ID
    const transferId = responseData.requestNumber || responseData.id || `TR${Date.now()}`;

    return {
      success: true,
      transferId: transferId
    };
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw error;
  }
}

/**
 * Accept an incoming transfer
 * @param transferId - The transfer ID to accept
 * @param recipientId - The recipient user ID
 * @param companyId - The company ID
 * @param customerId - The customer ID
 * @param departmentId - The department ID of the recipient
 * @param projectId - The project ID where items will be assigned
 * @param notes - Optional notes
 */
export async function acceptTransfer(
  transferId: string,
  recipientId: string,
  companyId: string,
  customerId: string,
  departmentId: string,
  projectId: string,
  workOrderId: string,
  notes?: string
): Promise<any> {
  const token = store.getState().auth.accessToken as string;
  if (!recipientId) {
    throw new Error('Recipient ID is required to accept the transfer.');
  }

  if (!projectId) {
    throw new Error('Project ID is required to accept the transfer.');
  }

  // Prepare the payload matching the API requirements
  const payload = {
    companyId,
    customerId,
    departmentId,
    projectId,
    workOrderId,
    notes: notes || ''
  };

  // Build URL with transfer ID and recipient ID as query parameter
  const url = `${API_URL}/transfer-requests/${transferId}/accept?recipientId=${recipientId}`;
  
  console.log('Accepting transfer to URL:', url);
  console.log('Accept payload:', payload);

  // Execute the request
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  // Handle errors
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('API Error Response:', errorBody);
    throw new Error(`Error al aceptar transferencia (Status: ${response.status}): ${errorBody || response.statusText}`);
  }

  // Return the response
  return await response.json();
}

/**
 * Reject an incoming transfer using the API
 */
export async function rejectTransfer(
  transferId: string
): Promise<{ success: boolean }> {
  try {
    const token = store.getState().auth.accessToken as string;
    const url = `${API_URL}/transfer-requests/${transferId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Transfer not found');
      }
      throw new Error(`Error rejecting transfer: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
}




/**
 * Delete a transfer by ID
 */
export async function deleteTransfer(transferId: string): Promise<{ success: boolean; message: string }> {
  try {
    const token = store.getState().auth.accessToken as string;
    const url = `${API_URL}/transfer-requests/${transferId}`;
    console.log('Deleting transfer from URL:', url);
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar transferencia: ${response.statusText}`);
    }

    // Try to parse JSON response, but handle empty responses
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
        console.log('Delete response:', responseData);
      } catch (e) {
        console.log('Response is not valid JSON, but DELETE was successful');
        responseData = null;
      }
    } else {
      console.log('Response is not JSON content type, but DELETE was successful');
      responseData = null;
    }

    return {
      success: true,
      message: 'Transfer deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting transfer:', error);
    throw error;
  }
}