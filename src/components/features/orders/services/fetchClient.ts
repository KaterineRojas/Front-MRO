import { authService } from '../../../../services/authService'; 
import { API_URL } from '../../../../url'; 

export const fetchClient = async (endpoint: string, options: RequestInit = {}) => {
    const token = authService.getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, 
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    return response;
};