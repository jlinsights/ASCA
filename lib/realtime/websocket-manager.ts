/**
 * WebSocket Manager
 *
 * Manages WebSocket connections for real-time bidirectional communication.
 *
 * Features:
 * - Client connection management
 * - Event broadcasting
 * - Authentication support
 * - Heartbeat/ping-pong
 * - Automatic reconnection handling
 * - Message validation
 *
 * @module lib/realtime/websocket-manager
 */

import type { IncomingMessage } from 'http';
import type { WebSocket as WSType } from 'ws';
import { getEventEmitter, EventType, type EventPayload } from './event-emitter';
import {
  getSubscriptionManager,
  ConnectionType,
  type SubscriptionFilter,
} from './subscription-manager';

/**
 * WebSocket message types
 */
export enum WSMessageType {
  // Client → Server
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  PING = 'ping',
  AUTH = 'auth',

  // Server → Client
  EVENT = 'event',
  PONG = 'pong',
  ERROR = 'error',
  AUTHENTICATED = 'authenticated',
  SUBSCRIBED = 'subscribed',
  UNSUBSCRIBED = 'unsubscribed',
}

/**
 * WebSocket message structure
 */
export interface WSMessage {
  type: WSMessageType;
  payload?: any;
  timestamp?: Date;
}

/**
 * WebSocket client info
 */
interface WSClient {
  id: string;
  socket: WSType;
  userId?: string;
  isAuthenticated: boolean;
  isAlive: boolean;
  connectedAt: Date;
  lastMessageAt: Date;
}

/**
 * WebSocket manager options
 */
export interface WebSocketManagerOptions {
  heartbeatInterval?: number;
  clientTimeout?: number;
  maxClients?: number;
  requireAuth?: boolean;
  verifyToken?: (token: string) => Promise<{ userId: string } | null>;
}

/**
 * WebSocket Manager
 *
 * Manages WebSocket connections and event broadcasting.
 */
export class WebSocketManager {
  private clients: Map<string, WSClient>;
  private eventEmitter = getEventEmitter();
  private subscriptionManager = getSubscriptionManager();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private clientIdCounter = 0;

  private options: Required<WebSocketManagerOptions>;

  constructor(options: WebSocketManagerOptions = {}) {
    this.clients = new Map();
    this.options = {
      heartbeatInterval: options.heartbeatInterval || 30000, // 30 seconds
      clientTimeout: options.clientTimeout || 60000, // 60 seconds
      maxClients: options.maxClients || 1000,
      requireAuth: options.requireAuth || false,
      verifyToken: options.verifyToken || (async () => null),
    };
  }

  /**
   * Initialize WebSocket manager
   */
  initialize(): void {
    // Start heartbeat checker
    this.startHeartbeat();

    // Subscribe to all events for broadcasting
    this.eventEmitter.on('*', async (payload) => {
      await this.broadcastEvent(payload);
    });
  }

  /**
   * Handle new WebSocket connection
   *
   * @param socket - WebSocket instance
   * @param request - HTTP request
   */
  async handleConnection(socket: WSType, request: IncomingMessage): Promise<void> {
    // Check max clients limit
    if (this.clients.size >= this.options.maxClients) {
      this.sendError(socket, 'Max clients limit reached');
      socket.close(1008, 'Max clients limit reached');
      return;
    }

    // Generate client ID
    const clientId = this.generateClientId();

    // Create client object
    const client: WSClient = {
      id: clientId,
      socket,
      userId: undefined,
      isAuthenticated: !this.options.requireAuth, // Auto-authenticate if not required
      isAlive: true,
      connectedAt: new Date(),
      lastMessageAt: new Date(),
    };

    // Store client
    this.clients.set(clientId, client);

    // Setup socket event handlers
    this.setupSocketHandlers(client);

    // Subscribe to all events by default (can be customized later)
    if (client.isAuthenticated) {
      this.subscriptionManager.subscribe(clientId, ConnectionType.WEBSOCKET, {
        eventTypes: ['*'],
      });
    }

    console.log(`WebSocket client connected: ${clientId} (total: ${this.clients.size})`);
  }

