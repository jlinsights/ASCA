# Phase 3.7: Structured Logging 구현 완료

## 개요

ASCA 프로젝트에 종합 구조화된 로깅 시스템을 구축했습니다.

## 구현 내용

### 1. Structured Logger (구조화된 로거)

**파일**: `lib/logging/structured-logger.ts` (650+ lines)

**주요 기능**:
- ✅ 5가지 로그 레벨 (DEBUG, INFO, WARN, ERROR, FATAL)
- ✅ 구조화된 로그 데이터 (JSON 기반)
- ✅ 로그 컨텍스트 관리 (LogContext)
- ✅ 태그 시스템
- ✅ 성능 측정 (time, timeAsync)
- ✅ 자식 로거 생성
- ✅ 비동기 로그 처리 (큐 기반)
- ✅ Transport 시스템

**핵심 API**:
```typescript
class StructuredLogger {
  debug(message: string, context?: Record<string, any>, tags?: string[]): void
  info(message: string, context?: Record<string, any>, tags?: string[]): void
  warn(message: string, context?: Record<string, any>, tags?: string[]): void
  error(message: string, error?: Error, context?: Record<string, any>, tags?: string[]): void
  fatal(message: string, error?: Error, context?: Record<string, any>, tags?: string[]): void
  time(label: string): () => void
  timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T>
  child(context: Record<string, any>, tags?: string[]): StructuredLogger
  addTransport(transport: LogTransport): void
  flush(): Promise<void>
}

class LogContext {
  static set(key: string, value: any): void
  static get(key: string): any
  static getAll(): Record<string, any>
  static with<T>(context: Record<string, any>, fn: () => T): T
  static withAsync<T>(context: Record<string, any>, fn: () => Promise<T>): Promise<T>
}
```

**특징**:
- 싱글톤 패턴으로 전역 접근
- 비동기 로그 처리 (100ms 간격)
- 스택 트레이스 추적
- 소스 위치 추적

### 2. Log Transports (로그 전송)

**파일**: `lib/logging/transports.ts` (500+ lines)

**제공 Transports**:

#### Console Transport
- 콘솔 출력
- ANSI 색상 지원
- 커스텀 Formatter 지원
```typescript
const transport = createConsoleTransport({
  level: LogLevel.DEBUG,
  useColors: true,
});
```

#### File Transport
- 파일 저장
- 자동 로테이션 (크기 기반)
- 최대 파일 개수 관리
```typescript
const transport = createFileTransport({
  filepath: './logs/app.log',
  level: LogLevel.INFO,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
});
```

#### HTTP Transport
- 원격 서버 전송
- 배치 처리 (기본 10개)
- 자동 재전송
```typescript
const transport = createHTTPTransport({
  endpoint: 'https://logs.example.com/api/logs',
  level: LogLevel.WARN,
  batchSize: 10,
  flushInterval: 5000,
});
```

#### Memory Transport
- 메모리에 로그 저장
- 테스트 및 디버깅용
- 로그 조회 및 통계
```typescript
const transport = createMemoryTransport({
  level: LogLevel.DEBUG,
  maxLogs: 1000,
});
```

#### Custom Transport
- 사용자 정의 로그 처리
```typescript
const transport = createCustomTransport(
  'my-transport',
  async (entry) => {
    await sendToExternalService(entry);
  },
  LogLevel.INFO
);
```

### 3. Log Formatters (로그 포맷터)

**파일**: `lib/logging/formatters.ts` (400+ lines)

**제공 Formatters**:

#### JSON Formatter
- JSON 형식 출력
- Pretty print 지원
```typescript
const formatter = createJSONFormatter({
  pretty: true,
  includeTimestamp: true,
  includeLevel: true,
});
```

#### Text Formatter
- 읽기 쉬운 텍스트
- 타임스탬프 포맷 선택
```typescript
const formatter = createTextFormatter({
  timestampFormat: 'iso', // 'iso' | 'locale' | 'time'
});
```

#### Colored Text Formatter
- ANSI 색상 지원
- 로그 레벨별 색상
```typescript
const formatter = createColoredTextFormatter({
  useColors: true,
});
```

#### Logfmt Formatter
- key=value 쌍 형식
- 파싱하기 쉬운 형식
```typescript
const formatter = createLogfmtFormatter();
```

#### Template Formatter
- 템플릿 기반 커스텀 포맷
```typescript
const formatter = createTemplateFormatter(
  '{timestamp} [{level}] {message} {context.userId}'
);
```

#### Compact Formatter
- 한 줄로 압축된 출력
```typescript
const formatter = createCompactFormatter();
```

### 4. Logs API (로그 API)

**파일**: `app/api/admin/logs/route.ts` (450+ lines)

**엔드포인트**:

#### GET /api/admin/logs
로그 조회 및 필터링

**Query Parameters**:
- `level`: 로그 레벨 (DEBUG, INFO, WARN, ERROR, FATAL)
- `message`: 메시지 검색
- `tags`: 태그 필터 (쉼표로 구분)
- `since`: 시작 시간
- `until`: 종료 시간
- `limit`: 결과 개수 (기본 100)
- `offset`: 페이지네이션 오프셋
- `format`: 출력 형식 (json, text, csv)

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "logs": [...],
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
      "errorCount": 50
    }
  }
}
```

#### POST /api/admin/logs/query
고급 로그 쿼리

**Request Body**:
```json
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

