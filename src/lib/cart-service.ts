/**
 * Cart Service - Medusa v2 API Integration
 * Uses Medusa's native cart APIs for both guest and logged-in users
 * - Guest users: localStorage + Medusa cart (stored by cart ID)
 * - Logged-in users: Medusa cart linked to customer
 */

import { CartItem } from "../components/Cart";
import { Product } from "../components/ProductCard";
import {
  MEDUSA_BACKEND_URL,
  ELECTRONICS_STORE_KEY,
  HEALTH_STORE_KEY,
  getSalesChannelId,
} from "./config";

const CART_STORAGE_KEY = "zabs_cart_items";
const CART_ID_KEY = "zabs_cart_id";
const DEFAULT_REGION = "reg_01JCQM9SC16SEK8PNRJ5TSGSCZ"; // South Africa region

/**
 * Get publishable key for a store type
 */
function getPublishableKey(storeType: "electronics" | "health"): string {
  return storeType === "health" ? HEALTH_STORE_KEY : ELECTRONICS_STORE_KEY;
}

/**
 * Create cart via Medusa API
 */
async function createMedusaCart(
  storeType: "electronics" | "health" = "electronics",
  customerId?: string
): Promise<string> {
  console.log(
    "🛒 Creating cart via Medusa API, store:",
    storeType,
    "customer:",
    customerId
  );
  const publishableKey = getPublishableKey(storeType);

  const body: any = {
    region_id: DEFAULT_REGION,
  };

  // Add customer_id if provided (logged-in user)
  if (customerId) {
    body.customer_id = customerId;
  }

  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/carts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": publishableKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ Error creating cart in Medusa:", error);
    throw new Error("Failed to create cart");
  }

  const data = await response.json();
  const cartId = data.cart?.id;

  if (!cartId) {
    throw new Error("Cart ID not returned from Medusa");
  }

  console.log("✅ Cart created in Medusa:", cartId);

  // Store cart ID in localStorage
  localStorage.setItem(CART_ID_KEY, cartId);

  return cartId;
}

/**
 * Get or create cart for user (both guest and logged-in)
 */
async function getOrCreateCart(
  storeType: "electronics" | "health" = "electronics",
  customerId?: string
): Promise<string> {
  // Check for existing cart ID in localStorage
  const existingCartId = localStorage.getItem(CART_ID_KEY);

  if (existingCartId) {
    // Verify cart still exists and is active
    try {
      const publishableKey = getPublishableKey(storeType);
      const response = await fetch(
        `${MEDUSA_BACKEND_URL}/store/carts/${existingCartId}`,
        {
          headers: {
            "x-publishable-api-key": publishableKey,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Check if cart is not completed
        if (!data.cart?.completed_at) {
          console.log("✅ Found existing active cart:", existingCartId);
          return existingCartId;
        }
      }
    } catch (error) {
      console.warn("⚠️ Error fetching existing cart, will create new one");
    }
  }

  // Create new cart
  return await createMedusaCart(storeType, customerId);
}

/**
 * Get cart from Medusa API
 */
async function getCartFromMedusa(
  cartId: string,
  storeType: "electronics" | "health" = "electronics"
): Promise<CartItem[]> {
  try {
    const publishableKey = getPublishableKey(storeType);
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}`,
      {
        headers: {
          "x-publishable-api-key": publishableKey,
        },
      }
    );

    if (!response.ok) {
      console.warn("⚠️ Could not fetch cart from Medusa");
      return [];
    }

    const data = await response.json();
    const cart = data.cart;

    if (!cart?.items || cart.items.length === 0) {
      return [];
    }

    // Convert Medusa cart items to our CartItem format
    return cart.items.map((item: any) => ({
      product: {
        id: item.variant_id,
        name: item.product_title || item.title,
        price: item.unit_price / 100, // Medusa stores in cents
        image: item.thumbnail || "",
        category: "",
        rating: 5,
        store: "electronics" as const,
        variants: [
          {
            id: item.variant_id,
            title: item.variant_title || "Default",
            prices: [{ amount: item.unit_price, currency_code: "ZAR" }],
          },
        ],
      } as Product,
      quantity: item.quantity,
    }));
  } catch (error) {
    console.error("❌ Error fetching cart from Medusa:", error);
    return [];
  }
}

/**
 * Add item to cart via Medusa API
 */
export async function addItemToCart(
  product: Product,
  quantity: number,
  isLoggedIn: boolean,
  customerId?: string
): Promise<CartItem[]> {
  try {
    const storeType = product.store === "healthcare" ? "health" : "electronics";
    const cartId = await getOrCreateCart(
      storeType,
      isLoggedIn ? customerId : undefined
    );
    const variantId = product.variants?.[0]?.id || product.id;
    const publishableKey = getPublishableKey(storeType);

    console.log("➕ Adding item to cart:", { cartId, variantId, quantity });

    // Add item via Medusa API
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({
          variant_id: variantId,
          quantity,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Error adding item to cart:", error);

      if (error.message && error.message.includes("do not have a price")) {
        throw new Error(
          "This product is not available for purchase at the moment. Please contact support."
        );
      }

      throw new Error(error.message || "Failed to add item to cart");
    }

    console.log("✅ Item added to cart via Medusa API");

    // Get updated cart
    const cartItems = await getCartFromMedusa(cartId, storeType);
    saveLocalCart(cartItems);
    return cartItems;
  } catch (error) {
    console.error("❌ Failed to add item to cart:", error);
    throw error;
  }
}

/**
 * Update item quantity via Medusa API
 */
export async function updateItemQuantity(
  productId: string,
  quantity: number,
  isLoggedIn: boolean,
  customerId?: string
): Promise<CartItem[]> {
  try {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) {
      console.warn("⚠️ No cart ID found");
      return [];
    }

    // Get the line item ID from the cart
    const currentCart = await getCartFromMedusa(cartId);
    const lineItem = currentCart.find((item) => item.product.id === productId);

    if (!lineItem) {
      console.warn("⚠️ Line item not found in cart");
      return currentCart;
    }

    // Determine store type from cart items
    const storeType =
      lineItem.product.store === "healthcare" ? "health" : "electronics";
    const publishableKey = getPublishableKey(storeType);

    // Get full cart to find line item ID
    const cartResponse = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}`,
      {
        headers: {
          "x-publishable-api-key": publishableKey,
        },
      }
    );

    if (!cartResponse.ok) {
      throw new Error("Failed to fetch cart");
    }

    const cartData = await cartResponse.json();
    const medusaLineItem = cartData.cart.items.find(
      (item: any) => item.variant_id === productId
    );

    if (!medusaLineItem) {
      throw new Error("Line item not found");
    }

    // Update quantity via Medusa API
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${medusaLineItem.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({ quantity }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update quantity");
    }

    console.log("✅ Quantity updated");
    const cartItems = await getCartFromMedusa(cartId, storeType);
    saveLocalCart(cartItems);
    return cartItems;
  } catch (error) {
    console.error("❌ Failed to update quantity:", error);

    // Fallback to localStorage
    const localCart = getLocalCart();
    const index = localCart.findIndex((i) => i.product.id === productId);
    if (index >= 0) {
      localCart[index].quantity = quantity;
    }
    saveLocalCart(localCart);
    return localCart;
  }
}

/**
 * Remove item from cart via Medusa API
 */
export async function removeItemFromCart(
  productId: string,
  isLoggedIn: boolean,
  customerId?: string
): Promise<CartItem[]> {
  try {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) {
      const localCart = getLocalCart().filter(
        (i) => i.product.id !== productId
      );
      saveLocalCart(localCart);
      return localCart;
    }

    // Get current cart to find line item
    const currentCart = await getCartFromMedusa(cartId);
    const lineItem = currentCart.find((item) => item.product.id === productId);

    if (!lineItem) {
      return currentCart;
    }

    const storeType =
      lineItem.product.store === "healthcare" ? "health" : "electronics";
    const publishableKey = getPublishableKey(storeType);

    // Get full cart to find line item ID
    const cartResponse = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}`,
      {
        headers: {
          "x-publishable-api-key": publishableKey,
        },
      }
    );

    if (!cartResponse.ok) {
      throw new Error("Failed to fetch cart");
    }

    const cartData = await cartResponse.json();
    const medusaLineItem = cartData.cart.items.find(
      (item: any) => item.variant_id === productId
    );

    if (!medusaLineItem) {
      return currentCart;
    }

    // Delete line item via Medusa API
    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${medusaLineItem.id}`,
      {
        method: "DELETE",
        headers: {
          "x-publishable-api-key": publishableKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove item");
    }

    console.log("✅ Item removed from cart");
    const cartItems = await getCartFromMedusa(cartId, storeType);
    saveLocalCart(cartItems);
    return cartItems;
  } catch (error) {
    console.error("❌ Failed to remove item:", error);

    // Fallback to localStorage
    const localCart = getLocalCart().filter((i) => i.product.id !== productId);
    saveLocalCart(localCart);
    return localCart;
  }
}

