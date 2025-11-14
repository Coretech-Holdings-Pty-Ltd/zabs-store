/**
 * Hybrid Cart Service
 * - Logged-in users: Use Medusa cart (stored in Medusa DB)
 * - Guest users: Use localStorage cart
 * - On login: Sync guest cart to Medusa
 */

import { 
  createCart, 
  addToCart as addToMedusaCart, 
  updateCartItem, 
  removeFromCart as removeFromMedusaCart 
} from './api';
import { CartItem } from '../components/Cart';
import { Product } from '../components/ProductCard';
import { getSalesChannelId, type StoreType } from './config';

// Storage keys
const LOCAL_CART_KEY = 'zabs_cart';
const MEDUSA_CART_ID_KEY = 'medusa_cart_id';

// Internal cart item mapping (for Medusa API)
interface MedusaCartItem {
  id: string;
  variant_id: string;
  quantity: number;
}

/**
 * Get or create Medusa cart
 * @param storeType - Store type (electronics or health) to determine sales channel
 * @param customerId - Customer ID (REQUIRED - never create cart without customer)
 */
export async function getOrCreateMedusaCart(
  storeType: StoreType = 'electronics',
  customerId: string
): Promise<string> {
  try {
    // ⚠️ CRITICAL: Never create a Medusa cart without customer_id
    if (!customerId) {
      throw new Error('❌ Customer ID is required to create Medusa cart. Use localStorage for guest users.');
    }
    
    let cartId = localStorage.getItem(MEDUSA_CART_ID_KEY);
    
    if (!cartId) {
      console.log('📦 Creating new Medusa cart for customer:', customerId, 'store:', storeType);
      
      // Create cart WITH customer_id - NEVER without it!
      const cart = await createCart(
        'reg_01K82NXVHCQ06YYB9TSF44NZSY', // South Africa region ID
        customerId, // ⚠️ REQUIRED - customer who owns this cart
        undefined, // No sales channel ID - let backend use default
        storeType
      );
      cartId = cart.id;
      localStorage.setItem(MEDUSA_CART_ID_KEY, cartId);
      console.log('✅ Medusa cart created:', cartId, 'for customer:', customerId);
    }
    
    return cartId;
  } catch (error) {
    console.error('❌ Failed to get/create Medusa cart:', error);
    throw error;
  }
}

/**
 * Add item to cart (Medusa for logged-in, localStorage for guests)
 * @param product - Product to add
 * @param quantity - Quantity to add
 * @param isLoggedIn - Whether user is logged in
 * @param customerId - Customer ID (REQUIRED if isLoggedIn=true)
 */
export async function addItemToCart(
  product: Product,
  quantity: number,
  isLoggedIn: boolean,
  customerId?: string
): Promise<CartItem[]> {
  try {
    // ⚡ GUEST USER - INSTANT OPERATION (no API calls)
    if (!isLoggedIn) {
      console.log('➕ Adding to local cart (guest):', product.name);
      const localCart = getLocalCart();
      
      const existingIndex = localCart.findIndex(i => i.product.id === product.id);
      if (existingIndex >= 0) {
        localCart[existingIndex].quantity += quantity;
      } else {
        localCart.push({ product, quantity });
      }
      
      saveLocalCart(localCart);
      return localCart; // ⚡ Instant return - no waiting!
    }
    
    // ⚠️ CRITICAL: Logged-in users MUST have customer_id
    if (!customerId) {
      throw new Error('❌ Customer ID is required for logged-in users. Cannot create cart without it.');
    }
    
    // 🔐 LOGGED-IN USER - Use Medusa cart (slower but synced)
    const storeType: StoreType = product.store === 'healthcare' ? 'health' : 'electronics';
    const cartId = await getOrCreateMedusaCart(storeType, customerId);
    console.log('➕ Adding to Medusa cart (logged-in):', product.name, 'customer:', customerId);
    
    const variantId = product.variants?.[0]?.id || product.id;
    const updatedCart = await addToMedusaCart(cartId, variantId, quantity);
    
    // Convert Medusa cart to our CartItem format
    const cartItems = convertMedusaCartToItems(updatedCart.items);
    saveLocalCart(cartItems); // Keep local cache
    return cartItems;
  } catch (error: any) {
    console.error('❌ Error adding to cart:', error);
    
    // 🔧 If cart not found (404), clear the invalid cart ID and retry ONCE
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      console.warn('⚠️ Cart not found - clearing invalid cart ID and retrying...');
      localStorage.removeItem(MEDUSA_CART_ID_KEY);
      
      // Retry once with fresh cart creation
      if (isLoggedIn && customerId) {
        try {
          const storeType: StoreType = product.store === 'healthcare' ? 'health' : 'electronics';
          const newCartId = await getOrCreateMedusaCart(storeType, customerId);
          const variantId = product.variants?.[0]?.id || product.id;
          const updatedCart = await addToMedusaCart(newCartId, variantId, quantity);
          const cartItems = convertMedusaCartToItems(updatedCart.items);
          saveLocalCart(cartItems);
          console.log('✅ Successfully added to new cart after retry');
          return cartItems;
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
          // Fall through to localStorage fallback
        }
      }
    }
    
    // ⚡ FALLBACK: If Medusa fails, save to localStorage anyway
    console.warn('⚠️ Falling back to localStorage due to error');
    const localCart = getLocalCart();
    const existingIndex = localCart.findIndex(i => i.product.id === product.id);
    if (existingIndex >= 0) {
      localCart[existingIndex].quantity += quantity;
    } else {
      localCart.push({ product, quantity });
    }
    saveLocalCart(localCart);
    return localCart;
  }
}

