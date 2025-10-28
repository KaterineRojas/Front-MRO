import type { Bin, BinResponse } from '../types';
import { API_URL, getBinPurposeDisplay, binPurposeMap } from './inventoryService'; // Importar utilidades compartidas
/**
 * Transforma la respuesta de la API (BinResponse) a nuestro modelo de aplicación (Bin).
 */
export function transformBin(apiBin: BinResponse): Bin {
  // Función helper para mapear el tipo de Bin de la API (string) a nuestro modelo ('good-condition', 'on-revision', etc.)
  function mapBinType(apiType: BinResponse['binPurposeDisplay']): Bin['type'] {
    const mappedType = binPurposeMap[apiType] || 'good-condition';
    // Se asegura de que el tipo retornado coincida con el tipo esperado de Bin['type']
    return mappedType as Bin['type']; 
  }

  return {
    id: apiBin.id,
    binCode: apiBin.binCode,
    description: apiBin.description || apiBin.name || '', // Usar description o name
    type: mapBinType(apiBin.binPurposeDisplay),
  };
}


/**
 * Obtiene todos los bins activos de la API.
 */
export async function fetchBinsFromApi(): Promise<Bin[]> {
  try {
    const response = await fetch(`${API_URL}/Bins?isActive=true`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bins: ${response.status} ${response.statusText}`);
    }

    const data: BinResponse[] = await response.json();
    return data.map(transformBin);
  } catch (error) {
    console.error('Error fetching all bins:', error);
    throw error;
  }
}

/**
 * Obtiene bins disponibles (ej. para crear nuevos artículos, usualmente GoodCondition).
 */
export async function getNewBins(): Promise<Bin[]> {
  try {
    const response = await fetch(`${API_URL}/Bins?isActive=true`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch new bins: ${response.status} ${response.statusText}`);
    }

    const data: BinResponse[] = await response.json();
    
    // Solo retornar bins en 'GoodCondition'
    return data
      .filter(bin => bin.binPurposeDisplay === 'GoodCondition')
      .map(transformBin);
  } catch (error) {
    console.error('Error fetching new bins:', error);
    throw error;
  }
}

/**
 * Crea un nuevo bin.
 */
export async function createBinApi(binData: {
  binCode: string;
  type: 'good-condition' | 'on-revision' | 'scrap' | 'Hold' | 'Packing' | 'Reception' ;
  description: string;
}): Promise<Bin> {
  try {
    // Mapear el tipo de la UI al valor numérico del backend
    const binPurposeMapReverse: Record<typeof binData.type, number> = {
      'good-condition': 0,
      'on-revision': 1,
      'scrap': 2,
      'Hold': 3,
      'Packing': 4,
      'Reception': 5
    };
    
    const payload = {
      binCode: binData.binCode,
      name: binData.description || '', // Usar description como name
      description: '', // Dejar description vacía si el backend no la usa
      binPurpose: binPurposeMapReverse[binData.type]
    };

    const response = await fetch(`${API_URL}/Bins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create bin: ${response.status} - ${errorText}`);
    }

    const createdBin: BinResponse = await response.json();
    return transformBin(createdBin);
  } catch (error) {
    console.error('Error creating bin:', error);
    throw error;
  }
}

/**
 * Actualiza un bin existente.
 */
export async function updateBinApi(
  id: number,
  binData: {
    binCode: string;
    type: 'good-condition' | 'on-revision' | 'scrap'; // El original solo tenía estos 3
    description: string;
  }
): Promise<Bin> {
  try {
    const payload = {
      //binCode: binData.binCode, // El código de bin no se actualizaba en el original
      name: binData.description || '', // Usar description como name
      description: '', // Enviar vacío
      //binPurpose: binPurposeMapReverse[binData.type] // El propósito no se actualizaba en el original
    };

    const response = await fetch(`${API_URL}/Bins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update bin: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    const hasContent = contentType?.includes('application/json');

    if (!hasContent || response.status === 204) {
      return await fetchBinByIdApi(id);
    }

    const updatedBin: BinResponse = await response.json();
    return transformBin(updatedBin);
    
  } catch (error) {
    console.error('Error updating bin:', error);
    throw error;
  }
}

/**
 * Elimina un Bin por su ID.
 */
export async function deleteBinApi(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/Bins/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete bin: ${response.status} - ${errorText}`);
    }
    
    console.log('✅ Bin deleted successfully'); 
  } catch (error) {
    console.error('❌ Error in deleteBinApi:', error);
    throw error;
  }
}

/**
 * Obtiene un bin por su ID (helper para cuando PUT devuelve 204)
 */
async function fetchBinByIdApi(id: number): Promise<Bin> {
  try {
    const response = await fetch(`${API_URL}/Bins/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bin: ${response.status}`);
    }

    const bin: BinResponse = await response.json();
    return transformBin(bin);
  } catch (error) {
    console.error('Error fetching bin by ID:', error);
    throw error;
  }
}