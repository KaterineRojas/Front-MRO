// src/services/transactionService.ts

import type { Transaction, TransactionType } from '../tabs/transactions/transactionTypes';
import { API_URL } from "../../../../url";
//const API_URL = 'http://localhost:5000/api';

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
 * GET /api/Transactions
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const response = await fetch(`${API_URL}/Transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
    const response = await fetch(`${API_URL}/Transactions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_URL}/Transactions/by-item/${itemId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_URL}/Transactions/by-inventory/${inventoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_URL}/Transactions/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
