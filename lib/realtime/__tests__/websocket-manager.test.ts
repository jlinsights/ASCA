/**
 * WebSocket Manager Tests
 *
 * Comprehensive tests for WebSocket connection management.
 *
 * Test Coverage:
 * - Connection handling and lifecycle
 * - Authentication flow
 * - Message handling (subscribe, unsubscribe, ping, auth)
 * - Heartbeat/ping-pong system
 * - Event broadcasting
 * - Error handling
 * - Client limits
 * - Statistics
 */

import { EventEmitter } from 'events';
import {
  createWebSocketManager,
  WSMessageType,
  type WebSocketManagerOptions,
} from '../websocket-manager';
import { createEventEmitter, EventType } from '../event-emitter';
import { ConnectionType } from '../subscription-manager';

// Mock WebSocket implementation
class MockWebSocket extends EventEmitter {
  readyState = 1; // OPEN
  sentMessages: any[] = [];

  send(data: string) {
    this.sentMessages.push(JSON.parse(data));
  }

  close(code?: number, reason?: string) {
    this.readyState = 3; // CLOSED
    this.emit('close', code, reason);
  }

  terminate() {
    this.readyState = 3; // CLOSED
  }

  ping() {
    // Simulate ping
  }
}

// Mock IncomingMessage
const createMockRequest = () => ({
  headers: {},
  socket: { remoteAddress: '127.0.0.1' },
  url: '/ws',
}) as any;

