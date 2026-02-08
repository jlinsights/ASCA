/**
 * 메트릭 수집기
 * 시간 기반 메트릭 집계 및 분석
 */

import { performanceMonitor, type PerformanceMetric } from './performance-monitor';
import { log } from '@/lib/utils/logger';

/**
 * 시간 윈도우 타입
 */
export enum TimeWindow {
  ONE_MINUTE = 60 * 1000,
  FIVE_MINUTES = 5 * 60 * 1000,
  FIFTEEN_MINUTES = 15 * 60 * 1000,
  ONE_HOUR = 60 * 60 * 1000,
  SIX_HOURS = 6 * 60 * 60 * 1000,
  TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000,
}

/**
 * 집계된 메트릭 데이터
 */
export interface AggregatedMetric {
  name: string;
  window: TimeWindow;
  startTime: number;
  endTime: number;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  stdDev: number;
  rate: number; // 초당 발생 횟수
  tags?: Record<string, string>;
}

/**
 * 트렌드 분석 결과
 */
export interface TrendAnalysis {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  change: number; // 변화율 (%)
  confidence: number; // 0-1
  prediction: number; // 다음 값 예측
}

/**
 * 이상 탐지 결과
 */
export interface AnomalyDetection {
  metric: string;
  value: number;
  expected: number;
  deviation: number; // 표준편차 배수
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

/**
 * 메트릭 수집기 클래스
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  private aggregatedMetrics = new Map<string, AggregatedMetric[]>();
  private anomalies: AnomalyDetection[] = [];
  private isCollecting = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  private maxAggregatedHistory = 1000; // 각 메트릭당 최대 집계 데이터 개수
  private maxAnomalies = 100; // 최대 이상 데이터 개수

  private constructor() {}

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * 수집 시작
   */
  start(intervalMs: number = 60000): void {
    if (this.isCollecting) return;

    this.isCollecting = true;
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    log.info('Metrics collection started', { intervalMs });
  }

  /**
   * 수집 중지
   */
  stop(): void {
    if (!this.isCollecting) return;

    this.isCollecting = false;
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }

