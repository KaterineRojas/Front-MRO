import { API_URL } from "../../../../url"; 

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
  id: number;
  binCode: string;
  type: string; 
  description: string;
}

/**
 * Transforms API bin response to application Bin format
 */
function transformBin(apiBin: BinResponse): Bin {
  return {
    id: apiBin.id,
    binCode: apiBin.binCode,
    type: apiBin.type || 'Unknown', // ✅ Usar el tipo tal cual viene del backend
    description: apiBin.description || '',
  };
}

/**
 * Fetches all available bins from the API
 * @param binPurpose - Optional parameter to filter bins by purpose (e.g., 0 for GoodCondition)
 * @param isActive - Optional parameter to filter only active bins
 */
export async function getAvailableBins(binPurpose?: number, isActive?: boolean): Promise<Bin[]> {
  try {
    const params = new URLSearchParams();
    if (binPurpose !== undefined) {
      params.append('binPurpose', binPurpose.toString());
    }
    if (isActive !== undefined) {
      params.append('isActive', isActive.toString());
    }

    const url = `${API_URL}/Bins/available${params.toString() ? '?' + params.toString() : ''}`;

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
export interface CheckItemOccupationResponse {
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
 * Checks if an item has an occupied bin of type GoodCondition
 * @param itemId - The ID of the item
 * @returns The occupation info including bin details, or null if not occupied
 */
export async function checkItemOccupation(itemId: number): Promise<CheckItemOccupationResponse | null> {
  try {
    const response = await fetch(`${API_URL}/Bins/check-item-occupation?itemId=${itemId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to check item occupation: ${response.status} ${response.statusText}`);
    }

    const data: CheckItemOccupationResponse = await response.json();
    return data.isOccupied ? data : null;
  } catch (error) {
    console.error('Error checking item occupation:', error);
    return null;
  }
}

/**
 * Checks if a kit has an occupied bin of type GoodCondition
 * @param kitId - The ID of the kit
 * @returns The occupation info including bin details, or null if not occupied
 */
export async function checkKitOccupation(kitId: number): Promise<CheckItemOccupationResponse | null> {
  try {
    const response = await fetch(`${API_URL}/Bins/check-item-occupation?kitId=${kitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to check kit occupation: ${response.status} ${response.statusText}`);
    }

    const data: CheckItemOccupationResponse = await response.json();
    return data.isOccupied ? data : null;
  } catch (error) {
    console.error('Error checking kit occupation:', error);
    return null;
  }
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
    return data.occupiedBin.binCode; 
  } catch (error) {
    console.error('Error fetching kit current bin:', error);
    throw error;
  }
}

/**
 * Fetches available bin types from the API
 * @returns Array of bin types with value and label
 */
export async function getBinTypes(): Promise<{ value: string; label: string }[]> {
  try {
    const response = await fetch(`${API_URL}/Bins/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bin types: ${response.status} ${response.statusText}`);
    }

    const data: string[] = await response.json();

    const formattedData = data.map(binType => ({
      value: binType,
      label: binType,
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching bin types:', error);
    throw error;
  }
}

// Al inicio del archivo, después de los imports
/**
 * Mapeo de tipos de bin (string) a binPurpose (número)
 */
const BIN_PURPOSE_MAP: Record<string, number> = {
  'GoodCondition': 0,
  'OnRevision': 1,
  'Scrap': 2,
  'Hold': 3,
  'Packing': 4,
  'Reception': 5,
};

/**
 * Convierte un tipo de bin (string) a su binPurpose (número)
 */
export function getBinPurposeFromType(type: string): number {
  return BIN_PURPOSE_MAP[type] ?? 0; // Default a 0 si no encuentra
}

/**
 * Convierte un binPurpose (número) a tipo de bin (string)
 */
export function getTypeFromBinPurpose(binPurpose: number): string {
  const entry = Object.entries(BIN_PURPOSE_MAP).find(([_, value]) => value === binPurpose);
  return entry ? entry[0] : 'GoodCondition';
}