describe('WebSocket Manager', () => {
  let manager: ReturnType<typeof createWebSocketManager>;

  beforeEach(() => {
    jest.useFakeTimers();
    manager = createWebSocketManager();
  });

  afterEach(async () => {
    await manager.shutdown();
    jest.useRealTimers();
  });

  describe('Connection Handling', () => {
    it('should handle new client connection', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      expect(manager.getClientCount()).toBe(1);
    });

    it('should assign unique client ID', async () => {
      const socket1 = new MockWebSocket() as any;
      const socket2 = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket1, request);
      await manager.handleConnection(socket2, request);

      expect(manager.getClientCount()).toBe(2);

      // Check that both clients received different IDs (implicitly verified by count)
    });

    it('should reject connection when max clients reached', async () => {
      const options: WebSocketManagerOptions = {
        maxClients: 2,
      };
      manager = createWebSocketManager(options);

      const socket1 = new MockWebSocket() as any;
      const socket2 = new MockWebSocket() as any;
      const socket3 = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket1, request);
      await manager.handleConnection(socket2, request);
      await manager.handleConnection(socket3, request);

      expect(manager.getClientCount()).toBe(2);
    });

    it('should handle client disconnect', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);
      expect(manager.getClientCount()).toBe(1);

      socket.emit('close');

      expect(manager.getClientCount()).toBe(0);
    });

    it('should handle socket errors', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);
      expect(manager.getClientCount()).toBe(1);

      socket.emit('error', new Error('Socket error'));

      expect(manager.getClientCount()).toBe(0);
    });
  });

  describe('Authentication', () => {
    it('should authenticate client with valid token', async () => {
      const verifyToken = jest.fn().mockResolvedValue({ userId: 'user-123' });
      manager = createWebSocketManager({
        requireAuth: true,
        verifyToken,
      });

      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      // Simulate auth message
      socket.emit('message', JSON.stringify({
        type: WSMessageType.AUTH,
        payload: { token: 'valid-token' },
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(verifyToken).toHaveBeenCalledWith('valid-token');

      const authMessage = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.AUTHENTICATED
      );
      expect(authMessage).toBeDefined();
      expect(authMessage.payload.userId).toBe('user-123');
    });

    it('should reject invalid token', async () => {
      const verifyToken = jest.fn().mockResolvedValue(null);
      manager = createWebSocketManager({
        requireAuth: true,
        verifyToken,
      });

      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      socket.emit('message', JSON.stringify({
        type: WSMessageType.AUTH,
        payload: { token: 'invalid-token' },
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      const errorMessage = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.ERROR
      );
      expect(errorMessage).toBeDefined();
      expect(errorMessage.payload.error).toContain('Invalid token');
    });

    it('should require authentication when configured', async () => {
      manager = createWebSocketManager({
        requireAuth: true,
      });

      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      // Try to subscribe without auth
      socket.emit('message', JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: [EventType.MEMBER_CREATED] },
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      const errorMessage = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.ERROR
      );
      expect(errorMessage).toBeDefined();
      expect(errorMessage.payload.error).toContain('Authentication required');
    });

    it('should auto-authenticate when auth not required', async () => {
      manager = createWebSocketManager({
        requireAuth: false,
      });

      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      // Should be able to subscribe without auth
      socket.emit('message', JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: [EventType.MEMBER_CREATED] },
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      const subscribedMessage = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.SUBSCRIBED
      );
      expect(subscribedMessage).toBeDefined();
    });
  });

  describe('Message Handling', () => {
    it('should handle subscribe message', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      socket.emit('message', JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: [EventType.MEMBER_CREATED, EventType.MEMBER_UPDATED] },
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      const subscribedMessage = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.SUBSCRIBED
      );
      expect(subscribedMessage).toBeDefined();
      expect(subscribedMessage.payload.eventTypes).toContain(EventType.MEMBER_CREATED);
    });

    it('should handle unsubscribe message', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      socket.emit('message', JSON.stringify({
        type: WSMessageType.UNSUBSCRIBE,
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      const unsubscribedMessage = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.UNSUBSCRIBED
      );
      expect(unsubscribedMessage).toBeDefined();
    });

    it('should handle ping message', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      socket.emit('message', JSON.stringify({
        type: WSMessageType.PING,
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      const pongMessage = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.PONG
      );
      expect(pongMessage).toBeDefined();
    });

    it('should handle invalid message format', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      socket.emit('message', 'invalid json');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const errorMessage = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.ERROR
      );
      expect(errorMessage).toBeDefined();
    });

    it('should handle unknown message type', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      socket.emit('message', JSON.stringify({
        type: 'unknown',
        payload: {},
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      const errorMessage = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.ERROR
      );
      expect(errorMessage).toBeDefined();
      expect(errorMessage.payload.error).toContain('Unknown message type');
    });
  });

  describe('Event Broadcasting', () => {
    it('should broadcast events to subscribed clients', async () => {
      const socket1 = new MockWebSocket() as any;
      const socket2 = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket1, request);
      await manager.handleConnection(socket2, request);

      socket1.emit('message', JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: [EventType.MEMBER_CREATED] },
      }));

      socket2.emit('message', JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: [EventType.MEMBER_UPDATED] },
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Get event emitter and emit event
      const eventEmitter = createEventEmitter();
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // socket1 should receive the event
      const event1 = socket1.sentMessages.find(
        (msg) => msg.type === WSMessageType.EVENT &&
                msg.payload.type === EventType.MEMBER_CREATED
      );
      expect(event1).toBeDefined();

      // socket2 should not receive the event
      const event2 = socket2.sentMessages.find(
        (msg) => msg.type === WSMessageType.EVENT &&
                msg.payload.type === EventType.MEMBER_CREATED
      );
      expect(event2).toBeUndefined();
    });

    it('should broadcast to wildcard subscribers', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      socket.emit('message', JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: ['member:*'] },
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      const eventEmitter = createEventEmitter();
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' });
      await eventEmitter.emit(EventType.MEMBER_UPDATED, { id: 'member-2' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const createdEvent = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.EVENT &&
                msg.payload.type === EventType.MEMBER_CREATED
      );
      const updatedEvent = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.EVENT &&
                msg.payload.type === EventType.MEMBER_UPDATED
      );

      expect(createdEvent).toBeDefined();
      expect(updatedEvent).toBeDefined();
    });

    it('should not send events to closed sockets', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      socket.emit('message', JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: [EventType.MEMBER_CREATED] },
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Close the socket
      socket.readyState = 3; // CLOSED

      const eventEmitter = createEventEmitter();
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should not have sent event
      const event = socket.sentMessages.find(
        (msg) => msg.type === WSMessageType.EVENT
      );
      expect(event).toBeUndefined();
    });
  });

  describe('Heartbeat System', () => {
    beforeEach(() => {
      manager = createWebSocketManager({
        heartbeatInterval: 1000, // 1 second for testing
        clientTimeout: 2000, // 2 seconds for testing
      });
    });

    it('should send periodic pings', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      const pingSpy = jest.spyOn(socket, 'ping');

      await manager.handleConnection(socket, request);

      // Advance time to trigger heartbeat
      jest.advanceTimersByTime(1000);

      expect(pingSpy).toHaveBeenCalled();
    });

    it('should disconnect inactive clients', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      const terminateSpy = jest.spyOn(socket, 'terminate');

      await manager.handleConnection(socket, request);

      expect(manager.getClientCount()).toBe(1);

      // Don't respond to ping
      // Advance time beyond timeout
      jest.advanceTimersByTime(3000);

      expect(terminateSpy).toHaveBeenCalled();
      expect(manager.getClientCount()).toBe(0);
    });

    it('should keep alive clients that respond to pings', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);

      expect(manager.getClientCount()).toBe(1);

      // Respond to pings
      jest.advanceTimersByTime(1000);
      socket.emit('pong');

      jest.advanceTimersByTime(1000);
      socket.emit('pong');

      expect(manager.getClientCount()).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should return client statistics', async () => {
      const socket1 = new MockWebSocket() as any;
      const socket2 = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket1, request);
      await manager.handleConnection(socket2, request);

      const stats = manager.getStats();

      expect(stats.connectedClients).toBe(2);
      expect(stats.authenticatedClients).toBe(2); // Auto-authenticated
    });

    it('should track authenticated clients separately', async () => {
      const verifyToken = jest.fn().mockResolvedValue({ userId: 'user-123' });
      manager = createWebSocketManager({
        requireAuth: true,
        verifyToken,
      });

      const socket1 = new MockWebSocket() as any;
      const socket2 = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket1, request);
      await manager.handleConnection(socket2, request);

      // Authenticate only socket1
      socket1.emit('message', JSON.stringify({
        type: WSMessageType.AUTH,
        payload: { token: 'valid-token' },
      }));

      await new Promise((resolve) => setTimeout(resolve, 10));

      const stats = manager.getStats();

      expect(stats.connectedClients).toBe(2);
      expect(stats.authenticatedClients).toBe(1);
    });
  });

  describe('Shutdown', () => {
    it('should close all connections on shutdown', async () => {
      const socket1 = new MockWebSocket() as any;
      const socket2 = new MockWebSocket() as any;
      const request = createMockRequest();

      const closeSpy1 = jest.spyOn(socket1, 'close');
      const closeSpy2 = jest.spyOn(socket2, 'close');

      await manager.handleConnection(socket1, request);
      await manager.handleConnection(socket2, request);

      expect(manager.getClientCount()).toBe(2);

      await manager.shutdown();

      expect(closeSpy1).toHaveBeenCalled();
      expect(closeSpy2).toHaveBeenCalled();
      expect(manager.getClientCount()).toBe(0);
    });

    it('should stop heartbeat on shutdown', async () => {
      const socket = new MockWebSocket() as any;
      const request = createMockRequest();

      await manager.handleConnection(socket, request);
      await manager.shutdown();

      // Advance time - should not trigger heartbeat
      const pingSpy = jest.spyOn(socket, 'ping');
      jest.advanceTimersByTime(30000);

      expect(pingSpy).not.toHaveBeenCalled();
    });
  });
});
