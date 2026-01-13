import type { Transaction, TransactionType } from '../tabs/transactions/transactionTypes';
import { API_URL } from "../../../../url";
import { fetchWithAuth } from '../../../../utils/fetchWithAuth';
import { store } from '../../../../store/store';

/**
 * API response format for transactions
 */
interface TransactionResponse {
  id: number;
  transactionType: TransactionType;
  subType: string;
  quantityChange: number;
  itemName: string;
  itemSku: string;
  fromBin: string | null;
  toBin: string | null;
  notes: string | null;
  createdAt: string;
}

/**
 * Transforms API transaction response to application Transaction format
 */
function transformTransaction(apiTransaction: TransactionResponse): Transaction {
  return {
    id: apiTransaction.id,
    transactionType: apiTransaction.transactionType,
    subType: apiTransaction.subType,
    quantityChange: apiTransaction.quantityChange,
    itemName: apiTransaction.itemName,
    itemSku: apiTransaction.itemSku,
    fromBin: apiTransaction.fromBin,
    toBin: apiTransaction.toBin,
    notes: apiTransaction.notes,
    createdAt: apiTransaction.createdAt,
  };
}

/**
 * Fetches all transactions from the API
 * GET /api/Transactions ya con warehouseId *****
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const state = store.getState();
    const warehouseId = state.auth.user?.warehouseId ?? state.auth.user?.warehouse ?? null;
    const searchParams = new URLSearchParams();
    if (warehouseId !== null && warehouseId !== undefined) {
      searchParams.append('warehouseId', String(warehouseId));
    }

    const url = `${API_URL}/Transactions${searchParams.size ? `?${searchParams.toString()}` : ''}`;

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });
    console.log('Fetching all transactions from:', url);
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
    }

    const data: TransactionResponse[] = await response.json();
    return data.map(transformTransaction);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Fetches a single transaction by ID
 * GET /api/Transactions/{id}
 */
export async function getTransactionById(id: number): Promise<Transaction> {
  try {
    const response = await fetchWithAuth(`${API_URL}/Transactions/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction: ${response.status} ${response.statusText}`);
    }

    const data: TransactionResponse = await response.json();
    return transformTransaction(data);
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    throw error;
  }
}

/**
 * Fetches all transactions for a specific item
 * GET /api/Transactions/by-item/{itemId}
 */
export async function getTransactionsByItem(itemId: number): Promise<Transaction[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/Transactions/by-item/${itemId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions for item ${itemId}: ${response.status} ${response.statusText}`);
    }

    const data: TransactionResponse[] = await response.json();
    return data.map(transformTransaction);
  } catch (error) {
    console.error(`Error fetching transactions for item ${itemId}:`, error);
    throw error;
  }
}

/**
 * Fetches all transactions for a specific inventory
 * GET /api/Transactions/by-inventory/{inventoryId}
 */
export async function getTransactionsByInventory(inventoryId: number): Promise<Transaction[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/Transactions/by-inventory/${inventoryId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions for inventory ${inventoryId}: ${response.status} ${response.statusText}`);
    }

    const data: TransactionResponse[] = await response.json();
    return data.map(transformTransaction);
  } catch (error) {
    console.error(`Error fetching transactions for inventory ${inventoryId}:`, error);
    throw error;
  }
}

/**
 * Fetches all available transaction types
 * GET /api/Transactions/types
 */
export async function getTransactionTypes(): Promise<TransactionType[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/Transactions/types`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction types: ${response.status} ${response.statusText}`);
    }

    const data: TransactionType[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching transaction types:', error);
    throw error;
  }
}
