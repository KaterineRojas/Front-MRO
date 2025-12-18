import { API_URL } from "../../../../url";
import { fetchWithAuth } from '../../../../utils/fetchWithAuth';
import { store } from '../../../../store/store';

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

const resolveWarehouseId = (override?: number | string | null): number | undefined => {
  const state = store.getState();
  const fallback = state.auth.user?.warehouseId ?? state.auth.user?.warehouse ?? null;
  const value = override ?? fallback;

  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
  return Number.isNaN(parsed) ? undefined : parsed;
};

// ===================================================================
// FUNCIONES TEMPORALMENTE DESACTIVADAS - PENDIENTE NUEVA LÓGICA BINS
// ===================================================================

/**
 * MOCK: Fetches all available bins from the API
 * ✅ REACTIVADO - Usa nueva lógica de bins jerárquicos si no tiene un bin asignado llama a este
 */
export async function getAvailableBins(warehouseId?: number | string | null, isActive?: boolean): Promise<Bin[]> {
  try {
    const resolvedWarehouseId = resolveWarehouseId(warehouseId ?? null);
    if (resolvedWarehouseId === undefined) {
      console.warn('⚠️ getAvailableBins: warehouseId is not available; returning empty list');
      return [];
    }

    // Construir URL con parámetros
    const params = new URLSearchParams();
    params.append('warehouseId', resolvedWarehouseId.toString());
    if (isActive !== undefined) {
      params.append('isActive', isActive.toString());
    }
    // allowDifferentItems=false significa bins que solo aceptan un tipo de item
    params.append('allowDifferentItems', 'false');

    const url = `${API_URL}/Bin/available${params.toString() ? '?' + params.toString() : ''}`;
    console.log('🔍 Fetching available bins from****:', url);

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      // console.warn(`⚠️ Failed to fetch available bins: ${response.status} - ${errorText}`);
      return [];
    }

    // Verificar que la respuesta sea JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // console.warn(`⚠️ Expected JSON response but got: ${contentType}`);
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
    // console.error('Error fetching available bins:', error);
    return [];
  }
}

/**
 * MOCK: Checks if an item has an occupied bin
 * ✅ REACTIVADO - Usa nueva lógica de bins jerárquicos
 */
export async function checkItemOccupation(
  itemId: number,
  warehouseId?: number | string
): Promise<CheckItemOccupationResponse | null> {
  try {
    const resolvedWarehouseId = resolveWarehouseId(warehouseId ?? null);

    const params = new URLSearchParams();
    params.append('itemId', String(itemId));
    if (resolvedWarehouseId !== undefined && resolvedWarehouseId !== null) {
      params.append('warehouseId', String(resolvedWarehouseId));
    }

    const url = `${API_URL}/Bin/check-item-occupation${params.size ? `?${params.toString()}` : ''}`;
    console.log('🔍 Checking item occupation***:', url);

    const response = await fetchWithAuth(url, {
      method: 'GET',
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
      console.warn('⚠️ URL was:', url);
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
    const response = await fetchWithAuth(`${API_URL}/Bins/check-item-occupation?kitId=${kitId}`, {
      method: 'GET',
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
    const response = await fetchWithAuth(`${API_URL}/Bins/check-item-occupation?kitId=${kitId}`, {
      method: 'GET',
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


/**
 * GET available bins
 * 
 */
export async function getAllAvailableBins(
  warehouseId: number, 
  isActive: boolean = true
): Promise<AvailableBinResponse[]> {
  
  if (!warehouseId || warehouseId <= 0) {
    console.warn('❌ getAllAvailableBins: Invalid warehouseId provided', warehouseId);
    return [];
  }

  try {
    // 2. Build Query Params strictly matching the Swagger definition
    const params = new URLSearchParams({
      warehouseId: warehouseId.toString(),
      isActive: isActive.toString()
    });

    // Note: We do NOT append 'allowDifferentItems' as it wasn't in your Swagger screenshot.
    // If you discover it is needed later, uncomment the next line:
    // params.append('allowDifferentItems', 'false');

    const url = `${API_URL}/Bin/available?${params.toString()}`;

    const response = await fetchWithAuth(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const data: AvailableBinResponse[] = await response.json();

    return data.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      fullCode: item.fullCode,
      allowDifferentItems: item.allowDifferentItems ?? false
    }));

  } catch (error) {
    console.error('Error in getWarehouseAvailableBins:', error);
    return [];
  }
}
