import { API_URL } from '../url';

// DTO para ingenieros que coincide con el backend
export interface EngineerDto {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  departmentName: string;
}

class AmaxService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('mro_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Obtiene todos los usuarios con rol Engineer de la base de datos local
   */
  async getEngineers(): Promise<EngineerDto[]> {
    const response = await fetch(`${API_URL}/amx/engineers`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch engineers');
    }

    return response.json();
  }
}

export const amaxService = new AmaxService();
