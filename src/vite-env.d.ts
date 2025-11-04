/// <reference types="vite/client" />

// Extend ImportMetaEnv to include custom environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
