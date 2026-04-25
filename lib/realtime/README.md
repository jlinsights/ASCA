# Real-time Updates System

Complete real-time communication system supporting both WebSocket
(bidirectional) and Server-Sent Events (SSE, unidirectional).

## 📦 Architecture

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  - User interfaces                      │
│  - Event triggers                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Event Emitter                   │
│  - Centralized event system             │
│  - Redis pub/sub support                │
│  - Type-safe events                     │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐ ┌─────────────┐
│  WebSocket  │ │     SSE     │
│   Manager   │ │   Manager   │
└──────┬──────┘ └──────┬──────┘
       │               │
       └───────┬───────┘
               ▼
┌─────────────────────────────────────────┐
│      Subscription Manager               │
│  - Client tracking                      │
│  - Event filtering                      │
│  - Connection lifecycle                 │
└─────────────────────────────────────────┘
```

## 🚀 Features

### Event Emitter

- ✅ Type-safe event definitions
- ✅ Wildcard subscriptions (`member:*`, `*`)
- ✅ Event filtering
- ✅ Redis pub/sub for distributed systems
- ✅ Memory leak prevention
- ✅ Promise-based async support

### WebSocket Manager

- ✅ Bidirectional communication
- ✅ Authentication support
- ✅ Heartbeat/ping-pong
- ✅ Automatic reconnection handling
- ✅ Message validation
- ✅ Connection lifecycle management

### SSE Manager

- ✅ Unidirectional streaming (server → client)
- ✅ Automatic reconnection (browser native)
- ✅ HTTP/2 compatible
- ✅ Keep-alive support
- ✅ Memory-efficient streaming
- ✅ Simpler than WebSocket

### Subscription Manager

- ✅ Client subscription tracking
- ✅ Event type filtering
- ✅ User-based filtering
- ✅ Connection type support (WebSocket/SSE)
- ✅ Activity monitoring
- ✅ Stale connection cleanup

## 📖 Usage Examples

### Server-Side: Emitting Events

```typescript
import { getEventEmitter, EventType } from '@/lib/realtime'

// Get global event emitter
const eventEmitter = getEventEmitter()

// Emit a member created event
await eventEmitter.emit(
  EventType.MEMBER_CREATED,
  {
    id: 'member_123',
    email: 'user@example.com',
    firstName: '홍',
    lastName: '길동',
  },
  {
    userId: 'admin_456',
    source: 'admin-panel',
  }
)

// Emit with wildcard listeners
await eventEmitter.emit(EventType.ARTWORK_APPROVED, {
  artworkId: 'artwork_789',
  title: 'Beautiful Artwork',
})
```

### Server-Side: Subscribing to Events

```typescript
import { getEventEmitter, EventType } from '@/lib/realtime'

const eventEmitter = getEventEmitter()

// Subscribe to specific event
const subscription = eventEmitter.on(
  EventType.MEMBER_CREATED,
  async payload => {
    console.log('New member created:', payload.data)
    // Send welcome email, update analytics, etc.
  }
)

// Subscribe to all member events
eventEmitter.on('member:*', async payload => {
  console.log('Member event:', payload.type, payload.data)
})

// Subscribe to all events
eventEmitter.on('*', async payload => {
  console.log('Event:', payload.type)
})

// Unsubscribe
subscription.unsubscribe()

// Subscribe with filter
eventEmitter.on(
  EventType.MEMBER_UPDATED,
  async payload => {
    console.log('VIP member updated:', payload.data)
  },
  payload => payload.data.membershipLevel === 'VIP' // Filter
)
```

### Client-Side: SSE Connection

```typescript
// Connect to SSE endpoint
const eventSource = new EventSource(
  '/api/realtime/sse?eventTypes=member:created,member:updated'
)

// Listen for connection
eventSource.addEventListener('connected', event => {
  const data = JSON.parse(event.data)
  console.log('Connected to SSE:', data.clientId)
})

// Listen for specific events
eventSource.addEventListener('member:created', event => {
  const data = JSON.parse(event.data)
  console.log('Member created:', data)
  // Update UI
})

eventSource.addEventListener('member:updated', event => {
  const data = JSON.parse(event.data)
  console.log('Member updated:', data)
  // Update UI
})

// Handle errors
eventSource.onerror = error => {
  console.error('SSE error:', error)
}

// Close connection
eventSource.close()
```

### Client-Side: WebSocket Connection

```typescript
// Connect to WebSocket server
const ws = new WebSocket('ws://localhost:3001')

ws.onopen = () => {
  console.log('WebSocket connected')

  // Authenticate (if required)
  ws.send(
    JSON.stringify({
      type: 'auth',
      payload: { token: 'your-auth-token' },
    })
  )

  // Subscribe to events
  ws.send(
    JSON.stringify({
      type: 'subscribe',
      payload: {
        eventTypes: ['member:created', 'artwork:approved'],
      },
    })
  )

  // Send ping
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping' }))
  }, 30000)
}

ws.onmessage = event => {
  const message = JSON.parse(event.data)

  switch (message.type) {
    case 'authenticated':
      console.log('Authenticated:', message.payload)
      break

    case 'subscribed':
      console.log('Subscribed to:', message.payload.eventTypes)
      break

    case 'event':
      console.log('Event received:', message.payload)
      // Update UI
      break

    case 'error':
      console.error('Error:', message.payload.error)
      break
  }
}

ws.onerror = error => {
  console.error('WebSocket error:', error)
}

ws.onclose = () => {
  console.log('WebSocket disconnected')
  // Implement reconnection logic
}
```

### React Hook: useRealtime

```typescript
import { useEffect, useState } from 'react';
import type { EventPayload } from '@/lib/realtime';

