// Medusa Product Types
export interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  thumbnail: string | null;
  images?: Array<{ url: string; id: string }>;
  variants?: MedusaProductVariant[];
  categories?: Array<{ id: string; name: string }>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MedusaProductVariant {
  id: string;
  title: string;
  product_id: string;
  sku: string | null;
  prices: MedusaPrice[];
  inventory_quantity?: number;
  options?: Array<{ value: string; option_id: string }>;
  metadata?: Record<string, any>;
}

export interface MedusaPrice {
  id: string;
  amount: number;
  currency_code: string;
  variant_id: string;
}

export interface MedusaRegion {
  id: string;
  name: string;
  currency_code: string;
  countries: Array<{ id: string; name: string; iso_2: string }>;
}

export interface MedusaCart {
  id: string;
  region_id: string;
  items: MedusaCartItem[];
  total: number;
  subtotal: number;
  tax_total: number;
}

export interface MedusaCartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  product_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total: number;
  thumbnail: string | null;
}

// Frontend Product Type (compatible with existing UI)
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  store: 'healthcare' | 'electronics';
  description?: string;
  handle?: string;
  variants?: MedusaProductVariant[];
  inventory?: number;
}

// Store Type
export type StoreType = 'electronics' | 'health';

// Convert Medusa product to frontend product format
export function convertMedusaProduct(
  medusaProduct: MedusaProduct,
  store: StoreType
): Product {
  // Get the default variant (first variant or cheapest)
  const defaultVariant = medusaProduct.variants?.[0];
  
  // Debug: Log the product structure to see price format
  if (!defaultVariant?.prices || defaultVariant.prices.length === 0) {
    console.warn(`No prices found for product: ${medusaProduct.title}`, medusaProduct);
  }
  
  // Get price - try ZAR first, then fall back to any available currency
  let price = 0;
  
  if (defaultVariant?.prices) {
    // Look for ZAR price first
    let priceData = defaultVariant.prices.find(
      (p: any) => p.currency_code === 'zar' || p.currency_code === 'ZAR'
    );
    
    // If no ZAR, use any available currency
    if (!priceData && defaultVariant.prices.length > 0) {
      priceData = defaultVariant.prices[0];
    }
    
    if (priceData) {
      // Use price as-is (whatever you enter in admin shows on frontend)
      price = priceData.amount || 0;
    }
  }
  
  // If still no price, check if there's a calculated_price (Medusa v2)
  if (price === 0 && (defaultVariant as any)?.calculated_price) {
    price = (defaultVariant as any).calculated_price.calculated_amount;
  }

  // Get category name
  const category = medusaProduct.categories?.[0]?.name || 'Uncategorized';

  // Get image URL
  const image = medusaProduct.thumbnail || medusaProduct.images?.[0]?.url || '/placeholder.png';

  // Get rating from metadata or default to 4.5
  const rating = (medusaProduct.metadata?.rating as number) || 4.5;

  // Get inventory
  const inventory = defaultVariant?.inventory_quantity || 0;

  return {
    id: medusaProduct.id,
    name: medusaProduct.title,
    price,
    image,
    category,
    rating,
    store: store === 'electronics' ? 'electronics' : 'healthcare',
    description: medusaProduct.description || undefined,
    handle: medusaProduct.handle,
    variants: medusaProduct.variants,
    inventory,
  };
}
