/**
 * Real-time Module
 *
 * Exports all real-time components for easy importing.
 *
 * @module lib/realtime
 */

// Event Emitter
export {
  AppEventEmitter,
  EventType,
  getEventEmitter,
  createEventEmitter,
  createEventPayload,
  type EventPayload,
  type EventListener,
  type Subscription,
  type EventFilter,
  type EventEmitterOptions,
} from './event-emitter';

// Subscription Manager
export {
  SubscriptionManager,
  ConnectionType,
  getSubscriptionManager,
  createSubscriptionManager,
  type ClientSubscription,
  type SubscriptionFilter,
} from './subscription-manager';

// WebSocket Manager
export {
  WebSocketManager,
  WSMessageType,
  getWebSocketManager,
  createWebSocketManager,
  type WSMessage,
  type WebSocketManagerOptions,
} from './websocket-manager';

// SSE Manager
export {
  SSEManager,
  getSSEManager,
  createSSEManager,
  createSSEResponse,
  type SSEMessage,
  type SSEManagerOptions,
} from './sse-manager';
