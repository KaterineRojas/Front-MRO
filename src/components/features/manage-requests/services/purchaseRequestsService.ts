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
        // Fetch all purchase requests for the warehouse first
        const url = `${API_URL}/purchase-requests?warehouseId=${warehouseId}`;
        
        const response = await fetchWithAuth(url, {
            method: 'GET',
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const allData = result.data || [];

        console.log('🔍 All purchase requests from API:', allData);
        console.log('🔍 Requested statuses:', statuses);

        // Filter by status in frontend if statuses are provided
        if (statuses && statuses.length > 0) {
            const filtered = allData.filter((request: any) => {
                console.log('🔍 Checking request:', request.id, 'Status:', request.status, 'Type:', typeof request.status);
                
                // Handle both string and numeric status
                if (typeof request.status === 'string') {
                    return statuses.includes(request.status);
                } else if (typeof request.status === 'number') {
                    // Map numeric status to string: 1=Approved, 3=Ordered, 4=Received
                    const statusMap: Record<number, string> = {
                        1: 'Approved',
                        3: 'Ordered', 
                        4: 'Received',
                    };
                    const statusString = statusMap[request.status];
                    console.log('🔍 Mapped status:', request.status, '->', statusString);
                    return statuses.includes(statusString);
                }
                return false;
            });
            
            console.log('🔍 Filtered results:', filtered);
            return filtered;
        }

        // API returns paginated response with { data: [], pageNumber, pageSize, totalCount, totalPages }
        return allData;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw error;
        }
        console.error('Error fetching purchase requests:', error);
        throw new Error(error.message || 'Failed to fetch purchase requests');
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
 */
export const markAsBought = async (id: number): Promise<void> => {
    try {
        const url = `${API_URL}/purchase-requests/${id}/receive`;
        
        const response = await fetchWithAuth(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error: any) {
        console.error('Error marking as bought:', error);
        throw new Error(error.message || 'Failed to mark as bought');
    }
};
