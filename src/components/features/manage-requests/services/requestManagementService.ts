import { LoanRequest, PagedResponseDto, CreateLoanRequestDto, UpdateLoanRequestStatusDto, LoanRequestDto, EngineerHoldingsResponse, HoldingSource, EngineerHoldingItem} from '../types';
import { API_URL } from "../../../../url";

const API_BASE_URL = API_URL;
const DEFAULT_WAREHOUSE_ID = 1;
async function getPagedData<T>(
    path: string, 
    statusFilter: string, 
    warehouseId: number,
    pageNumber: number = 1, 
    pageSize: number = 20
): Promise<T[]> {
    const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        status: statusFilter,
        warehouseId: warehouseId.toString(),
    }).toString();
    const url = `${API_BASE_URL}/${path}?${params}`; 

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error on GET ${url}. Status: ${response.status}`, errorText);
            throw new Error(`Failed to fetch requests: ${response.statusText}`);
        }

        const pagedData: PagedResponseDto<T> = await response.json();
        console.log(`[API Check] Total ${statusFilter} requests loaded for WH ${warehouseId}: ${pagedData.totalCount}`);
        return pagedData.data || []; 
        
    } catch (error) {
        console.error('Network or Parsing Error:', error);
        return [];
    }
}

const PACKING_ALLOWED_STATUSES = ['Pending', 'Packing'];

export async function getPackingRequests(): Promise<LoanRequest[]> {
  try {
    const pending = await getPagedData<LoanRequest>(
      'loan-requests',
      'Pending',
      DEFAULT_WAREHOUSE_ID
    );
    const packing = await getPagedData<LoanRequest>(
      'loan-requests',
      'Packing',
      DEFAULT_WAREHOUSE_ID
    );
    return [...pending, ...packing];

  } catch (error) {
    console.warn('Error fetching packing requests:', error);
    return [];
  }
}


function generateIdFromString(s: string): number {
    let hash = 0;
    if (s.length === 0) return hash;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    return Math.abs(hash); 
}

export async function getEngineerReturns(engineerId: string, warehouseId: number = DEFAULT_WAREHOUSE_ID): Promise<LoanRequest[]> {
    const url = `${API_BASE_URL}/engineer-holdings/${engineerId}?warehouseId=${warehouseId}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error on GET ${url}. Status: ${response.status}`, errorText);
            throw new Error(`Failed to fetch engineer holdings: ${response.status}`);
        }

        const data: EngineerHoldingsResponse = await response.json();
        const engineer = data.engineer;
        
        const returnsList: LoanRequest[] = [];
        
        data.holdingsByWarehouse.forEach((holding) => {
            
            const requestsMap = new Map<string, Partial<LoanRequest> & { items: any[] }>();

            holding.items.forEach((item: EngineerHoldingItem) => {
                item.sources.forEach((source: HoldingSource) => {
                    const requestNumber = source.sourceRequestNumber;
                    const dateReceived = source.dateReceived;
                    const projectIdStr = source.projectId;
                    
                    if (!requestsMap.has(requestNumber)) {
                        requestsMap.set(requestNumber, {
                            id: generateIdFromString(requestNumber), 
                            requestNumber: requestNumber,
                            requesterName: engineer.name,
                            requesterEmail: engineer.email,
                            departmentName: 'N/A', 
                            departmentId: 0, 
                            requesterId: engineer.id, 
                            projectId: 0, 
                            project: projectIdStr,
                            requestedLoanDate: dateReceived, 
                            expectedReturnDate: source.expectedReturnDate,
                            loanDate: dateReceived,
                            status: 'PENDING_RETURN',
                            priority: 'medium', 
                            requestedBy: engineer.name,
                            createdAt: dateReceived,
                            items: [], 
                            warehouse: holding.warehouse,
                        });
                    }

                    const loanRequest = requestsMap.get(requestNumber)!;
                
                    loanRequest.items.push({
                        id: item.itemId,
                        sku: item.sku, 
                        name: item.name, 
                        articleDescription: item.description || '',
                        articleType: item.sku.startsWith('KIT-') ? 'non-consumable' : 'consumable', 
                        quantityRequested: source.quantity, 
                        quantityFulfilled: source.quantity, 
                        unit: 'Pcs', 
                        status: 'active',
                        imageUrl: item.imageUrl,
                        isKit: item.sku.startsWith('KIT-'), 
                        kitItems: undefined, 
                    });
                    
                });
            });
            requestsMap.forEach(req => returnsList.push(req as LoanRequest));
        });
        return returnsList;

    } catch (error) {
        console.error("Error processing engineer returns:", error);
        return [];
    }
}
export async function createLoanRequest(dto: CreateLoanRequestDto): Promise<LoanRequestDto | null> {
  try {
    const url = `${API_BASE_URL}/loan-requests`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto) 
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to create loan request on server. Response:', errorText);
        throw new Error(`Failed to create request: ${res.statusText}`);
    }
    
    return await res.json() as LoanRequestDto;

  } catch (error) {
    console.warn('Error creating loan request:', error);
    return null;
  }
}

export async function updateLoanRequestStatus(
    requestNumber: string, 
    status: string,
    packedByUserId?: number 
): Promise<LoanRequestDto | null> { 
    try {
        const url = `${API_BASE_URL}/loan-requests/${requestNumber}/status`;
        
        const dto: UpdateLoanRequestStatusDto = { status, packedByUserId };

        const res = await fetch(url, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Failed to update status for ${requestNumber}. Response:`, errorText);
            throw new Error(`Failed to update status: ${res.statusText}`);
        }

        return await res.json() as LoanRequestDto;
    } catch (error) {
        console.warn('Error updating loan request status:', error);
        return null;
    }
}

