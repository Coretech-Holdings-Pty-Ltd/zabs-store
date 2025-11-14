/**
 * Order Service - Handles order creation via Medusa v2 API
 *
 * This service uses the Medusa backend to properly create orders,
 * ensuring proper email notifications, inventory updates, and order tracking.
 */

import {
  MEDUSA_BACKEND_URL,
  ELECTRONICS_STORE_KEY,
  HEALTH_STORE_KEY,
} from "./config";
import { getCartId, clearCart } from "./cart-service";

export interface CreateOrderRequest {
  email: string;
  shippingAddress?: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    province: string;
    postal_code: string;
    country_code: string;
    phone: string;
  };
  paymentMethod: "payfast" | "ozow" | "manual"; // manual = pay at store
}

export interface OrderResponse {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Get publishable key for a cart's sales channel
 */
function getPublishableKey(
  storeType: "electronics" | "health" = "electronics"
): string {
  return storeType === "electronics" ? ELECTRONICS_STORE_KEY : HEALTH_STORE_KEY;
}

/**
 * Complete cart and create order in Medusa v2
 * This uses Medusa's cart completion flow which:
 * - Creates the order
 * - Sends email notifications
 * - Updates inventory
 * - Marks cart as completed
 */
export async function completeCart(
  request: CreateOrderRequest
): Promise<OrderResponse> {
  try {
    const cartId = getCartId();

    if (!cartId) {
      return {
        success: false,
        error: "No active cart found",
      };
    }

    console.log("📦 Completing cart:", cartId);

    // Use electronics key as default - Medusa will handle the cart's actual channel
    const publishableKey = getPublishableKey("electronics");

    // Step 1: Update cart with customer email and shipping address
    const updateResponse = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({
          email: request.email,
          ...(request.shippingAddress && {
            shipping_address: {
              first_name: request.shippingAddress.first_name,
              last_name: request.shippingAddress.last_name,
              address_1: request.shippingAddress.address_1,
              city: request.shippingAddress.city,
              province: request.shippingAddress.province,
              postal_code: request.shippingAddress.postal_code,
              country_code: request.shippingAddress.country_code || "ZA",
              phone: request.shippingAddress.phone,
            },
            billing_address: {
              first_name: request.shippingAddress.first_name,
              last_name: request.shippingAddress.last_name,
              address_1: request.shippingAddress.address_1,
              city: request.shippingAddress.city,
              province: request.shippingAddress.province,
              postal_code: request.shippingAddress.postal_code,
              country_code: request.shippingAddress.country_code || "ZA",
              phone: request.shippingAddress.phone,
            },
          }),
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error("❌ Failed to update cart:", error);
      return {
        success: false,
        error: error.message || "Failed to update cart information",
      };
    }

    console.log("✅ Cart updated with customer information");

    // Step 2: Add payment session (for manual/COD payment)
    // In Medusa v2, we need to initialize a payment session before completing
    const paymentResponse = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}/payment-collections`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
      }
    );

    if (!paymentResponse.ok) {
      console.warn("⚠️ Could not create payment collection, continuing anyway");
    }

    // Step 3: Complete the cart to create an order
    const completeResponse = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cartId}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
      }
    );

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      console.error("❌ Cart completion failed:", error);
      return {
        success: false,
        error: error.message || "Failed to complete order",
      };
    }

    const data = await completeResponse.json();
    const order = data.order;

    if (!order?.id) {
      return {
        success: false,
        error: "Order was not created properly",
      };
    }

    console.log("✅ Order created:", order.id);

    // Clear local cart after successful order
    clearCart();

    return {
      success: true,
      orderId: order.id,
    };
  } catch (error) {
    console.error("❌ Error completing cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get order details by ID
 */
export async function getOrder(orderId: string) {
  try {
    const publishableKey = getPublishableKey("electronics");

    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/store/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }

    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return null;
  }
}
