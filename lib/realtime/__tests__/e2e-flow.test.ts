/**
 * End-to-End Real-time Event Flow Tests
 *
 * Comprehensive tests for complete event flow from emission to delivery.
 *
 * Test Coverage:
 * - Event emission → EventEmitter → SubscriptionManager → Client delivery
 * - Multi-client event broadcasting
 * - Event filtering and routing
 * - WebSocket and SSE integration
 * - Error propagation and recovery
 * - Performance and scalability
 */

import { EventEmitter } from 'events'
import { createEventEmitter, EventType, type EventPayload } from '../event-emitter'
import { createSubscriptionManager, ConnectionType } from '../subscription-manager'
import { createWebSocketManager, WSMessageType } from '../websocket-manager'
import { createSSEManager } from '../sse-manager'

// Mock WebSocket for E2E testing
class MockWebSocket extends EventEmitter {
  readyState = 1 // OPEN
  sentMessages: any[] = []

  send(data: string) {
    this.sentMessages.push(JSON.parse(data))
  }

  close() {
    this.readyState = 3 // CLOSED
    this.emit('close')
  }

  ping() {}
}

// Mock ReadableStreamController for SSE testing
class MockController {
  enqueued: Uint8Array[] = []
  closed = false

  enqueue(chunk: Uint8Array) {
    if (this.closed) {
      throw new Error('Stream is closed')
    }
    this.enqueued.push(chunk)
  }

  close() {
    this.closed = true
  }

  getEnqueuedText(): string[] {
    const decoder = new TextDecoder()
    return this.enqueued.map(chunk => decoder.decode(chunk))
  }
}

