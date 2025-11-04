// src/services/binsService.ts
import { API_URL } from '../url';

/**
 * API response format for bins
 */
export interface BinResponse {
  id: number;
  binCode: string;
  type?: string | null;
  description?: string | null;
}

/**
 * Application Bin type
 */
export interface Bin {
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap';
  description: string;
}

/**
 * Transforms API bin type to application type format
 */
function transformBinType(apiType: string | undefined | null): 'good-condition' | 'on-revision' | 'scrap' {
  // Handle undefined, null, or empty string
  if (!apiType) {
    return 'good-condition';
  }

  const normalizedType = apiType.toLowerCase().trim();

  if (normalizedType.includes('good') || normalizedType.includes('condition')) {
    return 'good-condition';
  }
  if (normalizedType.includes('revision')) {
    return 'on-revision';
  }
  if (normalizedType.includes('scrap')) {
    return 'scrap';
  }

  // Default to good-condition if type is unknown
  return 'good-condition';
}

/**
 * Transforms API bin response to application Bin format
 */
function transformBin(apiBin: BinResponse): Bin {
  return {
    binCode: apiBin.binCode,
    type: transformBinType(apiBin.type),
    description: apiBin.description || '',
  };
}

/**
 * Fetches all available bins from the API
 * @param binPurpose - Optional parameter to filter bins by purpose (e.g., 0 for kit building)
 */
export async function getAvailableBins(binPurpose?: number): Promise<Bin[]> {
  try {
    const url = binPurpose !== undefined
      ? `${API_URL}/Bins/available?binPurpose=${binPurpose}`
      : `${API_URL}/Bins/available`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bins: ${response.status} ${response.statusText}`);
    }

    const data: BinResponse[] = await response.json();
    return data.map(transformBin);
  } catch (error) {
    console.error('Error fetching available bins:', error);
    throw error;
  }
}

/**
 * API response format for check-item-occupation endpoint
 */
interface CheckItemOccupationResponse {
  isOccupied: boolean;
  message: string;
  occupiedBin: {
    id: number;
    binCode: string;
    description: string;
    binPurpose: number;
    binPurposeDisplay: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  quantity: number;
}

/**
 * Fetches the current bin for a specific kit
 * @param kitId - The ID of the kit
 * @returns The bin code where the kit is currently stored
 */
export async function getKitCurrentBin(kitId: number): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/Bins/check-item-occupation?kitId=${kitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch kit bin: ${response.status} ${response.statusText}`);
    }

    const data: CheckItemOccupationResponse = await response.json();
    // Extract the binCode from the occupiedBin object
    return data.occupiedBin.binCode;
  } catch (error) {
    console.error('Error fetching kit current bin:', error);
    throw error;
  }
}
