// Configuration for the storefront
export const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
export const DEFAULT_REGION = import.meta.env.VITE_DEFAULT_REGION || 'za';
export const MINIO_ENDPOINT = import.meta.env.VITE_MINIO_ENDPOINT || '';

// Sales channel publishable keys
export const ELECTRONICS_STORE_KEY = import.meta.env.VITE_MEDUSA_ELECTRONICS_KEY || '';
export const HEALTH_STORE_KEY = import.meta.env.VITE_MEDUSA_HEALTH_KEY || '';

// Store type definition
export type StoreType = 'electronics' | 'health';

// Get publishable key based on store type
export function getPublishableKey(store: StoreType): string {
  return store === 'electronics' ? ELECTRONICS_STORE_KEY : HEALTH_STORE_KEY;
}

// Check if environment is properly configured
export function isConfigured(): boolean {
  return !!(ELECTRONICS_STORE_KEY && HEALTH_STORE_KEY && MEDUSA_BACKEND_URL);
}

// Get configuration status
export function getConfigStatus() {
  return {
    backendUrl: MEDUSA_BACKEND_URL,
    electronicsKeyConfigured: !!ELECTRONICS_STORE_KEY,
    healthKeyConfigured: !!HEALTH_STORE_KEY,
    defaultRegion: DEFAULT_REGION,
    isFullyConfigured: isConfigured(),
  };
}
