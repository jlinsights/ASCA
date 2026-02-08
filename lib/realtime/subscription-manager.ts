/**
 * Subscription Manager
 *
 * Manages client subscriptions for real-time events.
 * Supports both WebSocket and SSE connections.
 *
 * Features:
 * - Client subscription tracking
 * - Event filtering per client
 * - Connection lifecycle management
 * - Memory leak prevention
 *
 * @module lib/realtime/subscription-manager
 */

import type { EventType, EventPayload } from './event-emitter';

/**
 * Client connection type
 */
export enum ConnectionType {
  WEBSOCKET = 'websocket',
  SSE = 'sse',
}

/**
 * Client subscription info
 */
export interface ClientSubscription {
  clientId: string;
  connectionType: ConnectionType;
  eventTypes: Set<EventType | string>;
  userId?: string;
  metadata?: Record<string, any>;
  connectedAt: Date;
  lastActivityAt: Date;
}

/**
 * Subscription filter
 */
export interface SubscriptionFilter {
  eventTypes?: Array<EventType | string>;
  userId?: string;
  customFilter?: (payload: EventPayload) => boolean;
}

/**
 * Subscription Manager
 *
 * Manages client subscriptions and event routing.
 */
export class SubscriptionManager {
  private subscriptions: Map<string, ClientSubscription>;
  private eventTypeIndex: Map<EventType | string, Set<string>>;
  private userIdIndex: Map<string, Set<string>>;

  constructor() {
    this.subscriptions = new Map();
    this.eventTypeIndex = new Map();
    this.userIdIndex = new Map();
  }

  /**
   * Subscribe a client to events
   *
   * @param clientId - Unique client identifier
   * @param connectionType - Connection type (WebSocket or SSE)
   * @param filter - Subscription filter
   * @returns Client subscription
   */
  subscribe(
    clientId: string,
    connectionType: ConnectionType,
    filter?: SubscriptionFilter
  ): ClientSubscription {
    // Remove existing subscription if any
    this.unsubscribe(clientId);

    const now = new Date();
    const eventTypes = new Set(filter?.eventTypes || ['*']);

    const subscription: ClientSubscription = {
      clientId,
      connectionType,
      eventTypes,
      userId: filter?.userId,
      metadata: {},
      connectedAt: now,
      lastActivityAt: now,
    };

    // Store subscription
    this.subscriptions.set(clientId, subscription);

    // Index by event types
    for (const eventType of eventTypes) {
      if (!this.eventTypeIndex.has(eventType)) {
        this.eventTypeIndex.set(eventType, new Set());
      }
      this.eventTypeIndex.get(eventType)!.add(clientId);
    }

    // Index by user ID
    if (filter?.userId) {
      if (!this.userIdIndex.has(filter.userId)) {
        this.userIdIndex.set(filter.userId, new Set());
      }
      this.userIdIndex.get(filter.userId)!.add(clientId);
    }

    return subscription;
  }

  /**
   * Unsubscribe a client
   *
   * @param clientId - Client identifier
   */
  unsubscribe(clientId: string): void {
    const subscription = this.subscriptions.get(clientId);
    if (!subscription) return;

    // Remove from event type index
    for (const eventType of subscription.eventTypes) {
      const clients = this.eventTypeIndex.get(eventType);
      if (clients) {
        clients.delete(clientId);
        if (clients.size === 0) {
          this.eventTypeIndex.delete(eventType);
        }
      }
    }

    // Remove from user ID index
    if (subscription.userId) {
      const clients = this.userIdIndex.get(subscription.userId);
      if (clients) {
        clients.delete(clientId);
        if (clients.size === 0) {
          this.userIdIndex.delete(subscription.userId);
        }
      }
    }

    // Remove subscription
    this.subscriptions.delete(clientId);
  }

  /**
   * Update client's last activity timestamp
   *
   * @param clientId - Client identifier
   */
  updateActivity(clientId: string): void {
    const subscription = this.subscriptions.get(clientId);
    if (subscription) {
      subscription.lastActivityAt = new Date();
    }
  }

  /**
   * Get subscription by client ID
   *
   * @param clientId - Client identifier
   * @returns Client subscription or undefined
   */
  getSubscription(clientId: string): ClientSubscription | undefined {
    return this.subscriptions.get(clientId);
  }

