import { Redis } from '@upstash/redis'
import { env, isRedisConfigured, isDevelopment } from '@/lib/config/env'
import { info, warn, error as logError } from '@/lib/logging'

/**
 * Cache options
 */
export interface CacheOptions {
  /**
   * Time to live in seconds
   */
  ttl?: number

  /**
   * Cache key prefix
   */
  prefix?: string

  /**
   * Cache tags for invalidation
   */
  tags?: string[]
}

/**
 * Cache result type
 */
export type CacheResult<T> =
  | { hit: true; data: T; source: 'redis' | 'memory' }
  | { hit: false; data: null; source: null }

/**
 * Redis client instance
 * Only initialized if Redis is configured
 */
const redis = isRedisConfigured
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

/**
 * In-memory cache fallback
 * Used when Redis is not configured
 */
class InMemoryCache {
  private cache: Map<string, { data: any; expiresAt: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const expiresAt = Date.now() + ttl * 1000
    this.cache.set(key, { data: value, expiresAt })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))

    if (keysToDelete.length > 0 && isDevelopment) {
      info(`[Cache] Cleaned up ${keysToDelete.length} expired entries`)
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.cache.clear()
  }
}

// Create in-memory fallback cache
const memoryCache = new InMemoryCache()

/**
 * Cache Manager
 * Provides a unified interface for caching with Redis or in-memory fallback
 */
export class CacheManager {
  private prefix: string

  constructor(prefix: string = 'app') {
    this.prefix = prefix
  }

  /**
   * Generate cache key with prefix
   */
  private key(key: string, options?: CacheOptions): string {
    const prefix = options?.prefix || this.prefix
    return `${prefix}:${key}`
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<CacheResult<T>> {
    const cacheKey = this.key(key, options)

    try {
      if (redis) {
        const data = await redis.get<T>(cacheKey)
        if (data !== null) {
          return { hit: true, data, source: 'redis' }
        }
      } else {
        const data = await memoryCache.get<T>(cacheKey)
        if (data !== null) {
          return { hit: true, data, source: 'memory' }
        }
      }
    } catch (err) {
      logError('[Cache] Get error', err instanceof Error ? err : undefined)
    }

    return { hit: false, data: null, source: null }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const cacheKey = this.key(key, options)
    const ttl = options?.ttl || 300 // Default 5 minutes

    try {
      if (redis) {
        await redis.setex(cacheKey, ttl, value)

        // Store tags for invalidation
        if (options?.tags) {
          for (const tag of options.tags) {
            const tagKey = `tag:${tag}`
            await redis.sadd(tagKey, cacheKey)
            await redis.expire(tagKey, ttl)
          }
        }
      } else {
        await memoryCache.set(cacheKey, value, ttl)
      }
    } catch (err) {
      logError('[Cache] Set error', err instanceof Error ? err : undefined)
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<void> {
    const cacheKey = this.key(key, options)

    try {
      if (redis) {
        await redis.del(cacheKey)
      } else {
        await memoryCache.delete(cacheKey)
      }
    } catch (err) {
      logError('[Cache] Delete error', err instanceof Error ? err : undefined)
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern: string, options?: CacheOptions): Promise<void> {
    const cachePattern = this.key(pattern, options)

    try {
      if (redis) {
        const keys = await redis.keys(cachePattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } else {
        await memoryCache.deletePattern(cachePattern)
      }
    } catch (err) {
      logError('[Cache] Delete pattern error', err instanceof Error ? err : undefined)
    }
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateTag(tag: string): Promise<void> {
    const tagKey = `tag:${tag}`

    try {
      if (redis) {
        const keys = await redis.smembers<string[]>(tagKey)
        if (keys.length > 0) {
          await redis.del(...keys)
          await redis.del(tagKey)
        }
      } else {
        // Tags not supported in memory cache
        warn('[Cache] Tag invalidation not supported in memory cache')
      }
    } catch (err) {
      logError('[Cache] Invalidate tag error', err instanceof Error ? err : undefined)
    }
  }

  /**
   * Cache a function result
   */
  async cached<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options)

    if (cached.hit) {
      if (isDevelopment) {
        info(`[Cache] Hit: ${key} (${cached.source})`)
      }
      return cached.data
    }

    // Cache miss - fetch data
    if (isDevelopment) {
      info(`[Cache] Miss: ${key}`)
    }

    const data = await fetcher()

    // Store in cache
    await this.set(key, data, options)

    return data
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (redis) {
        const keys = await redis.keys(`${this.prefix}:*`)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } else {
        await memoryCache.clear()
      }
    } catch (err) {
      logError('[Cache] Clear error', err instanceof Error ? err : undefined)
    }
  }

  /**
   * Check if Redis is available
   */
  isRedisAvailable(): boolean {
    return redis !== null
  }
}

/**
 * Default cache instance
 */
export const cache = new CacheManager('asca')

/**
 * Create a cache instance with custom prefix
 */
export function createCache(prefix: string): CacheManager {
  return new CacheManager(prefix)
}

/**
 * Cache decorator for methods
 * Use this to cache method results automatically
 */
export function Cached(options?: CacheOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`

      return await cache.cached(cacheKey, () => originalMethod.apply(this, args), options)
    }

    return descriptor
  }
}

/**
 * Helper: Cache API response
 */
export async function cacheApiResponse<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  return await cache.cached(key, fetcher, { ttl })
}

/**
 * Helper: Invalidate API cache
 */
export async function invalidateApiCache(pattern: string): Promise<void> {
  await cache.deletePattern(pattern)
}
