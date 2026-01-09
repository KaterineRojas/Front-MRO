import {PurchaseRequest} from '../../orders/types/purchaseType'

export interface LoanRequestItem {
    id: number;
    itemId: number;
    sku: string;           // Old: articleCode
    name: string;
    description: string;   // Old: articleDescription
    imageUrl?: string;
    quantityRequested: number; // Old: quantity
    quantityFulfilled: number;
}

// 2. The Loan Request Object
export interface LoanRequest {
    id: number;
    requestNumber: string; // e.g., "BT-2025000001"
    requesterId: string;
    requesterName: string; // Old: requestedBy
    typeRequestName: string;
    typeRequest: number;
    warehouseName: string;
    companyId: string;
    customerId: string;
    departmentId: string;  // Old: department (seems to be a code now like 'AMAX')
    projectId: string;     // Old: project
    workOrderId: string;
    status: string;        // e.g., "Sent"
    expectedReturnDate: string; // ISO Date string
    createdAt: string;     // Old: requestDate
    totalItems: number;
    totalQuantity: number;
    notes: string;         // Old: reason
    items: LoanRequestItem[];
}

// 3. The Paginated Response Wrapper 
export interface PaginatedLoanRequestResponse {
    data: LoanRequest[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// unified interface for both purchase and loan requests
export interface UnifiedRequest {
    id: number;        
    requestNumber: string;      
    type: string;               
    warehouse: string;          
    requester: string;          
    date: string;               
    totalQty: number;           

    // --- The Normalized Status ---
    statusLabel: string;

    // We use a Discriminated Union here so TypeScript is smart later
    originalData:
    | (PurchaseRequest & { kind: 'Purchase' })
    | (LoanRequest & { kind: 'Loan' });
}