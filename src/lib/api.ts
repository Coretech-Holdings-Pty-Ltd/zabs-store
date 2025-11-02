import { fetchFromMedusa } from './medusa-client';
import { Product, MedusaProduct, convertMedusaProduct, StoreType } from './types';
import { DEFAULT_REGION } from './config';
import { productCache, CACHE_KEYS, withCache } from './cache';

/**
 * Fetch products for a specific store (sales channel) - CACHED VERSION
 * @param store - 'electronics' or 'health'
 * @returns Array of products formatted for the UI
 */
export async function fetchProductsByStore(store: StoreType): Promise<Product[]> {
  const cacheKey = store === 'health' ? CACHE_KEYS.HEALTH_PRODUCTS : CACHE_KEYS.ELECTRONICS_PRODUCTS;
  
  // Try cache first
  const cached = productCache.get<Product[]>(cacheKey);
  if (cached) {
    console.log(`✅ Cache HIT: ${store} products`);
    return cached;
  }

  try {
    console.log(`❌ Cache MISS: Fetching ${store} products...`);
    
    // First, try to get available regions
    let regionId = DEFAULT_REGION;
    try {
      const regionsResponse = await fetchFromMedusa('/store/regions', {}, store);
      if (regionsResponse.regions && regionsResponse.regions.length > 0) {
        // Use the first available region
        regionId = regionsResponse.regions[0].id;
        console.log(`Using region: ${regionId}`);
      }
    } catch (regionError) {
      console.warn('Could not fetch regions, using default');
    }
    
    // Fetch products from Medusa Store API
    // The publishable key in fetchFromMedusa automatically filters by sales channel
    const response = await fetchFromMedusa(
      `/store/products?limit=100&region_id=${regionId}&fields=*variants,*variants.prices,*variants.calculated_price,*images,*categories`,
      {},
      store
    );

    if (!response.products || response.products.length === 0) {
      console.warn(`No products found for ${store} store`);
      return [];
    }

    console.log(`Found ${response.products.length} products for ${store} store`);

    // Convert Medusa products to frontend format
    const products = response.products.map((medusaProduct: MedusaProduct) =>
      convertMedusaProduct(medusaProduct, store)
    );

    // Cache for 10 minutes
    productCache.set(cacheKey, products, 10 * 60 * 1000);
    console.log(`💾 Cached ${store} products`);

    return products;
  } catch (error) {
    console.error(`Error fetching products for ${store} store:`, error);
    throw new Error(`Failed to fetch products for ${store} store: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch a single product by ID - CACHED VERSION
 * @param productId - Medusa product ID
 * @param store - Store type for proper client selection
 * @returns Single product or null
 */
export async function fetchProductById(
  productId: string,
  store: StoreType
): Promise<Product | null> {
  const cacheKey = CACHE_KEYS.PRODUCT_DETAIL(productId);
  
  // Try cache first
  const cached = productCache.get<Product>(cacheKey);
  if (cached) {
    console.log(`✅ Cache HIT: Product ${productId}`);
    return cached;
  }

  try {
    console.log(`❌ Cache MISS: Fetching product ${productId}...`);
    
    const response = await fetchFromMedusa(
      `/store/products/${productId}?fields=+variants,+variants.prices,+images,+categories`,
      {},
      store
    );

    if (!response.product) {
      console.warn(`Product ${productId} not found`);
      return null;
    }

    const product = convertMedusaProduct(response.product as MedusaProduct, store);
    
    // Cache for 15 minutes
    productCache.set(cacheKey, product, 15 * 60 * 1000);
    console.log(`💾 Cached product ${productId}`);

    return product;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
}

/**
 * Smart search products across both stores with fuzzy matching
 * @param query - Search query string
 * @returns Array of matching products (exact matches first, then similar)
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    // Fetch from both stores in parallel
    const [electronicsProducts, healthProducts] = await Promise.all([
      fetchProductsByStore('electronics'),
      fetchProductsByStore('health'),
    ]);

    const allProducts = [...electronicsProducts, ...healthProducts];

    // Normalize search term
    const searchTerm = query.toLowerCase().trim();
    
    // Score each product for relevance
    const scoredProducts = allProducts.map(product => {
      const name = product.name.toLowerCase();
      const category = product.category.toLowerCase();
      const description = (product.description || '').toLowerCase();
      
      let score = 0;
      
      // Exact matches (highest priority)
      if (name === searchTerm) score += 100;
      if (name.includes(searchTerm)) score += 50;
      
      // Category matches
      if (category.includes(searchTerm)) score += 30;
      
      // Description matches
      if (description.includes(searchTerm)) score += 20;
      
      // Word matches (split query into words)
      const searchWords = searchTerm.split(' ');
      searchWords.forEach(word => {
        if (word.length > 2) { // Skip short words
          if (name.includes(word)) score += 10;
          if (category.includes(word)) score += 5;
          if (description.includes(word)) score += 3;
        }
      });
      
      // Fuzzy matching - check if words are similar
      searchWords.forEach(word => {
        if (word.length > 3) {
          // Check if any word in product name is similar
          const nameWords = name.split(' ');
          nameWords.forEach(nameWord => {
            if (isSimilar(word, nameWord)) score += 15;
          });
        }
      });
      
      return { product, score };
    });

    // Filter products with score > 0 and sort by score
    const results = scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    return results;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Check if two strings are similar (simple Levenshtein-like comparison)
 */
function isSimilar(str1: string, str2: string): boolean {
  if (str1.length < 3 || str2.length < 3) return false;
  
  // Check if strings share significant characters
  const common = [...str1].filter(char => str2.includes(char)).length;
  const similarity = common / Math.max(str1.length, str2.length);
  
  return similarity > 0.6; // 60% similarity threshold
}

/**
 * Fetch products by category
 * @param category - Category name
 * @param store - Store type
 * @returns Array of products in that category
 */
export async function fetchProductsByCategory(
  category: string,
  store: StoreType
): Promise<Product[]> {
  try {
    const allProducts = await fetchProductsByStore(store);
    return allProducts.filter((p) => p.category === category);
  } catch (error) {
    console.error(`Error fetching products by category ${category}:`, error);
    return [];
  }
}

/**
 * Get available regions
 * @returns Array of regions
 */
export async function fetchRegions() {
  try {
    const response = await fetchFromMedusa('/store/regions', {}, 'electronics');
    return response.regions || [];
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
}

/**
 * Create a cart for the specified region
 * @param regionId - Region ID (e.g., 'za' for South Africa)
 * @returns Cart object
 */
export async function createCart(regionId: string = DEFAULT_REGION) {
  try {
    const response = await fetchFromMedusa(
      '/store/carts',
      {
        method: 'POST',
        body: JSON.stringify({ region_id: regionId }),
      },
      'electronics'
    );
    return response.cart;
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
}

/**
 * Add item to cart
 * @param cartId - Cart ID
 * @param variantId - Product variant ID
 * @param quantity - Quantity to add
 * @returns Updated cart
 */
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
) {
  try {
    const response = await fetchFromMedusa(
      `/store/carts/${cartId}/line-items`,
      {
        method: 'POST',
        body: JSON.stringify({
          variant_id: variantId,
          quantity,
        }),
      },
      'electronics'
    );
    return response.cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 * @param cartId - Cart ID
 * @param lineItemId - Line item ID
 * @param quantity - New quantity
 * @returns Updated cart
 */
export async function updateCartItem(
  cartId: string,
  lineItemId: string,
  quantity: number
) {
  try {
    const response = await fetchFromMedusa(
      `/store/carts/${cartId}/line-items/${lineItemId}`,
      {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      },
      'electronics'
    );
    return response.cart;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 * @param cartId - Cart ID
 * @param lineItemId - Line item ID
 * @returns Updated cart
 */
export async function removeFromCart(cartId: string, lineItemId: string) {
  try {
    const response = await fetchFromMedusa(
      `/store/carts/${cartId}/line-items/${lineItemId}`,
      {
        method: 'DELETE',
      },
      'electronics'
    );
    return response.cart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Customer Authentication - Register
 * Uses Medusa v2 auth module with email/password provider
 */
export async function registerCustomer(email: string, password: string, firstName: string, lastName: string) {
  try {
    console.log('🔐 Attempting customer registration with auth module...');
    
    // Step 1: Register using the auth module endpoint
    // This creates both the auth identity AND the customer
    const authResponse = await fetchFromMedusa(
      '/auth/customer/emailpass/register',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      },
      'electronics'
    );

    console.log('✅ Auth registration successful:', authResponse);

    // Step 2: Get the token from the response
    const token = authResponse.token;
    if (token) {
      localStorage.setItem('medusa_auth_token', token);
      console.log('🔑 Token stored successfully');
    }

    // Step 3: Update customer profile with first/last name
    // The customer is auto-created by the auth module, we just need to update it
    if (token) {
      try {
        const updateResponse = await fetchFromMedusa(
          '/store/customers/me',
          {
            method: 'POST',
            body: JSON.stringify({
              first_name: firstName,
              last_name: lastName,
            }),
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          },
          'electronics'
        );
        console.log('✅ Customer profile updated with name');
        return updateResponse.customer;
      } catch (updateError) {
        console.warn('⚠️ Could not update customer name, but registration succeeded');
        // Still return the basic customer info
        return authResponse.customer;
      }
    }

    return authResponse.customer;
  } catch (error: any) {
    console.error('❌ Error registering customer:', error);
    
    // Parse error message (check the full error object)
    const errorMsg = (error.message || '').toLowerCase();
    const errorString = JSON.stringify(error).toLowerCase();
    
    // Provide helpful error messages (check most specific errors first)
    if (errorMsg.includes('already exists') || errorString.includes('already exists') || 
        errorMsg.includes('duplicate') || errorString.includes('duplicate')) {
      throw new Error('✉️ An account with this email already exists. Please try logging in instead.');
    } else if (errorMsg.includes('404') || errorString.includes('404')) {
      throw new Error('🔧 Authentication endpoint not found. Please ensure the backend is running.');
    } else if (errorMsg.includes('400') || errorMsg.includes('invalid')) {
      throw new Error('⚠️ Invalid email or password. Password must be at least 8 characters.');
    } else if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
      throw new Error('🔒 Registration failed. Please check your information or try logging in if you already have an account.');
    }
    
    throw new Error('❌ Failed to create account. Please check your information and try again.');
  }
}

/**
 * Customer Authentication - Login
 * Uses Medusa v2 auth module with email/password provider
 */
export async function loginCustomer(email: string, password: string) {
  try {
    console.log('🔐 Attempting customer login with auth module...');
    
    // Use the auth module emailpass login endpoint
    const authResponse = await fetchFromMedusa(
      '/auth/customer/emailpass',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      },
      'electronics'
    );
    
    console.log('✅ Auth login successful:', authResponse);
    
    // Store the auth token FIRST (before any authenticated requests)
    const token = authResponse.token;
    if (token) {
      localStorage.setItem('medusa_auth_token', token);
      console.log('🔑 Token stored successfully');
    }
    
    // Fetch full customer details using the stored token
    // Note: fetchFromMedusa automatically includes the token from localStorage
    if (token) {
      try {
        const customerResponse = await fetchFromMedusa(
          '/store/customers/me',
          {
            method: 'GET',
          },
          'electronics'
        );
        
        console.log('✅ Customer details fetched successfully');
        return customerResponse.customer;
      } catch (fetchError) {
        console.warn('⚠️ Could not fetch customer details, but login succeeded');
        // Return basic info from auth response if available
        if (authResponse.customer) {
          return authResponse.customer;
        }
      }
    }
    
    // Fallback: return customer from auth response if available
    if (authResponse.customer) {
      return authResponse.customer;
    }
    
    // Return basic customer info with email
    return { email };
    
  } catch (error: any) {
    console.error('❌ Error logging in:', error);
    
    const errorMsg = (error.message || '').toLowerCase();
    const errorString = JSON.stringify(error).toLowerCase();
    
    // Provide helpful error messages
    if (errorMsg.includes('404') || errorString.includes('404')) {
      throw new Error('👤 Account not found. Please register first or check your email.');
    } else if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || errorString.includes('unauthorized')) {
      throw new Error('🔒 Invalid email or password. Please check your credentials and try again.');
    } else if (errorMsg.includes('400') || errorString.includes('400')) {
      throw new Error('⚠️ Invalid login request. Please check your email and password format.');
    }
    
    throw new Error('❌ Login failed. Please try again or contact support.');
  }
}

/**
 * Get current customer
 */
export async function getCurrentCustomer() {
  try {
    const token = localStorage.getItem('medusa_auth_token');
    if (!token) {
      return null;
    }

    const response = await fetchFromMedusa(
      '/store/customers/me',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      },
      'electronics'
    );
    return response.customer;
  } catch (error) {
    console.error('Error fetching current customer:', error);
    // Clear invalid token
    localStorage.removeItem('medusa_auth_token');
    return null;
  }
}

/**
 * Update customer profile
 */
export async function updateCustomer(data: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  billing_address?: any;
  metadata?: any;
}) {
  try {
    const token = localStorage.getItem('medusa_auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetchFromMedusa(
      '/store/customers/me',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
      'electronics'
    );
    return response.customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

/**
 * Logout customer
 */
export async function logoutCustomer() {
  try {
    const token = localStorage.getItem('medusa_auth_token');
    if (token) {
      await fetchFromMedusa(
        '/store/auth',
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
        'electronics'
      );
    }
  } catch (error) {
    console.error('Error logging out:', error);
  } finally {
    // Always clear local token
    localStorage.removeItem('medusa_auth_token');
  }
}

/**
 * Get customer orders
 */
export async function getCustomerOrders() {
  try {
    const token = localStorage.getItem('medusa_auth_token');
    if (!token) {
      return [];
    }

    const response = await fetchFromMedusa(
      '/store/customers/me/orders',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      },
      'electronics'
    );
    return response.orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}
