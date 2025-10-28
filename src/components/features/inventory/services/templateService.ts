import type { Template } from '../types';
import { delay } from './inventoryService'; // Importar utilidades compartidas

// Datos MOCK de Plantillas
const MOCK_TEMPLATES_DATA: Template[] = [
  {
    id: 1,
    name: 'Basic Office Setup',
    description: 'Standard office equipment for new employees',
    category: 'office-supplies',
    items: [
      { articleId: 1, articleBinCode: 'BIN-OFF-001', articleName: 'A4 Office Paper', quantity: 5 },
      { articleId: 2, articleBinCode: 'BIN-TECH-002', articleName: 'Dell Latitude Laptop', quantity: 1 },
      { articleId: 3, articleBinCode: 'BIN-USB-003', articleName: 'USB Type-C Cable', quantity: 2 }
    ],
    createdAt: '2025-01-15'
  },
  {
    id: 2,
    name: 'Safety Equipment Standard',
    description: 'Basic personal protective equipment',
    category: 'safety-equipment',
    items: [
      { articleId: 5, articleBinCode: 'BIN-SAFE-005', articleName: 'Safety Helmet', quantity: 1 },
      { articleId: 4, articleBinCode: 'BIN-TOOL-004', articleName: 'Electric Drill', quantity: 1 }
    ],
    createdAt: '2025-01-16'
  }
];

/**
 * Simula la obtención de plantillas de una API.
 */
export async function fetchTemplatesFromApi(): Promise<Template[]> {
  await delay(500); 
  return [...MOCK_TEMPLATES_DATA];
}

/**
 * Simula la creación de una plantilla.
 */
export async function createTemplateApi(templateData: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
  await delay(500); 
  
  const newTemplate: Template = {
    id: Date.now(),
    ...templateData,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  console.log('API: Template created successfully', newTemplate);
  return newTemplate;
}

/**
 * Simula la actualización de una plantilla.
 */
export async function updateTemplateApi(id: number, data: Partial<Template>): Promise<Template> {
  await delay(500); 
  
  console.log('API: Template updated successfully', { id, data });
  return { id, ...data } as Template;
}