export async function updateReturnItems(requestId: number, items: LoanRequest['items']): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/returns/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    return res.ok;
  } catch (error) {
    console.warn('Error updating return items:', error);
    return false;
  }
}

export async function getEngineerHoldings(
    engineerId: string, 
    warehouseId: number = DEFAULT_WAREHOUSE_ID
): Promise<EngineerHoldingsResponse | null> {
    
    const url = `${API_BASE_URL}/engineer-holdings/${engineerId}?warehouseId=${warehouseId}`; 

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error on GET ${url}. Status: ${response.status}`, errorText);
            
            if (response.status === 404) {
                console.log(`Engineer ${engineerId} not found or has no holdings.`);
                return null;
            }

            throw new Error(`Failed to fetch engineer holdings: ${response.statusText}`);
        }

        const data: EngineerHoldingsResponse = await response.json();
        return data;
        
    } catch (error) {
        console.error('Network or Parsing Error fetching engineer holdings:', error);
        return null;
    }
}

export async function startPacking(requestNumber: string, keeperEmployeeId: string): Promise<LoanRequest | null> {
    try {
        const url = `${API_URL}/loan-requests/${requestNumber}/start-packing?keeperEmployeeId=${keeperEmployeeId}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },

        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to start packing for ${requestNumber}. Status: ${response.status}`, errorText);
            
            // Se lanza un error con el mensaje de la UI si existe
            throw new Error(`Failed to start packing: ${response.statusText}. Backend message: ${errorText}`);
        }

        return await response.json(); // Devuelve la LoanRequest actualizada
    } catch (error) {
        console.error('Error starting packing:', error);
        return null;
    }
}

export interface SendLoanRequestDto {
    items: { 
        loanRequestItemId: number; 
        quantityFulfilled: number; 
    }[];
}
export async function sendLoanRequest(
    requestNumber: string, 
    keeperEmployeeId: string, 
    packedItems: SendLoanRequestDto
): Promise<LoanRequest | null> {
    try {
        const url = `${API_URL}/loan-requests/${requestNumber}/send?keeperEmployeeId=${keeperEmployeeId}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(packedItems)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to send loan request ${requestNumber}. Status: ${response.status}`, errorText);
            throw new Error(`Failed to send loan request: ${response.statusText}. Backend message: ${errorText}`);
        }
        return await response.json(); // Devuelve la LoanRequest actualizada
    } catch (error) {
        console.error('Error sending loan request:', error);
        return null;
    }
}

export interface UploadReturnPhotoResponse {
    photoUrl: string;
}

export async function uploadReturnPhoto(photoFile: Blob): Promise<string | null> {
    try {
        const url = `${API_BASE_URL}/Inventory/upload-return-photo`;
        const formData = new FormData();
        formData.append('photo', photoFile, 'return_photo.jpeg'); 

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error on POST ${url}. Status: ${response.status}`, errorText);
            throw new Error(`Failed to upload photo: ${response.statusText}`);
        }
        const data: UploadReturnPhotoResponse = await response.json();
        if (data.photoUrl) {
            console.log('Photo uploaded successfully. URL:', data.photoUrl);
            return data.photoUrl;
        } else {
            console.error('Photo uploaded successfully but photoUrl is missing in the response.', data);
            return null;
        }
        
    } catch (error) {
        console.error('Network or Upload Error:', error);
        return null;
    }
}// requestManagementService.ts (O donde manejes tus llamadas API)

// Define la estructura de los datos que enviamos al API
export interface ReturnItemPayload {
  itemId: number;
  quantityReturned: number;
  quantityDamaged: number;
  quantityLost: number;
  notes: string; // Usaremos esto para la condición detallada
}

export interface ReturnLoanPayload {
  engineerId: string;
  warehouseId: number;
  items: ReturnItemPayload[];
  generalNotes: string;
  photoUrl: string; // La URL de SharePoint
}

export async function submitReturnLoan(payload: ReturnLoanPayload): Promise<boolean> {
  // Asegúrate de usar la URL base correcta de tu API
  const url = `${API_BASE_URL}/Inventory/return-loan`; 

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Asegúrate de incluir cualquier cabecera de autenticación necesaria (e.g., Authorization)
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Manejo de errores de HTTP (4xx, 5xx)
      const errorDetail = await response.json();
      console.error('API Return Loan Error:', errorDetail);
      throw new Error(`Failed to submit return. Status: ${response.status}`);
    }

    // Si la respuesta es exitosa (200, 201, 204), devuelve true
    return true; 
  } catch (error) {
    console.error('Network or unexpected error during return loan submission:', error);
    throw error; 
  }
}
