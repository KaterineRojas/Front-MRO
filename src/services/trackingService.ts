import { API_URL } from '../url';

// DTOs que coinciden con el backend
export interface ItemLocationDto {
  binId: number;
  binCode: string;
  quantity: number;
  quantityOnLoan: number;
  quantityReserved: number;
  quantityAvailable: number;
  isDefault: boolean;
  zoneType: string;
}

export interface EngineerHoldingDto {
  engineerId: string;
  engineerName: string;
  quantity: number;
  loanRequestNumber: string;
  expectedReturnDate: string;
  isOverdue: boolean;
}

export interface ItemTrackingDto {
  itemId: number;
  itemSku: string;
  itemName: string;
  itemDescription: string;
  imageUrl?: string;
  totalInBins: number;
  totalOnLoan: number;
  totalReserved: number;
  totalLocations: number;
  locations: ItemLocationDto[];
  engineersHolding: EngineerHoldingDto[];
}

export interface EngineerItemDto {
  itemId: number;
  itemSku: string;
  itemName: string;
  itemDescription: string;
  imageUrl?: string;
  quantity: number;
  loanRequestNumber: string;
  expectedReturnDate: string;
  isOverdue: boolean;
}

export interface EngineerTrackingDto {
  engineerId: string;
  engineerName: string;
  email: string;
  departmentName: string;
  totalItems: number;
  totalQuantity: number;
  overdueItems: number;
  items: EngineerItemDto[];
}

class TrackingService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('mro_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getItemTracking(itemId: number, warehouseId: number): Promise<ItemTrackingDto> {
    const response = await fetch(
      `${API_URL}/tracking/item/${itemId}?warehouseId=${warehouseId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch item tracking');
    }

    return response.json();
  }

  async getEngineerTracking(employeeId: string, warehouseId: number): Promise<EngineerTrackingDto> {
    const response = await fetch(
      `${API_URL}/tracking/engineer/${employeeId}?warehouseId=${warehouseId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch engineer tracking');
    }

    return response.json();
  }
}

export const trackingService = new TrackingService();
