# Monitoring System

ASCA 프로젝트의 종합 성능 모니터링 및 메트릭 수집 시스템입니다.

## 개요

모니터링 시스템은 세 가지 핵심 컴포넌트로 구성됩니다:

1. **Performance Monitor** - 실시간 성능 메트릭 추적
2. **Metrics Collector** - 시간 기반 메트릭 집계 및 분석
3. **Slow Query Detector** - 데이터베이스 쿼리 성능 모니터링

## 주요 기능

### Performance Monitor

- ✅ 실시간 성능 메트릭 기록
- ✅ 임계값 기반 알림 생성
- ✅ 메트릭 데코레이터 (@Measure)
- ✅ 시스템 리소스 모니터링 (메모리, FPS)
- ✅ 이벤트 기반 자동 추적

### Metrics Collector

- ✅ 시간 윈도우별 메트릭 집계 (1m, 5m, 15m, 1h, 6h, 24h)
- ✅ 통계 계산 (평균, 최소, 최대, P50, P95, P99, 표준편차)
- ✅ 트렌드 분석 (선형 회귀)
- ✅ 이상 탐지 (표준편차 기반)
- ✅ 데이터 내보내기 (JSON, CSV)

### Slow Query Detector

- ✅ 느린 쿼리 자동 감지
- ✅ 쿼리 패턴 분석 및 통계
- ✅ N+1 쿼리 탐지
- ✅ 최적화 제안 생성
- ✅ 스택 트레이스 추적

## 설치 및 초기화

### 기본 사용법

```typescript
import { initializeMonitoring, shutdownMonitoring } from '@/lib/monitoring';

// 모니터링 시작
initializeMonitoring({
  enablePerformanceMonitoring: true,
  enableMetricsCollection: true,
  enableSlowQueryDetection: true,
  metricsCollectionInterval: 60000, // 1분
  slowQueryThreshold: 100, // 100ms
  criticalQueryThreshold: 1000, // 1초
});

// 애플리케이션 종료 시
shutdownMonitoring();
```

## Performance Monitor 사용법

### 메트릭 기록

```typescript
import { performanceMonitor } from '@/lib/monitoring';

// 메트릭 수동 기록
performanceMonitor.recordMetric({
  name: 'api.response_time',
  value: 150,
  unit: 'ms',
  tags: { endpoint: '/api/users', method: 'GET' },
  threshold: { warning: 200, critical: 500 },
});
```

### 함수 측정

```typescript
import { measureAsync, measureSync } from '@/lib/monitoring';

// 비동기 함수 측정
const fetchData = measureAsync(
  'api.fetchData',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
  { tags: { service: 'user-api' } }
);

// 동기 함수 측정
const processData = measureSync(
  'data.process',
  (data: any) => {
    return data.map(item => item * 2);
  }
);
```

### 데코레이터 사용

```typescript
import { Measure } from '@/lib/monitoring';

class UserService {
  @Measure('UserService.getUser', {
    threshold: { warning: 100, critical: 500 }
  })
  async getUser(id: string) {
    // 사용자 조회 로직
  }

  @Measure('UserService.createUser')
  async createUser(data: any) {
    // 사용자 생성 로직
  }
}
```

### 메트릭 조회

```typescript
// 특정 메트릭 조회
const metrics = performanceMonitor.getMetrics('api.response_time');

// 통계 조회
const stats = performanceMonitor.getMetricStats('api.response_time', 3600000); // 1시간
console.log(stats);
// {
//   avg: 150,
//   min: 50,
//   max: 500,
//   count: 100,
//   p95: 300,
//   p99: 450
// }

// 알림 조회
const alerts = performanceMonitor.getAlerts('critical');

// 시스템 상태 조회
const status = performanceMonitor.getSystemStatus();
```

## Metrics Collector 사용법

### 메트릭 집계

```typescript
import { metricsCollector, TimeWindow } from '@/lib/monitoring';

// 특정 윈도우에 대한 집계
const aggregated = metricsCollector.aggregateMetrics(
  'api.response_time',
  TimeWindow.ONE_HOUR
);

console.log(aggregated);
// {
//   name: 'api.response_time',
//   window: 3600000,
//   avg: 150,
//   min: 50,
//   max: 500,
//   p50: 140,
//   p95: 300,
//   p99: 450,
//   stdDev: 75,
//   rate: 10.5, // 초당 발생 횟수
//   count: 37800
// }

// 여러 윈도우에 대한 집계
const multiWindow = metricsCollector.aggregateMultipleWindows('api.response_time');
```

### 트렌드 분석

