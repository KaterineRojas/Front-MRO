// src/services/binService.ts
import type { BinResponse, BinModel } from '../types';

// Nota: Cambié el puerto a 5000 según tu URL de ejemplo.
const API_URL = 'http://localhost:5000/api';

/**
 * Transforma la respuesta de la API (BinResponse) a nuestro modelo de aplicación (BinModel).
 * En este caso, la transformación es un mapeo directo.
 */
function transformBin (apiBin: BinResponse): BinModel {
  return {
    id: apiBin.id,
    binCode: apiBin.binCode,
    name: apiBin.name,
    description: apiBin.description,
    binPurpose: apiBin.binPurpose,
    binPurposeDisplay: apiBin.binPurposeDisplay,
    isActive: apiBin.isActive,
    createdAt: apiBin.createdAt,
    updatedAt: apiBin.updatedAt,
  };
}

/**
 * Fetches all bins from the API
 * Endpoint: GET http://localhost:5000/api/Bins
 */
export async function getAllBins(): Promise<BinModel[]> {
  try {
    const response = await fetch(`${API_URL}/Bins`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bins: ${response.status} ${response.statusText}`);
    }

    // La respuesta es un array de BinResponse
    const data: BinResponse[] = await response.json();
    
    // Mapeamos los datos al formato de la aplicación
    return data.map(transformBin);
  } catch (error) {
    console.error('Error fetching all bins:', error);
    // Vuelve a lanzar el error para que el componente que llama lo maneje.
    throw error;
  }
}