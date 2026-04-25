/**
 * Standalone WebSocket Server
 *
 * Runs a separate WebSocket server for real-time communication.
 * This server runs independently from Next.js and handles WebSocket connections.
 *
 * Usage:
 * ```bash
 * npm run ws:server
 * # or
 * tsx scripts/websocket-server.ts
 * ```
 *
 * Environment variables:
 * - WS_PORT: WebSocket server port (default: 3001)
 * - WS_HOST: WebSocket server host (default: 0.0.0.0)
 *
 * @module scripts/websocket-server
 */

import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { getWebSocketManager } from '../lib/realtime/websocket-manager'
import { getEventEmitter } from '../lib/realtime/event-emitter'

const PORT = parseInt(process.env.WS_PORT || '3001', 10)
const HOST = process.env.WS_HOST || '0.0.0.0'

/**
 * Verify authentication token
 *
 * @param token - JWT or API token
 * @returns User info or null
 */
async function verifyToken(token: string): Promise<{ userId: string } | null> {
  // TODO: Implement real token verification
  // For now, accept any token and extract userId from it
  try {
    // Example: token format "user_123"
    if (token.startsWith('user_')) {
      return { userId: token }
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * Start WebSocket server
 */
async function startServer() {
  console.log('🚀 Starting WebSocket server...')

  // Create HTTP server
  const server = createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date() }))
      return
    }

    // Stats endpoint
    if (req.url === '/stats') {
      const wsManager = getWebSocketManager()
      const stats = wsManager.getStats()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(stats, null, 2))
      return
    }

    res.writeHead(404)
    res.end('Not Found')
  })

  // Create WebSocket server
  const wss = new WebSocketServer({ server })

  // Get WebSocket manager
  const wsManager = getWebSocketManager({
    heartbeatInterval: 30000,
    clientTimeout: 60000,
    maxClients: 1000,
    requireAuth: false, // Set to true in production
    verifyToken,
  })

  // Handle WebSocket connections
  wss.on('connection', async (socket, request) => {
    await wsManager.handleConnection(socket, request)
  })

  // Handle server errors
  wss.on('error', error => {
    console.error('WebSocket server error:', error)
  })

  // Start listening
  server.listen(PORT, HOST, () => {
    console.log(`✅ WebSocket server listening on ws://${HOST}:${PORT}`)
    console.log(`📊 Stats available at http://${HOST}:${PORT}/stats`)
    console.log(`💚 Health check at http://${HOST}:${PORT}/health`)
  })

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down WebSocket server...')

    // Stop accepting new connections
    wss.close()

    // Shutdown managers
    await wsManager.shutdown()

    // Close HTTP server
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })

    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('⚠️ Forced shutdown after timeout')
      process.exit(1)
    }, 10000)
  }

  // Handle signals
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)

  return { server, wss, wsManager }
}

// Start server if run directly
if (require.main === module) {
  startServer().catch(error => {
    console.error('Failed to start WebSocket server:', error)
    process.exit(1)
  })
}

export { startServer }
