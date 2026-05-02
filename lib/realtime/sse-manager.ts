/**
 * Server-Sent Events (SSE) Manager
 *
 * Manages SSE connections for real-time unidirectional (server → client) communication.
 *
 * Features:
 * - Client connection management
 * - Event streaming
 * - Automatic reconnection support
 * - Connection lifecycle management
 * - Memory-efficient streaming
 *
 * Advantages over WebSocket:
 * - Simpler implementation
 * - Automatic reconnection
 * - HTTP/2 compatible
 * - Lower overhead for one-way communication
 *
 * @module lib/realtime/sse-manager
 */

import type { NextResponse } from 'next/server'
import { info, error as logError } from '@/lib/logging'
import { getEventEmitter, type EventPayload } from './event-emitter'
import {
  getSubscriptionManager,
  ConnectionType,
  type SubscriptionFilter,
} from './subscription-manager'

/**
 * SSE client info
 */
interface SSEClient {
  id: string
  controller: ReadableStreamDefaultController
  encoder: TextEncoder
  userId?: string
  connectedAt: Date
  lastMessageAt: Date
  isClosed: boolean
}

/**
 * SSE manager options
 */
export interface SSEManagerOptions {
  keepAliveInterval?: number
  clientTimeout?: number
  maxClients?: number
}

/**
 * SSE message format
 */
export interface SSEMessage {
  id?: string
  event?: string
  data: any
  retry?: number
}

/**
 * SSE Manager
 *
 * Manages Server-Sent Events connections and event streaming.
 */
export class SSEManager {
  private clients: Map<string, SSEClient>
  private eventEmitter = getEventEmitter()
  private subscriptionManager = getSubscriptionManager()
  private keepAliveInterval: NodeJS.Timeout | null = null
  private clientIdCounter = 0

  private options: Required<SSEManagerOptions>

  constructor(options: SSEManagerOptions = {}) {
    this.clients = new Map()
    this.options = {
      keepAliveInterval: options.keepAliveInterval ?? 30000, // 30 seconds
      clientTimeout: options.clientTimeout ?? 300000, // 5 minutes
      maxClients: options.maxClients ?? 1000, // ?? not || (allow 0 for testing)
    }
  }

  /**
   * Initialize SSE manager
   */
  initialize(): void {
    // Start keep-alive sender
    this.startKeepAlive()

    // Subscribe to all events for broadcasting
    this.eventEmitter.on('*', async payload => {
      await this.broadcastEvent(payload)
    })
  }

