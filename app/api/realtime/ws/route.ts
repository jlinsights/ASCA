/**
 * WebSocket API Endpoint
 *
 * Provides real-time bidirectional communication via WebSocket.
 *
 * Note: WebSocket upgrade in Next.js requires custom server setup.
 * This file provides the route configuration. Actual WebSocket handling
 * should be done in a custom server (see scripts/websocket-server.ts).
 *
 * For development with Next.js App Router, consider using:
 * 1. Separate WebSocket server on different port
 * 2. Reverse proxy (nginx) to route WebSocket traffic
 * 3. Third-party WebSocket services (Pusher, Ably, etc.)
 *
 * @module app/api/realtime/ws
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/realtime/ws
 *
 * WebSocket upgrade endpoint
 */
export async function GET(request: NextRequest) {
  // Check if upgrade header is present
  const upgrade = request.headers.get('upgrade');

  if (upgrade !== 'websocket') {
    return NextResponse.json(
      {
        error: 'WebSocket upgrade required',
        message: 'This endpoint requires WebSocket upgrade',
        hint: 'Connect using WebSocket client: new WebSocket("ws://localhost:3000/api/realtime/ws")',
      },
      { status: 426 } // Upgrade Required
    );
  }

  // Note: Next.js App Router doesn't support WebSocket upgrades directly
  // You need to use a custom server or separate WebSocket server

  return NextResponse.json(
    {
      error: 'WebSocket not supported in this configuration',
      message: 'WebSocket requires custom server setup',
      alternatives: [
        'Use Server-Sent Events (SSE) at /api/realtime/sse',
        'Run separate WebSocket server with scripts/websocket-server.ts',
        'Use reverse proxy to route WebSocket traffic',
      ],
    },
    { status: 501 } // Not Implemented
  );
}

/**
 * Runtime configuration
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
