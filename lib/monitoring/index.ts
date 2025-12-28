/**
 * Monitoring Module
 *
 * 성능 모니터링 및 메트릭 수집 시스템
 *
 * @module lib/monitoring
 */

// Performance Monitor
export {
  PerformanceMonitor,
  performanceMonitor,
  measureAsync,
  measureSync,
  Measure,
  type PerformanceMetric,
  type PerformanceAlert,
} from './performance-monitor';

// Metrics Collector
export {
  MetricsCollector,
  metricsCollector,
  TimeWindow,
  startMetricsCollection,
  stopMetricsCollection,
  getMetricTrend,
  getMetricAnomalies,
  type AggregatedMetric,
  type TrendAnalysis,
  type AnomalyDetection,
} from './metrics-collector';

// Slow Query Detector
export {
  SlowQueryDetector,
  slowQueryDetector,
  startSlowQueryDetection,
  stopSlowQueryDetection,
  monitorQuery,
  detectNPlusOneQueries,
  getSlowQueryReport,
  type QueryExecution,
  type SlowQuery,
  type QueryPatternStats,
  type NPlusOneDetection,
  type DetectorConfig,
} from './slow-query-detector';

/**
 * 모니터링 시스템 초기화
 */
export function initializeMonitoring(config?: {
  enablePerformanceMonitoring?: boolean;
  enableMetricsCollection?: boolean;
  enableSlowQueryDetection?: boolean;
  metricsCollectionInterval?: number;
  slowQueryThreshold?: number;
  criticalQueryThreshold?: number;
}): void {
  const {
    enablePerformanceMonitoring = true,
    enableMetricsCollection = true,
    enableSlowQueryDetection = true,
    metricsCollectionInterval = 60000,
    slowQueryThreshold = 100,
    criticalQueryThreshold = 1000,
  } = config || {};

  // 성능 모니터링 시작
  if (enablePerformanceMonitoring) {
    performanceMonitor.start();
  }

  // 메트릭 수집 시작
  if (enableMetricsCollection) {
    metricsCollector.start(metricsCollectionInterval);
  }

  // 느린 쿼리 감지 시작
  if (enableSlowQueryDetection) {
    slowQueryDetector.updateConfig({
      slowQueryThreshold,
      criticalQueryThreshold,
    });
    slowQueryDetector.start();
  }
}

/**
 * 모니터링 시스템 종료
 */
export function shutdownMonitoring(): void {
  performanceMonitor.stop();
  metricsCollector.stop();
  slowQueryDetector.stop();
}

/**
 * 모니터링 상태 조회
 */
export function getMonitoringStatus() {
  return {
    performance: performanceMonitor.getSystemStatus(),
    metricsCollection: metricsCollector.getStats(),
    slowQueryDetection: slowQueryDetector.getStats(),
  };
}