export function useRealtime(eventTypes: string[]) {
  const [events, setEvents] = useState<EventPayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to SSE
    const eventSource = new EventSource(
      `/api/realtime/sse?eventTypes=${eventTypes.join(',')}`
    );

    eventSource.addEventListener('connected', () => {
      setIsConnected(true);
    });

    // Listen for all event types
    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event) => {
        const data = JSON.parse(event.data);
        setEvents((prev) => [...prev, data]);
      });
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [eventTypes]);

  return { events, isConnected };
}

// Usage in component
function MemberList() {
  const { events, isConnected } = useRealtime(['member:created', 'member:updated']);

  return (
    <div>
      <div>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      <ul>
        {events.map((event, i) => (
          <li key={i}>
            {event.type}: {JSON.stringify(event.data)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

```bash
# WebSocket Server
WS_PORT=3001
WS_HOST=0.0.0.0

# Redis (optional, for distributed events)
REDIS_URL=redis://localhost:6379
```

### Starting WebSocket Server

```bash
# Development
npm run ws:server

# Production
npm run ws:server:prod

# With tsx directly
tsx scripts/websocket-server.ts
```

### Adding to package.json

```json
{
  "scripts": {
    "ws:server": "tsx watch scripts/websocket-server.ts",
    "ws:server:prod": "tsx scripts/websocket-server.ts"
  }
}
```

## 📊 Event Types

```typescript
export enum EventType {
  // Member events
  MEMBER_CREATED = 'member:created',
  MEMBER_UPDATED = 'member:updated',
  MEMBER_DELETED = 'member:deleted',
  MEMBER_APPROVED = 'member:approved',
  MEMBER_REJECTED = 'member:rejected',

  // Artist events
  ARTIST_CREATED = 'artist:created',
  ARTIST_UPDATED = 'artist:updated',
  ARTIST_APPROVED = 'artist:approved',

  // Artwork events
  ARTWORK_CREATED = 'artwork:created',
  ARTWORK_UPDATED = 'artwork:updated',
  ARTWORK_APPROVED = 'artwork:approved',
  ARTWORK_REJECTED = 'artwork:rejected',

  // Exhibition events
  EXHIBITION_CREATED = 'exhibition:created',
  EXHIBITION_UPDATED = 'exhibition:updated',
  EXHIBITION_PUBLISHED = 'exhibition:published',
  EXHIBITION_CANCELLED = 'exhibition:cancelled',

  // Event events
  EVENT_CREATED = 'event:created',
  EVENT_UPDATED = 'event:updated',
  EVENT_PUBLISHED = 'event:published',
  EVENT_CANCELLED = 'event:cancelled',

  // System events
  SYSTEM_ERROR = 'system:error',
  SYSTEM_WARNING = 'system:warning',
  CACHE_CLEARED = 'cache:cleared',
}
```

## 🎯 When to Use What?

### Use WebSocket when:

- ✅ Bidirectional communication needed
- ✅ Low latency critical
- ✅ Real-time chat/collaboration
- ✅ Gaming or interactive features
- ✅ Complex message protocols

### Use SSE when:

- ✅ Server → client only (one-way)
- ✅ Browser compatibility important
- ✅ Simpler implementation preferred
- ✅ HTTP/2 infrastructure available
- ✅ Automatic reconnection desired

## 🔒 Security

### Authentication

```typescript
// WebSocket with token
ws.send(
  JSON.stringify({
    type: 'auth',
    payload: { token: 'jwt-token-here' },
  })
)

// SSE with token in URL
const eventSource = new EventSource('/api/realtime/sse?token=jwt-token-here')
```

### Rate Limiting

- Implement connection rate limiting
- Limit subscription changes per client
- Monitor message frequency

### Event Filtering

- Server-side event filtering
- User-based event access control
- Prevent information leakage

## 📈 Performance

### Scalability

- **Single Server**: Up to 10,000 concurrent connections
- **Redis Pub/Sub**: Unlimited horizontal scaling
- **Memory**: ~10KB per WebSocket connection
- **Memory**: ~5KB per SSE connection

### Optimization Tips

1. Use event filtering to reduce traffic
2. Implement Redis for multi-server deployments
3. Monitor connection count and set limits
4. Use compression for large payloads
5. Batch events when possible

## 🧪 Testing

### Manual Testing

```bash
# Test SSE endpoint
curl -N http://localhost:3000/api/realtime/sse

# Test WebSocket (using websocat)
websocat ws://localhost:3001
```

### Integration Testing

```typescript
import { createEventEmitter } from '@/lib/realtime'

describe('Event System', () => {
  it('should emit and receive events', async () => {
    const emitter = createEventEmitter()
    const events: any[] = []

    emitter.on(EventType.MEMBER_CREATED, payload => {
      events.push(payload)
    })

    await emitter.emit(EventType.MEMBER_CREATED, { id: '123' })

    expect(events).toHaveLength(1)
    expect(events[0].data.id).toBe('123')
  })
})
```

## 🐛 Troubleshooting

### WebSocket not connecting

- Check if WebSocket server is running (port 3001)
- Verify firewall rules
- Check proxy configuration (nginx, etc.)

### SSE disconnecting frequently

- Check keep-alive interval
- Verify network stability
- Monitor server resource usage

### Events not received

- Verify subscription event types
- Check event filtering logic
- Monitor subscription manager stats

## 📚 Resources

- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [WebSocket vs SSE](https://ably.com/topic/websockets-vs-sse)
