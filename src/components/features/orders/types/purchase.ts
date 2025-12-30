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
    category: string;
    cost: number;
    unit: string;
    imageUrl?: string;
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