describe('E2E Real-time Event Flow', () => {
  beforeEach(() => {
    // doNotFake: microtask/nextTick은 real 유지 → await flow resolve 보장.
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Complete Event Pipeline', () => {
    it('should deliver event from emitter to WebSocket client', async () => {
      // Setup: Create all components
      const eventEmitter = createEventEmitter()
      const subscriptionManager = createSubscriptionManager()
      const wsManager = createWebSocketManager()

      // Create mock WebSocket client
      const socket = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      // Connect client
      await wsManager.handleConnection(socket, request)

      // Subscribe to member events
      socket.emit(
        'message',
        JSON.stringify({
          type: WSMessageType.SUBSCRIBE,
          payload: { eventTypes: [EventType.MEMBER_CREATED] },
        })
      )

      await new Promise(resolve => setTimeout(resolve, 10))

      // Emit event
      await eventEmitter.emit(EventType.MEMBER_CREATED, {
        id: 'member-1',
        name: 'John Doe',
        email: 'john@example.com',
      })

      await new Promise(resolve => setTimeout(resolve, 10))

      // Verify client received event
      const eventMessage = socket.sentMessages.find(
        msg => msg.type === WSMessageType.EVENT && msg.payload.type === EventType.MEMBER_CREATED
      )

      expect(eventMessage).toBeDefined()
      expect(eventMessage.payload.data.id).toBe('member-1')
      expect(eventMessage.payload.data.name).toBe('John Doe')
    })

    it('should deliver event to multiple WebSocket clients', async () => {
      const eventEmitter = createEventEmitter()
      const wsManager = createWebSocketManager()

      // Create multiple clients
      const socket1 = new MockWebSocket() as any
      const socket2 = new MockWebSocket() as any
      const socket3 = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      await wsManager.handleConnection(socket1, request)
      await wsManager.handleConnection(socket2, request)
      await wsManager.handleConnection(socket3, request)

      // Subscribe all clients
      const subscribeMessage = JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: [EventType.MEMBER_CREATED] },
      })

      socket1.emit('message', subscribeMessage)
      socket2.emit('message', subscribeMessage)
      socket3.emit('message', subscribeMessage)

      await new Promise(resolve => setTimeout(resolve, 10))

      // Emit event
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })

      await new Promise(resolve => setTimeout(resolve, 10))

      // Verify all clients received event
      ;[socket1, socket2, socket3].forEach(socket => {
        const eventMessage = socket.sentMessages.find(
          msg => msg.type === WSMessageType.EVENT && msg.payload.type === EventType.MEMBER_CREATED
        )
        expect(eventMessage).toBeDefined()
      })
    })

    it('should filter events based on subscription', async () => {
      const eventEmitter = createEventEmitter()
      const wsManager = createWebSocketManager()

      const socket1 = new MockWebSocket() as any
      const socket2 = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      await wsManager.handleConnection(socket1, request)
      await wsManager.handleConnection(socket2, request)

      // socket1 subscribes to member events
      socket1.emit(
        'message',
        JSON.stringify({
          type: WSMessageType.SUBSCRIBE,
          payload: { eventTypes: [EventType.MEMBER_CREATED] },
        })
      )

      // socket2 subscribes to artist events
      socket2.emit(
        'message',
        JSON.stringify({
          type: WSMessageType.SUBSCRIBE,
          payload: { eventTypes: [EventType.ARTIST_CREATED] },
        })
      )

      await new Promise(resolve => setTimeout(resolve, 10))

      // Emit member event
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })

      await new Promise(resolve => setTimeout(resolve, 10))

      // socket1 should receive, socket2 should not
      const socket1Event = socket1.sentMessages.find(msg => msg.type === WSMessageType.EVENT)
      const socket2Event = socket2.sentMessages.find(msg => msg.type === WSMessageType.EVENT)

      expect(socket1Event).toBeDefined()
      expect(socket2Event).toBeUndefined()
    })
  })

  describe('Wildcard Subscriptions', () => {
    it('should deliver matching wildcard events to clients', async () => {
      const eventEmitter = createEventEmitter()
      const wsManager = createWebSocketManager()

      const socket = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      await wsManager.handleConnection(socket, request)

      // Subscribe to all member events
      socket.emit(
        'message',
        JSON.stringify({
          type: WSMessageType.SUBSCRIBE,
          payload: { eventTypes: ['member:*'] },
        })
      )

      await new Promise(resolve => setTimeout(resolve, 10))

      // Emit various member events
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      await eventEmitter.emit(EventType.MEMBER_UPDATED, { id: 'member-2' })
      await eventEmitter.emit(EventType.MEMBER_DELETED, { id: 'member-3' })

      // Emit non-member event
      await eventEmitter.emit(EventType.ARTIST_CREATED, { id: 'artist-1' })

      await new Promise(resolve => setTimeout(resolve, 10))

      // Should receive 3 member events, not the artist event
      const memberEvents = socket.sentMessages.filter(
        msg => msg.type === WSMessageType.EVENT && msg.payload.type.startsWith('member:')
      )

      expect(memberEvents).toHaveLength(3)
    })

    it('should deliver all events to global wildcard subscriber', async () => {
      const eventEmitter = createEventEmitter()
      const wsManager = createWebSocketManager()

      const socket = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      await wsManager.handleConnection(socket, request)

      // Subscribe to all events
      socket.emit(
        'message',
        JSON.stringify({
          type: WSMessageType.SUBSCRIBE,
          payload: { eventTypes: ['*'] },
        })
      )

      await new Promise(resolve => setTimeout(resolve, 10))

      // Emit various events
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      await eventEmitter.emit(EventType.ARTIST_CREATED, { id: 'artist-1' })
      await eventEmitter.emit(EventType.ARTWORK_CREATED, { id: 'artwork-1' })

      await new Promise(resolve => setTimeout(resolve, 10))

      // Should receive all events
      const allEvents = socket.sentMessages.filter(msg => msg.type === WSMessageType.EVENT)

      expect(allEvents).toHaveLength(3)
    })
  })

  describe('User-Specific Events', () => {
    it('should deliver user-specific events only to matching clients', async () => {
      const eventEmitter = createEventEmitter()
      const subscriptionManager = createSubscriptionManager()

      // Subscribe two clients with different user IDs
      subscriptionManager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_UPDATED],
        userId: 'user-123',
      })

      subscriptionManager.subscribe('client-2', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_UPDATED],
        userId: 'user-456',
      })

      // Emit event for user-123
      await eventEmitter.emit(EventType.MEMBER_UPDATED, { id: 'member-1' }, { userId: 'user-123' })

      await new Promise(resolve => setTimeout(resolve, 10))

      // Only client-1 should receive
      const eventPayload = {
        type: EventType.MEMBER_UPDATED,
        data: { id: 'member-1' },
        userId: 'user-123',
      } as any

      expect(subscriptionManager.shouldReceiveEvent('client-1', eventPayload)).toBe(true)
      expect(subscriptionManager.shouldReceiveEvent('client-2', eventPayload)).toBe(false)
    })

    it('should deliver events to all clients when no userId filter', async () => {
      const eventEmitter = createEventEmitter()
      const subscriptionManager = createSubscriptionManager()

      // Subscribe two clients without user ID filter
      subscriptionManager.subscribe('client-1', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
      })

      subscriptionManager.subscribe('client-2', ConnectionType.WEBSOCKET, {
        eventTypes: [EventType.MEMBER_CREATED],
      })

      const eventPayload = {
        type: EventType.MEMBER_CREATED,
        data: { id: 'member-1' },
        userId: 'user-123',
      } as any

      // Both should receive
      expect(subscriptionManager.shouldReceiveEvent('client-1', eventPayload)).toBe(true)
      expect(subscriptionManager.shouldReceiveEvent('client-2', eventPayload)).toBe(true)
    })
  })

  describe('Connection Lifecycle', () => {
    it('should stop delivering events after client disconnect', async () => {
      const eventEmitter = createEventEmitter()
      const wsManager = createWebSocketManager()

      const socket = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      await wsManager.handleConnection(socket, request)

      socket.emit(
        'message',
        JSON.stringify({
          type: WSMessageType.SUBSCRIBE,
          payload: { eventTypes: [EventType.MEMBER_CREATED] },
        })
      )

      await new Promise(resolve => setTimeout(resolve, 10))

      // Disconnect client
      socket.close()

      await new Promise(resolve => setTimeout(resolve, 10))

      // Clear previous messages
      socket.sentMessages = []

      // Emit event after disconnect
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })

      await new Promise(resolve => setTimeout(resolve, 10))

      // Should not receive event
      const eventMessage = socket.sentMessages.find(msg => msg.type === WSMessageType.EVENT)

      expect(eventMessage).toBeUndefined()
    })

    it('should handle client reconnection', async () => {
      const wsManager = createWebSocketManager()

      const socket1 = new MockWebSocket() as any
      const socket2 = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      // First connection
      await wsManager.handleConnection(socket1, request)
      socket1.close()

      await new Promise(resolve => setTimeout(resolve, 10))

      // Reconnection
      await wsManager.handleConnection(socket2, request)

      // Should have 1 client (the new connection)
      expect(wsManager.getClientCount()).toBe(1)
    })
  })

  describe('Error Handling', () => {
    it('should continue delivering to other clients on individual client error', async () => {
      const eventEmitter = createEventEmitter()
      const wsManager = createWebSocketManager()

      const socket1 = new MockWebSocket() as any
      const socket2 = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      await wsManager.handleConnection(socket1, request)
      await wsManager.handleConnection(socket2, request)

      const subscribeMessage = JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: [EventType.MEMBER_CREATED] },
      })

      socket1.emit('message', subscribeMessage)
      socket2.emit('message', subscribeMessage)

      await new Promise(resolve => setTimeout(resolve, 10))

      // Make socket1 throw error on send
      socket1.send = jest.fn().mockImplementation(() => {
        throw new Error('Send failed')
      })

      // Emit event
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })

      await new Promise(resolve => setTimeout(resolve, 10))

      // socket2 should still receive
      const socket2Event = socket2.sentMessages.find(msg => msg.type === WSMessageType.EVENT)

      expect(socket2Event).toBeDefined()
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle high-frequency events efficiently', async () => {
      const eventEmitter = createEventEmitter()
      const wsManager = createWebSocketManager()

      const socket = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      await wsManager.handleConnection(socket, request)

      socket.emit(
        'message',
        JSON.stringify({
          type: WSMessageType.SUBSCRIBE,
          payload: { eventTypes: ['*'] },
        })
      )

      await new Promise(resolve => setTimeout(resolve, 10))

      // Emit 100 events rapidly
      const startTime = Date.now()

      for (let i = 0; i < 100; i++) {
        await eventEmitter.emit(EventType.MEMBER_CREATED, { id: `member-${i}` })
      }

      const endTime = Date.now()

      // Should complete in reasonable time (<1 second)
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should handle many concurrent clients', async () => {
      const wsManager = createWebSocketManager()
      const sockets: MockWebSocket[] = []
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      // Create 50 clients
      for (let i = 0; i < 50; i++) {
        const socket = new MockWebSocket() as any
        sockets.push(socket)
        await wsManager.handleConnection(socket, request)
      }

      expect(wsManager.getClientCount()).toBe(50)

      // All clients subscribe
      const subscribeMessage = JSON.stringify({
        type: WSMessageType.SUBSCRIBE,
        payload: { eventTypes: [EventType.MEMBER_CREATED] },
      })

      sockets.forEach(socket => {
        socket.emit('message', subscribeMessage)
      })

      await new Promise(resolve => setTimeout(resolve, 50))

      // Cleanup
      await wsManager.shutdown()
    })
  })

  describe('Message Ordering', () => {
    it('should deliver events in order', async () => {
      const eventEmitter = createEventEmitter()
      const wsManager = createWebSocketManager()

      const socket = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      await wsManager.handleConnection(socket, request)

      socket.emit(
        'message',
        JSON.stringify({
          type: WSMessageType.SUBSCRIBE,
          payload: { eventTypes: [EventType.MEMBER_CREATED] },
        })
      )

      await new Promise(resolve => setTimeout(resolve, 10))

      // Emit events in sequence
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-1', order: 1 })
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-2', order: 2 })
      await eventEmitter.emit(EventType.MEMBER_CREATED, { id: 'member-3', order: 3 })

      await new Promise(resolve => setTimeout(resolve, 10))

      // Verify order
      const events = socket.sentMessages
        .filter(msg => msg.type === WSMessageType.EVENT)
        .map(msg => msg.payload.data.order)

      expect(events).toEqual([1, 2, 3])
    })
  })

  describe('Metadata Propagation', () => {
    it('should propagate metadata through event pipeline', async () => {
      const eventEmitter = createEventEmitter()
      const wsManager = createWebSocketManager()

      const socket = new MockWebSocket() as any
      const request = {
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
        url: '/ws',
      } as any

      await wsManager.handleConnection(socket, request)

      socket.emit(
        'message',
        JSON.stringify({
          type: WSMessageType.SUBSCRIBE,
          payload: { eventTypes: [EventType.MEMBER_CREATED] },
        })
      )

      await new Promise(resolve => setTimeout(resolve, 10))

      // Emit with metadata
      await eventEmitter.emit(
        EventType.MEMBER_CREATED,
        { id: 'member-1' },
        {
          userId: 'user-123',
          source: 'admin-panel',
          requestId: 'req-456',
        }
      )

      await new Promise(resolve => setTimeout(resolve, 10))

      const eventMessage = socket.sentMessages.find(msg => msg.type === WSMessageType.EVENT)

      expect(eventMessage.payload.userId).toBe('user-123')
      expect(eventMessage.payload.metadata.source).toBe('admin-panel')
      expect(eventMessage.payload.metadata.requestId).toBe('req-456')
    })
  })
})
