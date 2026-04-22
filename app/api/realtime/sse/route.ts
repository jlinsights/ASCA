/**
 * Server-Sent Events (SSE) API Endpoint
 *
 * Provides real-time event streaming via SSE.
 *
 * GET /api/realtime/sse
 *
 * Query parameters:
 * - eventTypes: Comma-separated list of event types to subscribe to (optional)
 * - token: Authentication token (optional)
 *
 * Example usage:
 * ```typescript
 * const eventSource = new EventSource('/api/realtime/sse?eventTypes=member:created,member:updated');
 *
 * eventSource.addEventListener('member:created', (event) => {
 *   const data = JSON.parse(event.data);
 *   console.log('Member created:', data);
 * });
 *
 * eventSource.addEventListener('connected', (event) => {
 *   console.log('Connected to SSE');
 * });
 * ```
 *
 * @module app/api/realtime/sse
 */

import { NextRequest } from 'next/server'
import { getSSEManager, createSSEResponse } from '@/lib/realtime/sse-manager'
import { EventType } from '@/lib/realtime/event-emitter'
import { error as logError } from '@/lib/logging'

/**
 * GET /api/realtime/sse
 *
 * Create SSE connection
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const eventTypesParam = searchParams.get('eventTypes')
    const token = searchParams.get('token')

    // Parse event types
    const eventTypes = eventTypesParam ? eventTypesParam.split(',').map(type => type.trim()) : ['*']

    // Verify token (optional - implement your auth logic)
    let userId: string | undefined
    if (token) {
      // TODO: Implement token verification
      // const authResult = await verifyToken(token);
      // userId = authResult?.userId;
    }

    // Get SSE manager
    const sseManager = getSSEManager()

    // Create SSE stream
    const stream = sseManager.createStream(
      {
        eventTypes,
      },
      userId
    )

    // Return SSE response
    return createSSEResponse(stream)
  } catch (error) {
    logError('SSE connection error', error instanceof Error ? error : undefined)

    // Return error as SSE stream
    const errorStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ error: 'Failed to establish SSE connection' })}\n\n`
          )
        )
        controller.close()
      },
    })

    return createSSEResponse(errorStream)
  }
}

/**
 * Runtime configuration
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
