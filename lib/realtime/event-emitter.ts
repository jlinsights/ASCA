/**
 * Event Emitter System
 *
 * Core event broadcasting system for real-time updates.
 * Supports both in-memory and Redis-based event distribution.
 *
 * Features:
 * - Type-safe event definitions
 * - Wildcard subscriptions
 * - Event filtering
 * - Redis pub/sub support (optional)
 * - Memory leak prevention
 *
 * @module lib/realtime/event-emitter
 */

import { EventEmitter as NodeEventEmitter } from 'events'
import { error as logError } from '@/lib/logging'
// import type { Redis } from 'ioredis';
type Redis = any

/**
 * Event types for the application
 */
export enum EventType {
  // Member events
  MEMBER_CREATED = 'member:created',
  MEMBER_UPDATED = 'member:updated',
  MEMBER_DELETED = 'member:deleted',
  MEMBER_APPROVED = 'member:approved',
  MEMBER_REJECTED = 'member:rejected',

  // Artist events
  ARTIST_CREATED = 'artist:created',
  ARTIST_UPDATED = 'artist:updated',
  ARTIST_APPROVED = 'artist:approved',

  // Artwork events
  ARTWORK_CREATED = 'artwork:created',
  ARTWORK_UPDATED = 'artwork:updated',
  ARTWORK_APPROVED = 'artwork:approved',
  ARTWORK_REJECTED = 'artwork:rejected',

  // Exhibition events
  EXHIBITION_CREATED = 'exhibition:created',
  EXHIBITION_UPDATED = 'exhibition:updated',
  EXHIBITION_PUBLISHED = 'exhibition:published',
  EXHIBITION_CANCELLED = 'exhibition:cancelled',

  // Event events
  EVENT_CREATED = 'event:created',
  EVENT_UPDATED = 'event:updated',
  EVENT_PUBLISHED = 'event:published',
  EVENT_CANCELLED = 'event:cancelled',

  // System events
  SYSTEM_ERROR = 'system:error',
  SYSTEM_WARNING = 'system:warning',
  CACHE_CLEARED = 'cache:cleared',
}

/**
 * Event payload interface
 */
export interface EventPayload<T = any> {
  type: EventType
  data: T
  timestamp: Date
  userId?: string
  metadata?: Record<string, any>
}

/**
 * Event listener callback
 */
export type EventListener<T = any> = (payload: EventPayload<T>) => void | Promise<void>

/**
 * Subscription object
 */
export interface Subscription {
  id: string
  unsubscribe: () => void
}

/**
 * Event filter function
 */
export type EventFilter<T = any> = (payload: EventPayload<T>) => boolean

/**
 * Event emitter options
 */
export interface EventEmitterOptions {
  redis?: Redis
  redisChannel?: string
  maxListeners?: number
}

/**
 * Application Event Emitter
 *
 * Centralized event system with Redis support for distributed environments.
 */
export class AppEventEmitter {
  private emitter: NodeEventEmitter
  private redis?: Redis
  private redisChannel: string
  private subscriptions: Map<string, Set<EventListener>>
  private subscriptionCounter: number

  constructor(options: EventEmitterOptions = {}) {
    this.emitter = new NodeEventEmitter()
    this.redis = options.redis
    this.redisChannel = options.redisChannel || 'asca:events'
    this.subscriptions = new Map()
    this.subscriptionCounter = 0

    // Set max listeners to prevent memory leak warnings
    this.emitter.setMaxListeners(options.maxListeners || 100)

    // Setup Redis subscriber if Redis is available
    if (this.redis) {
      this.setupRedisSubscriber()
    }
  }

  /**
   * Setup Redis subscriber for distributed events
   */
  private setupRedisSubscriber(): void {
    if (!this.redis) return

    const subscriber = this.redis.duplicate()

    subscriber.subscribe(this.redisChannel, (err: any) => {
      if (err) {
        logError('Failed to subscribe to Redis channel', err instanceof Error ? err : undefined)
      }
    })

    subscriber.on('message', (channel: any, message: any) => {
      if (channel === this.redisChannel) {
        try {
          const payload: EventPayload = JSON.parse(message)
          // Emit to local listeners without re-publishing to Redis
          this.emitLocal(payload)
        } catch (error) {
          logError('Failed to parse Redis message', error instanceof Error ? error : undefined)
        }
      }
    })
  }

  /**
   * Emit an event
   *
   * @param type - Event type
   * @param data - Event data
   * @param metadata - Optional metadata
   */
  async emit<T = any>(
    type: EventType,
    data: T,
    metadata?: { userId?: string; [key: string]: any }
  ): Promise<void> {
    const payload: EventPayload<T> = {
      type,
      data,
      timestamp: new Date(),
      userId: metadata?.userId,
      metadata,
    }

    // Publish to Redis if available
    if (this.redis) {
      try {
        await this.redis.publish(this.redisChannel, JSON.stringify(payload))
      } catch (error) {
        logError('Failed to publish event to Redis', error instanceof Error ? error : undefined)
        // Fallback to local emit
        this.emitLocal(payload)
      }
    } else {
      // Local emit only
      this.emitLocal(payload)
    }
  }

