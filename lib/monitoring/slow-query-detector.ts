/**
 * 느린 쿼리 감지기
 * 데이터베이스 쿼리 성능 모니터링 및 최적화 제안
 */

import { performanceMonitor } from './performance-monitor';
import { log } from '@/lib/utils/logger';

/**
 * 쿼리 실행 정보
 */
export interface QueryExecution {
  id: string;
  query: string;
  params?: any[];
  executionTime: number;
  timestamp: number;
  stackTrace?: string;
  caller?: string;
  rowCount?: number;
  cached?: boolean;
}

/**
 * 느린 쿼리 정보
 */
export interface SlowQuery extends QueryExecution {
  threshold: number;
  severity: 'warning' | 'critical';
  suggestions?: string[];
  pattern?: string;
  hash?: string;
}

/**
 * 쿼리 패턴 통계
 */
export interface QueryPatternStats {
  pattern: string;
  hash: string;
  count: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  lastExecution: number;
  isSlow: boolean;
}

/**
 * N+1 쿼리 감지 결과
 */
export interface NPlusOneDetection {
  pattern: string;
  queryCount: number;
  totalTime: number;
  timeWindow: number;
  examples: QueryExecution[];
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

/**
 * 쿼리 감지 설정
 */
export interface DetectorConfig {
  slowQueryThreshold: number; // ms
  criticalQueryThreshold: number; // ms
  enableStackTrace: boolean;
  maxSlowQueries: number;
  maxQueryHistory: number;
  nPlusOneDetectionWindow: number; // ms
  nPlusOneThreshold: number; // 반복 쿼리 최소 횟수
}

const DEFAULT_CONFIG: DetectorConfig = {
  slowQueryThreshold: 100,
  criticalQueryThreshold: 1000,
  enableStackTrace: true,
  maxSlowQueries: 100,
  maxQueryHistory: 1000,
  nPlusOneDetectionWindow: 5000,
  nPlusOneThreshold: 5,
};

/**
 * 느린 쿼리 감지기 클래스
 */
export class SlowQueryDetector {
  private static instance: SlowQueryDetector;
  private config: DetectorConfig = DEFAULT_CONFIG;
  private queryHistory: QueryExecution[] = [];
  private slowQueries: SlowQuery[] = [];
  private patternStats = new Map<string, QueryPatternStats>();
  private activeQueries = new Map<string, number>(); // queryId -> startTime
  private isMonitoring = false;

  private constructor(config?: Partial<DetectorConfig>) {
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
    }
  }

  static getInstance(config?: Partial<DetectorConfig>): SlowQueryDetector {
    if (!SlowQueryDetector.instance) {
      SlowQueryDetector.instance = new SlowQueryDetector(config);
    }
    return SlowQueryDetector.instance;
  }

  /**
   * 모니터링 시작
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    log.info('Slow query detection started', this.config);
  }

  /**
   * 모니터링 중지
   */
  stop(): void {
    this.isMonitoring = false;
    log.info('Slow query detection stopped');
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<DetectorConfig>): void {
    this.config = { ...this.config, ...config };
    log.info('Slow query detector config updated', this.config);
  }

  /**
   * 쿼리 실행 시작
   */
  startQuery(query: string, params?: any[]): string {
    if (!this.isMonitoring) return '';

    const queryId = this.generateQueryId();
    this.activeQueries.set(queryId, Date.now());

    return queryId;
  }

  /**
   * 쿼리 실행 종료
   */
  endQuery(
    queryId: string,
    query: string,
    params?: any[],
    rowCount?: number
  ): QueryExecution | null {
    if (!this.isMonitoring || !this.activeQueries.has(queryId)) return null;

    const startTime = this.activeQueries.get(queryId)!;
    const executionTime = Date.now() - startTime;

    this.activeQueries.delete(queryId);

    const execution: QueryExecution = {
      id: queryId,
      query: this.normalizeQuery(query),
      params,
      executionTime,
      timestamp: Date.now(),
      rowCount,
      cached: false,
    };

    // 스택 트레이스 추가
    if (this.config.enableStackTrace) {
      const stack = new Error().stack;
      execution.stackTrace = stack;
      execution.caller = this.extractCaller(stack);
    }

    // 쿼리 히스토리에 추가
    this.recordQuery(execution);

    // 느린 쿼리 검사
    this.checkSlowQuery(execution);

    // 패턴 통계 업데이트
    this.updatePatternStats(execution);

    // 성능 메트릭 기록
    performanceMonitor.recordMetric({
      name: 'database.query.execution_time',
      value: executionTime,
      unit: 'ms',
      tags: {
        isSlow: executionTime >= this.config.slowQueryThreshold ? 'true' : 'false',
      },
      threshold: {
        warning: this.config.slowQueryThreshold,
        critical: this.config.criticalQueryThreshold,
      },
    });

    return execution;
  }

