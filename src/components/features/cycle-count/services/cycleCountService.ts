import { API_URL } from '../../../../url';
import { fetchWithAuth } from '../../../../utils/fetchWithAuth';

// Types for API Response
export interface CycleCountApiResponse {
  id: number;
  countNumber: string;
  countName: string;
  warehouseName: string;
  zoneName: string | null;
  status: number;
  statusName: string;
  createdByName: string;
  completedByName: string | null;
  createdAt: string;
  completedAt: string | null;
  totalEntries: number;
  countedEntries: number;
  entriesWithVariance: number;
  percentageComplete: number;
}

export interface PagedCycleCountResponse {
  data: CycleCountApiResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Types for POST /api/cycle-counts
export interface CreateCycleCountRequest {
  countName: string;
  warehouseId: number;
  zoneId?: number | null; // Optional: null or undefined for "All Zones"
  createdByUserId: number;
  showSystemQuantity: boolean;
  notes?: string;
}

export interface CycleCountEntry {
  id: number;
  cycleCountId: number;
  inventoryId: number;
  itemId: number;
  itemSku: string;
  itemName: string;
  itemImageUrl: string;
  binId: number;
  binFullCode: string;
  systemQuantity: number;
  physicalCount: number;
  variance: number;
  status: number;
  statusName: string;
  countedByUserId: number | null;
  countedByName: string | null;
  countedAt: string | null;
  verifiedByUserId: number | null;
  verifiedByName: string | null;
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps CycleCountEntry from API to Article format for UI
 */
export function mapEntryToArticle(entry: CycleCountEntry, zoneName: string): {
  id: string;
  code: string;
  description: string;
  type: 'consumable' | 'non-consumable';
  zone: 'Good Condition' | 'Damaged' | 'Quarantine';
  totalRegistered: number;
  physicalCount?: number;
  status?: 'match' | 'discrepancy';
  observations?: string;
} {
  // Determine status based on statusName
  let status: 'match' | 'discrepancy' | undefined = undefined;
  if (entry.statusName?.toLowerCase() === 'match' || entry.statusName?.toLowerCase() === 'matched') {
    status = 'match';
  } else if (entry.statusName?.toLowerCase() === 'discrepancy' || entry.statusName?.toLowerCase() === 'variance') {
    status = 'discrepancy';
  }

  // Map zone name - if entry has zone info, use it; otherwise use provided zoneName
  let zone: 'Good Condition' | 'Damaged' | 'Quarantine' = 'Good Condition';
  if (zoneName) {
    if (zoneName === 'Damaged') zone = 'Damaged';
    else if (zoneName === 'Quarantine') zone = 'Quarantine';
    else zone = 'Good Condition';
  }

  // Determine type based on SKU (similar to other parts of the codebase)
  const type: 'consumable' | 'non-consumable' = entry.itemSku?.startsWith('KIT-') ? 'non-consumable' : 'non-consumable';

  return {
    id: entry.itemSku || entry.id.toString(),
    code: entry.itemSku,
    description: entry.itemName,
    type,
    zone,
    totalRegistered: entry.systemQuantity,
    physicalCount: entry.physicalCount > 0 ? entry.physicalCount : undefined,
    status,
    observations: entry.notes || undefined
  };
}

export interface CycleCountDetailResponse {
  id: number;
  countNumber: string;
  countName: string;
  warehouseId: number;
  warehouseName: string;
  zoneId: number | null;
  zoneName: string | null;
  rackId: number | null;
  rackName: string | null;
  levelId: number | null;
  levelName: string | null;
  binId: number | null;
  binFullCode: string | null;
  status: number;
  statusName: string;
  createdByUserId: number;
  createdByName: string;
  completedByUserId: number | null;
  completedByName: string | null;
  createdAt: string;
  pausedAt: string | null;
  resumedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
  showSystemQuantity: boolean;
  notes: string | null;
  entries: CycleCountEntry[];
  totalEntries: number;
  countedEntries: number;
  pendingEntries: number;
  entriesWithVariance?: number;
  percentageComplete: number;
}

// Mapped type for UI (matching CycleCountRecord structure)
export interface MappedCycleCountRecord {
  id: number;
  date: string;
  completedDate?: string;
  zone: string;
  status: 'in-progress' | 'completed';
  countType: 'Annual' | 'Biannual' | 'Spot Check';
  auditor: string;
  totalItems: number;
  counted: number;
  discrepancies: number;
  articles: never[]; // Will be populated later when we fetch details
  adjustmentsApplied?: boolean;
  // Additional fields from API
  countNumber?: string;
  countName?: string;
  warehouseName?: string;
  statusName?: string;
  createdByName?: string;
  completedByName?: string;
  createdAt?: string;
  percentageComplete?: number;
}

/**
 * Maps API response to UI format
 */
function mapApiResponseToRecord(apiResponse: CycleCountApiResponse): MappedCycleCountRecord {
  // Map statusName to status ('in-progress' | 'completed')
  // API returns "InProgress" or "Completed"
  const statusNameLower = apiResponse.statusName?.toLowerCase() || '';
  const status: 'in-progress' | 'completed' = 
    statusNameLower === 'inprogress' || 
    statusNameLower.includes('progress') || 
    statusNameLower.includes('pending')
      ? 'in-progress'
      : 'completed';

  // Extract date from completedAt or createdAt
  const completedDate = apiResponse.completedAt || undefined;
  
  // Format date as YYYY-MM-DD
  const date = completedDate 
    ? new Date(completedDate).toISOString().split('T')[0]
    : new Date(apiResponse.createdAt).toISOString().split('T')[0];

  // Format completedDate with time as YYYY-MM-DD HH:mm:ss (matching existing format)
  let formattedCompletedDate: string | undefined = undefined;
  if (completedDate) {
    const dateObj = new Date(completedDate);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    formattedCompletedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Use completedByName or createdByName as auditor
  const auditor = apiResponse.completedByName || apiResponse.createdByName || '';

  // Determine countType from countName if possible, default to 'Annual'
  let countType: 'Annual' | 'Biannual' | 'Spot Check' = 'Annual';
  if (apiResponse.countName) {
    const countNameLower = apiResponse.countName.toLowerCase();
    if (countNameLower.includes('biannual') || countNameLower.includes('semiannual')) {
      countType = 'Biannual';
    } else if (countNameLower.includes('spot') || countNameLower.includes('spot check')) {
      countType = 'Spot Check';
    }
  }

  // Handle zoneName which can be null - default to 'All Zones' if null
  const zone = apiResponse.zoneName || 'All Zones';

  return {
    id: apiResponse.id,
    date,
    completedDate: formattedCompletedDate,
    zone,
    status,
    countType,
    auditor,
    totalItems: apiResponse.totalEntries,
    counted: apiResponse.countedEntries,
    discrepancies: apiResponse.entriesWithVariance,
    articles: [], // Will be populated when fetching detail view
    adjustmentsApplied: false,
    // Additional fields
    countNumber: apiResponse.countNumber,
    countName: apiResponse.countName,
    warehouseName: apiResponse.warehouseName,
    statusName: apiResponse.statusName,
    createdByName: apiResponse.createdByName,
    completedByName: apiResponse.completedByName || undefined,
    createdAt: apiResponse.createdAt,
    percentageComplete: apiResponse.percentageComplete
  };
}

/**
 * Fetches all cycle counts from the API
 * GET /api/cycle-counts
 * 
 * @param warehouseId - Warehouse ID of the logged in user (required)
 * @param pageNumber - Page number (default: 1)
 * @param pageSize - Items per page (default: 20)
 * @returns Promise with paged response and mapped records
 */
export async function getCycleCounts(
  warehouseId: number,
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<{
  records: MappedCycleCountRecord[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}> {
  try {
    const params = new URLSearchParams({
      warehouseId: warehouseId.toString(),
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });

    const url = `${API_URL}/cycle-counts?${params.toString()}`;
    
    const response = await fetchWithAuth(url, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on GET ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to fetch cycle counts: ${response.statusText}`);
    }

    const pagedData: PagedCycleCountResponse = await response.json();
    
    // Map API responses to UI format
    const mappedRecords = pagedData.data.map(mapApiResponseToRecord);

    return {
      records: mappedRecords,
      pagination: {
        pageNumber: pagedData.pageNumber,
        pageSize: pagedData.pageSize,
        totalCount: pagedData.totalCount,
        totalPages: pagedData.totalPages,
        hasPreviousPage: pagedData.hasPreviousPage,
        hasNextPage: pagedData.hasNextPage
      }
    };
  } catch (error) {
    console.error('Error fetching cycle counts:', error);
    throw error;
  }
}

/**
 * Maps zone name to zoneId
 * @param zone - Zone name from UI ('all' | 'Good Condition' | 'Damaged' | 'Quarantine')
 * @returns zoneId number or null for 'all'
 */
export function mapZoneToZoneId(zone: string): number | null {
  switch (zone) {
    case 'Good Condition':
      return 1;
    case 'Damaged':
      return 2;
    case 'Quarantine':
      return 3;
    case 'all':
    default:
      return null;
  }
}

/**
 * Creates a new cycle count
 * POST /api/cycle-counts
 * 
 * @param request - Cycle count creation data
 * @returns Promise with created cycle count detail
 */
export async function createCycleCount(
  request: CreateCycleCountRequest
): Promise<CycleCountDetailResponse> {
  try {
    const url = `${API_URL}/cycle-counts`;
    
    // Build payload - exclude zoneId if it's null/undefined
    const payload: any = {
      countName: request.countName,
      warehouseId: request.warehouseId,
      createdByUserId: request.createdByUserId,
      showSystemQuantity: request.showSystemQuantity,
      notes: request.notes || ''
    };

    // Only include zoneId if it's not null
    if (request.zoneId !== null && request.zoneId !== undefined) {
      payload.zoneId = request.zoneId;
    }

    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on POST ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to create cycle count: ${response.statusText}`);
    }

    const data: CycleCountDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating cycle count:', error);
    throw error;
  }
}

export interface PagedCycleCountEntriesResponse {
  data: CycleCountEntry[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Fetches cycle count entries
 * GET /api/cycle-counts/{id}/entries
 * 
 * @param cycleCountId - Cycle count ID
 * @param pageNumber - Page number (default: 1)
 * @param pageSize - Items per page (default: 50)
 * @returns Promise with paged cycle count entries
 */
export async function getCycleCountEntries(
  cycleCountId: number,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<PagedCycleCountEntriesResponse> {
  try {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });

    const url = `${API_URL}/cycle-counts/${cycleCountId}/entries?${params.toString()}`;
    
    const response = await fetchWithAuth(url, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on GET ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to fetch cycle count entries: ${response.statusText}`);
    }

    const pagedResponse: PagedCycleCountEntriesResponse = await response.json();
    return pagedResponse;
  } catch (error) {
    console.error('Error fetching cycle count entries:', error);
    throw error;
  }
}