**특징**:
- 복잡한 필터링 (정규식, 태그 AND/OR)
- 정렬 및 페이지네이션
- 통계 제공
- CSV, Text 내보내기

### 5. Module Index

**파일**: `lib/logging/index.ts` (80+ lines)

**제공 기능**:
- 모든 로깅 컴포넌트 통합 내보내기
- `initializeLogging()` - 원스톱 초기화
- 헬퍼 함수들

**사용 예시**:
```typescript
import { initializeLogging, LogLevel } from '@/lib/logging';

initializeLogging({
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  filepath: './logs/app.log',
  useColors: true,
});
```

### 6. 문서화

**파일**: `lib/logging/README.md` (700+ lines)

**내용**:
- 개요 및 주요 기능
- 설치 및 초기화
- 각 컴포넌트별 상세 사용법
- API 레퍼런스
- 베스트 프랙티스
- 트러블슈팅 가이드

## 기술 스택

- **TypeScript** - 엄격한 타입 안정성
- **Singleton Pattern** - 전역 로거 인스턴스
- **Queue-based Processing** - 비동기 로그 처리
- **Transport System** - 플러그형 출력 대상
- **Formatter System** - 다양한 출력 형식
- **Context Management** - 요청별 컨텍스트 추적

## 로그 레벨

```typescript
enum LogLevel {
  DEBUG = 0,   // 디버깅 정보
  INFO = 1,    // 일반 정보 (기본)
  WARN = 2,    // 경고
  ERROR = 3,   // 에러
  FATAL = 4,   // 치명적 에러
}
```

## 사용 예시

### 1. 기본 로깅

```typescript
import { debug, info, warn, error, fatal } from '@/lib/logging';

debug('Debugging information', { userId: '123' });
info('User logged in', { userId: '123', ip: '192.168.1.1' });
warn('API rate limit approaching', { current: 950, limit: 1000 });
error('Failed to fetch data', new Error('Timeout'), { endpoint: '/api/users' });
fatal('Database connection lost', new Error('Connection refused'));
```

### 2. 컨텍스트 관리

```typescript
import { LogContext, withLogContext, info } from '@/lib/logging';

// 전역 컨텍스트
LogContext.set('requestId', 'req-123');
info('Processing request'); // requestId가 자동 포함

// 스코프 컨텍스트
withLogContext({ userId: '456' }, () => {
  info('User action'); // requestId와 userId 모두 포함
});
```

### 3. 성능 측정

```typescript
import { measureTime, measureTimeAsync } from '@/lib/logging';

// 동기 함수
const end = measureTime('Data processing');
processData();
end(); // "Data processing completed { duration: 150, unit: 'ms' }"

// 비동기 함수
const result = await measureTimeAsync('API call', async () => {
  return await fetch('/api/data');
});
```

### 4. 자식 로거

```typescript
import { createLogger } from '@/lib/logging';

const apiLogger = createLogger({ service: 'api' }, ['api']);
apiLogger.info('Request received', { method: 'GET', path: '/users' });
// 출력: { service: 'api', method: 'GET', path: '/users' } [api]
```

### 5. 로그 조회

```bash
# 에러 로그만 조회
GET /api/admin/logs?level=ERROR

# 메시지 검색
GET /api/admin/logs?message=failed

# CSV로 내보내기
GET /api/admin/logs?format=csv&since=2025-12-28T00:00:00Z
```

## 보안

- ✅ Permission 기반 접근 제어 (ADMIN_AUDIT_LOGS)
- ✅ 민감한 정보 필터링 (비밀번호, 토큰 제외)
- ✅ 로그 크기 제한 (최대 10,000개)
- ✅ Rate limiting 고려

## 성능 특징

### Structured Logger
- 비동기 큐 기반 처리 (100ms 간격)
- Transport별 레벨 필터링
- 효율적인 메모리 관리

### File Transport
- 비동기 파일 쓰기
- 자동 로테이션 (크기 기반)
- 최대 파일 개수 관리

### HTTP Transport
- 배치 처리 (기본 10개)
- 자동 재전송 (실패 시)
- 플러시 간격 설정 (기본 5초)

### Memory Transport
- 순환 버퍼 (최대 1,000개)
- 빠른 조회 및 통계
- 메모리 효율적

## 다음 단계

- [ ] 로그 시각화 대시보드
- [ ] 로그 집계 및 알림
- [ ] 로그 보관 정책
- [ ] 분산 추적 (Distributed Tracing)
- [ ] 로그 암호화

## 관련 Phase

- ✅ Phase 3.1: Core API Layer
- ✅ Phase 3.2: Data Access Layer
- ✅ Phase 3.3: GraphQL Layer
- ✅ Phase 3.4: Real-time Updates
- ✅ Phase 3.5: Admin API Layer
- ✅ Phase 3.6: Performance Monitoring
- ✅ **Phase 3.7: Structured Logging** (현재)

## 작성자

- Claude Sonnet 4.5
- 작성일: 2025-12-28

---

**Phase 3.7 완료!** 🎉

Phase 3 전체 구현이 완료되었습니다!
