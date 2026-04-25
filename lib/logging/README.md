# Structured Logging System

ASCA 프로젝트의 구조화된 로깅 시스템입니다.

## 개요

구조화된 로깅 시스템은 JSON 기반의 로그 출력, 컨텍스트 관리, 다양한 Transport 및
Formatter를 제공합니다.

## 주요 기능

### Structured Logger

- ✅ 5가지 로그 레벨 (DEBUG, INFO, WARN, ERROR, FATAL)
- ✅ 구조화된 로그 데이터 (JSON)
- ✅ 컨텍스트 관리 (요청 ID, 사용자 ID 등)
- ✅ 태그 시스템
- ✅ 성능 측정 (time, timeAsync)
- ✅ 자식 로거 생성
- ✅ 비동기 로그 처리

### Transports

- ✅ Console Transport (콘솔 출력, 컬러 지원)
- ✅ File Transport (파일 저장, 로테이션)
- ✅ HTTP Transport (원격 서버 전송, 배치 처리)
- ✅ Memory Transport (메모리 저장, 테스트용)
- ✅ Custom Transport (사용자 정의)

### Formatters

- ✅ JSON Formatter (JSON 형식)
- ✅ Text Formatter (읽기 쉬운 텍스트)
- ✅ Colored Text Formatter (ANSI 색상)
- ✅ Logfmt Formatter (key=value 쌍)
- ✅ Template Formatter (템플릿 기반)
- ✅ Compact Formatter (압축된 출력)

## 설치 및 초기화

### 기본 사용법

```typescript
import { initializeLogging, LogLevel } from '@/lib/logging'

// 로깅 시스템 초기화
initializeLogging({
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  filepath: './logs/app.log',
  useColors: true,
})
```

## 기본 로깅

### 로그 레벨별 사용

```typescript
import { debug, info, warn, error, fatal } from '@/lib/logging'

// DEBUG 로그
debug('Debugging information', { userId: '123', operation: 'fetch' })

// INFO 로그
info('User logged in', { userId: '123', ip: '192.168.1.1' })

// WARN 로그
warn('API rate limit approaching', { current: 950, limit: 1000 })

// ERROR 로그
error('Failed to fetch data', new Error('Network timeout'), {
  endpoint: '/api/users',
  retries: 3,
})

// FATAL 로그
fatal('Database connection lost', new Error('Connection refused'), {
  host: 'localhost',
  port: 5432,
})
```

### 태그 사용

```typescript
import { info } from '@/lib/logging'

// 태그를 사용한 로그 분류
info('Payment processed', { amount: 1000, currency: 'USD' }, [
  'payment',
  'success',
])

info('Cache miss', { key: 'user:123' }, ['cache', 'performance'])
```

## 컨텍스트 관리

### 로그 컨텍스트 설정

```typescript
import { LogContext, info } from '@/lib/logging'

// 컨텍스트 설정
LogContext.set('requestId', 'req-123')
LogContext.set('userId', 'user-456')

// 컨텍스트가 자동으로 모든 로그에 포함됨
info('Processing request') // { requestId: 'req-123', userId: 'user-456' }

// 컨텍스트 제거
LogContext.clear()
```

### 스코프 컨텍스트

```typescript
import { withLogContext, withLogContextAsync, info } from '@/lib/logging'

// 동기 함수
withLogContext({ requestId: 'req-123' }, () => {
  info('Inside context') // requestId가 자동으로 포함됨
})

// 비동기 함수
await withLogContextAsync({ requestId: 'req-456' }, async () => {
  await someAsyncOperation()
  info('Async operation completed') // requestId가 자동으로 포함됨
})
```

## 자식 로거

### 자식 로거 생성

```typescript
import { createLogger } from '@/lib/logging'

// 기본 컨텍스트와 태그를 가진 자식 로거 생성
const userLogger = createLogger({ userId: '123' }, ['user-service'])

// 자식 로거로 로그
userLogger.info('User action', { action: 'click' })
// 출력: { userId: '123', action: 'click' } [user-service]
```

## 성능 측정

### 함수 실행 시간 측정

```typescript
import { measureTime, measureTimeAsync } from '@/lib/logging'

// 동기 함수 측정
const end = measureTime('Data processing')
processData()
end() // 로그: "Data processing completed { duration: 150, unit: 'ms' }"

// 비동기 함수 측정
const result = await measureTimeAsync('API call', async () => {
  return await fetch('/api/data')
})
```

## Transports 설정

### Console Transport

```typescript
import { logger, createConsoleTransport, LogLevel } from '@/lib/logging'

const consoleTransport = createConsoleTransport({
  level: LogLevel.DEBUG,
  useColors: true,
})

logger.addTransport(consoleTransport)
```