  /**
   * Setup WebSocket event handlers
   *
   * @param client - Client info
   */
  private setupSocketHandlers(client: WSClient): void {
    const { socket, id } = client;

    // Handle incoming messages
    socket.on('message', async (data) => {
      try {
        const message = this.parseMessage(data);
        await this.handleMessage(client, message);
      } catch (error) {
        this.sendError(socket, 'Invalid message format');
      }
    });

    // Handle pong (heartbeat response)
    socket.on('pong', () => {
      client.isAlive = true;
      client.lastMessageAt = new Date();
    });

    // Handle close
    socket.on('close', () => {
      this.handleDisconnect(id);
    });

    // Handle error
    socket.on('error', (error) => {
      console.error(`WebSocket error for client ${id}:`, error);
      this.handleDisconnect(id);
    });
  }

  /**
   * Handle incoming message
   *
   * @param client - Client info
   * @param message - WebSocket message
   */
  private async handleMessage(client: WSClient, message: WSMessage): Promise<void> {
    const { socket, id, isAuthenticated } = client;

    // Update last message time
    client.lastMessageAt = new Date();

    switch (message.type) {
      case WSMessageType.AUTH:
        await this.handleAuth(client, message.payload);
        break;

      case WSMessageType.SUBSCRIBE:
        if (!isAuthenticated) {
          this.sendError(socket, 'Authentication required');
          return;
        }
        this.handleSubscribe(client, message.payload);
        break;

      case WSMessageType.UNSUBSCRIBE:
        if (!isAuthenticated) {
          this.sendError(socket, 'Authentication required');
          return;
        }
        this.handleUnsubscribe(client, message.payload);
        break;

      case WSMessageType.PING:
        this.send(socket, { type: WSMessageType.PONG });
        break;

      default:
        this.sendError(socket, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle authentication
   *
   * @param client - Client info
   * @param payload - Auth payload containing token
   */
  private async handleAuth(client: WSClient, payload: any): Promise<void> {
    const { socket, id } = client;

    try {
      const { token } = payload;
      if (!token) {
        this.sendError(socket, 'Token required');
        return;
      }

      // Verify token
      const authResult = await this.options.verifyToken(token);
      if (!authResult) {
        this.sendError(socket, 'Invalid token');
        socket.close(1008, 'Authentication failed');
        return;
      }

      // Update client
      client.userId = authResult.userId;
      client.isAuthenticated = true;

      // Subscribe to all events by default
      this.subscriptionManager.subscribe(id, ConnectionType.WEBSOCKET, {
        eventTypes: ['*'],
        userId: authResult.userId,
      });

      // Send success response
      this.send(socket, {
        type: WSMessageType.AUTHENTICATED,
        payload: { userId: authResult.userId },
      });

      console.log(`Client ${id} authenticated as user ${authResult.userId}`);
    } catch (error) {
      console.error(`Authentication error for client ${id}:`, error);
      this.sendError(socket, 'Authentication failed');
      socket.close(1008, 'Authentication failed');
    }
  }

  /**
   * Handle subscribe message
   *
   * @param client - Client info
   * @param payload - Subscribe payload
   */
  private handleSubscribe(client: WSClient, payload: any): void {
    const { socket, id, userId } = client;

    try {
      const { eventTypes } = payload as { eventTypes?: string[] };

      const filter: SubscriptionFilter = {
        eventTypes: eventTypes || ['*'],
        userId,
      };

      this.subscriptionManager.subscribe(id, ConnectionType.WEBSOCKET, filter);

      this.send(socket, {
        type: WSMessageType.SUBSCRIBED,
        payload: { eventTypes: filter.eventTypes },
      });

      console.log(`Client ${id} subscribed to:`, filter.eventTypes);
    } catch (error) {
      this.sendError(socket, 'Invalid subscribe payload');
    }
  }

  /**
   * Handle unsubscribe message
   *
   * @param client - Client info
   * @param payload - Unsubscribe payload
   */
  private handleUnsubscribe(client: WSClient, payload: any): void {
    const { socket, id } = client;

    this.subscriptionManager.unsubscribe(id);

    this.send(socket, {
      type: WSMessageType.UNSUBSCRIBED,
    });

    console.log(`Client ${id} unsubscribed`);
  }

  /**
   * Handle client disconnect
   *
   * @param clientId - Client ID
   */
  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove subscription
    this.subscriptionManager.unsubscribe(clientId);

    // Remove client
    this.clients.delete(clientId);

    console.log(`WebSocket client disconnected: ${clientId} (total: ${this.clients.size})`);
  }

  /**
   * Broadcast event to subscribed clients
   *
   * @param payload - Event payload
   */
  private async broadcastEvent(payload: EventPayload): Promise<void> {
    // Get clients subscribed to this event type
    const subscribedClients = this.subscriptionManager.getClientsByEventType(payload.type);

    let successCount = 0;
    let errorCount = 0;

    for (const clientId of subscribedClients) {
      const client = this.clients.get(clientId);
      if (!client) continue;

      // Check if client should receive this event
      if (!this.subscriptionManager.shouldReceiveEvent(clientId, payload)) {
        continue;
      }

      // Send event to client
      try {
        this.send(client.socket, {
          type: WSMessageType.EVENT,
          payload,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send event to client ${clientId}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0 || errorCount > 0) {
      console.log(
        `Broadcast event ${payload.type}: ${successCount} sent, ${errorCount} failed`
      );
    }
  }

  /**
   * Send message to client
   *
   * @param socket - WebSocket instance
   * @param message - Message to send
   */
  private send(socket: WSType, message: WSMessage): void {
    if (socket.readyState !== 1) {
      // WebSocket.OPEN
      return;
    }

    socket.send(
      JSON.stringify({
        ...message,
        timestamp: new Date(),
      })
    );
  }

  /**
   * Send error message to client
   *
   * @param socket - WebSocket instance
   * @param error - Error message
   */
  private sendError(socket: WSType, error: string): void {
    this.send(socket, {
      type: WSMessageType.ERROR,
      payload: { error },
    });
  }

  /**
   * Parse incoming message
   *
   * @param data - Raw message data
   * @returns Parsed message
   */
  private parseMessage(data: any): WSMessage {
    const raw = data.toString();
    const parsed = JSON.parse(raw);

    if (!parsed.type) {
      throw new Error('Message type required');
    }

    return parsed as WSMessage;
  }

  /**
   * Start heartbeat checker
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeat();
    }, this.options.heartbeatInterval);
  }

  /**
   * Check client heartbeats
   */
  private checkHeartbeat(): void {
    const now = Date.now();
    const disconnectList: string[] = [];

    for (const [clientId, client] of this.clients) {
      // Check if client is alive
      if (!client.isAlive) {
        disconnectList.push(clientId);
        continue;
      }

      // Check timeout
      const idleTime = now - client.lastMessageAt.getTime();
      if (idleTime > this.options.clientTimeout) {
        disconnectList.push(clientId);
        continue;
      }

      // Send ping
      client.isAlive = false;
      client.socket.ping();
    }

    // Disconnect inactive clients
    for (const clientId of disconnectList) {
      const client = this.clients.get(clientId);
      if (client) {
        console.log(`Disconnecting inactive client: ${clientId}`);
        client.socket.terminate();
        this.handleDisconnect(clientId);
      }
    }
  }

  /**
   * Generate unique client ID
   *
   * @returns Client ID
   */
  private generateClientId(): string {
    return `ws_${Date.now()}_${++this.clientIdCounter}`;
  }

  /**
   * Get connected client count
   *
   * @returns Number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get manager statistics
   *
   * @returns Manager statistics
   */
  getStats() {
    const subscriptionStats = this.subscriptionManager.getStats();

    return {
      connectedClients: this.clients.size,
      authenticatedClients: Array.from(this.clients.values()).filter(
        (c) => c.isAuthenticated
      ).length,
      subscriptions: subscriptionStats,
    };
  }

  /**
   * Shutdown WebSocket manager
   */
  async shutdown(): Promise<void> {
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close all client connections
    for (const client of this.clients.values()) {
      client.socket.close(1001, 'Server shutting down');
    }

    // Clear clients
    this.clients.clear();

    // Clear subscriptions
    this.subscriptionManager.clear();

    console.log('WebSocket manager shutdown complete');
  }
}

/**
 * Global WebSocket manager instance (singleton)
 */
let globalWebSocketManager: WebSocketManager | null = null;

/**
 * Get or create global WebSocket manager instance
 *
 * @param options - WebSocket manager options
 * @returns Global WebSocket manager instance
 */
export function getWebSocketManager(
  options?: WebSocketManagerOptions
): WebSocketManager {
  if (!globalWebSocketManager) {
    globalWebSocketManager = new WebSocketManager(options);
    globalWebSocketManager.initialize();
  }
  return globalWebSocketManager;
}

/**
 * Create a new WebSocket manager instance
 *
 * @param options - WebSocket manager options
 * @returns New WebSocket manager instance
 */
export function createWebSocketManager(
  options?: WebSocketManagerOptions
): WebSocketManager {
  const manager = new WebSocketManager(options);
  manager.initialize();
  return manager;
}