    log.info('Metrics collection stopped');
  }

  /**
   * 메트릭 집계
   */
  aggregateMetrics(
    metricName: string,
    window: TimeWindow,
    startTime?: number
  ): AggregatedMetric | null {
    const endTime = Date.now();
    const start = startTime || endTime - window;

    // 원시 메트릭 데이터 가져오기
    const rawMetrics = performanceMonitor
      .getMetrics(metricName)
      .filter(m => m.timestamp >= start && m.timestamp <= endTime);

    if (rawMetrics.length === 0) return null;

    // 값 추출 및 정렬
    const values = rawMetrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;

    // 표준편차 계산
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // 백분위수 계산
    const p50 = this.calculatePercentile(values, 0.5);
    const p95 = this.calculatePercentile(values, 0.95);
    const p99 = this.calculatePercentile(values, 0.99);

    // 발생 비율 계산 (초당)
    const durationSeconds = (endTime - start) / 1000;
    const rate = values.length / durationSeconds;

    // 태그 병합
    const tags = rawMetrics[0]?.tags;

    const aggregated: AggregatedMetric = {
      name: metricName,
      window,
      startTime: start,
      endTime,
      count: values.length,
      sum,
      avg,
      min: values[0] as number,
      max: values[values.length - 1] as number,
      p50,
      p95,
      p99,
      stdDev,
      rate,
      tags,
    };

    // 집계 데이터 저장
    this.storeAggregatedMetric(aggregated);

    return aggregated;
  }

  /**
   * 여러 윈도우에 대한 메트릭 집계
   */
  aggregateMultipleWindows(
    metricName: string,
    windows: TimeWindow[] = [
      TimeWindow.ONE_MINUTE,
      TimeWindow.FIVE_MINUTES,
      TimeWindow.FIFTEEN_MINUTES,
      TimeWindow.ONE_HOUR,
      TimeWindow.TWENTY_FOUR_HOURS,
    ]
  ): Map<TimeWindow, AggregatedMetric | null> {
    const results = new Map<TimeWindow, AggregatedMetric | null>();

    for (const window of windows) {
      const aggregated = this.aggregateMetrics(metricName, window);
      results.set(window, aggregated);
    }

    return results;
  }

  /**
   * 트렌드 분석
   */
  analyzeTrend(
    metricName: string,
    window: TimeWindow,
    dataPoints: number = 10
  ): TrendAnalysis | null {
    const key = this.getAggregatedKey(metricName, window);
    const history = this.aggregatedMetrics.get(key) || [];

    if (history.length < 2) return null;

    // 최근 데이터 포인트 가져오기
    const recentData = history.slice(-dataPoints).map(m => m.avg);

    if (recentData.length < 2) return null;

    // 선형 회귀로 트렌드 계산
    const { slope, intercept, r2 } = this.linearRegression(recentData);

    // 트렌드 방향 결정
    const threshold = 0.01; // 1% 변화를 안정으로 간주
    const change = (slope / (recentData[0] || 1)) * 100;

    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(change) < threshold) {
      direction = 'stable';
    } else {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }

    // 다음 값 예측
    const prediction = slope * recentData.length + intercept;

    return {
      metric: metricName,
      direction,
      change,
      confidence: r2,
      prediction: Math.max(0, prediction),
    };
  }

  /**
   * 이상 탐지
   */
  detectAnomalies(
    metricName: string,
    threshold: number = 3 // 표준편차 배수
  ): AnomalyDetection[] {
    const recentMetrics = performanceMonitor.getMetrics(metricName).slice(-100);

    if (recentMetrics.length < 10) return [];

    // 평균과 표준편차 계산
    const values = recentMetrics.map(m => m.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: AnomalyDetection[] = [];

    // 최근 10개 메트릭 검사
    const latestMetrics = recentMetrics.slice(-10);

    for (const metric of latestMetrics) {
      const deviation = Math.abs(metric.value - mean) / stdDev;

      if (deviation >= threshold) {
        let severity: 'low' | 'medium' | 'high';
        if (deviation >= threshold * 2) {
          severity = 'high';
        } else if (deviation >= threshold * 1.5) {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        const anomaly: AnomalyDetection = {
          metric: metricName,
          value: metric.value,
          expected: mean,
          deviation,
          severity,
          timestamp: metric.timestamp,
        };

        anomalies.push(anomaly);
        this.storeAnomaly(anomaly);
      }
    }

    return anomalies;
  }

  /**
   * 집계된 메트릭 조회
   */
  getAggregatedMetrics(
    metricName?: string,
    window?: TimeWindow
  ): AggregatedMetric[] {
    if (metricName && window) {
      const key = this.getAggregatedKey(metricName, window);
      return this.aggregatedMetrics.get(key) || [];
    }

    if (metricName) {
      const results: AggregatedMetric[] = [];
      for (const [key, metrics] of this.aggregatedMetrics.entries()) {
        if (key.startsWith(metricName + ':')) {
          results.push(...metrics);
        }
      }
      return results.sort((a, b) => b.endTime - a.endTime);
    }

    // 모든 집계 메트릭 반환
    const allMetrics: AggregatedMetric[] = [];
    for (const metrics of this.aggregatedMetrics.values()) {
      allMetrics.push(...metrics);
    }

    return allMetrics.sort((a, b) => b.endTime - a.endTime);
  }

  /**
   * 이상 데이터 조회
   */
  getAnomalies(
    metricName?: string,
    severity?: 'low' | 'medium' | 'high'
  ): AnomalyDetection[] {
    let results = [...this.anomalies];

    if (metricName) {
      results = results.filter(a => a.metric === metricName);
    }

    if (severity) {
      results = results.filter(a => a.severity === severity);
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 데이터 내보내기 (JSON)
   */
  exportJSON(metricName?: string): string {
    const data = {
      timestamp: Date.now(),
      aggregatedMetrics: this.getAggregatedMetrics(metricName),
      anomalies: this.getAnomalies(metricName),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * 데이터 내보내기 (CSV)
   */
  exportCSV(metricName?: string): string {
    const metrics = this.getAggregatedMetrics(metricName);

    if (metrics.length === 0) return '';

    // CSV 헤더
    const headers = [
      'name',
      'window',
      'startTime',
      'endTime',
      'count',
      'avg',
      'min',
      'max',
      'p50',
      'p95',
      'p99',
      'stdDev',
      'rate',
    ];

    // CSV 행
    const rows = metrics.map(m => [
      m.name,
      m.window,
      new Date(m.startTime).toISOString(),
      new Date(m.endTime).toISOString(),
      m.count,
      m.avg.toFixed(2),
      m.min.toFixed(2),
      m.max.toFixed(2),
      m.p50.toFixed(2),
      m.p95.toFixed(2),
      m.p99.toFixed(2),
      m.stdDev.toFixed(2),
      m.rate.toFixed(2),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * 통계 요약
   */
  getStats(): {
    totalAggregatedMetrics: number;
    totalAnomalies: number;
    metricsPerWindow: Record<string, number>;
    anomaliesBySeverity: { low: number; medium: number; high: number };
    isCollecting: boolean;
  } {
    const metricsPerWindow: Record<string, number> = {};

    for (const [key, metrics] of this.aggregatedMetrics.entries()) {
      const window = key.split(':')[1];
      metricsPerWindow[window || 'unknown'] = (metricsPerWindow[window || 'unknown'] || 0) + metrics.length;
    }

    const anomaliesBySeverity = {
      low: this.anomalies.filter(a => a.severity === 'low').length,
      medium: this.anomalies.filter(a => a.severity === 'medium').length,
      high: this.anomalies.filter(a => a.severity === 'high').length,
    };

    return {
      totalAggregatedMetrics: Array.from(this.aggregatedMetrics.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      totalAnomalies: this.anomalies.length,
      metricsPerWindow,
      anomaliesBySeverity,
      isCollecting: this.isCollecting,
    };
  }

  /**
   * 데이터 정리
   */
  cleanup(olderThan?: number): void {
    const cutoffTime = olderThan || Date.now() - TimeWindow.TWENTY_FOUR_HOURS * 7; // 기본 7일

    // 오래된 집계 메트릭 제거
    for (const [key, metrics] of this.aggregatedMetrics.entries()) {
      const filtered = metrics.filter(m => m.endTime >= cutoffTime);
      this.aggregatedMetrics.set(key, filtered);
    }

    // 오래된 이상 데이터 제거
    this.anomalies = this.anomalies.filter(a => a.timestamp >= cutoffTime);

    log.info('Metrics cleanup completed', { cutoffTime: new Date(cutoffTime) });
  }

  // Private 메서드들

  private collectMetrics(): void {
    // 모든 메트릭에 대해 집계 수행
    const allMetrics = performanceMonitor.getMetrics();
    const uniqueNames = new Set(allMetrics.map(m => m.name));

    for (const name of uniqueNames) {
      // 1분, 5분, 15분, 1시간 윈도우에 대해 집계
      this.aggregateMetrics(name, TimeWindow.ONE_MINUTE);
      this.aggregateMetrics(name, TimeWindow.FIVE_MINUTES);
      this.aggregateMetrics(name, TimeWindow.FIFTEEN_MINUTES);
      this.aggregateMetrics(name, TimeWindow.ONE_HOUR);

      // 이상 탐지
      this.detectAnomalies(name);
    }
  }

  private storeAggregatedMetric(metric: AggregatedMetric): void {
    const key = this.getAggregatedKey(metric.name, metric.window);

    if (!this.aggregatedMetrics.has(key)) {
      this.aggregatedMetrics.set(key, []);
    }

    const history = this.aggregatedMetrics.get(key)!;
    history.push(metric);

    // 히스토리 크기 제한
    if (history.length > this.maxAggregatedHistory) {
      history.shift();
    }
  }

  private storeAnomaly(anomaly: AnomalyDetection): void {
    this.anomalies.push(anomaly);

    // 최대 개수 제한
    if (this.anomalies.length > this.maxAnomalies) {
      this.anomalies.shift();
    }
  }

  private getAggregatedKey(metricName: string, window: TimeWindow): string {
    return `${metricName}:${window}`;
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = Math.ceil(sortedValues.length * percentile) - 1;
    return sortedValues[Math.max(0, index)] as number;
  }

  private linearRegression(values: number[]): {
    slope: number;
    intercept: number;
    r2: number;
  } {
    const n = values.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((acc, x, i) => acc + x * (values[i] || 0), 0);
    const sumXX = indices.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R² 계산
    const meanY = sumY / n;
    const ssTotal = values.reduce((acc, y) => acc + Math.pow(y - meanY, 2), 0);
    const ssResidual = values.reduce(
      (acc, y, i) => acc + Math.pow(y - (slope * i + intercept), 2),
      0
    );
    const r2 = 1 - ssResidual / ssTotal;

    return { slope, intercept, r2 };
  }
}

// 전역 인스턴스
export const metricsCollector = MetricsCollector.getInstance();

// 헬퍼 함수들
export function startMetricsCollection(intervalMs?: number): void {
  metricsCollector.start(intervalMs);
}

export function stopMetricsCollection(): void {
  metricsCollector.stop();
}

export function getMetricTrend(
  metricName: string,
  window: TimeWindow = TimeWindow.ONE_HOUR
): TrendAnalysis | null {
  return metricsCollector.analyzeTrend(metricName, window);
}

export function getMetricAnomalies(metricName: string): AnomalyDetection[] {
  return metricsCollector.detectAnomalies(metricName);
}