### File Transport

```typescript
import { logger, createFileTransport, LogLevel } from '@/lib/logging'

const fileTransport = createFileTransport({
  filepath: './logs/app.log',
  level: LogLevel.INFO,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5, // 최대 5개 파일 유지
})

logger.addTransport(fileTransport)
```

### HTTP Transport

```typescript
import { logger, createHTTPTransport, LogLevel } from '@/lib/logging'

const httpTransport = createHTTPTransport({
  endpoint: 'https://logs.example.com/api/logs',
  level: LogLevel.WARN,
  headers: {
    Authorization: 'Bearer token',
  },
  batchSize: 10,
  flushInterval: 5000,
})

logger.addTransport(httpTransport)
```

### Memory Transport

```typescript
import { createMemoryTransport, LogLevel } from '@/lib/logging'

const memoryTransport = createMemoryTransport({
  level: LogLevel.DEBUG,
  maxLogs: 1000,
})

logger.addTransport(memoryTransport)

// 로그 조회
const logs = memoryTransport.getLogs({
  level: LogLevel.ERROR,
  tags: ['api'],
  since: Date.now() - 3600000, // 1시간 전부터
})

// 통계 조회
const stats = memoryTransport.getStats()
console.log(stats)
// {
//   total: 1000,
//   byLevel: { INFO: 700, WARN: 200, ERROR: 100 },
//   byTag: { api: 500, database: 300 }
// }
```

### Custom Transport

```typescript
import { createCustomTransport, LogLevel } from '@/lib/logging'
import type { LogEntry } from '@/lib/logging'

const customTransport = createCustomTransport(
  'my-transport',
  async (entry: LogEntry) => {
    // 커스텀 로그 처리 로직
    await sendToExternalService(entry)
  },
  LogLevel.INFO
)

logger.addTransport(customTransport)
```

## Formatters 사용

### JSON Formatter

```typescript
import { createConsoleTransport, createJSONFormatter } from '@/lib/logging'

const jsonFormatter = createJSONFormatter({
  pretty: true,
  includeTimestamp: true,
  includeLevel: true,
  includeContext: true,
  includeTags: true,
})

const transport = createConsoleTransport({
  formatter: entry => jsonFormatter.format(entry),
})
```

### Text Formatter

```typescript
import { createTextFormatter } from '@/lib/logging'

const textFormatter = createTextFormatter({
  includeTimestamp: true,
  includeLevel: true,
  includeContext: true,
  timestampFormat: 'iso', // 'iso' | 'locale' | 'time'
})
```

### Colored Text Formatter

```typescript
import { createColoredTextFormatter } from '@/lib/logging'

const coloredFormatter = createColoredTextFormatter({
  useColors: true,
  timestampFormat: 'time',
})
```

### Template Formatter

```typescript
import { createTemplateFormatter } from '@/lib/logging'

const templateFormatter = createTemplateFormatter(
  '{timestamp} [{level}] {message} {context.userId}'
)
```

## Admin API 사용

### 로그 조회

```bash
# 기본 로그 조회
GET /api/admin/logs?limit=100&offset=0

# 로그 레벨 필터
GET /api/admin/logs?level=ERROR

# 메시지 검색
GET /api/admin/logs?message=failed

# 태그 필터
GET /api/admin/logs?tags=api,error

# 시간 범위 필터
GET /api/admin/logs?since=2025-12-28T00:00:00Z&until=2025-12-28T23:59:59Z

# CSV 내보내기
GET /api/admin/logs?format=csv

# 텍스트 내보내기
GET /api/admin/logs?format=text
```

### 고급 쿼리

```bash
POST /api/admin/logs/query
Content-Type: application/json

{
  "levels": ["ERROR", "FATAL"],
  "messageRegex": "database|connection",
  "tagsAll": ["api"],
  "hasError": true,
  "since": "2025-12-28T00:00:00Z",
  "limit": 50,
  "sortBy": "timestamp",
  "sortOrder": "desc"
}
```

## 응답 예시

