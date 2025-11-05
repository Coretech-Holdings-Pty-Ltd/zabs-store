import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  supabase, 
  authHelpers, 
  customerOperations, 
  Customer,
  Order,
  onAuthStateChange 
} from './supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Customer>) => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load customer data
  const loadCustomer = async (userId: string) => {
    try {
      const customerData = await customerOperations.getCustomer(userId);
      setCustomer(customerData);
    } catch (error) {
      console.error('Error loading customer:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Check active session
    authHelpers.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadCustomer(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadCustomer(session.user.id);
      } else {
        setCustomer(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      const { user } = await authHelpers.signUp(email, password, firstName, lastName);
      if (user) {
        await loadCustomer(user.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user } = await authHelpers.signIn(email, password);
      if (user) {
        await loadCustomer(user.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authHelpers.signOut();
      setUser(null);
      setCustomer(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Customer>) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const updatedCustomer = await customerOperations.updateCustomer(user.id, updates);
      setCustomer(updatedCustomer);
    } finally {
      setLoading(false);
    }
  };

  const refreshCustomer = async () => {
    if (!user) return;
    await loadCustomer(user.id);
  };

  const value = {
    user,
    customer,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for customer orders
export function useCustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerOperations.getCustomerOrders(user.id);
        setOrders(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
        setError(errorMessage);
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const refreshOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await customerOperations.getCustomerOrders(user.id);
      setOrders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh orders';
      setError(errorMessage);
      console.error('Error refreshing orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, error, refreshOrders };
}

// Hook for customer addresses
export function useCustomerAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const data = await customerOperations.getCustomerAddresses(user.id);
        setAddresses(data);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const addAddress = async (address: any) => {
    if (!user) throw new Error('No user logged in');
    
    const newAddress = await customerOperations.addAddress(user.id, address);
    setAddresses([...addresses, newAddress]);
    return newAddress;
  };

  const updateAddress = async (addressId: string, updates: any) => {
    const updatedAddress = await customerOperations.updateAddress(addressId, updates);
    setAddresses(addresses.map(addr => addr.id === addressId ? updatedAddress : addr));
    return updatedAddress;
  };

  const deleteAddress = async (addressId: string) => {
    await customerOperations.deleteAddress(addressId);
    setAddresses(addresses.filter(addr => addr.id !== addressId));
  };

  return { addresses, loading, addAddress, updateAddress, deleteAddress };
}
