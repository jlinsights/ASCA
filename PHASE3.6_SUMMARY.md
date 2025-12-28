# Phase 3.6: Performance Monitoring 구현 완료

## 개요

ASCA 프로젝트에 종합 성능 모니터링 및 메트릭 수집 시스템을 구축했습니다.

## 구현 내용

### 1. Performance Monitor (성능 모니터)

**파일**: `lib/monitoring/performance-monitor.ts` (412 lines)

**주요 기능**:
- ✅ 실시간 성능 메트릭 기록 (카운터, 게이지, 히스토그램, 요약)
- ✅ 임계값 기반 알림 생성 (warning, critical)
- ✅ 메트릭 데코레이터 (@Measure)
- ✅ 시스템 리소스 모니터링 (메모리, FPS)
- ✅ 이벤트 버스 통합 자동 추적
- ✅ 통계 계산 (avg, min, max, p95, p99)

**핵심 API**:
```typescript
class PerformanceMonitor {
  recordMetric(metric: PerformanceMetric): void
  measure<T>(fn: Function): Function
  getMetrics(name?: string): PerformanceMetric[]
  getMetricStats(name: string, timeRange?: number): Stats
  getAlerts(level?: 'warning' | 'critical'): PerformanceAlert[]
  getSystemStatus(): SystemStatus
}
```

**특징**:
- 싱글톤 패턴으로 전역 접근
- Event Bus 연동 (command.executed, agent.task.completed 등)
- 브라우저 환경에서 자동 시작
- 메모리와 FPS 자동 모니터링

### 2. Metrics Collector (메트릭 수집기)

**파일**: `lib/monitoring/metrics-collector.ts` (600+ lines)

**주요 기능**:
- ✅ 시간 윈도우별 메트릭 집계 (1m, 5m, 15m, 1h, 6h, 24h)
- ✅ 통계 계산 (평균, 최소, 최대, P50, P95, P99, 표준편차, 발생률)
- ✅ 트렌드 분석 (선형 회귀, 변화율, 신뢰도, 예측값)
- ✅ 이상 탐지 (표준편차 기반, 심각도 분류)
- ✅ 데이터 내보내기 (JSON, CSV)
- ✅ 자동 수집 및 정리

**핵심 API**:
```typescript
class MetricsCollector {
  start(intervalMs: number): void
  aggregateMetrics(name: string, window: TimeWindow): AggregatedMetric
  analyzeTrend(name: string, window: TimeWindow): TrendAnalysis
  detectAnomalies(name: string, threshold: number): AnomalyDetection[]
  getAggregatedMetrics(name?: string, window?: TimeWindow): AggregatedMetric[]
  exportJSON(name?: string): string
  exportCSV(name?: string): string
  cleanup(olderThan?: number): void
}
```

**특징**:
- 6개 시간 윈도우 지원 (1분~24시간)
- 선형 회귀를 통한 트렌드 분석
- 표준편차 기반 이상 탐지
- 자동 히스토리 관리 및 정리

### 3. Slow Query Detector (느린 쿼리 감지기)

**파일**: `lib/monitoring/slow-query-detector.ts` (750+ lines)

**주요 기능**:
- ✅ 느린 쿼리 자동 감지 (설정 가능한 임계값)
- ✅ 쿼리 패턴 분석 및 통계
- ✅ N+1 쿼리 탐지 (시간 윈도우 기반)
- ✅ 최적화 제안 생성 (인덱스, JOIN, SELECT * 등)
- ✅ 스택 트레이스 추적
- ✅ 쿼리 실행 시간 측정

**핵심 API**:
```typescript
class SlowQueryDetector {
  start(): void
  updateConfig(config: Partial<DetectorConfig>): void
  startQuery(query: string, params?: any[]): string
  endQuery(queryId: string, query: string, params?: any[], rowCount?: number): QueryExecution
  wrapQuery<T>(query: string, executor: () => Promise<T>, params?: any[]): Promise<T>
  detectNPlusOne(timeWindow?: number): NPlusOneDetection[]
  getSlowQueries(limit?: number): SlowQuery[]
  getPatternStats(sortBy: 'count' | 'avgTime' | 'totalTime'): QueryPatternStats[]
  getQueryHistory(limit?: number): QueryExecution[]
  export(): string
}
```

**특징**:
- 쿼리 패턴 정규화 및 해싱
- N+1 쿼리 자동 탐지
- 최적화 제안 자동 생성 (9가지 규칙)
- 호출자 추적 (스택 트레이스)

### 4. Metrics API (메트릭 API)

**파일**: `app/api/admin/metrics/route.ts` (400+ lines)

**엔드포인트**:

#### GET /api/admin/metrics
메트릭 데이터 조회

**Query Parameters**:
- `type`: 'performance' | 'queries' | 'aggregated' | 'all'
- `format`: 'json' | 'csv' | 'prometheus'
- `metric`: 특정 메트릭 이름
- `window`: 시간 윈도우 (1m, 5m, 15m, 1h, 24h)
- `limit`: 결과 개수 제한

**응답 예시** (type=all):
```json
{
  "success": true,
  "data": {
    "performance": {
      "metrics": [...],
      "stats": { "avg": 150, "p95": 300, "p99": 450 },
      "alerts": [...],
      "systemStatus": {...}
    },
    "queries": {
      "slowQueries": [...],
      "patternStats": [...],
      "nPlusOneDetections": [...],
      "stats": {...}
    },
    "aggregated": {
      "metrics": [...],
      "trends": { "direction": "increasing", "change": 15.5 },
      "anomalies": [...]
    },
    "systemStatus": {...}
  },
  "timestamp": "2025-12-28T10:00:00Z"
}
```