### GET /api/admin/logs

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": 1704009600000,
        "level": 3,
        "levelName": "ERROR",
        "message": "Failed to fetch user data",
        "context": {
          "userId": "123",
          "endpoint": "/api/users/123"
        },
        "error": {
          "name": "NetworkError",
          "message": "Connection timeout",
          "stack": "..."
        },
        "tags": ["api", "error"]
      }
    ],
    "pagination": {
      "total": 1000,
      "limit": 100,
      "offset": 0,
      "hasMore": true
    },
    "stats": {
      "total": 1000,
      "byLevel": {
        "DEBUG": 100,
        "INFO": 700,
        "WARN": 150,
        "ERROR": 50
      },
      "byTag": {
        "api": 500,
        "database": 300
      },
      "errorCount": 50,
      "timeRange": {
        "oldest": 1703923200000,
        "newest": 1704009600000
      }
    }
  }
}
```

## 베스트 프랙티스

### 1. 적절한 로그 레벨 사용

```typescript
// DEBUG - 개발 및 디버깅 정보
debug('Function called', { params: { id: 123 } })

// INFO - 일반적인 정보 (기본 레벨)
info('User logged in', { userId: '123' })

// WARN - 경고 (주의 필요하지만 에러는 아님)
warn('API rate limit approaching', { current: 950, limit: 1000 })

// ERROR - 에러 (복구 가능)
error('Failed to save data', err, { operation: 'save' })

// FATAL - 치명적 에러 (복구 불가능)
fatal('Database connection lost', err)
```

### 2. 구조화된 컨텍스트 사용

```typescript
// 좋은 예
info('Order placed', {
  orderId: '12345',
  userId: '789',
  amount: 1000,
  currency: 'USD',
  items: 3,
})

// 나쁜 예
info('Order 12345 placed by user 789 for $1000 USD with 3 items')
```

### 3. 태그를 활용한 분류

```typescript
// 도메인별 태그
info('Payment processed', context, ['payment', 'success'])

// 환경별 태그
info('Cache hit', context, ['cache', 'redis', 'production'])

// 성능 측정 태그
measureTime('API call', ['performance', 'api'])
```

### 4. 에러 로깅

```typescript
try {
  await riskyOperation()
} catch (err) {
  error(
    'Operation failed',
    err instanceof Error ? err : new Error(String(err)),
    {
      operation: 'riskyOperation',
      retries: 3,
      lastAttempt: new Date(),
    },
    ['error', 'retry']
  )
}
```

### 5. 민감한 정보 제외

```typescript
// 좋은 예
info('User authenticated', {
  userId: '123',
  method: 'password',
  // 비밀번호나 토큰은 로그하지 않음
})

// 나쁜 예
info('User authenticated', {
  userId: '123',
  password: 'secret123', // ❌ 절대 금지
  token: 'Bearer abc123', // ❌ 절대 금지
})
```

## 설정

### 환경별 설정

```typescript
// 개발 환경
initializeLogging({
  level: LogLevel.DEBUG,
  enableConsole: true,
  enableFile: true,
  useColors: true,
})

// 프로덕션 환경
initializeLogging({
  level: LogLevel.INFO,
  enableConsole: false,
  enableFile: true,
  enableHTTP: true,
  httpEndpoint: 'https://logs.example.com/api/logs',
  useColors: false,
})
```

### 로그 레벨 동적 변경

```typescript
import { setLogLevel, LogLevel } from '@/lib/logging'

// 런타임에 로그 레벨 변경
setLogLevel(LogLevel.DEBUG)
```

## 트러블슈팅

### 로그가 출력되지 않을 때

```typescript
// 1. 로그 레벨 확인
import { logger } from '@/lib/logging'
console.log('Current log level:', logger.getLevel())

// 2. Transport 확인
initializeLogging({
  enableConsole: true, // 콘솔 출력 활성화
})

// 3. 로그 레벨 낮추기
setLogLevel(LogLevel.DEBUG)
```

### 파일 로그가 저장되지 않을 때

```typescript
// 1. 파일 경로 확인
createFileTransport({
  filepath: './logs/app.log', // 절대 경로 권장
})

// 2. 디렉토리 권한 확인
// logs 디렉토리에 쓰기 권한이 있는지 확인

// 3. 로그 플러시
await logger.flush()
```

### 메모리 사용량이 높을 때

```typescript
// 1. 로그 큐 크기 확인
console.log('Queue size:', logger.getQueueSize())

// 2. 정기적인 플러시
setInterval(() => logger.flush(), 10000)

// 3. 파일 로테이션 설정
createFileTransport({
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3, // 최대 3개만 유지
})
```

## 권한

모든 Admin API 엔드포인트는 다음 권한이 필요합니다:

- `Permission.ADMIN_AUDIT_LOGS` - 로그 조회 및 검색

## 관련 문서

- [Structured Logger 상세 문서](./structured-logger.ts)
- [Transports 상세 문서](./transports.ts)
- [Formatters 상세 문서](./formatters.ts)
- [Logs API 문서](../../app/api/admin/logs/route.ts)

## 라이선스

MIT
