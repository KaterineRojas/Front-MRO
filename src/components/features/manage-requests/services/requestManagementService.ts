import { LoanRequest } from '../types';

const API_BASE_URL = 'http://localhost:3000';

// Mock data as fallback if API is unavailable

export async function getPackingRequests(): Promise<LoanRequest[]> {
  try {
    // `db.json` exposes the collection as `requests` for JSON Server
    const response = await fetch(`${API_BASE_URL}/requests`);
    if (!response.ok) {
      console.warn('Failed to fetch packing requests from API, returning empty array');
      return [];
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching packing requests:', error);
    return [];
  }
}

export async function getReturns(): Promise<LoanRequest[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/returns`);
    if (!response.ok) {
      console.warn('Failed to fetch returns from API, returning empty array');
      return [];
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Error fetching returns:', error);
    return [];
  }
}

// Create a new return entry on the server
export async function createReturn(returnReq: LoanRequest): Promise<LoanRequest | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnReq)
    });
    if (!res.ok) throw new Error('Failed to create return on server');
    return await res.json();
  } catch (error) {
    console.warn('Error creating return:', error);
    return null;
  }
}

// Update a packing request status (e.g., 'moved-to-returns' or 'packed')
export async function updatePackingRequestStatus(requestId: number, status: string): Promise<boolean> {
  try {
    // Update the request resource on the server (db.json -> "requests")
    const res = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.ok;
  } catch (error) {
    console.warn('Error updating packing request status:', error);
    return false;
  }
}

// Update the items array of a return request (used when confirming returned items)
export async function updateReturnItems(requestId: number, items: LoanRequest['items']): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/returns/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    return res.ok;
  } catch (error) {
    console.warn('Error updating return items:', error);
    return false;
  }
}
