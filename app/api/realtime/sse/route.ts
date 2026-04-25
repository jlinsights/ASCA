/**
 * Server-Sent Events (SSE) API Endpoint
 *
 * Provides real-time event streaming via SSE. Authentication is enforced
 * via Clerk session cookie (server-side). Anonymous connections are rejected
 * with 401.
 *
 * GET /api/realtime/sse
 *
 * Query parameters:
 * - eventTypes: Comma-separated list of event types to subscribe to (optional)
 *
 * Example usage:
 * ```typescript
 * // Browser: cookie auto-sent. Pass `withCredentials: true` if needed.
 * const eventSource = new EventSource('/api/realtime/sse?eventTypes=member:created');
 *
 * eventSource.addEventListener('member:created', (event) => {
 *   const data = JSON.parse(event.data);
 *   console.log('Member created:', data);
 * });
 * ```
 *
 * @module app/api/realtime/sse
 */

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSSEManager, createSSEResponse } from '@/lib/realtime/sse-manager'
import { error as logError } from '@/lib/logging'

/**
 * GET /api/realtime/sse
 *
 * Create SSE connection (Clerk session required)
 */
export async function GET(request: NextRequest) {
  try {
    // Enforce Clerk session (cookie-based)
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const eventTypesParam = searchParams.get('eventTypes')

    // Parse event types
    const eventTypes = eventTypesParam ? eventTypesParam.split(',').map(type => type.trim()) : ['*']

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
