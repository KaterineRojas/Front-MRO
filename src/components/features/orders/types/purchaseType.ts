/**
 * interface defined for purqchase request sent by backend
 */

export interface PurchaseRequest {
    id: number;
    requestNumber: string;
    requesterId: number;
    requesterName: string;
    warehouseId: number;
    warehouseName: string;
    departmentName: string;
    projectName: string;
    status: number;
    priority: number;
    selfPurchase: boolean;
    totalAmount: number;
    totalItems: number;
    totalQuantity: number;
    approvedByName: string | null;
    approvedAt: string | null;
    supplier: string | null;
    createdAt: string;
    orderedAt: string | null;
    receivedAt: string | null;
}

/**
 * The Main component prop
 */

export interface PurchaseOrdersProps {
    onViewDetail?: (order: any) => void;
}

// the article interface
// --- TYPES ---
export interface Article {
    code: string;
    description: string;
    unit: string;
    cost: number;
    supplier: string;
    imageUrl: string;
    category: string;
}

export interface NewRequestItem {
    articleCode: string;
    quantity: number;
    estimatedCost: number;
    purchaseUrl: string;
    description?: string;
    unit?: string;
    imageUrl?: string;
}

export interface ArticleSelectorProps {
    articles: Article[];
    onAddItem: (item: NewRequestItem) => void;
}

// order table interface

export interface ActivePurchaseTableProps {
    orders: PurchaseRequest[];
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    onStatusUpdate: (id: number, status: number) => void;
    activeTab: string;
}

// request form data interface
export interface RequestFormData {
    requestedBy: string;
    department: string;
    priority: string;
    project: string;
    notes: string;
    expectedDate: string;
}

// ==========================================
//  ITEMS / INVENTORY TYPES
// ==========================================
export interface Item {
    id: number;
    sku: string;
    name: string;
    description: string;
    category: string;
    unit: string;
    minStock: number;
    isActive: boolean;
    consumible: boolean; 
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface PurchaseRequestItem extends Item {
    requestQuantity: number;  // How many they want to buy
    estimatedCost: number;    // The price they entered
    totalCost: number;        // quantity * estimatedCost
    purchaseUrl: string;      // The link they provided
}

// BACKEND PAYLOAD TYPES 

export interface BackendItemPayload {
    itemId: number;
    quantity: number;
}

export interface CreatePurchaseRequestPayload {
    requesterId: string;
    clientBilled: boolean;
    companyId: string;
    customerId: string;
    departmentId: string;
    projectId: string;
    workOrderId: string;
    address: string;
    googleMapsUrl: string;
    zipCode: string;
    reason: number; // Assuming 0 = Standard, etc.
    selfPurchase: boolean;
    notes: string;
    expectedDeliveryDate: string; // ISO String
    estimatedTotalCost: number;
    warehouseId: number;
    items: BackendItemPayload[];
}