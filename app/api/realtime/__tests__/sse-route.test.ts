/**
 * SSE API Route Integration Tests
 *
 * @jest-environment node
 *
 * Uses Node test env to access Web Streams (Request, ReadableStream, TextEncoder)
 * required by SSE route handler. jsdom env does not provide these globals.
 *
 * Comprehensive tests for the Server-Sent Events API endpoint.
 *
 * Test Coverage:
 * - Stream creation with query parameters
 * - Authentication and authorization
 * - Event type filtering
 * - Response headers and format
 * - Error handling
 * - User ID association
 */

import { NextRequest } from 'next/server'
import { GET } from '../sse/route'
import { getSSEManager, createSSEResponse } from '@/lib/realtime/sse-manager'
import { EventType } from '@/lib/realtime/event-emitter'

// Mock the SSE manager
jest.mock('@/lib/realtime/sse-manager', () => ({
  getSSEManager: jest.fn(),
  createSSEResponse: jest.fn(),
}))

// Mock authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

const mockGetSSEManager = getSSEManager as jest.MockedFunction<typeof getSSEManager>
const mockCreateSSEResponse = createSSEResponse as jest.MockedFunction<typeof createSSEResponse>

describe('SSE API Route', () => {
  let mockManager: any
  let mockStream: ReadableStream

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Create mock stream
    mockStream = new ReadableStream({
      start(controller) {
        controller.close()
      },
    })

    // Create mock manager
    mockManager = {
      createStream: jest.fn().mockReturnValue(mockStream),
      getClientCount: jest.fn().mockReturnValue(0),
      getStats: jest.fn().mockReturnValue({
        connectedClients: 0,
        subscriptions: { total: 0, byEventType: {} },
      }),
    }

    mockGetSSEManager.mockReturnValue(mockManager)

    // Mock createSSEResponse to return a proper Response
    mockCreateSSEResponse.mockImplementation(stream => {
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })
    })
  })

  describe('Stream Creation', () => {
    it('should create SSE stream with default wildcard subscription', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith({ eventTypes: ['*'] }, undefined)
      expect(mockCreateSSEResponse).toHaveBeenCalledWith(mockStream)
      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    })

    it('should create SSE stream with specific event types', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=member:created,member:updated'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        {
          eventTypes: [EventType.MEMBER_CREATED, EventType.MEMBER_UPDATED],
        },
        undefined
      )
      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    })

    it('should create SSE stream with wildcard event types', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse?eventTypes=member:*')

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith({ eventTypes: ['member:*'] }, undefined)
    })

    it('should create SSE stream with multiple wildcard types', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=member:*,artist:*'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        { eventTypes: ['member:*', 'artist:*'] },
        undefined
      )
    })

    it('should trim whitespace from event types', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes= member:created , member:updated '
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        {
          eventTypes: [EventType.MEMBER_CREATED, EventType.MEMBER_UPDATED],
        },
        undefined
      )
    })
  })

  describe('Response Headers', () => {
    it('should set correct SSE headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      const response = await GET(request)

      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
      expect(response.headers.get('Cache-Control')).toBe('no-cache')
      expect(response.headers.get('Connection')).toBe('keep-alive')
      expect(response.headers.get('X-Accel-Buffering')).toBe('no')
    })

    it('should return status 200', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      const response = await GET(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Authentication', () => {
    it('should pass user ID to stream when authenticated', async () => {
      // Mock Clerk auth
      const { auth } = require('@clerk/nextjs/server')
      ;(auth as jest.Mock).mockReturnValue({ userId: 'user-123' })

      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith({ eventTypes: ['*'] }, 'user-123')
    })

    it('should work without authentication', async () => {
      // Mock Clerk auth returning no user
      const { auth } = require('@clerk/nextjs/server')
      ;(auth as jest.Mock).mockReturnValue({ userId: null })

      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith({ eventTypes: ['*'] }, undefined)
      expect(response.status).toBe(200)
    })

    it('should accept token from query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse?token=test-token')

      const response = await GET(request)

      // Token verification would be handled by Clerk middleware
      expect(response.status).toBe(200)
    })
  })

  describe('Event Type Filtering', () => {
    it('should filter by single event type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=member:created'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        { eventTypes: [EventType.MEMBER_CREATED] },
        undefined
      )
    })

    it('should filter by multiple event types', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=member:created,artist:created,artwork:created'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        {
          eventTypes: [
            EventType.MEMBER_CREATED,
            EventType.ARTIST_CREATED,
            EventType.ARTWORK_CREATED,
          ],
        },
        undefined
      )
    })

    it('should support exhibition event types', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=exhibition:created,exhibition:published'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        {
          eventTypes: [EventType.EXHIBITION_CREATED, EventType.EXHIBITION_PUBLISHED],
        },
        undefined
      )
    })

    it('should support event event types', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=event:created,event:updated'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        {
          eventTypes: [EventType.EVENT_CREATED, EventType.EVENT_UPDATED],
        },
        undefined
      )
    })

    it('should support system event types', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=system:error,system:warning'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        {
          eventTypes: [EventType.SYSTEM_ERROR, EventType.SYSTEM_WARNING],
        },
        undefined
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle stream creation errors', async () => {
      mockManager.createStream.mockImplementation(() => {
        throw new Error('Stream creation failed')
      })

      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      await expect(GET(request)).rejects.toThrow('Stream creation failed')
    })

    it('should handle invalid event types gracefully', async () => {
      // Invalid event types should still create stream with those strings
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=invalid:type'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        { eventTypes: ['invalid:type'] },
        undefined
      )
    })

    it('should handle empty event types parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse?eventTypes=')

      const response = await GET(request)

      // Empty string should default to wildcard
      expect(mockManager.createStream).toHaveBeenCalledWith({ eventTypes: ['*'] }, undefined)
    })

    it('should handle malformed query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=member:created&eventTypes=artist:created'
      )

      const response = await GET(request)

      // Should only use the first eventTypes parameter
      expect(mockManager.createStream).toHaveBeenCalled()
      expect(response.status).toBe(200)
    })
  })

  describe('Integration Scenarios', () => {
    it('should create stream with authentication and filtering', async () => {
      const { auth } = require('@clerk/nextjs/server')
      ;(auth as jest.Mock).mockReturnValue({ userId: 'user-123' })

      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=member:*,artist:*'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        { eventTypes: ['member:*', 'artist:*'] },
        'user-123'
      )
      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    })

    it('should handle multiple query parameters', async () => {
      const { auth } = require('@clerk/nextjs/server')
      ;(auth as jest.Mock).mockReturnValue({ userId: 'user-456' })

      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=member:created&token=test-token'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        { eventTypes: [EventType.MEMBER_CREATED] },
        'user-456'
      )
    })

    it('should work with all event type categories', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/realtime/sse?eventTypes=member:created,artist:updated,artwork:approved,exhibition:published,event:cancelled,system:error'
      )

      const response = await GET(request)

      expect(mockManager.createStream).toHaveBeenCalledWith(
        {
          eventTypes: [
            EventType.MEMBER_CREATED,
            EventType.ARTIST_UPDATED,
            EventType.ARTWORK_APPROVED,
            EventType.EXHIBITION_PUBLISHED,
            EventType.EVENT_CANCELLED,
            EventType.SYSTEM_ERROR,
          ],
        },
        undefined
      )
    })
  })

  describe('Stream Lifecycle', () => {
    it('should return a readable stream', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      const response = await GET(request)

      expect(response.body).toBeDefined()
      expect(response.body).toBeInstanceOf(ReadableStream)
    })

    it('should allow client to read from stream', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      const response = await GET(request)

      // Verify stream is readable
      const reader = response.body?.getReader()
      expect(reader).toBeDefined()

      reader?.releaseLock()
    })
  })

  describe('Manager Integration', () => {
    it('should use singleton SSE manager', async () => {
      const request1 = new NextRequest('http://localhost:3000/api/realtime/sse')
      const request2 = new NextRequest('http://localhost:3000/api/realtime/sse')

      await GET(request1)
      await GET(request2)

      // Should call getSSEManager twice, but return same instance
      expect(mockGetSSEManager).toHaveBeenCalledTimes(2)
    })

    it('should pass filter correctly to manager', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse?eventTypes=member:*')

      await GET(request)

      const createStreamCall = mockManager.createStream.mock.calls[0]
      expect(createStreamCall[0]).toEqual({ eventTypes: ['member:*'] })
    })

    it('should pass userId correctly to manager', async () => {
      const { auth } = require('@clerk/nextjs/server')
      ;(auth as jest.Mock).mockReturnValue({ userId: 'test-user' })

      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      await GET(request)

      const createStreamCall = mockManager.createStream.mock.calls[0]
      expect(createStreamCall[1]).toBe('test-user')
    })
  })

  describe('Performance', () => {
    it('should create stream quickly', async () => {
      const request = new NextRequest('http://localhost:3000/api/realtime/sse')

      const startTime = Date.now()
      await GET(request)
      const endTime = Date.now()

      // Should complete in less than 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle concurrent requests', async () => {
      const requests = Array.from(
        { length: 10 },
        () => new NextRequest('http://localhost:3000/api/realtime/sse')
      )

      const responses = await Promise.all(requests.map(req => GET(req)))

      expect(responses).toHaveLength(10)
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.headers.get('Content-Type')).toBe('text/event-stream')
      })
    })
  })
})