  /**
   * Get all subscriptions
   *
   * @returns Array of client subscriptions
   */
  getAllSubscriptions(): ClientSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get clients subscribed to a specific event type
   *
   * @param eventType - Event type
   * @returns Set of client IDs
   */
  getClientsByEventType(eventType: EventType | string): Set<string> {
    // Direct match
    const directMatch = this.eventTypeIndex.get(eventType) || new Set<string>();

    // Wildcard match (e.g., 'member:*' matches 'member:created')
    const category = this.getEventCategory(eventType);
    const wildcardMatch = category
      ? this.eventTypeIndex.get(`${category}:*`) || new Set<string>()
      : new Set<string>();

    // All events wildcard
    const allMatch = this.eventTypeIndex.get('*') || new Set<string>();

    // Combine all matches
    return new Set([...directMatch, ...wildcardMatch, ...allMatch]);
  }

  /**
   * Get clients by user ID
   *
   * @param userId - User identifier
   * @returns Set of client IDs
   */
  getClientsByUserId(userId: string): Set<string> {
    return this.userIdIndex.get(userId) || new Set<string>();
  }

  /**
   * Check if a client should receive an event
   *
   * @param clientId - Client identifier
   * @param payload - Event payload
   * @returns True if client should receive event
   */
  shouldReceiveEvent(clientId: string, payload: EventPayload): boolean {
    const subscription = this.subscriptions.get(clientId);
    if (!subscription) return false;

    // Check if subscribed to this event type
    const subscribedClients = this.getClientsByEventType(payload.type);
    if (!subscribedClients.has(clientId)) {
      return false;
    }

    // Check user ID filter (if specified)
    if (subscription.userId && payload.userId !== subscription.userId) {
      return false;
    }

    return true;
  }

  /**
   * Get active client count
   *
   * @returns Number of active clients
   */
  getActiveCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get active clients by connection type
   *
   * @param connectionType - Connection type
   * @returns Array of client subscriptions
   */
  getByConnectionType(connectionType: ConnectionType): ClientSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.connectionType === connectionType
    );
  }

  /**
   * Remove stale subscriptions
   *
   * @param maxIdleTime - Maximum idle time in milliseconds
   * @returns Number of removed subscriptions
   */
  removeStaleSubscriptions(maxIdleTime: number): number {
    const now = Date.now();
    const staleClients: string[] = [];

    for (const [clientId, subscription] of this.subscriptions) {
      const idleTime = now - subscription.lastActivityAt.getTime();
      if (idleTime > maxIdleTime) {
        staleClients.push(clientId);
      }
    }

    for (const clientId of staleClients) {
      this.unsubscribe(clientId);
    }

    return staleClients.length;
  }

  /**
   * Get subscription statistics
   *
   * @returns Subscription statistics
   */
  getStats(): {
    total: number;
    byConnectionType: Record<ConnectionType, number>;
    byEventType: Record<string, number>;
    avgIdleTime: number;
  } {
    const byConnectionType = {
      [ConnectionType.WEBSOCKET]: 0,
      [ConnectionType.SSE]: 0,
    };

    const byEventType: Record<string, number> = {};
    let totalIdleTime = 0;
    const now = Date.now();

    for (const subscription of this.subscriptions.values()) {
      // Count by connection type
      byConnectionType[subscription.connectionType]++;

      // Count by event types
      for (const eventType of subscription.eventTypes) {
        byEventType[eventType] = (byEventType[eventType] || 0) + 1;
      }

      // Calculate idle time
      totalIdleTime += now - subscription.lastActivityAt.getTime();
    }

    const avgIdleTime =
      this.subscriptions.size > 0 ? totalIdleTime / this.subscriptions.size : 0;

    return {
      total: this.subscriptions.size,
      byConnectionType,
      byEventType,
      avgIdleTime,
    };
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscriptions.clear();
    this.eventTypeIndex.clear();
    this.userIdIndex.clear();
  }

  /**
   * Get event category from event type
   *
   * @param type - Event type
   * @returns Event category (e.g., 'member' from 'member:created')
   */
  private getEventCategory(type: EventType | string): string | null {
    const parts = type.split(':');
    return parts.length > 1 ? parts[0] ?? null : null;
  }
}

/**
 * Global subscription manager instance (singleton)
 */
let globalSubscriptionManager: SubscriptionManager | null = null;

/**
 * Get or create global subscription manager instance
 *
 * @returns Global subscription manager instance
 */
export function getSubscriptionManager(): SubscriptionManager {
  if (!globalSubscriptionManager) {
    globalSubscriptionManager = new SubscriptionManager();
  }
  return globalSubscriptionManager;
}

/**
 * Create a new subscription manager instance
 *
 * @returns New subscription manager instance
 */
export function createSubscriptionManager(): SubscriptionManager {
  return new SubscriptionManager();
}
