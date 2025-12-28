/**
 * Generic DataLoader Implementation
 *
 * Solves N+1 query problem by batching and caching database requests.
 *
 * Example N+1 Problem:
 * ```typescript
 * // BAD: 1 + N queries
 * const members = await db.select().from(members); // 1 query
 * for (const member of members) {
 *   const level = await db.select().from(levels).where(eq(levels.id, member.level_id)); // N queries
 * }
 * ```
 *
 * Solution with DataLoader:
 * ```typescript
 * // GOOD: 1 + 1 queries (batched)
 * const members = await db.select().from(members); // 1 query
 * const levels = await levelLoader.loadMany(members.map(m => m.level_id)); // 1 batched query
 * ```
 */

export interface DataLoaderOptions<K, V> {
  /**
   * Batch loading function that loads multiple keys at once
   */
  batchLoadFn: (keys: readonly K[]) => Promise<(V | Error)[]>;

  /**
   * Maximum batch size (default: 100)
   */
  maxBatchSize?: number;

  /**
   * Enable caching (default: true)
   */
  cache?: boolean;

  /**
   * Cache TTL in milliseconds (default: no expiration)
   */
  cacheTTL?: number;

  /**
   * Custom cache key function (default: JSON.stringify)
   */
  cacheKeyFn?: (key: K) => string;
}

interface CacheEntry<V> {
  value: V | Error;
  expiresAt?: number;
}

/**
 * Generic DataLoader for batching and caching
 */
export class DataLoader<K, V> {
  private batchLoadFn: (keys: readonly K[]) => Promise<(V | Error)[]>;
  private maxBatchSize: number;
  private cache: Map<string, CacheEntry<V>>;
  private cacheEnabled: boolean;
  private cacheTTL?: number;
  private cacheKeyFn: (key: K) => string;

  // Batching state
  private queue: Array<{
    key: K;
    resolve: (value: V) => void;
    reject: (error: Error) => void;
  }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(options: DataLoaderOptions<K, V>) {
    this.batchLoadFn = options.batchLoadFn;
    this.maxBatchSize = options.maxBatchSize ?? 100;
    this.cacheEnabled = options.cache ?? true;
    this.cacheTTL = options.cacheTTL;
    this.cacheKeyFn = options.cacheKeyFn ?? ((key: K) => JSON.stringify(key));
    this.cache = new Map();
  }

  /**
   * Load a single value by key
   */
  async load(key: K): Promise<V> {
    // Check cache first
    if (this.cacheEnabled) {
      const cacheKey = this.cacheKeyFn(key);
      const cached = this.cache.get(cacheKey);

      if (cached) {
        // Check if cache entry is expired
        if (!cached.expiresAt || cached.expiresAt > Date.now()) {
          if (cached.value instanceof Error) {
            throw cached.value;
          }
          return cached.value;
        } else {
          // Remove expired entry
          this.cache.delete(cacheKey);
        }
      }
    }

    // Add to batch queue
    return new Promise<V>((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      // Schedule batch execution
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.executeBatch(), 0);
      }

      // Execute immediately if batch is full
      if (this.queue.length >= this.maxBatchSize) {
        clearTimeout(this.batchTimeout);
        this.batchTimeout = null;
        this.executeBatch();
      }
    });
  }

  /**
   * Load multiple values by keys
   */
  async loadMany(keys: readonly K[]): Promise<(V | Error)[]> {
    return Promise.all(
      keys.map(key =>
        this.load(key).catch(error => error)
      )
    );
  }

  /**
   * Execute batched load
   */
  private async executeBatch(): Promise<void> {
    const batch = this.queue.splice(0, this.maxBatchSize);
    if (batch.length === 0) return;

    const keys = batch.map(item => item.key);

    try {
      const results = await this.batchLoadFn(keys);

      // Validate results length
      if (results.length !== keys.length) {
        throw new Error(
          `DataLoader batch function returned ${results.length} results for ${keys.length} keys. ` +
          'The batch function must return the same number of results as keys.'
        );
      }

      // Process results
      results.forEach((result, index) => {
        const { key, resolve, reject } = batch[index];
        const cacheKey = this.cacheKeyFn(key);

        // Cache the result
        if (this.cacheEnabled) {
          const expiresAt = this.cacheTTL
            ? Date.now() + this.cacheTTL
            : undefined;

          this.cache.set(cacheKey, { value: result, expiresAt });
        }

        // Resolve or reject the promise
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      });
    } catch (error) {
      // Reject all promises in batch
      batch.forEach(({ reject }) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    }

    // Continue with next batch if queue is not empty
    if (this.queue.length > 0) {
      this.batchTimeout = setTimeout(() => this.executeBatch(), 0);
    }
  }

  /**
   * Clear all cached values
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Clear a specific cached value
   */
  clear(key: K): void {
    const cacheKey = this.cacheKeyFn(key);
    this.cache.delete(cacheKey);
  }

  /**
   * Prime the cache with a known value
   */
  prime(key: K, value: V): void {
    if (!this.cacheEnabled) return;

    const cacheKey = this.cacheKeyFn(key);
    const expiresAt = this.cacheTTL
      ? Date.now() + this.cacheTTL
      : undefined;

    this.cache.set(cacheKey, { value, expiresAt });
  }
}