  /**
   * 쿼리 래퍼 (자동 측정)
   */
  async wrapQuery<T>(
    query: string,
    executor: () => Promise<T>,
    params?: any[]
  ): Promise<T> {
    const queryId = this.startQuery(query, params);

    try {
      const result = await executor();

      // 결과가 배열이면 행 개수 추출
      const rowCount = Array.isArray(result) ? result.length : undefined;

      this.endQuery(queryId, query, params, rowCount);

      return result;
    } catch (error) {
      this.endQuery(queryId, query, params);
      throw error;
    }
  }

  /**
   * N+1 쿼리 탐지
   */
  detectNPlusOne(timeWindow?: number): NPlusOneDetection[] {
    const window = timeWindow || this.config.nPlusOneDetectionWindow;
    const now = Date.now();
    const recentQueries = this.queryHistory.filter(q => now - q.timestamp <= window);

    // 쿼리 패턴별로 그룹화
    const patternGroups = new Map<string, QueryExecution[]>();

    for (const query of recentQueries) {
      const pattern = this.extractQueryPattern(query.query);
      if (!patternGroups.has(pattern)) {
        patternGroups.set(pattern, []);
      }
      patternGroups.get(pattern)!.push(query);
    }

    const detections: NPlusOneDetection[] = [];

    // 반복 패턴 검사
    for (const [pattern, queries] of patternGroups.entries()) {
      if (queries.length >= this.config.nPlusOneThreshold) {
        const totalTime = queries.reduce((sum, q) => sum + q.executionTime, 0);
        const avgTime = totalTime / queries.length;

        let severity: 'low' | 'medium' | 'high';
        if (queries.length >= 20 || avgTime >= 100) {
          severity = 'high';
        } else if (queries.length >= 10 || avgTime >= 50) {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        detections.push({
          pattern,
          queryCount: queries.length,
          totalTime,
          timeWindow: window,
          examples: queries.slice(0, 5),
          severity,
          suggestion: this.generateNPlusOneSuggestion(pattern, queries),
        });
      }
    }

    return detections.sort((a, b) => b.queryCount - a.queryCount);
  }

  /**
   * 느린 쿼리 조회
   */
  getSlowQueries(limit?: number): SlowQuery[] {
    const queries = [...this.slowQueries].sort((a, b) => b.executionTime - a.executionTime);

    return limit ? queries.slice(0, limit) : queries;
  }

  /**
   * 쿼리 패턴 통계 조회
   */
  getPatternStats(sortBy: 'count' | 'avgTime' | 'totalTime' = 'totalTime'): QueryPatternStats[] {
    const stats = Array.from(this.patternStats.values());

    stats.sort((a, b) => {
      switch (sortBy) {
        case 'count':
          return b.count - a.count;
        case 'avgTime':
          return b.avgTime - a.avgTime;
        case 'totalTime':
          return b.totalTime - a.totalTime;
        default:
          return 0;
      }
    });

    return stats;
  }

  /**
   * 쿼리 히스토리 조회
   */
  getQueryHistory(limit?: number): QueryExecution[] {
    const history = [...this.queryHistory].sort((a, b) => b.timestamp - a.timestamp);

    return limit ? history.slice(0, limit) : history;
  }

  /**
   * 통계 요약
   */
  getStats(): {
    totalQueries: number;
    slowQueries: number;
    criticalQueries: number;
    avgExecutionTime: number;
    uniquePatterns: number;
    nPlusOneDetections: number;
    isMonitoring: boolean;
  } {
    const totalQueries = this.queryHistory.length;
    const slowQueries = this.slowQueries.filter(
      q => q.executionTime >= this.config.slowQueryThreshold
    ).length;
    const criticalQueries = this.slowQueries.filter(
      q => q.executionTime >= this.config.criticalQueryThreshold
    ).length;

    const avgExecutionTime =
      totalQueries > 0
        ? this.queryHistory.reduce((sum, q) => sum + q.executionTime, 0) / totalQueries
        : 0;

    const nPlusOneDetections = this.detectNPlusOne().length;

    return {
      totalQueries,
      slowQueries,
      criticalQueries,
      avgExecutionTime,
      uniquePatterns: this.patternStats.size,
      nPlusOneDetections,
      isMonitoring: this.isMonitoring,
    };
  }

  /**
   * 데이터 정리
   */
  cleanup(olderThan?: number): void {
    const cutoffTime = olderThan || Date.now() - 24 * 60 * 60 * 1000; // 기본 24시간

    // 오래된 쿼리 히스토리 제거
    this.queryHistory = this.queryHistory.filter(q => q.timestamp >= cutoffTime);

    // 오래된 느린 쿼리 제거
    this.slowQueries = this.slowQueries.filter(q => q.timestamp >= cutoffTime);

    // 오래된 패턴 통계 제거
    for (const [pattern, stats] of this.patternStats.entries()) {
      if (stats.lastExecution < cutoffTime) {
        this.patternStats.delete(pattern);
      }
    }

    log.info('Slow query data cleanup completed', { cutoffTime: new Date(cutoffTime) });
  }

  /**
   * 데이터 내보내기
   */
  export(): string {
    return JSON.stringify(
      {
        config: this.config,
        stats: this.getStats(),
        slowQueries: this.getSlowQueries(50),
        patternStats: this.getPatternStats(),
        nPlusOneDetections: this.detectNPlusOne(),
      },
      null,
      2
    );
  }

  // Private 메서드들

  private generateQueryId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private normalizeQuery(query: string): string {
    return query.trim().replace(/\s+/g, ' ');
  }

  private extractQueryPattern(query: string): string {
    // 값들을 플레이스홀더로 치환하여 패턴 추출
    return query
      .replace(/\d+/g, '?')
      .replace(/'[^']*'/g, '?')
      .replace(/"[^"]*"/g, '?')
      .replace(/\$\d+/g, '?')
      .trim();
  }

  private extractCaller(stack?: string): string {
    if (!stack) return 'unknown';

    const lines = stack.split('\n');
    // 자신의 함수와 래퍼 함수는 건너뛰고 실제 호출자를 찾음
    for (let i = 3; i < lines.length && i < 10; i++) {
      const line = lines[i];
      if (line && !line.includes('slow-query-detector')) {
        const match = line.match(/at\s+(.+?)\s+\(/);
        return (match && match[1]) || 'unknown';
      }
    }

    return 'unknown';
  }

  private recordQuery(execution: QueryExecution): void {
    this.queryHistory.push(execution);

    // 히스토리 크기 제한
    if (this.queryHistory.length > this.config.maxQueryHistory) {
      this.queryHistory.shift();
    }
  }

  private checkSlowQuery(execution: QueryExecution): void {
    if (execution.executionTime < this.config.slowQueryThreshold) return;

    const severity: 'warning' | 'critical' =
      execution.executionTime >= this.config.criticalQueryThreshold ? 'critical' : 'warning';

    const pattern = this.extractQueryPattern(execution.query);
    const hash = this.hashString(pattern);

    const slowQuery: SlowQuery = {
      ...execution,
      threshold: this.config.slowQueryThreshold,
      severity,
      suggestions: this.generateOptimizationSuggestions(execution),
      pattern,
      hash,
    };

    this.slowQueries.push(slowQuery);

    // 최대 개수 제한
    if (this.slowQueries.length > this.config.maxSlowQueries) {
      this.slowQueries.shift();
    }

    // 로그 기록
    const level = severity === 'critical' ? 'error' : 'warn';
    log[level]('Slow query detected', {
      executionTime: execution.executionTime,
      query: execution.query.substring(0, 200),
      caller: execution.caller,
      suggestions: slowQuery.suggestions,
    });
  }

  private updatePatternStats(execution: QueryExecution): void {
    const pattern = this.extractQueryPattern(execution.query);
    const hash = this.hashString(pattern);

    if (!this.patternStats.has(hash)) {
      this.patternStats.set(hash, {
        pattern,
        hash,
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        p95Time: 0,
        lastExecution: 0,
        isSlow: false,
      });
    }

    const stats = this.patternStats.get(hash)!;
    stats.count++;
    stats.totalTime += execution.executionTime;
    stats.avgTime = stats.totalTime / stats.count;
    stats.minTime = Math.min(stats.minTime, execution.executionTime);
    stats.maxTime = Math.max(stats.maxTime, execution.executionTime);
    stats.lastExecution = execution.timestamp;
    stats.isSlow = stats.avgTime >= this.config.slowQueryThreshold;

    // p95 계산 (간단한 추정)
    stats.p95Time = stats.avgTime + (stats.maxTime - stats.avgTime) * 0.5;
  }

  private generateOptimizationSuggestions(execution: QueryExecution): string[] {
    const suggestions: string[] = [];
    const query = execution.query.toLowerCase();

    // 인덱스 관련 제안
    if (query.includes('where') && !query.includes('index')) {
      suggestions.push('WHERE 절에 사용된 컬럼에 인덱스를 추가하세요');
    }

    // JOIN 최적화
    if (query.includes('join')) {
      suggestions.push('JOIN 조건에 인덱스가 있는지 확인하세요');
      suggestions.push('JOIN 순서를 최적화하세요 (작은 테이블을 먼저)');
    }

    // SELECT * 경고
    if (query.includes('select *')) {
      suggestions.push('SELECT *를 피하고 필요한 컬럼만 선택하세요');
    }

    // LIKE 패턴
    if (query.includes("like '%") || query.includes('like "%')) {
      suggestions.push('와일드카드가 앞에 있는 LIKE 패턴은 인덱스를 사용할 수 없습니다');
    }

    // 서브쿼리
    if (query.includes('select') && query.split('select').length > 2) {
      suggestions.push('서브쿼리를 JOIN으로 변경하는 것을 고려하세요');
    }

    // 정렬
    if (query.includes('order by')) {
      suggestions.push('ORDER BY 컬럼에 인덱스를 추가하세요');
    }

    // DISTINCT
    if (query.includes('distinct')) {
      suggestions.push('DISTINCT 대신 GROUP BY를 사용하거나 중복 데이터를 제거하세요');
    }

    return suggestions;
  }

  private generateNPlusOneSuggestion(pattern: string, queries: QueryExecution[]): string {
    const query = pattern.toLowerCase();

    if (query.includes('select') && query.includes('where') && query.includes('id')) {
      return 'eager loading (includes/preload)을 사용하여 한 번의 쿼리로 데이터를 가져오세요';
    }

    if (query.includes('join')) {
      return '조인을 최적화하거나 데이터를 미리 로드하세요';
    }

    return '반복되는 쿼리를 배치 쿼리나 캐싱으로 최적화하세요';
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}

// 전역 인스턴스
export const slowQueryDetector = SlowQueryDetector.getInstance();

// 헬퍼 함수들
export function startSlowQueryDetection(config?: Partial<DetectorConfig>): void {
  if (config) {
    slowQueryDetector.updateConfig(config);
  }
  slowQueryDetector.start();
}

export function stopSlowQueryDetection(): void {
  slowQueryDetector.stop();
}

export async function monitorQuery<T>(
  query: string,
  executor: () => Promise<T>,
  params?: any[]
): Promise<T> {
  return slowQueryDetector.wrapQuery(query, executor, params);
}

export function detectNPlusOneQueries(timeWindow?: number): NPlusOneDetection[] {
  return slowQueryDetector.detectNPlusOne(timeWindow);
}

export function getSlowQueryReport(): {
  slowQueries: SlowQuery[];
  patternStats: QueryPatternStats[];
  nPlusOneDetections: NPlusOneDetection[];
  stats: ReturnType<typeof slowQueryDetector.getStats>;
} {
  return {
    slowQueries: slowQueryDetector.getSlowQueries(20),
    patternStats: slowQueryDetector.getPatternStats(),
    nPlusOneDetections: slowQueryDetector.detectNPlusOne(),
    stats: slowQueryDetector.getStats(),
  };
}