#### POST /api/admin/metrics
메트릭 관리 작업

**Query Parameters**:
- `action`: 'reset' | 'cleanup'
- `olderThan`: 정리할 데이터 기준 시간 (ms)

**특징**:
- 3가지 포맷 지원 (JSON, CSV, Prometheus)
- Permission 기반 접근 제어
- 실시간 데이터 조회
- 데이터 내보내기 및 정리

### 5. Module Index

**파일**: `lib/monitoring/index.ts` (100+ lines)

**제공 기능**:
- 모든 모니터링 컴포넌트 통합 내보내기
- `initializeMonitoring()` - 원스톱 초기화
- `shutdownMonitoring()` - 정리
- `getMonitoringStatus()` - 상태 조회

**사용 예시**:
```typescript
import { initializeMonitoring, shutdownMonitoring } from '@/lib/monitoring';

// 모니터링 시작
initializeMonitoring({
  enablePerformanceMonitoring: true,
  enableMetricsCollection: true,
  enableSlowQueryDetection: true,
  metricsCollectionInterval: 60000,
  slowQueryThreshold: 100,
  criticalQueryThreshold: 1000,
});

// 애플리케이션 종료 시
shutdownMonitoring();
```

### 6. 문서화

**파일**: `lib/monitoring/README.md` (600+ lines)

**내용**:
- 개요 및 주요 기능
- 설치 및 초기화
- 각 컴포넌트별 상세 사용법
- API 레퍼런스
- 베스트 프랙티스
- 트러블슈팅 가이드
- 권한 및 보안

## 기술 스택

- **TypeScript** - 엄격한 타입 안정성
- **Singleton Pattern** - 전역 인스턴스 관리
- **Event-Driven** - Event Bus 연동
- **통계 알고리즘** - 백분위수, 선형 회귀, 표준편차
- **시계열 데이터** - 시간 윈도우 기반 집계
- **Permission-Based** - RBAC 기반 접근 제어

## 성능 특징

### Performance Monitor
- 메모리 효율적인 순환 버퍼 (최대 1,000개)
- 자동 히스토리 관리
- 실시간 임계값 검사
- 이벤트 기반 비동기 처리

### Metrics Collector
- 백그라운드 자동 수집 (기본 1분 간격)
- 6단계 시간 윈도우 (1분~24시간)
- 선형 회귀 트렌드 분석 (O(n))
- 효율적인 백분위수 계산

### Slow Query Detector
- 쿼리 패턴 정규화 및 해싱
- N+1 쿼리 탐지 (5초 윈도우)
- 최대 1,000개 쿼리 히스토리
- 자동 최적화 제안 생성

## 보안

- ✅ Permission 기반 접근 제어 (ADMIN_ANALYTICS, ADMIN_SYSTEM_SETTINGS)
- ✅ Admin Middleware 통합
- ✅ 민감한 데이터 필터링
- ✅ Rate limiting 고려

## 모니터링 지표

### 추적 중인 메트릭
1. **성능 메트릭**
   - Command 실행 시간
   - Agent 작업 시간
   - 시스템 메모리 사용량
   - FPS (브라우저)

2. **데이터베이스 메트릭**
   - 쿼리 실행 시간
   - 느린 쿼리 수
   - 쿼리 패턴별 통계
   - N+1 쿼리 탐지

3. **시스템 메트릭**
   - 가동 시간 (Uptime)
   - 메모리 사용량
   - 에러 발생 횟수
   - 알림 수

## 사용 예시

### 1. 기본 메트릭 기록
```typescript
import { performanceMonitor } from '@/lib/monitoring';

performanceMonitor.recordMetric({
  name: 'api.response_time',
  value: 150,
  unit: 'ms',
  tags: { endpoint: '/api/users', method: 'GET' },
  threshold: { warning: 200, critical: 500 }
});
```

### 2. 함수 성능 측정
```typescript
import { measureAsync } from '@/lib/monitoring';

const fetchData = measureAsync(
  'api.fetchData',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);
```

### 3. 쿼리 모니터링
```typescript
import { monitorQuery } from '@/lib/monitoring';

const users = await monitorQuery(
  'SELECT * FROM users WHERE id = ?',
  async () => {
    return await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  },
  [userId]
);
```

### 4. 메트릭 조회
```bash
# 모든 메트릭 조회
curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/api/admin/metrics?type=all

# Prometheus 포맷으로 내보내기
curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/api/admin/metrics?format=prometheus
```

## 다음 단계

- [ ] 대시보드 UI 구현 (실시간 차트)
- [ ] 알림 시스템 통합 (이메일, Slack)
- [ ] 메트릭 영구 저장 (TimescaleDB)
- [ ] 분산 추적 (OpenTelemetry)
- [ ] 커스텀 메트릭 대시보드

## 관련 Phase

- ✅ Phase 3.1: Core API Layer
- ✅ Phase 3.2: Data Access Layer
- ✅ Phase 3.3: GraphQL Layer
- ✅ Phase 3.4: Real-time Updates
- ✅ Phase 3.5: Admin API Layer
- ✅ **Phase 3.6: Performance Monitoring** (현재)
- ⏳ Phase 3.7: Structured Logging

## 작성자

- Claude Sonnet 4.5
- 작성일: 2025-12-28

---

**Phase 3.6 완료!** 🎉

다음은 Phase 3.7 Structured Logging 구현입니다.
