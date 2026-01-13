/**
 * Fetch wrapper that automatically includes authentication token in headers
 * and handles 401 Unauthorized responses
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Get token from localStorage (must match authService.ts key)
  const token = localStorage.getItem('mro_token');

  // Don't set Content-Type for FormData - browser will set it automatically with boundary
  const isFormData = options?.body instanceof FormData;

  // Merge headers with authorization
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Make the fetch request with auth headers
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    console.warn('⚠️ 401 Unauthorized - Token expired or invalid. Redirecting to login...');

    // Clear invalid token and user data
    localStorage.removeItem('mro_token');
    localStorage.removeItem('mro_user');

    // Redirect to login page
    window.location.href = '/login';

    // Return the response anyway for error handling
    return response;
  }

  return response;
}
