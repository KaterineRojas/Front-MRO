import type { Kit } from '../types';
import { delay } from './inventoryService'; // Importar utilidades compartidas

// Datos MOCK de Kits
const MOCK_KITS_DATA: Kit[] = [
  {
    id: 1,
    binCode: 'KIT-OFFICE-001',
    name: 'Basic Office Starter Kit',
    description: 'Complete office setup kit for new employees',
    category: 'office-supplies',
    items: [
      { articleId: 1, articleBinCode: 'BIN-OFF-001', articleName: 'Office Paper A4', quantity: 5 },
      { articleId: 2, articleBinCode: 'BIN-TECH-002', articleName: 'Laptop Dell Latitude', quantity: 1 },
      { articleId: 3, articleBinCode: 'BIN-USB-003', articleName: 'USB Cable Type-C', quantity: 2 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'good-condition',
    createdAt: '2025-01-15'
  },
  {
    id: 2,
    binCode: 'KIT-SAFETY-001',
    name: 'Personal Safety Kit',
    description: 'Complete personal protective equipment kit',
    category: 'safety-equipment',
    items: [
      { articleId: 5, articleBinCode: 'BIN-SAFE-005', articleName: 'Safety Helmet', quantity: 1 },
      { articleId: 4, articleBinCode: 'BIN-PROJ-004', articleName: 'Projector Epson', quantity: 1 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1698226930185-132277855882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b29sYm94JTIwa2l0JTIwY29udGFpbmVyfGVufDF8fHx8MTc1OTc4NDEzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'good-condition',
    createdAt: '2025-01-16'
  }
];

/**
 * Simula la obtención de Kits de una API.
 */
export async function fetchKitsFromApi(): Promise<Kit[]> {
  await delay(500); 
  return [...MOCK_KITS_DATA];
}

/**
 * Simula la creación de un kit.
 */
export async function createKitApi(kitData: Omit<Kit, 'id' | 'createdAt' | 'status'>): Promise<Kit> {
  await delay(500); 
  
  const newKit: Kit = {
    id: Date.now(),
    ...kitData,
    status: 'good-condition',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  console.log('API: Kit created successfully', newKit);
  return newKit;
}

/**
 * Simula la actualización de un kit.
 */
export async function updateKitApi(id: number, data: Partial<Kit>): Promise<Kit> {
  await delay(500); 
  
  console.log('API: Kit updated successfully', { id, data });
  return { id, ...data } as Kit;
}
