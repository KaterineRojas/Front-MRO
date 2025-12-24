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