```typescript
// 트렌드 분석
const trend = metricsCollector.analyzeTrend(
  'api.response_time',
  TimeWindow.ONE_HOUR,
  10 // 최근 10개 데이터 포인트
);

console.log(trend);
// {
//   metric: 'api.response_time',
//   direction: 'increasing', // 'increasing' | 'decreasing' | 'stable'
//   change: 15.5, // 변화율 (%)
//   confidence: 0.85, // R² 값
//   prediction: 180 // 다음 값 예측
// }
```

### 이상 탐지

```typescript
// 이상 감지 (표준편차 3배 이상)
const anomalies = metricsCollector.detectAnomalies('api.response_time', 3);

console.log(anomalies);
// [
//   {
//     metric: 'api.response_time',
//     value: 1500,
//     expected: 150,
//     deviation: 4.5, // 표준편차 배수
//     severity: 'high', // 'low' | 'medium' | 'high'
//     timestamp: 1234567890
//   }
// ]
```

### 데이터 내보내기

```typescript
// JSON으로 내보내기
const jsonData = metricsCollector.exportJSON('api.response_time');

// CSV로 내보내기
const csvData = metricsCollector.exportCSV('api.response_time');
```

## Slow Query Detector 사용법

### 쿼리 모니터링

```typescript
import { slowQueryDetector, monitorQuery } from '@/lib/monitoring';

// 쿼리 래핑
const users = await monitorQuery(
  'SELECT * FROM users WHERE id = ?',
  async () => {
    return await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  },
  [userId]
);

// 수동 측정
const queryId = slowQueryDetector.startQuery(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

try {
  const result = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  slowQueryDetector.endQuery(queryId, 'SELECT * FROM users WHERE id = ?', [userId], result.length);
} catch (error) {
  slowQueryDetector.endQuery(queryId, 'SELECT * FROM users WHERE id = ?', [userId]);
  throw error;
}
```

### N+1 쿼리 탐지

```typescript
import { detectNPlusOneQueries } from '@/lib/monitoring';

// N+1 쿼리 탐지 (5초 윈도우)
const nPlusOneDetections = detectNPlusOneQueries(5000);

console.log(nPlusOneDetections);
// [
//   {
//     pattern: 'SELECT * FROM posts WHERE user_id = ?',
//     queryCount: 25,
//     totalTime: 1250,
//     timeWindow: 5000,
//     examples: [...],
//     severity: 'high',
//     suggestion: 'eager loading (includes/preload)을 사용하여 한 번의 쿼리로 데이터를 가져오세요'
//   }
// ]
```

### 느린 쿼리 조회

```typescript
// 느린 쿼리 목록
const slowQueries = slowQueryDetector.getSlowQueries(20);

console.log(slowQueries);
// [
//   {
//     query: 'SELECT * FROM users WHERE name LIKE %john%',
//     executionTime: 1500,
//     severity: 'critical',
//     suggestions: [
//       '와일드카드가 앞에 있는 LIKE 패턴은 인덱스를 사용할 수 없습니다',
//       'WHERE 절에 사용된 컬럼에 인덱스를 추가하세요'
//     ],
//     caller: 'UserService.searchUsers',
//     ...
//   }
// ]
```

### 쿼리 패턴 통계

```typescript
// 쿼리 패턴별 통계
const patternStats = slowQueryDetector.getPatternStats('totalTime');

console.log(patternStats);
// [
//   {
//     pattern: 'SELECT * FROM users WHERE id = ?',
//     hash: 'abc123',
//     count: 1000,
//     totalTime: 50000,
//     avgTime: 50,
//     minTime: 10,
//     maxTime: 200,
//     p95Time: 100,
//     lastExecution: 1234567890,
//     isSlow: false
//   }
// ]
```

### 종합 리포트

```typescript
import { getSlowQueryReport } from '@/lib/monitoring';

const report = getSlowQueryReport();

console.log(report);
// {
//   slowQueries: [...],
//   patternStats: [...],
//   nPlusOneDetections: [...],
//   stats: {
//     totalQueries: 10000,
//     slowQueries: 50,
//     criticalQueries: 5,
//     avgExecutionTime: 75,
//     uniquePatterns: 150,
//     nPlusOneDetections: 3,
//     isMonitoring: true
//   }
// }
```

## Admin API 사용법

### 메트릭 조회

```bash
# 모든 메트릭 조회
GET /api/admin/metrics?type=all

# 성능 메트릭만 조회
GET /api/admin/metrics?type=performance

# 쿼리 메트릭만 조회
GET /api/admin/metrics?type=queries

# 집계된 메트릭 조회
GET /api/admin/metrics?type=aggregated&metric=api.response_time&window=1h

# CSV로 내보내기
GET /api/admin/metrics?format=csv

# Prometheus 포맷으로 내보내기
GET /api/admin/metrics?format=prometheus
```

