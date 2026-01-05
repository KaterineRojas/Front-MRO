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
    const response = await fetchClient('/purchase-requests', {
        method: 'GET',
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const json: PaginatedResponse<PurchaseRequest> = await response.json();
    
    return json.data; 
};