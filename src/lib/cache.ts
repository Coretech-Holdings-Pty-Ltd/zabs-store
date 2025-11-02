/**
 * High-Performance Product Cache
 * Implements in-memory caching with TTL and LRU eviction
 * Similar to Redis but client-side
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ProductCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set item in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // LRU eviction: Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Get item from cache, returns null if expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    Array.from(this.cache.keys())
      .filter(key => regex.test(key))
      .forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const productCache = new ProductCache(100, 10 * 60 * 1000); // 10 minutes TTL

/**
 * Cache keys constants
 */
export const CACHE_KEYS = {
  HEALTH_PRODUCTS: 'products:health',
  ELECTRONICS_PRODUCTS: 'products:electronics',
  PRODUCT_DETAIL: (id: string) => `product:${id}`,
  SEARCH_RESULTS: (query: string) => `search:${query.toLowerCase()}`,
  ALL_PRODUCTS: 'products:all',
} as const;

/**
 * Higher-order function to add caching to any async function
 */
export function withCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): () => Promise<T> {
  return async () => {
    // Try cache first
    const cached = productCache.get<T>(cacheKey);
    if (cached !== null) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return cached;
    }

    console.log(`❌ Cache MISS: ${cacheKey}, fetching...`);
    
    // Fetch and cache
    const data = await fetchFn();
    productCache.set(cacheKey, data, ttl);
    
    return data;
  };
}

/**
 * Preload cache in background
 */
export function preloadCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): void {
  // Don't block, fetch in background
  setTimeout(async () => {
    if (!productCache.has(cacheKey)) {
      try {
        const data = await fetchFn();
        productCache.set(cacheKey, data, ttl);
        console.log(`🚀 Preloaded cache: ${cacheKey}`);
      } catch (error) {
        console.error(`Failed to preload cache: ${cacheKey}`, error);
      }
    }
  }, 0);
}