/**
 * Create a DataLoader for database queries
 *
 * @example
 * ```typescript
 * const membershipLevelLoader = createDataLoader(async (ids: string[]) => {
 *   const levels = await db
 *     .select()
 *     .from(membershipLevels)
 *     .where(inArray(membershipLevels.id, ids));
 *
 *   // Return results in same order as input keys
 *   return ids.map(id =>
 *     levels.find(level => level.id === id) ?? new Error(`Level ${id} not found`)
 *   );
 * });
 *
 * // Usage
 * const level = await membershipLevelLoader.load('premium-id');
 * const levels = await membershipLevelLoader.loadMany(['basic-id', 'premium-id']);
 * ```
 */
export function createDataLoader<K, V>(
  batchLoadFn: (keys: readonly K[]) => Promise<(V | Error)[]>,
  options?: Partial<DataLoaderOptions<K, V>>
): DataLoader<K, V> {
  return new DataLoader({
    batchLoadFn,
    ...options,
  });
}

/**
 * Utility: Create a simple ID-based DataLoader for database tables
 *
 * @example
 * ```typescript
 * const levelLoader = createIdLoader(async (ids: string[]) => {
 *   return db.select().from(membershipLevels).where(inArray(membershipLevels.id, ids));
 * });
 * ```
 */
export function createIdLoader<T extends { id: string }>(
  fetchFn: (ids: readonly string[]) => Promise<T[]>,
  options?: Partial<DataLoaderOptions<string, T>>
): DataLoader<string, T> {
  return createDataLoader(
    async (ids: readonly string[]) => {
      const items = await fetchFn(ids);
      const itemMap = new Map(items.map(item => [item.id, item]));

      return ids.map(id =>
        itemMap.get(id) ?? new Error(`Item with id ${id} not found`)
      );
    },
    options
  );
}

/**
 * Performance monitoring for DataLoader
 */
export class DataLoaderStats {
  private loaders = new Map<string, {
    loadCount: number;
    batchCount: number;
    cacheHits: number;
    cacheMisses: number;
    totalLoadTime: number;
  }>();

  recordLoad(loaderName: string, cached: boolean, duration: number): void {
    if (!this.loaders.has(loaderName)) {
      this.loaders.set(loaderName, {
        loadCount: 0,
        batchCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        totalLoadTime: 0,
      });
    }

    const stats = this.loaders.get(loaderName)!;
    stats.loadCount++;
    stats.totalLoadTime += duration;

    if (cached) {
      stats.cacheHits++;
    } else {
      stats.cacheMisses++;
    }
  }

  recordBatch(loaderName: string): void {
    const stats = this.loaders.get(loaderName);
    if (stats) {
      stats.batchCount++;
    }
  }

  getStats(loaderName: string) {
    return this.loaders.get(loaderName);
  }

  getAllStats() {
    return Object.fromEntries(this.loaders);
  }

  reset(): void {
    this.loaders.clear();
  }
}

export const globalDataLoaderStats = new DataLoaderStats();