/**
 * Update item quantity (Medusa for logged-in, localStorage for guests)
 * @param productId - Product ID
 * @param quantity - New quantity
 * @param isLoggedIn - Whether user is logged in
 * @param customerId - Customer ID (REQUIRED if isLoggedIn=true)
 */
export async function updateItemQuantity(
  productId: string,
  quantity: number,
  isLoggedIn: boolean,
  customerId?: string
): Promise<CartItem[]> {
  try {
    // ⚡ GUEST USER - INSTANT OPERATION
    if (!isLoggedIn) {
      console.log('🔄 Updating local cart (guest):', productId, 'to quantity:', quantity);
      const localCart = getLocalCart();
      
      const index = localCart.findIndex(i => i.product.id === productId);
      if (index >= 0) {
        localCart[index].quantity = quantity;
      }
      
      saveLocalCart(localCart);
      return localCart; // ⚡ Instant return
    }
    
    // ⚠️ CRITICAL: Logged-in users MUST have customer_id
    if (!customerId) {
      throw new Error('❌ Customer ID is required for logged-in users.');
    }
    
    // 🔐 LOGGED-IN USER - Use Medusa cart
    const cartId = await getOrCreateMedusaCart('electronics', customerId);
    console.log('🔄 Updating Medusa cart (logged-in):', productId, 'to quantity:', quantity);
    
    // Find the line item ID from local cache
    const localCart = getLocalCart();
    const item = localCart.find(i => i.product.id === productId);
    
    if (item) {
      const updatedCart = await updateCartItem(cartId, productId, quantity);
      const cartItems = convertMedusaCartToItems(updatedCart.items);
      saveLocalCart(cartItems);
      return cartItems;
    }
    
    return localCart;
  } catch (error: any) {
    console.error('❌ Error updating cart:', error);
    
    // 🔧 If cart not found (404), clear the invalid cart ID
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      console.warn('⚠️ Cart not found - clearing invalid cart ID');
      localStorage.removeItem(MEDUSA_CART_ID_KEY);
    }
    
    // ⚡ FALLBACK: Update localStorage anyway
    console.warn('⚠️ Falling back to localStorage due to error');
    const localCart = getLocalCart();
    const index = localCart.findIndex(i => i.product.id === productId);
    if (index >= 0) {
      localCart[index].quantity = quantity;
    }
    saveLocalCart(localCart);
    return localCart;
  }
}

/**
 * Remove item from cart (Medusa for logged-in, localStorage for guests)
 * @param productId - Product ID to remove
 * @param isLoggedIn - Whether user is logged in
 * @param customerId - Customer ID (REQUIRED if isLoggedIn=true)
 */
