import { Item } from '../types/purchase'
import { fetchClient } from './fetchClient';



/**
 * GET - Fetches only active items for dropdowns/selectors
 * Endpoint: /api/Items?isActive=true
 */
export const getActiveItems = async (): Promise<Item[]> => {
    // ✅ Clean: No headers, no manual token, no base URL repetition
    const response = await fetchClient('/Items?isActive=true', {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};