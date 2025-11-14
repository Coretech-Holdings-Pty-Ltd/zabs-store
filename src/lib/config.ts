// Configuration for the storefront
export const MEDUSA_BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";
export const DEFAULT_REGION = import.meta.env.VITE_DEFAULT_REGION || "za";
export const MINIO_ENDPOINT = import.meta.env.VITE_MINIO_ENDPOINT || "";

// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// PayFast Configuration (South Africa)
export const PAYFAST_MERCHANT_ID = import.meta.env.VITE_PAYFAST_MERCHANT_ID || "";
export const PAYFAST_MERCHANT_KEY = import.meta.env.VITE_PAYFAST_MERCHANT_KEY || "";
export const PAYFAST_PASSPHRASE = import.meta.env.VITE_PAYFAST_PASSPHRASE || "";
export const PAYFAST_SANDBOX = import.meta.env.VITE_PAYFAST_SANDBOX === "true";

// Ozow Configuration (South Africa)
export const OZOW_SITE_CODE = import.meta.env.VITE_OZOW_SITE_CODE || "";
export const OZOW_PRIVATE_KEY = import.meta.env.VITE_OZOW_PRIVATE_KEY || "";
export const OZOW_API_KEY = import.meta.env.VITE_OZOW_API_KEY || "";
export const OZOW_SANDBOX = import.meta.env.VITE_OZOW_SANDBOX === "true";

// Sales channel publishable keys
export const ELECTRONICS_STORE_KEY =
  import.meta.env.VITE_MEDUSA_ELECTRONICS_KEY || "";
export const HEALTH_STORE_KEY = import.meta.env.VITE_MEDUSA_HEALTH_KEY || "";

// Sales channel IDs (needed for cart creation with multi-channel publishable keys)
// TODO: Get these IDs from Medusa Admin → Settings → Sales Channels
// Or run: SELECT id, name FROM sales_channel in the database
export const ELECTRONICS_SALES_CHANNEL_ID =
  import.meta.env.VITE_ELECTRONICS_SALES_CHANNEL_ID || "sc_01K7VTE9TAVJDM6Y1TMFBBG6VT"; // Placeholder - update from admin
export const HEALTH_SALES_CHANNEL_ID =
  import.meta.env.VITE_HEALTH_SALES_CHANNEL_ID || "sc_01K82P6KZVHQR3XJFB0CSRQ5YN"; // Placeholder - update from admin

// Store type definition
export type StoreType = "electronics" | "health";

// Get publishable key based on store type
export function getPublishableKey(store: StoreType): string {
  return store === "electronics" ? ELECTRONICS_STORE_KEY : HEALTH_STORE_KEY;
}

// Get sales channel ID based on store type
export function getSalesChannelId(store: StoreType): string {
  return store === "electronics" ? ELECTRONICS_SALES_CHANNEL_ID : HEALTH_SALES_CHANNEL_ID;
}

// Check if environment is properly configured
export function isConfigured(): boolean {
  return !!(ELECTRONICS_STORE_KEY && HEALTH_STORE_KEY && MEDUSA_BACKEND_URL);
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// Check if PayFast is configured
export function isPayFastConfigured(): boolean {
  return !!(PAYFAST_MERCHANT_ID && PAYFAST_MERCHANT_KEY);
}

// Check if Ozow is configured
export function isOzowConfigured(): boolean {
  return !!(OZOW_SITE_CODE && OZOW_PRIVATE_KEY && OZOW_API_KEY);
}

// Get configuration status
export function getConfigStatus() {
  return {
    backendUrl: MEDUSA_BACKEND_URL,
    electronicsKeyConfigured: !!ELECTRONICS_STORE_KEY,
    healthKeyConfigured: !!HEALTH_STORE_KEY,
    defaultRegion: DEFAULT_REGION,
    supabaseConfigured: isSupabaseConfigured(),
    isFullyConfigured: isConfigured() && isSupabaseConfigured(),
  };
}
