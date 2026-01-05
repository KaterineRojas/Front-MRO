

import { API_URL } from "../../../../url";
import { store } from "../../../../store/store";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types
export interface ExistingItem {
  id: string;
  name: string;
  image: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface PurchaseItem {
  id: number;
  itemId?: number;
  imageUrl: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  estimatedCost?: number;
  cost?: number;
  productUrl?: string;
  warehouseId?: string | number;
  warehouseName?: string;
}

export interface PurchaseRequest {
  requestId?: string;
  requestNumber?: string;
  department?: string;
  departmentId?: string;
  project?: string;
  projectId?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | number | string;
  statusName?: string;
  reason?: 'low-stock' | 'urgent' | 'new-project' | number | string;
  reasonName?: string;
  selfPurchase: boolean;
  items: PurchaseItem[];
  totalCost?: number;
  estimatedTotalCost?: number;
  totalItems?: number;
  totalQuantity?: number;
  createdAt?: string;
  orderedAt?: string | null;
  receivedAt?: string | null;
  expectedDeliveryDate?: string;
  warehouseId?: string | number;
  warehouseName?: string;
  companyId?: string;
  customerId?: string;
  clientBilled?: boolean;
}

export interface PurchaseRequestItemPayload {
  itemId: number;
  quantity: number;
  productUrl?: string;
}

export interface CreatePurchaseRequestPayload {
  requesterId: string;
  clientBilled: boolean;
  companyId: string;
  customerId: string;
  departmentId: string;
  projectId: string;
  workOrderId: string;
  address?: string;
  googleMapsUrl?: string;
  zipCode?: string;
  reason: 0 | 1 | 2;
  selfPurchase: boolean;
  notes: string;
  expectedDeliveryDate: string;
  estimatedTotalCost: number;
  warehouseId: number;
  items: PurchaseRequestItemPayload[];
}

export interface CreatePurchaseRequestResponse {
  success: boolean;
  message: string;
  requestNumber?: string;
}

// Mock Data - Existing Items
const mockExistingItems: ExistingItem[] = [
  { id: '1', name: 'Mechanical Keyboard RGB', image: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwa2V5Ym9hcmQlMjBnYW1pbmd8ZW58MXx8fHwxNzU5Nzc2MzM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '2', name: 'Proyector Epson PowerLite', image: 'https://images.unsplash.com/photo-1625961332600-f6eac385c6ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0b3IlMjBvZmZpY2UlMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzU5MTc4ODkzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '3', name: 'Monitor Samsung 27"', image: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMG1vbml0b3IlMjBkaXNwbGF5fGVufDF8fHx8MTc1OTA1ODE5Nnww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '4', name: 'Cable HDMI 2.0', image: 'https://images.unsplash.com/photo-1625738323142-01e6d7906e0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZG1pJTIwY2FibGV8ZW58MXx8fHwxNzU5MDgxODM0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '5', name: 'Teclado mecánico', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXlib2FyZCUyMG1lY2hhbmljYWx8ZW58MXx8fHwxNzU5MDgxODM0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '6', name: 'Mouse inalámbrico', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VzZSUyMHdpcmVsZXNzfGVufDF8fHx8MTc1OTA4MTgzNHww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '7', name: 'Webcam HD', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJjYW18ZW58MXx8fHwxNzU5MDgxODM0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '8', name: 'Auriculares con micrófono', image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwbWljcm9waG9uZXxlbnwxfHx8fDE3NTkwODE4MzR8MA&ixlib=rb-4.1.0&q=80&w=1080' }
];

// Mock Data - Departments
const mockDepartments: Department[] = [
  { id: 'eng', name: 'Engineering' },
  { id: 'dev', name: 'Development' },
  { id: 'des', name: 'Design' },
  { id: 'mkt', name: 'Marketing' },
  { id: 'sal', name: 'Sales' },
  { id: 'adm', name: 'Administration' }
];

// Mock Data - Purchase Requests
const mockPurchaseRequests: PurchaseRequest[] = [
  {
    requestId: 'PUR001',
    department: 'Engineering',
    project: 'Proyecto Amazonas',
    notes: 'Urgente para desarrollo',
    status: 'pending',
    reason: 'urgent',
    selfPurchase: false,
    items: [
      {
        id: 1,
        imageUrl: 'https://images.unsplash.com/photo-1656711081969-9d16ebc2d210?w=400',
        sku: 'MECH-KB-001',
        name: 'Mechanical Keyboard RGB',
        description: 'Gaming keyboard with RGB lighting',
        quantity: 2,
        estimatedCost: 150,
        warehouseId: 'wh-1',
        warehouseName: 'Amax'
      },
      {
        id: 2,
        imageUrl: 'https://images.unsplash.com/photo-1758598497364-544a0cdbc950?w=400',
        sku: 'SAM-003',
        name: 'Samsung 27" Monitor',
        description: 'Full HD display',
        quantity: 1,
        estimatedCost: 350,
        warehouseId: 'wh-1',
        warehouseName: 'Amax'
      }
    ],
    totalCost: 650,
    createdAt: '2024-01-15',
    warehouseId: 'wh-1',
    warehouseName: 'Amax'
  },
  {
    requestId: 'PUR002',
    department: 'Design',
    project: 'Proyecto Web',
    notes: 'Para nueva estación de trabajo',
    status: 'approved',
    reason: 'new-project',
    selfPurchase: true,
    items: [
      {
        id: 3,
        imageUrl: 'https://images.unsplash.com/photo-1625961332600-f6eac385c6ba?w=400',
        sku: 'PROJ-EP-001',
        name: 'Proyector Epson PowerLite',
        description: 'HD projector for presentations',
        quantity: 1,
        estimatedCost: 800,
        warehouseId: 'wh-2',
        warehouseName: 'Best'
      }
    ],
    totalCost: 800,
    createdAt: '2024-01-14',
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  },
  {
    requestId: 'PUR003',
    department: 'Development',
    project: 'Proyecto Innova',
    notes: 'Cables y accesorios varios',
    status: 'rejected',
    reason: 'low-stock',
    selfPurchase: false,
    items: [
      {
        id: 4,
        imageUrl: 'https://images.unsplash.com/photo-1625738323142-01e6d7906e0a?w=400',
        sku: 'HDMI-001',
        name: 'Cable HDMI 2.0',
        description: '4K HDMI cable 2m',
        quantity: 5,
        estimatedCost: 15,
        warehouseId: 'wh-3',
        warehouseName: 'Central'
      }
    ],
    totalCost: 75,
    createdAt: '2024-01-12',
    warehouseId: 'wh-3',
    warehouseName: 'Central'
  },
  {
    requestId: 'PUR004',
    department: 'Engineering',
    project: 'Proyecto Construcción',
    notes: 'Herramientas para taller',
    status: 'approved',
    reason: 'urgent',
    selfPurchase: true,
    items: [
      {
        id: 5,
        imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
        sku: 'DRL-001',
        name: 'Power Drill',
        description: 'Cordless drill with battery',
        quantity: 2,
        estimatedCost: 120,
        warehouseId: 'wh-2',
        warehouseName: 'Best'
      },
      {
        id: 6,
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
        sku: 'HAM-001',
        name: 'Hammer',
        description: 'Professional grade hammer',
        quantity: 3,
        estimatedCost: 25,
        warehouseId: 'wh-2',
        warehouseName: 'Best'
      }
    ],
    totalCost: 315,
    createdAt: '2024-01-10',
    warehouseId: 'wh-2',
    warehouseName: 'Best'
  }
];

// API Simulation Functions

function getStoredUserId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return window.localStorage?.getItem('userId') ?? '';
  } catch (error) {
    console.warn('Unable to access localStorage for userId', error);
    return '';
  }
}