  /**
   * Create SSE stream for a client
   *
   * @param filter - Subscription filter
   * @param userId - Optional user ID
   * @returns ReadableStream for SSE
   */
  createStream(filter?: SubscriptionFilter, userId?: string): ReadableStream {
    // Check max clients limit
    if (this.clients.size >= this.options.maxClients) {
      throw new Error('Max clients limit reached')
    }

    const clientId = this.generateClientId()
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start: controller => {
        // Create client object
        const client: SSEClient = {
          id: clientId,
          controller,
          encoder,
          userId,
          connectedAt: new Date(),
          lastMessageAt: new Date(),
          isClosed: false,
        }

        // Store client
        this.clients.set(clientId, client)

        // Subscribe to events
        this.subscriptionManager.subscribe(clientId, ConnectionType.SSE, {
          ...filter,
          userId,
        })

        // Send initial connection message
        this.sendToClient(client, {
          event: 'connected',
          data: {
            clientId,
            timestamp: new Date(),
          },
        })

        info(`SSE client connected: ${clientId} (total: ${this.clients.size})`)
      },

      cancel: () => {
        this.handleDisconnect(clientId)
      },
    })

    return stream
  }

  /**
   * Send message to a specific client
   *
   * @param client - Client info
   * @param message - SSE message
   */
  private sendToClient(client: SSEClient, message: SSEMessage): void {
    if (client.isClosed) {
      return
    }

    try {
      const formatted = this.formatSSEMessage(message)
      client.controller.enqueue(client.encoder.encode(formatted))
      client.lastMessageAt = new Date()
    } catch (error) {
      logError(
        `Failed to send to SSE client ${client.id}`,
        error instanceof Error ? error : undefined
      )
      this.handleDisconnect(client.id)
    }
  }

  /**
   * Broadcast event to subscribed clients
   *
   * @param payload - Event payload
   */
  private async broadcastEvent(payload: EventPayload): Promise<void> {
    // Get clients subscribed to this event type
    const subscribedClients = this.subscriptionManager.getClientsByEventType(payload.type)

    let successCount = 0
    let errorCount = 0

    for (const clientId of subscribedClients) {
      const client = this.clients.get(clientId)
      if (!client) continue

      // Check if client should receive this event
      if (!this.subscriptionManager.shouldReceiveEvent(clientId, payload)) {
        continue
      }

      // Send event to client
      try {
        this.sendToClient(client, {
          event: payload.type,
          data: payload,
        })
        successCount++
      } catch (error) {
        logError(
          `Failed to send event to SSE client ${clientId}`,
          error instanceof Error ? error : undefined
        )
        errorCount++
      }
    }

    if (successCount > 0 || errorCount > 0) {
      info(`Broadcast event ${payload.type}: ${successCount} sent, ${errorCount} failed`)
    }
  }

  /**
   * Format message according to SSE protocol
   *
   * @param message - SSE message
   * @returns Formatted SSE message string
   */
  private formatSSEMessage(message: SSEMessage): string {
    let formatted = ''

    if (message.id) {
      formatted += `id: ${message.id}\n`
    }

    if (message.event) {
      formatted += `event: ${message.event}\n`
    }

    if (message.retry) {
      formatted += `retry: ${message.retry}\n`
    }

    // Data can be multi-line
    const dataString =
      typeof message.data === 'string' ? message.data : JSON.stringify(message.data)

    const dataLines = dataString.split('\n')
    for (const line of dataLines) {
      formatted += `data: ${line}\n`
    }

    // Double newline marks end of message
    formatted += '\n'

    return formatted
  }

  /**
   * Send keep-alive to all clients
   */
  private sendKeepAlive(): void {
    const now = Date.now()
    const disconnectList: string[] = []

    for (const [clientId, client] of this.clients) {
      // Check if client timed out
      const idleTime = now - client.lastMessageAt.getTime()
      if (idleTime > this.options.clientTimeout) {
        disconnectList.push(clientId)
        continue
      }

      // Send keep-alive comment (keeps connection open)
      try {
        client.controller.enqueue(client.encoder.encode(': keep-alive\n\n'))
      } catch (error) {
        disconnectList.push(clientId)
      }
    }

    // Disconnect inactive clients
    for (const clientId of disconnectList) {
      info(`Disconnecting inactive SSE client: ${clientId}`)
      this.handleDisconnect(clientId)
    }
  }

  /**
   * Start keep-alive interval
   */
  private startKeepAlive(): void {
    this.keepAliveInterval = setInterval(() => {
      this.sendKeepAlive()
    }, this.options.keepAliveInterval)
  }

  /**
   * Handle client disconnect
   *
   * @param clientId - Client ID
   */
  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId)
    if (!client) return

    // Mark as closed
    client.isClosed = true

    // Close the stream
    try {
      client.controller.close()
    } catch (error) {
      // Already closed
    }

    // Remove subscription
    this.subscriptionManager.unsubscribe(clientId)

    // Remove client
    this.clients.delete(clientId)

    info(`SSE client disconnected: ${clientId} (total: ${this.clients.size})`)
  }

  /**
   * Generate unique client ID
   *
   * @returns Client ID
   */
  private generateClientId(): string {
    return `sse_${Date.now()}_${++this.clientIdCounter}`
  }

  /**
   * Get connected client count
   *
   * @returns Number of connected clients
   */
  getClientCount(): number {
    return this.clients.size
  }

  /**
   * Get manager statistics
   *
   * @returns Manager statistics
   */
  getStats() {
    const subscriptionStats = this.subscriptionManager.getStats()

    return {
      connectedClients: this.clients.size,
      subscriptions: subscriptionStats,
    }
  }

  /**
   * Shutdown SSE manager
   */
  async shutdown(): Promise<void> {
    // Stop keep-alive
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval)
      this.keepAliveInterval = null
    }

    // Close all client connections
    for (const clientId of Array.from(this.clients.keys())) {
      this.handleDisconnect(clientId)
    }

    info('SSE manager shutdown complete')
  }
}

/**
 * Global SSE manager instance (singleton)
 */
let globalSSEManager: SSEManager | null = null

/**
 * Get or create global SSE manager instance
 *
 * @param options - SSE manager options
 * @returns Global SSE manager instance
 */
export function getSSEManager(options?: SSEManagerOptions): SSEManager {
  if (!globalSSEManager) {
    globalSSEManager = new SSEManager(options)
    globalSSEManager.initialize()
  }
  return globalSSEManager
}

/**
 * Create a new SSE manager instance
 *
 * @param options - SSE manager options
 * @returns New SSE manager instance
 */
export function createSSEManager(options?: SSEManagerOptions): SSEManager {
  const manager = new SSEManager(options)
  manager.initialize()
  return manager
}

/**
 * Helper: Create SSE response
 *
 * Creates a Next.js Response object with proper SSE headers.
 *
 * @param stream - ReadableStream
 * @returns Next.js Response
 */
export function createSSEResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
