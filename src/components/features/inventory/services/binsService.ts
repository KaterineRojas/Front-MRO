import { API_URL } from "../../../../url";

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
 * Available Bin response from new API
 */
export interface AvailableBinResponse {
  id: number;
  code: string;
  name: string;
  fullCode: string;
  allowDifferentItems: boolean;
}

/**
 * API response format for check-item-occupation endpoint (NUEVA LÓGICA)
 */
export interface CheckItemOccupationResponse {
  isOccupied: boolean;
  message: string;
  occupiedBin: {
    id: number;
    binCode: string;
    description: string;
    isActive: boolean;
  } | null;
  quantity: number | null;
}

// ===================================================================
// FUNCIONES TEMPORALMENTE DESACTIVADAS - PENDIENTE NUEVA LÓGICA BINS
// ===================================================================

/**
 * MOCK: Fetches all available bins from the API
 * ✅ REACTIVADO - Usa nueva lógica de bins jerárquicos
 */
export async function getAvailableBins(_binPurpose?: number, isActive?: boolean): Promise<Bin[]> {
  try {
    // Construir URL con parámetros
    const params = new URLSearchParams();
    if (isActive !== undefined) {
      params.append('isActive', isActive.toString());
    }
    // allowDifferentItems=false significa bins que solo aceptan un tipo de item
    params.append('allowDifferentItems', 'false');

    const url = `${API_URL}/Bin/available${params.toString() ? '?' + params.toString() : ''}`;
    console.log('🔍 Fetching available bins from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ Failed to fetch available bins: ${response.status} - ${errorText}`);
      return [];
    }

    // Verificar que la respuesta sea JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`⚠️ Expected JSON response but got: ${contentType}`);
      return [];
    }

    const data: AvailableBinResponse[] = await response.json();
    console.log(`✅ Loaded ${data.length} available bins`);

    // Transformar a formato Bin
    return data.map(bin => ({
      id: bin.id,
      binCode: bin.fullCode, // Usar fullCode (WH01-ZC-R01-L01-B01)
      type: 'GoodCondition', // Asumimos GoodCondition para bins disponibles
      description: bin.name
    }));
  } catch (error) {
    console.error('Error fetching available bins:', error);
    return [];
  }
}

/**
 * MOCK: Checks if an item has an occupied bin
 * ✅ REACTIVADO - Usa nueva lógica de bins jerárquicos
 */
export async function checkItemOccupation(itemId: number): Promise<CheckItemOccupationResponse | null> {
  try {
    const response = await fetch(`${API_URL}/Bin/check-item-occupation?itemId=${itemId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`ℹ️ Item ${itemId} does not have an occupied bin (404)`);
        return null;
      }
      const errorText = await response.text();
      console.warn(`⚠️ Failed to check item occupation: ${response.status} - ${errorText}`);
      return null;
    }

    // Verificar que la respuesta sea JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`⚠️ Expected JSON response but got: ${contentType}`);
      console.warn(`⚠️ URL was: ${API_URL}/Bin/check-item-occupation?itemId=${itemId}`);
      return null;
    }

    const data: CheckItemOccupationResponse = await response.json();
    console.log(`📦 Check item occupation response for item ${itemId}:`, data);
    return data; // Retornar siempre la respuesta completa, no solo cuando isOccupied es true
  } catch (error) {
    console.error('Error checking item occupation:', error);
    return null;
  }
}

/**
 * MOCK: Checks if a kit has an occupied bin
 * ✅ REACTIVADO - Usa nueva lógica de bins jerárquicos
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
        console.log(`ℹ️ Kit ${kitId} does not have an occupied bin (404)`);
        return null;
      }
      const errorText = await response.text();
      console.warn(`⚠️ Failed to check kit occupation: ${response.status} - ${errorText}`);
      return null;
    }

    // Verificar que la respuesta sea JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`⚠️ Expected JSON response but got: ${contentType}`);
      return null;
    }

    const data: CheckItemOccupationResponse = await response.json();
    return data.isOccupied ? data : null;
  } catch (error) {
    console.error('Error checking kit occupation:', error);
    return null;
  }
}

/**
 * MOCK: Fetches the current bin for a specific kit
 * ✅ REACTIVADO - Usa nueva lógica de bins jerárquicos
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
      const errorText = await response.text();
      throw new Error(`Failed to fetch kit bin: ${response.status} - ${errorText}`);
    }

    // Verificar que la respuesta sea JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but got: ${contentType}`);
    }

    const data: CheckItemOccupationResponse = await response.json();
    
    if (!data.occupiedBin) {
      throw new Error('Kit does not have an occupied bin');
    }
    
    return data.occupiedBin.binCode; 
  } catch (error) {
    console.error('Error fetching kit current bin:', error);
    throw error;
  }
}

/**
 * MOCK: Fetches available bin types
 * @deprecated Temporalmente desactivado - pendiente migración a nueva lógica de bins
 */
export async function getBinTypes(): Promise<{ value: string; label: string }[]> {
  console.warn('⚠️ getBinTypes temporalmente desactivado - pendiente migración a nueva lógica');
  return [];
}

/**
 * Convierte un tipo de bin (string) a su binPurpose (número)
 */
export function getBinPurposeFromType(_type: string): number {
  return 0; // Default
}

/**
 * Convierte un binPurpose (número) a tipo de bin (string)
 */
export function getTypeFromBinPurpose(_binPurpose: number): string {
  return 'GoodCondition';
}

// ===================================================================
// CÓDIGO ORIGINAL COMENTADO (PENDIENTE MIGRACIÓN)
// ===================================================================

