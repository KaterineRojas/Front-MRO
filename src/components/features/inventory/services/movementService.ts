import type { Article, Transaction } from '../types';
import { delay } from './inventoryService'; // Importar utilidades compartidas

/**
 * Simula el registro de un movimiento de inventario (Entrada/Salida/Ajuste).
 */
export async function recordMovementApi(movementData: any): Promise<{ transaction: Transaction; updatedArticle?: Article }> {
  await delay(500); // Simulate network delay
  
  // Create a transaction record
  const transaction: Transaction = {
    id: Date.now(),
    type: movementData.movementType,
    subtype: movementData.movementType === 'entry' ? 'purchase' : 
             movementData.movementType === 'exit' ? 'consumption' : 'relocation',
    articleCode: movementData.articleSKU || movementData.kitBinCode || 'UNKNOWN',
    articleDescription: movementData.articleName || 'Movement',
    quantity: parseInt(movementData.quantity || '1'),
    unit: movementData.unit || 'units',
    reference: `REF-${Date.now()}`,
    notes: movementData.notes || '',
    user: 'Current User',
    project: 'Inventory Management',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };
  
  console.log('API: Movement recorded successfully', { movementData, transaction });
  
  // En un sistema real, aquí llamaríamos a la API y obtendríamos la transacción y el artículo actualizado.
  return { transaction };
}
