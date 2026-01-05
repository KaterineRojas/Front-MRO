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
 * Loads a cycle count with full article details for display/printing
 * @param cycleCountId - The ID of the cycle count to load
 * @param auditorName - Optional: The name of the logged-in user to use as auditor (overrides backend data)
 */
export async function getCycleCountWithArticles(cycleCountId: number, auditorName?: string) {
  try {
    // Fetch cycle count detail
    const cycleCountDetail = await getCycleCountDetail(cycleCountId);
    
    // Fetch statistics
    const stats = await getCycleCountStatistics(cycleCountId);
    
    // Determine countType from countName
    let countType: 'Annual' | 'Biannual' | 'Spot Check' = 'Annual';
    if (cycleCountDetail.countName) {
      const countNameLower = cycleCountDetail.countName.toLowerCase();
      if (countNameLower.includes('biannual') || countNameLower.includes('semiannual')) {
        countType = 'Biannual';
      } else if (countNameLower.includes('spot') || countNameLower.includes('spot check')) {
        countType = 'Spot Check';
      }
    }
    
    // Map entries to articles
    const articles = cycleCountDetail.entries.map(entry => {
      const mappedArticle = mapEntryToArticle(entry, cycleCountDetail.zoneName || 'Good Condition');
      return {
        code: mappedArticle.code,
        description: mappedArticle.description,
        zone: mappedArticle.zone,
        totalRegistered: mappedArticle.totalRegistered,
        physicalCount: mappedArticle.physicalCount || 0,
        status: mappedArticle.status || 'match',
        observations: mappedArticle.observations,
        imageUrl: mappedArticle.imageUrl
      };
    });
    
    return {
      id: cycleCountDetail.id,
      date: new Date(cycleCountDetail.createdAt).toISOString().split('T')[0],
      completedDate: cycleCountDetail.completedAt 
        ? new Date(cycleCountDetail.completedAt).toLocaleString('sv-SE').replace('T', ' ').substring(0, 19)
        : undefined,
      zone: cycleCountDetail.zoneName || 'All Zones',
      status: mapStatusNameToUIStatus(cycleCountDetail.statusName),
      countType,
      auditor: auditorName || cycleCountDetail.completedByName || cycleCountDetail.createdByName,
      totalItems: stats.totalEntries,
      counted: stats.countedEntries,
      discrepancies: stats.entriesWithVariance,
      articles,
      adjustmentsApplied: false
    };
  } catch (error) {
    console.error('Error fetching cycle count with articles:', error);
    throw error;
  }
}

/**
 * Maps CycleCountEntry from API to Article format for UI
 */