function resolveRequesterId(): string {
  try {
    const state = store.getState() as any;
    const employeeId: string | undefined = state?.auth?.user?.employeeId;
    const userId: string | undefined = state?.auth?.user?.id;

    return employeeId || userId || getStoredUserId();
  } catch (error) {
    console.error('Failed to resolve requesterId from store', error);
    return getStoredUserId();
  }
}

function normalizePurchaseRequest(raw: any, index: number): PurchaseRequest {
  const itemsSource = Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw?.requestItems)
      ? raw.requestItems
      : Array.isArray(raw?.details)
        ? raw.details
        : [];

  const items: PurchaseItem[] = itemsSource.map((item: any, itemIndex: number) => {
    const fallbackId = item?.id ?? item?.itemId ?? itemIndex + 1;
    const numericId = Number(fallbackId);
    const resolvedId = Number.isFinite(numericId) ? numericId : itemIndex + 1;

    const rawItemId = Number(item?.itemId ?? fallbackId);
    const itemId = Number.isFinite(rawItemId) ? rawItemId : resolvedId;

    const quantity = Number(item?.quantity ?? item?.qty ?? 0);
    const estimatedCost = Number(item?.estimatedCost ?? item?.cost ?? item?.price);
    const cost = Number(item?.cost);

    return {
      id: resolvedId,
      itemId,
      imageUrl: item?.imageUrl ?? item?.itemImageUrl ?? '',
      sku: item?.sku ?? item?.skuCode ?? '',
      name: item?.name ?? item?.itemName ?? 'Unnamed item',
      description: item?.description ?? item?.itemDescription ?? '',
      quantity: Number.isFinite(quantity) ? quantity : 0,
      estimatedCost: Number.isFinite(estimatedCost) ? estimatedCost : undefined,
      cost: Number.isFinite(cost) ? cost : undefined,
      productUrl: item?.productUrl ?? item?.url ?? undefined,
      warehouseId: item?.warehouseId ?? raw?.warehouseId,
      warehouseName: item?.warehouseName ?? raw?.warehouseName,
    };
  });

  const totalItemsValue = Number(raw?.totalItems);
  const totalQuantityValue = Number(raw?.totalQuantity);
  const statusRaw = raw?.status ?? raw?.statusId ?? raw?.statusCode;
  const reasonRaw = raw?.reason ?? raw?.reasonId ?? raw?.reasonCode;
  const statusValue = typeof statusRaw === 'string' && statusRaw.trim() !== '' && !Number.isNaN(Number(statusRaw))
    ? Number(statusRaw)
    : statusRaw ?? 'pending';
  const reasonValue = typeof reasonRaw === 'string' && reasonRaw.trim() !== '' && !Number.isNaN(Number(reasonRaw))
    ? Number(reasonRaw)
    : reasonRaw;
  const totalCostValue = Number(raw?.totalCost);
  const estimatedTotalCostValue = Number(raw?.estimatedTotalCost ?? raw?.totalEstimatedCost ?? raw?.estimatedCost);

  return {
    requestId: raw?.requestId ?? raw?.id ?? undefined,
    requestNumber: raw?.requestNumber ?? raw?.requestNo ?? raw?.number ?? undefined,
    department: raw?.department ?? raw?.departmentName ?? undefined,
    departmentId: raw?.departmentId ?? undefined,
    project: raw?.project ?? raw?.projectName ?? undefined,
    projectId: raw?.projectId ?? undefined,
    notes: raw?.notes ?? raw?.comment ?? raw?.comments ?? undefined,
    status: statusValue,
    statusName: raw?.statusName ?? raw?.statusDescription ?? undefined,
    reason: reasonValue,
    reasonName: raw?.reasonName ?? raw?.reasonDescription ?? undefined,
    selfPurchase: Boolean(raw?.selfPurchase ?? raw?.isSelfPurchase ?? false),
    items,
    totalCost: Number.isFinite(totalCostValue) ? totalCostValue : undefined,
    estimatedTotalCost: Number.isFinite(estimatedTotalCostValue) ? estimatedTotalCostValue : undefined,
    totalItems: Number.isFinite(totalItemsValue) ? totalItemsValue : items.length,
    totalQuantity: Number.isFinite(totalQuantityValue)
      ? totalQuantityValue
      : items.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    createdAt: raw?.createdAt ?? raw?.createdDate ?? raw?.createdOn ?? undefined,
    orderedAt: raw?.orderedAt ?? raw?.orderedDate ?? raw?.orderedOn ?? null,
    receivedAt: raw?.receivedAt ?? raw?.receivedDate ?? raw?.receivedOn ?? null,
    expectedDeliveryDate: raw?.expectedDeliveryDate ?? raw?.expectedDelivery ?? raw?.deliveryDate ?? undefined,
    warehouseId: raw?.warehouseId ?? raw?.warehouseCode ?? undefined,
    warehouseName: raw?.warehouseName ?? raw?.warehouse ?? items[0]?.warehouseName ?? undefined,
    companyId: raw?.companyId ?? raw?.company ?? undefined,
    customerId: raw?.customerId ?? raw?.customer ?? raw?.clientId ?? undefined,
    clientBilled: Boolean(raw?.clientBilled ?? raw?.isClientBilled ?? false),
  };
}