  /**
   * Emit event locally (without Redis)
   *
   * @param payload - Event payload
   */
  private emitLocal<T = any>(payload: EventPayload<T>): void {
    // Emit to specific event listeners
    this.emitter.emit(payload.type, payload)

    // Emit to wildcard listeners (e.g., 'member:*')
    const category = this.getEventCategory(payload.type)
    if (category) {
      this.emitter.emit(`${category}:*`, payload)
    }

    // Emit to all listeners
    this.emitter.emit('*', payload)
  }

  /**
   * Subscribe to an event
   *
   * @param type - Event type or wildcard (e.g., 'member:*', '*')
   * @param listener - Event listener callback
   * @param filter - Optional filter function
   * @returns Subscription object
   */
  on<T = any>(
    type: EventType | string,
    listener: EventListener<T>,
    filter?: EventFilter<T>
  ): Subscription {
    const subscriptionId = `sub_${++this.subscriptionCounter}`

    // Wrap listener with filter if provided
    const wrappedListener: EventListener<T> = async payload => {
      if (filter && !filter(payload)) {
        return
      }
      await listener(payload)
    }

    // Store subscription
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Set())
    }
    this.subscriptions.get(type)!.add(wrappedListener)

    // Add listener to EventEmitter
    this.emitter.on(type, wrappedListener)

    return {
      id: subscriptionId,
      unsubscribe: () => {
        this.off(type, wrappedListener)
      },
    }
  }

  /**
   * Subscribe to an event (fires only once)
   *
   * @param type - Event type
   * @param listener - Event listener callback
   * @returns Subscription object
   */
  once<T = any>(type: EventType | string, listener: EventListener<T>): Subscription {
    const subscriptionId = `sub_${++this.subscriptionCounter}`

    const wrappedListener: EventListener<T> = async payload => {
      await listener(payload)
      this.off(type, wrappedListener)
    }

    this.emitter.once(type, wrappedListener)

    return {
      id: subscriptionId,
      unsubscribe: () => {
        this.off(type, wrappedListener)
      },
    }
  }

  /**
   * Unsubscribe from an event
   *
   * @param type - Event type
   * @param listener - Event listener to remove
   */
  off<T = any>(type: EventType | string, listener: EventListener<T>): void {
    this.emitter.off(type, listener)

    const listeners = this.subscriptions.get(type)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.subscriptions.delete(type)
      }
    }
  }

  /**
   * Remove all listeners for an event type
   *
   * @param type - Event type (optional, removes all if not provided)
   */
  removeAllListeners(type?: EventType | string): void {
    if (type) {
      this.emitter.removeAllListeners(type)
      this.subscriptions.delete(type)
    } else {
      this.emitter.removeAllListeners()
      this.subscriptions.clear()
    }
  }

  /**
   * Get event category from event type
   *
   * @param type - Event type
   * @returns Event category (e.g., 'member' from 'member:created')
   */
  private getEventCategory(type: EventType | string): string | null {
    const parts = type.split(':')
    return parts.length > 1 ? (parts[0] ?? null) : null
  }

  /**
   * Get listener count for an event type
   *
   * @param type - Event type
   * @returns Number of listeners
   */
  listenerCount(type: EventType | string): number {
    return this.emitter.listenerCount(type)
  }

  /**
   * Get all event types with active listeners
   *
   * @returns Array of event types
   */
  eventNames(): Array<EventType | string> {
    return this.emitter.eventNames() as Array<EventType | string>
  }

  /**
   * Wait for an event
   *
   * @param type - Event type
   * @param timeout - Optional timeout in milliseconds
   * @returns Promise that resolves with event payload
   */
  async waitFor<T = any>(type: EventType | string, timeout?: number): Promise<EventPayload<T>> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const listener: EventListener<T> = payload => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        resolve(payload)
      }

      this.once(type, listener)

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(type, listener)
          reject(new Error(`Timeout waiting for event: ${type}`))
        }, timeout)
      }
    })
  }

  /**
   * Shutdown event emitter and cleanup resources
   */
  async shutdown(): Promise<void> {
    this.removeAllListeners()

    if (this.redis) {
      try {
        await this.redis.quit()
      } catch (error) {
        logError('Failed to quit Redis connection', error instanceof Error ? error : undefined)
      }
    }
  }
}

/**
 * Global event emitter instance (singleton)
 */
let globalEventEmitter: AppEventEmitter | null = null

/**
 * Get or create global event emitter instance
 *
 * @param options - Event emitter options
 * @returns Global event emitter instance
 */
export function getEventEmitter(options?: EventEmitterOptions): AppEventEmitter {
  if (!globalEventEmitter) {
    globalEventEmitter = new AppEventEmitter(options)
  }
  return globalEventEmitter
}

/**
 * Create a new event emitter instance
 *
 * @param options - Event emitter options
 * @returns New event emitter instance
 */
export function createEventEmitter(options?: EventEmitterOptions): AppEventEmitter {
  return new AppEventEmitter(options)
}

/**
 * Helper: Create event payload
 *
 * @param type - Event type
 * @param data - Event data
 * @param metadata - Optional metadata
 * @returns Event payload
 */
export function createEventPayload<T = any>(
  type: EventType,
  data: T,
  metadata?: { userId?: string; [key: string]: any }
): EventPayload<T> {
  return {
    type,
    data,
    timestamp: new Date(),
    userId: metadata?.userId,
    metadata,
  }
}