export function mapEntryToArticle(entry: CycleCountEntry, zoneName: string): {
  id: string;
  entryId: number;
  code: string;
  description: string;
  type: 'consumable' | 'non-consumable';
  zone: 'Good Condition' | 'Damaged' | 'Quarantine';
  totalRegistered: number;
  physicalCount?: number;
  status?: 'match' | 'discrepancy';
  observations?: string;
  imageUrl?: string;
} {
  // Determine if entry has been counted (countedAt is not null or physicalCount is set)
  const hasBeenCounted = entry.countedAt !== null || entry.countedByUserId !== null;
  
  // Determine status based on statusName OR if counted, compare values
  let status: 'match' | 'discrepancy' | undefined = undefined;
  if (entry.statusName?.toLowerCase() === 'match' || entry.statusName?.toLowerCase() === 'matched') {
    status = 'match';
  } else if (entry.statusName?.toLowerCase() === 'discrepancy' || entry.statusName?.toLowerCase() === 'variance') {
    status = 'discrepancy';
  } else if (hasBeenCounted && entry.variance === 0) {
    status = 'match';
  } else if (hasBeenCounted && entry.variance !== 0) {
    status = 'discrepancy';
  }

  // Map zone name - Use the provided zoneName parameter
  // For specific zone counts (Damaged, Quarantine, Good Condition), all entries should have that zone
  // For All Zones counts, zoneName will be null or contain 'all' - assign default zone
  // but the UI filter will show all items when selectedZone is 'all'
  let zone: 'Good Condition' | 'Damaged' | 'Quarantine' = 'Good Condition';
  
  if (zoneName) {
    const zoneNameLower = zoneName.toLowerCase();
    
    // Don't process if it's 'All Zones' - keep default
    if (!zoneNameLower.includes('all')) {
      // Map specific zone names
      if (zoneName === 'Damaged' || zoneName === 'damaged') {
        zone = 'Damaged';
      } else if (zoneName === 'Quarantine' || zoneName === 'quarantine') {
        zone = 'Quarantine';
      } else if (zoneName === 'Good Condition' || zoneNameLower.includes('good')) {
        zone = 'Good Condition';
      }
    }
  }
  // If zoneName is null or 'All Zones', keep default 'Good Condition'
  // The UI will show all items when selectedZone === 'all'

  // Determine type based on SKU (similar to other parts of the codebase)
  const type: 'consumable' | 'non-consumable' = entry.itemSku?.startsWith('KIT-') ? 'non-consumable' : 'non-consumable';

  // Include physicalCount if the entry has been counted (even if it's 0)
  // Only set to undefined if it hasn't been counted yet
  const physicalCount = hasBeenCounted ? entry.physicalCount : undefined;

  // Debug: Log image URL to verify it's coming from the API
  if (!entry.itemImageUrl) {
    console.log('⚠️ [mapEntryToArticle] No imageUrl for item:', {
      itemSku: entry.itemSku,
      itemName: entry.itemName,
      itemImageUrl: entry.itemImageUrl,
      fullEntry: entry
    });
  }

  return {
    id: entry.id.toString(), // Use unique entry ID instead of binFullCode
    entryId: entry.id, // Add entryId for recount operations
    code: entry.binFullCode,
    description: entry.itemName,
    type,
    zone,
    totalRegistered: entry.systemQuantity,
    physicalCount,
    status,
    observations: entry.notes || undefined,
    imageUrl: entry.itemImageUrl || undefined
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
 * Maps API statusName to UI status format
 * @param statusName - Status name from API (e.g., "InProgress", "Completed", "Paused", "Pending")
 * @returns UI status ('in-progress' | 'completed')
 */
export function mapStatusNameToUIStatus(statusName: string | undefined): 'in-progress' | 'completed' {
  const statusNameLower = statusName?.toLowerCase() || '';
  return statusNameLower === 'inprogress' || 
    statusNameLower.includes('progress') || 
    statusNameLower.includes('pending') ||
    statusNameLower.includes('paused')
      ? 'in-progress'
      : 'completed';
}

/**
 * Maps API response to UI format
 */
function mapApiResponseToRecord(apiResponse: CycleCountApiResponse): MappedCycleCountRecord {
  // Map statusName to status ('in-progress' | 'completed')
  // API returns "InProgress", "Completed", "Paused", etc.
  const status = mapStatusNameToUIStatus(apiResponse.statusName);

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
    
    console.log('🔍 [getCycleCounts] Calling API with URL:', url);
    console.log('🔍 [getCycleCounts] Parameters:', { warehouseId, pageNumber, pageSize });
    
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

/**
 * Fetches a specific cycle count with full details including entries
 * GET /api/cycle-counts/{id}
 * 
 * @param cycleCountId - Cycle count ID
 * @returns Promise with cycle count detail
 */
export async function getCycleCountDetail(
  cycleCountId: number
): Promise<CycleCountDetailResponse> {
  try {
    const url = `${API_URL}/cycle-counts/${cycleCountId}`;
    
    const response = await fetchWithAuth(url, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on GET ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to fetch cycle count detail: ${response.statusText}`);
    }

    const data: CycleCountDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cycle count detail:', error);
    throw error;
  }
}

/**
 * Pauses a cycle count
 * PUT /api/cycle-counts/{id}/pause
 * 
 * @param cycleCountId - Cycle count ID
 * @returns Promise with updated cycle count detail
 */
export async function pauseCycleCount(
  cycleCountId: number
): Promise<CycleCountDetailResponse> {
  try {
    const url = `${API_URL}/cycle-counts/${cycleCountId}/pause`;
    
    const response = await fetchWithAuth(url, {
      method: 'PUT'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on PUT ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to pause cycle count: ${response.statusText}`);
    }

    const data: CycleCountDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error pausing cycle count:', error);
    throw error;
  }
}

/**
 * Resumes a paused cycle count
 * PUT /api/cycle-counts/{id}/resume
 * 
 * @param cycleCountId - Cycle count ID
 * @returns Promise with updated cycle count detail
 */
export async function resumeCycleCount(
  cycleCountId: number
): Promise<CycleCountDetailResponse> {
  try {
    const url = `${API_URL}/cycle-counts/${cycleCountId}/resume`;
    
    const response = await fetchWithAuth(url, {
      method: 'PUT'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on PUT ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to resume cycle count: ${response.statusText}`);
    }

    const data: CycleCountDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error resuming cycle count:', error);
    throw error;
  }
}

/**
 * Completes a cycle count
 * PUT /api/cycle-counts/{id}/complete
 * 
 * @param cycleCountId - Cycle count ID
 * @returns Promise with updated cycle count detail
 */
export async function completeCycleCount(
  cycleCountId: number
): Promise<CycleCountDetailResponse> {
  try {
    const url = `${API_URL}/cycle-counts/${cycleCountId}/complete`;
    
    const response = await fetchWithAuth(url, {
      method: 'PUT'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on PUT ${url}. Status: ${response.status}`, errorText);
      
      // Try to extract the specific error message from the response
      // The error message from the API is typically just plain text
      const errorMessage = errorText || response.statusText;
      throw new Error(`Status: ${response.status} ${errorMessage}`);
    }

    const data: CycleCountDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error completing cycle count:', error);
    throw error;
  }
}

/**
 * Cancels a cycle count
 * PUT /api/cycle-counts/{id}/cancel
 * 
 * @param cycleCountId - Cycle count ID
 * @returns Promise with updated cycle count detail
 */
export async function cancelCycleCount(
  cycleCountId: number
): Promise<CycleCountDetailResponse> {
  try {
    const url = `${API_URL}/cycle-counts/${cycleCountId}/cancel`;
    
    const response = await fetchWithAuth(url, {
      method: 'PUT'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on PUT ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to cancel cycle count: ${response.statusText}`);
    }

    const data: CycleCountDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error canceling cycle count:', error);
    throw error;
  }
}

export interface RecordCountRequest {
  entryId: number;
  physicalCount: number;
  countedByUserId: number;
  notes?: string;
}

/**
 * Records a count for a single entry
 * POST /api/cycle-counts/entries/record-count
 * 
 * @param request - Count recording data
 * @returns Promise with updated cycle count entry
 */
export async function recordCount(
  request: RecordCountRequest
): Promise<CycleCountEntry> {
  try {
    const url = `${API_URL}/cycle-counts/entries/record-count`;
    
    const payload = {
      entryId: request.entryId,
      physicalCount: request.physicalCount,
      countedByUserId: request.countedByUserId,
      notes: request.notes || ''
    };

    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on POST ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to record count: ${response.statusText}`);
    }

    const data: CycleCountEntry = await response.json();
    return data;
  } catch (error) {
    console.error('Error recording count:', error);
    throw error;
  }
}

export interface RecordBatchCountRequest {
  countedByUserId: number;
  counts: Array<{
    entryId: number;
    physicalCount: number;
    notes?: string;
  }>;
}

/**
 * Records counts for multiple entries in batch
 * POST /api/cycle-counts/entries/record-batch
 * 
 * @param request - Batch count recording data
 * @returns Promise with array of updated cycle count entries
 */
export async function recordBatchCount(
  request: RecordBatchCountRequest
): Promise<CycleCountEntry[]> {
  try {
    const url = `${API_URL}/cycle-counts/entries/record-batch`;
    
    const payload = {
      countedByUserId: request.countedByUserId,
      counts: request.counts.map(c => ({
        entryId: c.entryId,
        physicalCount: c.physicalCount,
        notes: c.notes || ''
      }))
    };

    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on POST ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to record batch count: ${response.statusText}`);
    }

    const data: CycleCountEntry[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error recording batch count:', error);
    throw error;
  }
}

export interface CycleCountStatistics {
  totalEntries: number;
  countedEntries: number;
  verifiedEntries: number;
  pendingEntries: number;
  entriesWithVariance: number;
  percentageComplete: number;
  totalVariancePositive: number;
  totalVarianceNegative: number;
}

/**
 * Fetches statistics for a cycle count
 * GET /api/cycle-counts/{id}/statistics
 * 
 * @param cycleCountId - Cycle count ID
 * @returns Promise with cycle count statistics
 */
export async function getCycleCountStatistics(
  cycleCountId: number
): Promise<CycleCountStatistics> {
  try {
    const url = `${API_URL}/cycle-counts/${cycleCountId}/statistics`;
    
    const response = await fetchWithAuth(url, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on GET ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to fetch cycle count statistics: ${response.statusText}`);
    }

    const data: CycleCountStatistics = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cycle count statistics:', error);
    throw error;
  }
}

/**
 * DTO for recording a count entry
 */
export interface RecordCountDto {
  entryId: number;
  physicalCount: number;
  countedByUserId: number;
  notes?: string;
}

/**
 * Records a physical count for a cycle count entry
 * POST /api/cycle-counts/entries/record-count
 * 
 * @param data - Record count data
 * @returns Promise with updated entry
 */
export async function recordCycleCountEntry(
  data: RecordCountDto
): Promise<CycleCountEntry> {
  try {
    const url = `${API_URL}/cycle-counts/entries/record-count`;
    
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on POST ${url}. Status: ${response.status}`, errorText);
      throw new Error(`Failed to record count: ${response.statusText}`);
    }

    const updatedEntry: CycleCountEntry = await response.json();
    return updatedEntry;
  } catch (error) {
    console.error('Error recording cycle count entry:', error);
    throw error;
  }
}