/**
 * Get all purchase requests
 */
export async function getPurchaseRequests(): Promise<PurchaseRequest[]> {
  const state = store.getState();
  const token = state.auth?.accessToken ?? null;
  const requesterId = resolveRequesterId();

  if (!token) {
    throw new Error('Authentication token not found');
  }

  if (!requesterId) {
    throw new Error('Requester ID not found');
  }

  const url = `${API_URL}/purchase-requests?requesterId=${encodeURIComponent(requesterId)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const responseText = await response.text();
    if (!responseText) {
      if (!response.ok) {
        throw new Error(`Failed to fetch purchase requests: ${response.status}`);
      }

      return [];
    }

    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error('purchaseService: Failed to parse purchase request response', responseText);
      throw new Error('Unexpected response while fetching purchase requests');
    }

    if (!response.ok) {
      const message = responseData?.message ?? responseData?.error ?? `Failed to fetch purchase requests: ${response.status}`;
      throw new Error(message);
    }

    const payload = Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData?.purchaseRequests)
        ? responseData.purchaseRequests
        : Array.isArray(responseData?.items)
          ? responseData.items
          : Array.isArray(responseData?.results)
            ? responseData.results
            : Array.isArray(responseData)
              ? responseData
              : [];

    if (!Array.isArray(payload)) {
      console.warn('purchaseService: Unexpected purchase requests payload shape', responseData);
      return [];
    }

    return payload.map((item, index) => normalizePurchaseRequest(item, index));
  } catch (error) {
    console.error('purchaseService: Failed to retrieve purchase requests', error);
    throw error;
  }
}

/**
 * Get purchase request by ID
 */
export async function getPurchaseRequestById(requestId: string): Promise<PurchaseRequest | null> {
  await delay(200);
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  return request ? { ...request } : null;
}

/**
 * Create a new purchase request
 */
export async function createPurchaseRequest(
  request: CreatePurchaseRequestPayload
): Promise<CreatePurchaseRequestResponse> {
  const state = store.getState();
  const token = state.auth.accessToken;

  if (!token) {
    throw new Error('Authentication token not found');
  }

  if (!request.requesterId) {
    throw new Error('Requester ID is required');
  }

  if (!request.departmentId) {
    throw new Error('Department is required');
  }

  if (!request.projectId) {
    throw new Error('Project is required');
  }

  if (request.items.length === 0) {
    throw new Error('At least one item must be included');
  }

  const url = `${API_URL}/purchase-requests`;
  console.log('Submitting purchase request to API:', url);
  console.log('Payload:', request);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  const responseText = await response.text();
  let responseData: any = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error('purchaseService: non-JSON response body', responseText);
      throw new Error(`Server error ${response.status}: ${responseText}`);
    }
  }

  if (!response.ok) {
    const message = responseData?.message || responseData?.error || `Failed to create purchase request: ${response.status}`;
    throw new Error(message);
  }

  const dataPayload = responseData?.data ?? responseData ?? {};
  const requestNumber = dataPayload?.requestNumber || dataPayload?.requestId || undefined;
  const message = responseData?.message || 'Purchase request submitted successfully';

  return {
    success: true,
    message,
    requestNumber
  };
}

/**
 * Update purchase request status
 */
export async function updatePurchaseRequestStatus(
  requestId: string,
  status: PurchaseRequest['status']
): Promise<PurchaseRequest | null> {
  await delay(300);
  
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    throw new Error('Purchase request not found');
  }
  
  return {
    ...request,
    status
  };
}

/**
 * Delete purchase request
 */
export async function deletePurchaseRequest(requestId: string): Promise<{ success: boolean; message: string }> {
  await delay(300);
  
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    return {
      success: false,
      message: 'Purchase request not found'
    };
  }
  
  // Only pending requests can be deleted
  if (request.status !== 'pending') {
    return {
      success: false,
      message: 'Only pending requests can be cancelled'
    };
  }

  return {
    success: true,
    message: 'Request cancelled successfully'
  };
}

/**
 * Update purchase request reason
 */
export async function updatePurchaseRequestReason(
  requestId: string,
  reason: PurchaseRequest['reason']
): Promise<PurchaseRequest | null> {
  await delay(300);
  
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    throw new Error('Purchase request not found');
  }
  
  return {
    ...request,
    reason
  };
}

/**
 * Confirm purchase as bought (for self-purchase requests)
 */
export async function confirmPurchaseBought(
  requestId: string,
  _quantities: { [itemId: number]: number }
): Promise<{ success: boolean; message: string }> {
  await delay(400);
  
  const request = mockPurchaseRequests.find(r => r.requestId === requestId);
  
  if (!request) {
    return {
      success: false,
      message: 'Purchase request not found'
    };
  }
  
  if (!request.selfPurchase) {
    return {
      success: false,
      message: 'Only self-purchase requests can be confirmed'
    };
  }
  
  if (request.status !== 'approved') {
    return {
      success: false,
      message: 'Only approved requests can be confirmed as bought'
    };
  }

  return {
    success: true,
    message: 'Purchase confirmed! Items will appear in Borrow module as pending return'
  };
}

/**
 * Get all existing items for selection
 */
export async function getExistingItems(): Promise<ExistingItem[]> {
  await delay(200);
  return [...mockExistingItems];
}

/**
 * Get all departments
 */
export async function getDepartments(): Promise<Department[]> {
  await delay(100);
  return [...mockDepartments];
}