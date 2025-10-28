
import type { Article } from '../types'; 
import { CATEGORIES } from '../constants';
// Suponiendo que el path a types y constants es correcto
// import type { Article } from '../types';
// import { CATEGORIES } from '../constants';

/** URL base de la API */
export const API_URL = 'http://localhost:5000/api';

/**
 * Simula un retraso de la API para ambientes de desarrollo.
 * @param ms Milisegundos de retraso.
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mapea la categoría de la API al modelo de la aplicación.
 * @param apiCategory Categoría de la API (string o undefined).
 * @returns La categoría mapeada o 'tools' por defecto.
 */
export function mapCategory(apiCategory?: string): Article['category'] {
  // Nota: Asumimos que CATEGORIES está disponible globalmente o importado correctamente
  // const validCategories = CATEGORIES.map(c => c.value) as Article['category'][];
  // Temporalmente, usamos una lista de ejemplo si CATEGORIES no está definido:
  const validCategories = ['office-supplies', 'safety-equipment', 'technology', 'tools', 'others'];

  if (apiCategory && validCategories.includes(apiCategory as Article['category'])) {
    return apiCategory as Article['category'];
  }
  // Valor por defecto si no coincide o viene vacío
  return 'tools';
}

/**
 * Mapea el propósito del Bin (GoodCondition, OnRevision, Scrap, etc.) a un tipo de la UI.
 * Nota: 'Hold', 'Packing', 'Reception' no fueron mapeados en el original, se agregan para coherencia.
 */
export const binPurposeMap: Record<string, 'good-condition' | 'on-revision' | 'scrap' | 'Hold' | 'Packing' | 'Reception'> = {
  'GoodCondition': 'good-condition',
  'OnRevision': 'on-revision',
  'Scrap': 'scrap',
  'Hold': 'Hold',
  'Packing': 'Packing',
  'Reception': 'Reception',
  'NotApplicable': 'good-condition'
};

/**
 * Obtiene el nombre de visualización del propósito de un Bin.
 */
export function getBinPurposeDisplay(purpose: string): string {
  switch (purpose) {
    case 'GoodCondition': return 'Good Condition';
    case 'OnRevision': return 'On Revision';
    case 'Scrap': return 'Scrap';
    case 'Hold': return 'Hold';
    case 'Packing': return 'Packing';
    case 'Reception': return 'Reception';
    default: return 'Good Condition';
  }
}
