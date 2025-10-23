import { useState, useEffect } from 'react';
import { Product, StoreType } from './types';
import { 
  fetchProductsByStore, 
  searchProducts, 
  getCurrentCustomer,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  updateCustomer,
} from './api';

/**
 * Hook to fetch products for a specific store
 * @param store - Store type ('electronics' or 'health')
 * @returns { products, loading, error, refetch }
 */
export function useProducts(store: StoreType) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductsByStore(store);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [store]);

  return { products, loading, error, refetch: fetchProducts };
}

/**
 * Hook to search products across all stores
 * @param query - Search query string
 * @returns { results, loading, error }
 */
export function useProductSearch(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim() === '') {
      setResults([]);
      return;
    }

    const search = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await searchProducts(query);
        setResults(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, loading, error };
}

/**
 * Hook for cart management
 * @returns Cart state and operations
 */
export function useCart() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load cart ID from localStorage on mount
  useEffect(() => {
    const savedCartId = localStorage.getItem('medusa_cart_id');
    if (savedCartId) {
      setCartId(savedCartId);
    }
  }, []);

  // Save cart ID to localStorage when it changes
  useEffect(() => {
    if (cartId) {
      localStorage.setItem('medusa_cart_id', cartId);
    }
  }, [cartId]);

  return {
    cartId,
    setCartId,
    loading,
    clearCart: () => {
      setCartId(null);
      localStorage.removeItem('medusa_cart_id');
    },
  };
}

/**
 * Hook for authentication
 * @returns Authentication state and methods
 */
export function useAuth() {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const user = await getCurrentCustomer();
      setCustomer(user);
    } catch (err) {
      console.error('Auth check failed:', err);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await loginCustomer(email, password);
      setCustomer(user);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await registerCustomer(email, password, firstName, lastName);
      // Auto-login after registration
      await login(email, password);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutCustomer();
      setCustomer(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCustomer = await updateCustomer(data);
      setCustomer(updatedCustomer);
      return updatedCustomer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    customer,
    loading,
    error,
    isAuthenticated: !!customer,
    login,
    register,
    logout,
    updateProfile,
    refetch: checkAuth,
  };
}