// /**
//  * API response format for bins
//  */
// export interface BinResponse {
//   id: number;
//   binCode: string;
//   type?: string | null;
//   description?: string | null;
// }
 
// /**
//  * Application Bin type
//  */
// export interface Bin {
//   id: number;
//   binCode: string;
//   type: string; 
//   description: string;
// }

// /**
//  * Transforms API bin response to application Bin format
//  */
// function transformBin(apiBin: BinResponse): Bin {
//   return {
//     id: apiBin.id,
//     binCode: apiBin.binCode,
//     type: apiBin.type || 'Unknown', // ✅ Usar el tipo tal cual viene del backend
//     description: apiBin.description || '',
//   };
// }

// /**
//  * Fetches all available bins from the API
//  */
// export async function getAvailableBins(binPurpose?: number, isActive?: boolean): Promise<Bin[]> {
//   try {
//     const params = new URLSearchParams();
//     if (binPurpose !== undefined) {
//       params.append('binPurpose', binPurpose.toString());
//     }
//     if (isActive !== undefined) {
//       params.append('isActive', isActive.toString());
//     }

//     const url = `${API_URL}/Bins/available${params.toString() ? '?' + params.toString() : ''}`;

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch bins: ${response.status} ${response.statusText}`);
//     }

//     const data: BinResponse[] = await response.json();
//     return data.map(transformBin);
//   } catch (error) {
//     console.error('Error fetching available bins:', error);
//     throw error;
//   }
// }

// /**
//  * API response format for check-item-occupation endpoint
//  */
// export interface CheckItemOccupationResponse {
//   isOccupied: boolean;
//   message: string;
//   occupiedBin: {
//     id: number;
//     binCode: string;
//     description: string;
//     binPurpose: number;
//     binPurposeDisplay: string;
//     isActive: boolean;
//     createdAt: string;
//     updatedAt: string;
//   };
//   quantity: number;
// }

// /**
//  * Checks if an item has an occupied bin of type GoodCondition
//  * @param itemId - The ID of the item
//  * @returns The occupation info including bin details, or null if not occupied
//  */
// export async function checkItemOccupation(itemId: number): Promise<CheckItemOccupationResponse | null> {
//   try {
//     const response = await fetch(`${API_URL}/Bins/check-item-occupation?itemId=${itemId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       if (response.status === 404) {
//         return null;
//       }
//       throw new Error(`Failed to check item occupation: ${response.status} ${response.statusText}`);
//     }

//     const data: CheckItemOccupationResponse = await response.json();
//     return data.isOccupied ? data : null;
//   } catch (error) {
//     console.error('Error checking item occupation:', error);
//     return null;
//   }
// }

// /**
//  * Checks if a kit has an occupied bin of type GoodCondition
//  * @param kitId - The ID of the kit
//  * @returns The occupation info including bin details, or null if not occupied
//  */
// export async function checkKitOccupation(kitId: number): Promise<CheckItemOccupationResponse | null> {
//   try {
//     const response = await fetch(`${API_URL}/Bins/check-item-occupation?kitId=${kitId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       if (response.status === 404) {
//         return null;
//       }
//       throw new Error(`Failed to check kit occupation: ${response.status} ${response.statusText}`);
//     }

//     const data: CheckItemOccupationResponse = await response.json();
//     return data.isOccupied ? data : null;
//   } catch (error) {
//     console.error('Error checking kit occupation:', error);
//     return null;
//   }
// }

// /**
//  * Fetches the current bin for a specific kit
//  * @param kitId - The ID of the kit
//  * @returns The bin code where the kit is currently stored
//  */
// export async function getKitCurrentBin(kitId: number): Promise<string> {
//   try {
//     const response = await fetch(`${API_URL}/Bins/check-item-occupation?kitId=${kitId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch kit bin: ${response.status} ${response.statusText}`);
//     }

//     const data: CheckItemOccupationResponse = await response.json();
//     return data.occupiedBin.binCode; 
//   } catch (error) {
//     console.error('Error fetching kit current bin:', error);
//     throw error;
//   }
// }

// /**
//  * Fetches available bin types from the API
//  * @returns Array of bin types with value and label
//  */
// export async function getBinTypes(): Promise<{ value: string; label: string }[]> {
//   try {
//     const response = await fetch(`${API_URL}/Bins/types`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch bin types: ${response.status} ${response.statusText}`);
//     }

//     const data: string[] = await response.json();

//     const formattedData = data.map(binType => ({
//       value: binType,
//       label: binType,
//     }));

//     return formattedData;
//   } catch (error) {
//     console.error('Error fetching bin types:', error);
//     throw error;
//   }
// }

// // Al inicio del archivo, después de los imports
// /**
//  * Mapeo de tipos de bin (string) a binPurpose (número)
//  */
// const BIN_PURPOSE_MAP: Record<string, number> = {
//   'GoodCondition': 0,
//   'OnRevision': 1,
//   'Scrap': 2,
//   'Hold': 3,
//   'Packing': 4,
//   'Reception': 5,
// };

// /**
//  * Convierte un tipo de bin (string) a su binPurpose (número)
//  */
// export function getBinPurposeFromType(type: string): number {
//   return BIN_PURPOSE_MAP[type] ?? 0; // Default a 0 si no encuentra
// }

// /**
//  * Convierte un binPurpose (número) a tipo de bin (string)
//  */
// export function getTypeFromBinPurpose(binPurpose: number): string {
//   const entry = Object.entries(BIN_PURPOSE_MAP).find(([_, value]) => value === binPurpose);
//   return entry ? entry[0] : 'GoodCondition';
// }