/**
 * Sync localStorage cart to Medusa when user logs in
 */
export async function syncLocalCartToMedusa(
  customerId: string
): Promise<CartItem[]> {
  const localCart = getLocalCart();
  if (localCart.length === 0) {
    return [];
  }

  try {
    console.log("🔄 Syncing local cart to Medusa for customer:", customerId);

    // Get or create cart for this customer
    const cartId = await getOrCreateCart("electronics", customerId);
    const publishableKey = getPublishableKey("electronics");

    // Add each local item to Medusa cart
    for (const item of localCart) {
      const variantId = item.product.variants?.[0]?.id || item.product.id;

      try {
        await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": publishableKey,
          },
          body: JSON.stringify({
            variant_id: variantId,
            quantity: item.quantity,
          }),
        });
      } catch (error) {
        console.warn(`⚠️ Could not sync item ${variantId}:`, error);
      }
    }

    // Get synced cart
    const syncedCart = await getCartFromMedusa(cartId);
    saveLocalCart(syncedCart);
    return syncedCart;
  } catch (error) {
    console.error("❌ Error syncing cart:", error);
    return localCart;
  }
}

/**
 * Load cart from Medusa when user is already logged in (page reload)
 */
export async function loadCartFromDatabase(
  customerId: string
): Promise<CartItem[]> {
  try {
    const cartId = localStorage.getItem(CART_ID_KEY);

    if (!cartId) {
      console.log("ℹ️ No cart ID found in localStorage");
      return [];
    }

    // Fetch cart from Medusa
    const cartItems = await getCartFromMedusa(cartId);
    saveLocalCart(cartItems);
    return cartItems;
  } catch (error) {
    console.error("❌ Failed to load cart from database:", error);
    return [];
  }
}

/**
 * Get current cart ID
 */
export function getCartId(): string | null {
  return localStorage.getItem(CART_ID_KEY);
}

/**
 * Clear cart (removes cart ID and items)
 */
export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(CART_ID_KEY);
}

/**
 * Get cart from localStorage
 */
export function getLocalCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save cart to localStorage
 */
function saveLocalCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
}
