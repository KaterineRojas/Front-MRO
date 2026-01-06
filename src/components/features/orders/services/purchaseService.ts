import { Item, CreatePurchaseRequestPayload, PurchaseRequest, PaginatedResponse } from '../types/purchaseType'
import { fetchClient } from './fetchClient';

/**
 * GET - Fetches only active items for dropdowns/selectors
 * Endpoint: /api/Items?isActive=true
 */
export const getActiveItems = async (signal?: AbortSignal): Promise<Item[]> => {
    const response = await fetchClient('/Items?isActive=true', {
        method: 'GET',
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
    }

    return await response.json();
};

/**
 * POST - Creates a new Purchase Request
 * Endpoint: /api/p urchase-requests 
 */
export const createPurchaseRequest = async (payload: CreatePurchaseRequestPayload): Promise<any> => {
    const response = await fetchClient('/purchase-requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || response.statusText;
        
        throw new Error(`Failed to create request: ${errorMessage}`);
    }

    return await response.json();
};


/**
 * GET - Fetches ALL purchase requests for the Main Table
 * Endpoint: /api/PurchaseRequests
 */
export const getAllPurchaseRequests = async (signal?: AbortSignal): Promise<PurchaseRequest[]> => {
    const response = await fetchClient('/purchase-requests?warehouseId=1', {
        method: 'GET',
        signal, 
    });

    if (!response.ok) {
        let errorMessage = response.statusText;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorBody.error || response.statusText;
        } catch {
            // If response isn't JSON, fallback to statusText
        }
        
        throw new Error(`Error ${response.status}: ${errorMessage}`);
    }

    const json: PaginatedResponse<PurchaseRequest> = await response.json();
    return json.data; 
};


/**
 * Approves a specific purchase request.
 * @param id - The ID of the purchase request to approve.
 * @returns A promise that resolves with the server's success message.
 */
export const approvePurchaseRequest = async (id: number): Promise<string> => {
    const response = await fetchClient(`/purchase-requests/${id}/approve`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', 
        }
    });

    if (!response.ok) {
        let errorMessage = `Failed to approve request #${id}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
            errorMessage = response.statusText;
        }
        throw new Error(errorMessage);
    }

    const successMessage = await response.text();
    return successMessage;
};

/**
 * Rejects a specific purchase request.
 * @param id - The ID of the purchase request.
 * @param reason - The mandatory reason for rejection.
 */
export const rejectPurchaseRequest = async (id: number, reason: string): Promise<string> => {
    const response = await fetchClient(`/purchase-requests/${id}/reject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
        let errorMessage = `Failed to reject request #${id}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
            errorMessage = response.statusText;
        }
        throw new Error(errorMessage);
    }

    // Handle text/plain response
    return await response.text();
};