/**
 * Subscription Manager Tests
 *
 * Comprehensive tests for client subscription management.
 *
 * Test Coverage:
 * - Subscribe/unsubscribe operations
 * - Event type indexing
 * - User ID indexing
 * - Event filtering logic
 * - Connection type support
 * - Stale subscription cleanup
 * - Statistics collection
 */

import {
  createSubscriptionManager,
  ConnectionType,
  type SubscriptionFilter,
} from '../subscription-manager';
import { EventType, createEventPayload } from '../event-emitter';

describe('Subscription Manager', () => {
  describe('Subscribe/Unsubscribe', () => {
    it('should subscribe a client', () => {
      const manager = createSubscriptionManager();

      const subscription = manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
        userId: 'user-123',
      });

      expect(subscription.clientId).toBe('client-1');
      expect(subscription.connectionType).toBe(ConnectionType.WEBSOCKET);
      expect(subscription.eventTypes).toContain(EventType.MEMBER_CREATED);
      expect(subscription.userId).toBe('user-123');
      expect(subscription.connectedAt).toBeInstanceOf(Date);
    });

    it('should subscribe with default wildcard (*) when no event types specified', () => {
      const manager = createSubscriptionManager();

      const subscription = manager.subscribe('client-1', ConnectionType.SSE);

      expect(subscription.eventTypes.has('*')).toBe(true);
    });

    it('should unsubscribe a client', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
      });

      expect(manager.getActiveCount()).toBe(1);

      manager.unsubscribe('client-1');

      expect(manager.getActiveCount()).toBe(0);
      expect(manager.getSubscription('client-1')).toBeUndefined();
    });

    it('should replace existing subscription when subscribing again', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
      });

      manager.subscribe('client-1', ConnectionType.SSE, {
        eventTypes: [EventType.MEMBER_UPDATED],
      });

      const subscription = manager.getSubscription('client-1');
      expect(subscription?.connectionType).toBe(ConnectionType.SSE);
      expect(subscription?.eventTypes.has(EventType.MEMBER_UPDATED)).toBe(true);
      expect(subscription?.eventTypes.has(EventType.MEMBER_CREATED)).toBe(false);
    });

    it('should handle unsubscribe for non-existent client', () => {
      const manager = createSubscriptionManager();

      // Should not throw
      expect(() => manager.unsubscribe('non-existent')).not.toThrow();
    });
  });

  describe('Subscription Retrieval', () => {
    it('should get subscription by client ID', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
        userId: 'user-123',
      });

      const subscription = manager.getSubscription('client-1');
      expect(subscription).toBeDefined();
      expect(subscription?.clientId).toBe('client-1');
    });

    it('should return undefined for non-existent subscription', () => {
      const manager = createSubscriptionManager();

      const subscription = manager.getSubscription('non-existent');
      expect(subscription).toBeUndefined();
    });

    it('should get all subscriptions', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET);
      manager.subscribe('client-2', ConnectionType.SSE);
      manager.subscribe('client-3', ConnectionType.WEBSOCKET);

      const subscriptions = manager.getAllSubscriptions();
      expect(subscriptions).toHaveLength(3);
    });

    it('should get subscriptions by connection type', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET);
      manager.subscribe('client-2', ConnectionType.SSE);
      manager.subscribe('client-3', ConnectionType.WEBSOCKET);

      const wsClients = manager.getByConnectionType(ConnectionType.WEBSOCKET);
      const sseClients = manager.getByConnectionType(ConnectionType.SSE);

      expect(wsClients).toHaveLength(2);
      expect(sseClients).toHaveLength(1);
    });
  });

  describe('Event Type Indexing', () => {
    it('should index clients by event type', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
      });

      manager.subscribe('client-2', ConnectionType.SSE, {
        eventTypes: [EventType.MEMBER_CREATED, EventType.MEMBER_UPDATED],
      });

      const clients = manager.getClientsByEventType(EventType.MEMBER_CREATED);
      expect(clients.size).toBe(2);
      expect(clients.has('client-1')).toBe(true);
      expect(clients.has('client-2')).toBe(true);
    });

    it('should support wildcard event type (*)', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: ['*'],
      });

      const clients1 = manager.getClientsByEventType(EventType.MEMBER_CREATED);
      const clients2 = manager.getClientsByEventType(EventType.ARTIST_CREATED);

      expect(clients1.has('client-1')).toBe(true);
      expect(clients2.has('client-1')).toBe(true);
    });

    it('should support category wildcard (member:*)', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: ['member:*'],
      });

      const memberClients = manager.getClientsByEventType(EventType.MEMBER_CREATED);
      const artistClients = manager.getClientsByEventType(EventType.ARTIST_CREATED);

      expect(memberClients.has('client-1')).toBe(true);
      expect(artistClients.has('client-1')).toBe(false);
    });

    it('should combine specific, wildcard, and global matches', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
      });

      manager.subscribe('client-2', ConnectionType.SSE, {
        eventTypes: ['member:*'],
      });

      manager.subscribe('client-3', ConnectionType.WEBSOCKET, {
        eventTypes: ['*'],
      });

      const clients = manager.getClientsByEventType(EventType.MEMBER_CREATED);
      expect(clients.size).toBe(3);
    });

    it('should clean up event type index on unsubscribe', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
      });

      let clients = manager.getClientsByEventType(EventType.MEMBER_CREATED);
      expect(clients.size).toBe(1);

      manager.unsubscribe('client-1');

      clients = manager.getClientsByEventType(EventType.MEMBER_CREATED);
      expect(clients.size).toBe(0);
    });
  });

  describe('User ID Indexing', () => {
    it('should index clients by user ID', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        userId: 'user-123',
      });

      manager.subscribe('client-2', ConnectionType.SSE, {
        userId: 'user-123',
      });

      manager.subscribe('client-3', ConnectionType.WEBSOCKET, {
        userId: 'user-456',
      });

      const user123Clients = manager.getClientsByUserId('user-123');
      const user456Clients = manager.getClientsByUserId('user-456');

      expect(user123Clients.size).toBe(2);
      expect(user456Clients.size).toBe(1);
    });

    it('should clean up user ID index on unsubscribe', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        userId: 'user-123',
      });

      let clients = manager.getClientsByUserId('user-123');
      expect(clients.size).toBe(1);

      manager.unsubscribe('client-1');

      clients = manager.getClientsByUserId('user-123');
      expect(clients.size).toBe(0);
    });
  });

  describe('Event Filtering', () => {
    it('should filter events by subscription', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
        userId: 'user-123',
      });

      const payload1 = createEventPayload(
        EventType.MEMBER_CREATED,
        { id: 'member-1' },
        { userId: 'user-123' }
      );

      const payload2 = createEventPayload(
        EventType.MEMBER_CREATED,
        { id: 'member-2' },
        { userId: 'user-456' }
      );

      const payload3 = createEventPayload(
        EventType.MEMBER_UPDATED,
        { id: 'member-1' },
        { userId: 'user-123' }
      );

      expect(manager.shouldReceiveEvent('client-1', payload1)).toBe(true);
      expect(manager.shouldReceiveEvent('client-1', payload2)).toBe(false);
      expect(manager.shouldReceiveEvent('client-1', payload3)).toBe(false);
    });

    it('should allow events without userId filter', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
      });

      const payload = createEventPayload(
        EventType.MEMBER_CREATED,
        { id: 'member-1' },
        { userId: 'user-123' }
      );

      expect(manager.shouldReceiveEvent('client-1', payload)).toBe(true);
    });

    it('should return false for non-existent client', () => {
      const manager = createSubscriptionManager();

      const payload = createEventPayload(EventType.MEMBER_CREATED, { id: 'member-1' });

      expect(manager.shouldReceiveEvent('non-existent', payload)).toBe(false);
    });
  });

  describe('Activity Tracking', () => {
    it('should update last activity timestamp', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET);

      const subscription1 = manager.getSubscription('client-1');
      const initialTime = subscription1?.lastActivityAt.getTime();

      // Wait a bit
      jest.advanceTimersByTime(100);

      manager.updateActivity('client-1');

      const subscription2 = manager.getSubscription('client-1');
      const updatedTime = subscription2?.lastActivityAt.getTime();

      expect(updatedTime).toBeGreaterThan(initialTime!);
    });

    it('should handle updateActivity for non-existent client', () => {
      const manager = createSubscriptionManager();

      // Should not throw
      expect(() => manager.updateActivity('non-existent')).not.toThrow();
    });
  });

  describe('Stale Subscription Cleanup', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should remove stale subscriptions', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET);
      manager.subscribe('client-2', ConnectionType.SSE);

      // Advance time by 10 minutes
      jest.advanceTimersByTime(10 * 60 * 1000);

      // Update activity for client-1
      manager.updateActivity('client-1');

      // Remove subscriptions idle for more than 5 minutes
      const removed = manager.removeStaleSubscriptions(5 * 60 * 1000);

      expect(removed).toBe(1);
      expect(manager.getActiveCount()).toBe(1);
      expect(manager.getSubscription('client-1')).toBeDefined();
      expect(manager.getSubscription('client-2')).toBeUndefined();
    });

    it('should not remove active subscriptions', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET);

      // Advance time by 1 minute
      jest.advanceTimersByTime(1 * 60 * 1000);

      const removed = manager.removeStaleSubscriptions(5 * 60 * 1000);

      expect(removed).toBe(0);
      expect(manager.getActiveCount()).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should collect subscription statistics', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED, EventType.MEMBER_UPDATED],
      });

      manager.subscribe('client-2', ConnectionType.SSE, {
        eventTypes: ['*'],
      });

      manager.subscribe('client-3', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
      });

      const stats = manager.getStats();

      expect(stats.total).toBe(3);
      expect(stats.byConnectionType[ConnectionType.WEBSOCKET]).toBe(2);
      expect(stats.byConnectionType[ConnectionType.SSE]).toBe(1);
      expect(stats.byEventType[EventType.MEMBER_CREATED]).toBe(2);
      expect(stats.byEventType['*']).toBe(1);
      expect(stats.avgIdleTime).toBeGreaterThanOrEqual(0);
    });

    it('should return correct active count', () => {
      const manager = createSubscriptionManager();

      expect(manager.getActiveCount()).toBe(0);

      manager.subscribe('client-1', ConnectionType.WEBSOCKET);
      manager.subscribe('client-2', ConnectionType.SSE);

      expect(manager.getActiveCount()).toBe(2);

      manager.unsubscribe('client-1');

      expect(manager.getActiveCount()).toBe(1);
    });
  });

  describe('Clear', () => {
    it('should clear all subscriptions', () => {
      const manager = createSubscriptionManager();

      manager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
        userId: 'user-123',
      });

      manager.subscribe('client-2', ConnectionType.SSE);

      expect(manager.getActiveCount()).toBe(2);

      manager.clear();

      expect(manager.getActiveCount()).toBe(0);
      expect(manager.getClientsByEventType(EventType.MEMBER_CREATED).size).toBe(0);
      expect(manager.getClientsByUserId('user-123').size).toBe(0);
    });
  });
});
