import Medusa from "@medusajs/medusa-js";
import { MEDUSA_BACKEND_URL, getPublishableKey, StoreType } from "./config";

// Create Medusa client instances for each store
export function createMedusaClient(store: StoreType) {
  const publishableKey = getPublishableKey(store);
  
  if (!publishableKey) {
    console.warn(`No publishable key configured for ${store} store`);
  }

  const client = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    maxRetries: 3,
    publishableApiKey: publishableKey,
  });

  return client;
}

// Singleton instances for each store
let electronicsClient: Medusa | null = null;
let healthClient: Medusa | null = null;

export function getElectronicsClient(): Medusa {
  if (!electronicsClient) {
    electronicsClient = createMedusaClient('electronics');
  }
  return electronicsClient;
}

export function getHealthClient(): Medusa {
  if (!healthClient) {
    healthClient = createMedusaClient('health');
  }
  return healthClient;
}

// Get client based on store type
export function getMedusaClient(store: StoreType): Medusa {
  return store === 'electronics' ? getElectronicsClient() : getHealthClient();
}

// HTTP client for direct API calls
export async function fetchFromMedusa(
  endpoint: string,
  options: RequestInit = {},
  store: StoreType = 'electronics'
): Promise<any> {
  const publishableKey = getPublishableKey(store);
  
  // Get auth token from localStorage if available
  const authToken = localStorage.getItem('medusa_auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(publishableKey && { 'x-publishable-api-key': publishableKey }),
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${MEDUSA_BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}