### 메트릭 관리

```bash
# 메트릭 초기화
POST /api/admin/metrics?action=reset

# 오래된 데이터 정리 (7일 이전)
POST /api/admin/metrics?action=cleanup&olderThan=604800000
```

## 응답 예시

### GET /api/admin/metrics?type=all

```json
{
  "success": true,
  "data": {
    "performance": {
      "metrics": [...],
      "stats": {
        "avg": 150,
        "min": 50,
        "max": 500,
        "count": 1000,
        "p95": 300,
        "p99": 450
      },
      "alerts": [...],
      "systemStatus": {
        "isMonitoring": true,
        "totalMetrics": 5000,
        "alertCount": 3,
        "criticalAlerts": 1,
        "uptime": 123456
      }
    },
    "queries": {
      "slowQueries": [...],
      "patternStats": [...],
      "nPlusOneDetections": [...],
      "stats": {
        "totalQueries": 10000,
        "slowQueries": 50,
        "avgExecutionTime": 75
      }
    },
    "aggregated": {
      "metrics": [...],
      "trends": {
        "direction": "increasing",
        "change": 15.5,
        "confidence": 0.85
      },
      "anomalies": [...]
    },
    "systemStatus": {...}
  },
  "timestamp": "2025-12-28T10:00:00Z"
}
```

## 설정

### Performance Monitor 설정

```typescript
// 기본값
{
  slowQueryThreshold: 100,        // ms
  criticalQueryThreshold: 1000,   // ms
  enableStackTrace: true,
  maxSlowQueries: 100,
  maxQueryHistory: 1000,
  nPlusOneDetectionWindow: 5000,  // ms
  nPlusOneThreshold: 5
}
```

### Metrics Collector 설정

```typescript
// 수집 간격 설정
metricsCollector.start(60000); // 1분마다 수집
```

### Slow Query Detector 설정

```typescript
slowQueryDetector.updateConfig({
  slowQueryThreshold: 100,
  criticalQueryThreshold: 1000,
  enableStackTrace: true,
});
```

## 베스트 프랙티스

### 1. 메트릭 명명 규칙

```typescript
// 좋은 예
'api.response_time'
'database.query.execution_time'
'cache.hit_rate'

// 나쁜 예
'responseTime'
'query_time'
'cache_hits'
```

### 2. 태그 사용

```typescript
performanceMonitor.recordMetric({
  name: 'api.response_time',
  value: 150,
  unit: 'ms',
  tags: {
    endpoint: '/api/users',
    method: 'GET',
    status: '200',
    region: 'asia-northeast'
  }
});
```

### 3. 임계값 설정

```typescript
// 경고: 사용자 경험에 영향
// 심각: 비즈니스에 영향
{
  threshold: {
    warning: 200,   // 200ms 이상이면 경고
    critical: 1000  // 1초 이상이면 심각
  }
}
```

### 4. 정기적인 데이터 정리

```typescript
// 매일 자정에 오래된 데이터 정리
setInterval(() => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  metricsCollector.cleanup(sevenDaysAgo);
  slowQueryDetector.cleanup(sevenDaysAgo);
}, 24 * 60 * 60 * 1000);
```

## 트러블슈팅

### 메모리 사용량이 높을 때

```typescript
// 히스토리 크기 제한
performanceMonitor.maxMetricHistory = 500; // 기본 1000

// 정기적인 정리
metricsCollector.cleanup(Date.now() - 24 * 60 * 60 * 1000);
```

### 성능 오버헤드가 클 때

```typescript
// 스택 트레이스 비활성화
slowQueryDetector.updateConfig({
  enableStackTrace: false
});

// 수집 간격 늘리기
metricsCollector.stop();
metricsCollector.start(300000); // 5분
```

### N+1 쿼리가 많이 탐지될 때

```typescript
// 임계값 조정
slowQueryDetector.updateConfig({
  nPlusOneThreshold: 10 // 10회 이상 반복 시에만 탐지
});
```

## 권한

모든 Admin API 엔드포인트는 다음 권한이 필요합니다:

- `Permission.ADMIN_ANALYTICS` - 메트릭 조회
- `Permission.ADMIN_SYSTEM_SETTINGS` - 메트릭 초기화 및 정리

## 관련 문서

- [Performance Monitor 상세 문서](./performance-monitor.ts)
- [Metrics Collector 상세 문서](./metrics-collector.ts)
- [Slow Query Detector 상세 문서](./slow-query-detector.ts)
- [Admin API 문서](../../app/api/admin/metrics/route.ts)

## 라이선스

MIT
