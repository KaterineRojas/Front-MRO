/**
 * Servicio para obtener proyectos
 * Simula una API para obtener la lista de proyectos disponibles
 */

import { apiCall } from './errorHandler';

export interface Project {
  id: string;
  name: string;
  code: string;
  department?: string;
  status: 'active' | 'completed' | 'on-hold';
}

const mockProjects: Project[] = [
  { id: '1', name: 'Proyecto Alpha', code: 'ALPHA-2024', department: 'Engineering', status: 'active' },
  { id: '2', name: 'Desarrollo Web', code: 'WEB-2024', department: 'Development', status: 'active' },
  { id: '3', name: 'App Mobile', code: 'MOB-2024', department: 'Development', status: 'active' },
  { id: '4', name: 'Sistema ERP', code: 'ERP-2024', department: 'Engineering', status: 'active' },
  { id: '5', name: 'Migración Cloud', code: 'CLOUD-2024', department: 'Engineering', status: 'active' },
  { id: '6', name: 'Análisis de Datos', code: 'DATA-2024', department: 'Development', status: 'active' },
  { id: '7', name: 'Proyecto Amazonas', code: 'AMZ-2024', department: 'Engineering', status: 'active' },
  { id: '8', name: 'Proyecto Innova', code: 'INN-2024', department: 'Development', status: 'active' },
  { id: '9', name: 'Proyecto Construcción', code: 'CONS-2024', department: 'Engineering', status: 'active' },
  { id: '10', name: 'Marketing Campaign', code: 'MARK-2024', department: 'Marketing', status: 'active' },
  { id: '11', name: 'Sales Initiative', code: 'SALES-2024', department: 'Sales', status: 'active' },
];

/**
 * Obtiene todos los proyectos activos
 */
export async function getProjects(): Promise<Project[]> {
  return apiCall(async () => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Retornar solo proyectos activos
    return mockProjects.filter(p => p.status === 'active');
  });
}

/**
 * Obtiene proyectos filtrados por departamento
 */
export async function getProjectsByDepartment(department: string): Promise<Project[]> {
  return apiCall(async () => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return mockProjects.filter(p => 
      p.status === 'active' && 
      (!department || p.department === department)
    );
  });
}

/**
 * Busca un proyecto por ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  return apiCall(async () => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const project = mockProjects.find(p => p.id === id);
    return project || null;
  });
}
