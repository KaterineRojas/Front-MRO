import { API_URL } from '../../../../url';
import { fetchWithAuth } from '../../../../utils/fetchWithAuth';

/**
 * Fetches purchase requests by warehouse and status filters
 * @param warehouseId - The warehouse ID to filter by
 * @param statuses - Array of status strings to filter by (e.g., ['Approved', 'Ordered'])
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Array of purchase requests
 */
export const getPurchaseRequestsByStatus = async (
    warehouseId: number,
    statuses: string[],
    signal?: AbortSignal
): Promise<any[]> => {
    try {
        // Fetch requests for each status separately and combine results
        const allResults: any[] = [];
        
        for (const status of statuses) {
            const url = `${API_URL}/purchase-requests?warehouseId=${warehouseId}&status=${encodeURIComponent(status)}`;
            
            console.log('📦 Fetching purchase requests from:', url);
            
            const response = await fetchWithAuth(url, {
                method: 'GET',
                signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const statusData = result.data || result || [];
            
            console.log(`🔍 Purchase requests with status "${status}":`, statusData);
            
            // Add results to combined array, avoiding duplicates
            allResults.push(...statusData);
        }
        
        console.log('🔍 Combined purchase requests from all statuses:', allResults);

        return allResults;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw error;
        }
        console.error('Error fetching purchase requests:', error);
        throw new Error(error.message || 'Failed to fetch purchase requests');
    }
};

/**
 * Fetches on-site purchase requests (type=3) by warehouse
 * @param warehouseId - The warehouse ID to filter by
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Array of on-site purchase requests
 */
export const getPurchaseOnSiteRequests = async (
    warehouseId: number,
    signal?: AbortSignal
): Promise<any[]> => {
    try {
        const url = `${API_URL}/purchase-requests?warehouse=${warehouseId}&type=3`;
        
        console.log('📦 Fetching on-site purchase requests from:', url);
        
        const response = await fetchWithAuth(url, {
            method: 'GET',
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const data = result.data || result || [];
        
        console.log('🔍 On-site purchase requests (type=3):', data);

        return data;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw error;
        }
        console.error('Error fetching on-site purchase requests:', error);
        throw new Error(error.message || 'Failed to fetch on-site purchase requests');
    }
};

/**
 * Marks a purchase request as Ordered
 * @param id - The purchase request ID
 */
export const markAsOrdered = async (id: number): Promise<void> => {
    try {
        const url = `${API_URL}/purchase-requests/${id}/mark-ordered`;
        
        const response = await fetchWithAuth(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error: any) {
        console.error('Error marking as ordered:', error);
        throw new Error(error.message || 'Failed to mark as ordered');
    }
};

/**
 * Marks a purchase request as Bought/Received
 * @param id - The purchase request ID
 * @param receivedQuantities - Object with item IDs as keys and received quantities as values
 */
export const markAsBought = async (id: number, receivedQuantities?: Record<number, number>): Promise<void> => {
    try {
        const url = `${API_URL}/purchase-requests/${id}/receive`;
        
        console.log('📦 Raw receivedQuantities:', receivedQuantities);
        
        // Construir el payload con la estructura correcta del endpoint
        const receivedItems = Object.entries(receivedQuantities || {})
            .filter(([_, quantity]) => quantity > 0)
            .map(([itemId, quantityReceived]) => ({
                itemId: parseInt(itemId, 10),
                quantityReceived: quantityReceived
            }));
        
        console.log('📦 Received items to send:', receivedItems);
        
        // Validar que hay al menos un item
        if (receivedItems.length === 0) {
            throw new Error('At least one item with quantity > 0 must be received');
        }
        
        // Crear payload con la estructura correcta
        const payload = {
            receivedItems: receivedItems
        };
        
        console.log('📦 Final payload:', JSON.stringify(payload, null, 2));
        console.log('📦 Marking as bought/received:', { id, url });
        
        const response = await fetchWithAuth(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Successfully marked as bought/received:', result);
    } catch (error: any) {
        console.error('❌ Error marking as bought:', error);
        throw new Error(error.message || 'Failed to mark as bought');
    }
};
