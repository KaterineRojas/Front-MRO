// API URL Configuration
// Uses VITE_API_URL environment variable from .env files

// Development (.env.development): http://localhost:5044/api
// Production (.env.production): http://kzenstudio-001-site13.stempurl.com/api

export const API_URL: string = import.meta.env.VITE_API_URL;

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
} else {
  console.log('🚀 Production API URL:', API_URL);
}