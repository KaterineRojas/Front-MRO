export interface WarehouseInfo {
  id: number;
  code: string;
  name: string;
}

export interface KitItem {
  id: number;
  name: string;
  description: string;
  category: string;
  type: 'consumable' | 'non-consumable';
  quantity: number;
  unit: string;
  imageUrl?: string;
}

export interface LoanItem {
  id: number;
  sku: string; 
  name: string; 
  articleDescription: string;
  articleType: 'consumable' | 'non-consumable';
  quantityRequested: number; 
  quantityFulfilled?: number;
  unit: string;
  status: 'pending' | 'active' | 'returned' | 'partial' | 'lost' | 'damaged';
  imageUrl?: string;
  isKit?: boolean;
  kitItems?: KitItem[];
}

export interface LoanRequest {
  id: number;
  requestNumber: string;
  requesterName: string; 
  requesterEmail: string; 
  departmentName: string; 
  departmentId: number; // Requerido por el DTO del servidor
  requesterId: string; // EmployeeId string (e.g., 'amx0142')
  projectId: number; // Si tu servidor espera el ID del proyecto
  project: string; 
  requestedLoanDate: string;
  expectedReturnDate: string;
  loanDate?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent'; 
  requestedBy: string;
  approvedBy?: string;
  processedBy?: string;
  createdAt: string;
  items: LoanItem[];
// =========================================================
  // CORRECCIÓN: CAMPOS AGREGADOS DE PACKING/SENDING
  // =========================================================
  packedBy?: string | null;      // ID del Empleado (e.g., "amx0093")
  packedByName?: string | null;  // Nombre del Empacador
  packedAt?: string | null;      // Fecha/Hora de inicio/fin de empaque
  sentAt?: string | null;        // Fecha/Hora de envío (para estado 'Sent')
  
  // Información del almacén (puede venir anidada en la respuesta)
  warehouse?: WarehouseInfo;
  // ========================================================= 
}
export interface PagedResponseDto<T> {
  data: T[]; 

  // Metadatos de paginación
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface CreateLoanRequestDto {
  requesterId: number; 
  warehouseId: number; 
  expectedReturnDate: string; 
  departmentId: number;
  items: {
    itemId: number;
    quantityRequested: number;
  }[]; 
  projectId?: number; 
  notes?: string;
}

export interface UpdateLoanRequestStatusDto {
  status: string; 
  packedByUserId?: number; 
}

export interface LoanRequestDto extends LoanRequest {
    // Si hay campos adicionales que solo aparecen en la respuesta detallada
    // (Ej: Ids internos, historial de logs, etc.) se agregarían aquí.
    // Como LoanRequest ya parece ser el detalle, solo la extendemos.
}
// =========================================================
// INTERFACES PARA ENGINEER HOLDINGS (Búsqueda de Ingenieros)
// =========================================================

export interface EngineerInfo {
    id: number;
    employeeId: string; // e.g., "amx0142"
    name: string;
    email: string;
}

export interface HoldingSource {
    holdingId: number;
    sourceType: string; // e.g., "Loan"
    sourceRequestNumber: string;
    quantity: number;
    dateReceived: string;
    expectedReturnDate: string;
    projectId: string; // O number, basado en la respuesta de la API
}

export interface EngineerHoldingItem {
    itemId: number;
    sku: string;
    name: string;
    description: string;
    imageUrl: string | null;
    quantity: number; // Cantidad total que tiene el ingeniero
    sources: HoldingSource[];
    dateReceived: string; // Fecha de recepción más reciente o promedio
    expectedReturnDate: string; // Fecha de devolución más próxima o promedio
    projectIds: string[]; // Proyectos asociados
}

export interface HoldingsByWarehouse {
    warehouse: {
        id: number;
        code: string;
        name: string;
    };
    items: EngineerHoldingItem[];
    totalItems: number; // Número de artículos únicos
    totalQuantity: number; // Cantidad total de todas las unidades
}

export interface EngineerHoldingsResponse {
    engineer: EngineerInfo;
    holdingsByWarehouse: HoldingsByWarehouse[];
    totalItemsAcrossWarehouses: number;
    totalQuantityAcrossWarehouses: number;
}

// Respuesta del endpoint GET /api/engineer-holdings/warehouse/{warehouseId}
export interface EngineerHoldingSummary {
    engineer: EngineerInfo;
    items: EngineerHoldingItem[];
    kits: any[]; // Tipo para kits si es necesario
    totalItems: number;
    totalKits: number;
    totalItemQuantity: number;
    totalKitQuantity: number;
}

export interface WarehouseEngineersResponse {
    warehouse: {
        id: number;
        code: string;
        name: string;
    };
    engineers: EngineerHoldingSummary[];
    totalEngineers: number;
    totalDistinctItems: number;
    totalDistinctKits: number;
    totalItemQuantity: number;
    totalKitQuantity: number;
}