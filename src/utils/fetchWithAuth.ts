/**
 * Fetch wrapper that automatically includes authentication token in headers
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Get token from localStorage
  const token = localStorage.getItem('auth_token');

  // Don't set Content-Type for FormData - browser will set it automatically with boundary
  const isFormData = options?.body instanceof FormData;

  // Merge headers with authorization
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Make the fetch request with auth headers
  return fetch(url, {
    ...options,
    headers,
  });
}
