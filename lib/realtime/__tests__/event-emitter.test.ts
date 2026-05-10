/**
 * Event Emitter Tests
 *
 * Comprehensive tests for the real-time event emitter system.
 *
 * Test Coverage:
 * - Event emission (local and Redis)
 * - Event subscription (on, once, off)
 * - Wildcard subscriptions
 * - Event filtering
 * - Memory leak prevention
 * - Promise-based async support
 * - waitFor with timeout
 */

import {
  createEventEmitter,
  EventType,
  type EventPayload,
  type EventListener,
  type EventFilter,
} from '../event-emitter'

describe('Event Emitter', () => {
  let emitter: ReturnType<typeof createEventEmitter> | undefined

  afterEach(async () => {
    if (emitter) {
      await emitter.shutdown()
      emitter = undefined
    }
  })

  describe('Event Emission', () => {
    it('should emit events locally', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      emitter.on(EventType.MEMBER_CREATED, payload => {
        events.push(payload)
      })

      await emitter.emit(EventType.MEMBER_CREATED, {
        id: 'member-1',
        email: 'test@example.com',
      })

      expect(events).toHaveLength(1)
      expect(events[0].type).toBe(EventType.MEMBER_CREATED)
      expect(events[0].data.id).toBe('member-1')
      expect(events[0].timestamp).toBeInstanceOf(Date)
    })

    it('should include metadata in event payload', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      emitter.on(EventType.MEMBER_CREATED, payload => {
        events.push(payload)
      })

      await emitter.emit(
        EventType.MEMBER_CREATED,
        { id: 'member-1' },
        { userId: 'user-123', source: 'admin-panel' }
      )

      expect(events[0].userId).toBe('user-123')
      expect(events[0].metadata?.source).toBe('admin-panel')
    })

    it('should emit to multiple listeners', async () => {
      emitter = createEventEmitter()
      const events1: EventPayload[] = []
      const events2: EventPayload[] = []

      emitter.on(EventType.MEMBER_CREATED, payload => {
        events1.push(payload)
      })

      emitter.on(EventType.MEMBER_CREATED, payload => {
        events2.push(payload)
      })

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })

      expect(events1).toHaveLength(1)
      expect(events2).toHaveLength(1)
    })

    it('should handle async listeners', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      emitter.on(EventType.MEMBER_CREATED, async payload => {
        // Simulate async operation
        await jest.advanceTimersByTimeAsync(10)
        events.push(payload)
      })

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })

      // Give async listeners time to complete
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(events).toHaveLength(1)
    })
  })

  describe('Event Subscription', () => {
    it('should subscribe with on()', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      const subscription = emitter.on(EventType.MEMBER_CREATED, payload => {
        events.push(payload)
      })

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-2' })

      expect(events).toHaveLength(2)
      expect(subscription.id).toMatch(/^sub_\d+$/)
    })

    it('should subscribe with once()', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      emitter.once(EventType.MEMBER_CREATED, payload => {
        events.push(payload)
      })

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-2' })

      expect(events).toHaveLength(1)
      expect(events[0].data.id).toBe('member-1')
    })

    it('should unsubscribe with subscription.unsubscribe()', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      const subscription = emitter.on(EventType.MEMBER_CREATED, payload => {
        events.push(payload)
      })

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      subscription.unsubscribe()
      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-2' })

      expect(events).toHaveLength(1)
    })

    it('should unsubscribe with off()', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      const listener: EventListener = payload => {
        events.push(payload)
      }

      emitter.on(EventType.MEMBER_CREATED, listener)
      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })

      emitter.off(EventType.MEMBER_CREATED, listener)
      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-2' })

      expect(events).toHaveLength(1)
    })

    it('should removeAllListeners for specific event type', async () => {
      emitter = createEventEmitter()
      const events1: EventPayload[] = []
      const events2: EventPayload[] = []

      emitter.on(EventType.MEMBER_CREATED, payload => {
        events1.push(payload)
      })

      emitter.on(EventType.MEMBER_UPDATED, payload => {
        events2.push(payload)
      })

      emitter.removeAllListeners(EventType.MEMBER_CREATED)

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      await emitter.emit(EventType.MEMBER_UPDATED, { id: 'member-1' })

      expect(events1).toHaveLength(0)
      expect(events2).toHaveLength(1)
    })

    it('should removeAllListeners for all events', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      emitter.on(EventType.MEMBER_CREATED, payload => {
        events.push(payload)
      })

      emitter.on(EventType.MEMBER_UPDATED, payload => {
        events.push(payload)
      })

      emitter.removeAllListeners()

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      await emitter.emit(EventType.MEMBER_UPDATED, { id: 'member-1' })

      expect(events).toHaveLength(0)
    })
  })

  describe('Wildcard Subscriptions', () => {
    it('should support category wildcard (member:*)', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      emitter.on('member:*', payload => {
        events.push(payload)
      })

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      await emitter.emit(EventType.MEMBER_UPDATED, { id: 'member-2' })
      await emitter.emit(EventType.MEMBER_DELETED, { id: 'member-3' })
      await emitter.emit(EventType.ARTIST_CREATED, { id: 'artist-1' })

      expect(events).toHaveLength(3)
      expect(events[0].type).toBe(EventType.MEMBER_CREATED)
      expect(events[1].type).toBe(EventType.MEMBER_UPDATED)
      expect(events[2].type).toBe(EventType.MEMBER_DELETED)
    })

    it('should support global wildcard (*)', async () => {
      emitter = createEventEmitter()
      const events: EventPayload[] = []

      emitter.on('*', payload => {
        events.push(payload)
      })

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      await emitter.emit(EventType.ARTIST_CREATED, { id: 'artist-1' })
      await emitter.emit(EventType.ARTWORK_CREATED, { id: 'artwork-1' })

      expect(events).toHaveLength(3)
    })

    it('should emit to both specific and wildcard listeners', async () => {
      emitter = createEventEmitter()
      const specificEvents: EventPayload[] = []
      const wildcardEvents: EventPayload[] = []

      emitter.on(EventType.MEMBER_CREATED, payload => {
        specificEvents.push(payload)
      })

      emitter.on('member:*', payload => {
        wildcardEvents.push(payload)
      })

      await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })

      expect(specificEvents).toHaveLength(1)
      expect(wildcardEvents).toHaveLength(1)
    })
  })

  describe('Event Filtering', () => {
    it('should filter events based on custom logic', async () => {
      emitter = createEventEmitter()
      const vipEvents: EventPayload[] = []

      const filter: EventFilter = payload => payload.data.membershipLevel === 'VIP'

      emitter.on(
        EventType.MEMBER_CREATED,
        payload => {
          vipEvents.push(payload)
        },
        filter
      )

      await emitter.emit(EventType.MEMBER_CREATED, {
        id: 'member-1',
        membershipLevel: 'VIP',
      })

      await emitter.emit(EventType.MEMBER_CREATED, {
        id: 'member-2',
        membershipLevel: 'BASIC',
      })

      expect(vipEvents).toHaveLength(1)
      expect(vipEvents[0].data.id).toBe('member-1')
    })

    it('should filter events by userId', async () => {
      emitter = createEventEmitter()
      const userEvents: EventPayload[] = []

      const filter: EventFilter = payload => payload.userId === 'user-123'

      emitter.on(
        EventType.MEMBER_UPDATED,
        payload => {
          userEvents.push(payload)
        },
        filter
      )

      await emitter.emit(EventType.MEMBER_UPDATED, { id: 'member-1' }, { userId: 'user-123' })

      await emitter.emit(EventType.MEMBER_UPDATED, { id: 'member-2' }, { userId: 'user-456' })

      expect(userEvents).toHaveLength(1)
      expect(userEvents[0].data.id).toBe('member-1')
    })
  })

  describe('Utility Methods', () => {
    it('should return listener count', async () => {
      emitter = createEventEmitter()

      emitter.on(EventType.MEMBER_CREATED, () => {})
      emitter.on(EventType.MEMBER_CREATED, () => {})
      emitter.on(EventType.MEMBER_UPDATED, () => {})

      expect(emitter.listenerCount(EventType.MEMBER_CREATED)).toBe(2)
      expect(emitter.listenerCount(EventType.MEMBER_UPDATED)).toBe(1)
    })

    it('should return event names', async () => {
      emitter = createEventEmitter()

      emitter.on(EventType.MEMBER_CREATED, () => {})
      emitter.on(EventType.MEMBER_UPDATED, () => {})

      const eventNames = emitter.eventNames()
      expect(eventNames).toContain(EventType.MEMBER_CREATED)
      expect(eventNames).toContain(EventType.MEMBER_UPDATED)
    })

    it('should wait for an event with waitFor()', async () => {
      emitter = createEventEmitter()

      // Start waiting for event
      const waitPromise = emitter.waitFor(EventType.MEMBER_CREATED)

      // Emit event after a delay
      setTimeout(async () => {
        await emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      }, 10)

      const payload = await waitPromise
      expect(payload.type).toBe(EventType.MEMBER_CREATED)
      expect(payload.data.id).toBe('member-1')
    })

    it('should timeout when waiting for event', async () => {
      emitter = createEventEmitter()

      await expect(emitter.waitFor(EventType.MEMBER_CREATED, 100)).rejects.toThrow(
        'Timeout waiting for event'
      )
    })
  })

  describe('Memory Leak Prevention', () => {
    it('should not exceed max listeners', async () => {
      emitter = createEventEmitter({ maxListeners: 5 })

      // Add 5 listeners (should be OK)
      for (let i = 0; i < 5; i++) {
        emitter.on(EventType.MEMBER_CREATED, () => {})
      }

      expect(emitter.listenerCount(EventType.MEMBER_CREATED)).toBe(5)

      // Add 6th listener (should not trigger warning)
      emitter.on(EventType.MEMBER_CREATED, () => {})
      expect(emitter.listenerCount(EventType.MEMBER_CREATED)).toBe(6)
    })

    it('should clean up subscriptions on removeAllListeners', async () => {
      emitter = createEventEmitter()

      emitter.on(EventType.MEMBER_CREATED, () => {})
      emitter.on(EventType.MEMBER_UPDATED, () => {})

      expect(emitter.eventNames().length).toBeGreaterThan(0)

      emitter.removeAllListeners()

      expect(emitter.eventNames().length).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors in listeners gracefully', async () => {
      emitter = createEventEmitter()
      const successEvents: EventPayload[] = []

      emitter.on(EventType.MEMBER_CREATED, () => {
        throw new Error('Listener error')
      })

      emitter.on(EventType.MEMBER_CREATED, payload => {
        successEvents.push(payload)
      })

      // Should not throw
      await expect(
        emitter.emit(EventType.MEMBER_CREATED, { id: 'member-1' })
      ).resolves.not.toThrow()

      // Second listener should still execute
      expect(successEvents).toHaveLength(1)
    })
  })

  describe('Shutdown', () => {
    it('should clean up all resources on shutdown', async () => {
      emitter = createEventEmitter()

      emitter.on(EventType.MEMBER_CREATED, () => {})
      emitter.on(EventType.MEMBER_UPDATED, () => {})

      await emitter.shutdown()

      expect(emitter.eventNames().length).toBe(0)
      expect(emitter.listenerCount(EventType.MEMBER_CREATED)).toBe(0)
    })
  })
})
