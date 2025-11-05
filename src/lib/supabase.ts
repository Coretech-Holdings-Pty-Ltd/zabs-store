import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file"
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Database types for TypeScript
export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  has_account: boolean;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
}

export interface Order {
  id: string;
  customer_id: string;
  status: string;
  email: string;
  currency_code: string;
  total: number;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  display_id: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
  items?: OrderItem[];
  shipping_address?: Address;
  billing_address?: Address;
}

export interface OrderItem {
  id: string;
  order_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total: number;
  thumbnail: string | null;
  variant_id: string;
  product_id: string;
  metadata: Record<string, any> | null;
}

export interface Address {
  id: string;
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string | null;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
  phone: string | null;
}

// Auth helper functions
export const authHelpers = {
  // Sign up new customer
  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    console.log("🔐 Attempting signup with:", { email, firstName, lastName });

    // Supabase Auth + Medusa backend subscriber will create customer automatically
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      console.error("❌ Signup error:", error);
      throw error;
    }

    console.log(
      "✅ Signup successful - Medusa subscriber will create customer"
    );
    return data;
  },

  // Sign in customer
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out customer
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user session
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },
};

// Customer database operations
export const customerOperations = {
  // Get customer profile
  async getCustomer(userId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from("customer")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching customer:", error);
      return null;
    }

    return data;
  },

  // Update customer profile
  async updateCustomer(userId: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from("customer")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get customer orders - Use direct Supabase query
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("order")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return data || [];
  },

  // Get single order details
  async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from("order")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return null;
    }

    return data;
  },

  // Get customer addresses - Use direct Supabase query
  async getCustomerAddresses(customerId: string) {
    // Try different possible table names for addresses
    let data = null;
    let error = null;

    // Try cart_address first (Medusa v2)
    const result1 = await supabase
      .from("cart_address")
      .select("*")
      .eq("customer_id", customerId);

    if (!result1.error && result1.data) {
      return result1.data;
    }

    // Try order_address
    const result2 = await supabase
      .from("order_address")
      .select("*")
      .eq("customer_id", customerId);

    if (!result2.error && result2.data) {
      return result2.data;
    }

    console.error("Error fetching addresses - no address table found");
    return [];
  },

  // Add new address
  async addAddress(customerId: string, address: Omit<Address, "id">) {
    // Addresses in Medusa v2 are typically stored in cart_address or order_address
    // For now, return empty - addresses are managed through orders
    console.warn(
      "Address management not implemented - addresses are part of orders"
    );
    return null;
  },

  // Update address
  async updateAddress(addressId: string, updates: Partial<Address>) {
    console.warn(
      "Address management not implemented - addresses are part of orders"
    );
    return null;
  },

  // Delete address
  async deleteAddress(addressId: string) {
    console.warn(
      "Address management not implemented - addresses are part of orders"
    );
  },
};

// Listen to auth state changes
export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
