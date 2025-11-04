// API URL Configuration
// Uses VITE_API_URL environment variable if available, otherwise defaults to localhost

// Vite exposes env variables through import.meta.env
// All env variables must be prefixed with VITE_ to be accessible in the browser
export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5044/api';

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
}