export async function removeItemFromCart(
  productId: string,
  isLoggedIn: boolean,
  customerId?: string
): Promise<CartItem[]> {
  try {
    // ⚡ GUEST USER - INSTANT OPERATION
    if (!isLoggedIn) {
      console.log('🗑️ Removing from local cart (guest):', productId);
      const localCart = getLocalCart().filter(i => i.product.id !== productId);
      saveLocalCart(localCart);
      return localCart; // ⚡ Instant return
    }
    
    // ⚠️ CRITICAL: Logged-in users MUST have customer_id
    if (!customerId) {
      throw new Error('❌ Customer ID is required for logged-in users.');
    }
    
    // 🔐 LOGGED-IN USER - Use Medusa cart
    const cartId = await getOrCreateMedusaCart('electronics', customerId);
    console.log('🗑️ Removing from Medusa cart (logged-in):', productId);
    
    const updatedCart = await removeFromMedusaCart(cartId, productId);
    const cartItems = convertMedusaCartToItems(updatedCart.items);
    saveLocalCart(cartItems);
    return cartItems;
  } catch (error: any) {
    console.error('❌ Error removing from cart:', error);
    
    // 🔧 If cart not found (404), clear the invalid cart ID
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      console.warn('⚠️ Cart not found - clearing invalid cart ID');
      localStorage.removeItem(MEDUSA_CART_ID_KEY);
    }
    
    // ⚡ FALLBACK: Remove from localStorage anyway
    console.warn('⚠️ Falling back to localStorage due to error');
    const localCart = getLocalCart().filter(i => i.product.id !== productId);
    saveLocalCart(localCart);
    return localCart;
  }
}

/**
 * Clear cart
 */
export async function clearCart(isLoggedIn: boolean): Promise<void> {
  try {
    if (isLoggedIn) {
      // Clear Medusa cart
      localStorage.removeItem(MEDUSA_CART_ID_KEY);
      console.log('🧹 Cleared Medusa cart');
    }
    
    // Always clear local cache
    localStorage.removeItem(LOCAL_CART_KEY);
    console.log('🧹 Cleared local cart');
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    throw error;
  }
}

/**
 * Sync guest cart to Medusa when user logs in
 * @param customerId - Customer ID (REQUIRED - user just logged in)
 */
export async function syncLocalCartToMedusa(customerId: string): Promise<CartItem[]> {
  try {
    // ⚠️ CRITICAL: Must have customer_id to sync
    if (!customerId) {
      throw new Error('❌ Customer ID is required to sync cart to Medusa.');
    }
    
    const localCart = getLocalCart();
    
    if (localCart.length === 0) {
      console.log('ℹ️ No local cart to sync');
      return [];
    }
    
    console.log('🔄 Syncing', localCart.length, 'items to Medusa cart for customer:', customerId);
    
    // 🔧 Clear any invalid cart ID before syncing
    localStorage.removeItem(MEDUSA_CART_ID_KEY);
    
    // Use the first product's store type (assume all items are from same store for now)
    const storeType: StoreType = localCart[0].product.store === 'healthcare' ? 'health' : 'electronics';
    const cartId = await getOrCreateMedusaCart(storeType, customerId);
    
    // Add each item to Medusa cart
    for (const item of localCart) {
      const variantId = item.product.variants?.[0]?.id || item.product.id;
      console.log('  ➕ Syncing:', item.product.name, 'x', item.quantity);
      await addToMedusaCart(cartId, variantId, item.quantity);
    }
    
    console.log('✅ Cart synced to Medusa for customer:', customerId);
    
    // Fetch final cart state - use first item to get updated cart
    const firstVariantId = localCart[0].product.variants?.[0]?.id || localCart[0].product.id;
    const response = await addToMedusaCart(cartId, firstVariantId, 0); // Dummy call to get cart
    const cartItems = convertMedusaCartToItems(response.items);
    
    saveLocalCart(cartItems);
    return cartItems;
  } catch (error) {
    console.error('❌ Error syncing cart to Medusa:', error);
    // Keep items in localStorage even if sync fails
    return getLocalCart();
  }
}

/**
 * Get cart from localStorage
 */
export function getLocalCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('❌ Error loading local cart:', error);
    return [];
  }
}

/**
 * Save cart to localStorage
 */
function saveLocalCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('❌ Error saving local cart:', error);
  }
}

/**
 * Convert Medusa cart items to our CartItem format
 */
function convertMedusaCartToItems(medusaItems: any[]): CartItem[] {
  return medusaItems.map(item => {
    const product: Product = {
      id: item.id,
      name: item.title || item.variant?.product?.title || 'Unknown Product',
      description: item.description || '',
      image: item.thumbnail || item.variant?.product?.thumbnail || '',
      price: item.unit_price || 0,
      handle: item.variant?.product?.handle || '',
      variants: item.variant ? [item.variant] : [],
      category: item.variant?.product?.category || 'general',
      rating: 0,
      store: 'electronics',
    };
    
    return {
      product,
      quantity: item.quantity || 1,
    };
  });
}

